import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import crypto from "crypto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite Cache
const db = new Database('ai_cache.db', { readonly: false, fileMustExist: false });
db.pragma('journal_mode = WAL'); // Enable WAL mode for better concurrency
db.exec(`
  CREATE TABLE IF NOT EXISTS ai_response_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_key TEXT UNIQUE,
    response_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const getCache = (key: string) => {
  const stmt = db.prepare('SELECT response_json FROM ai_response_cache WHERE cache_key = ?');
  const row = stmt.get(key) as { response_json: string } | undefined;
  return row ? JSON.parse(row.response_json) : null;
};

const setCache = (key: string, data: any) => {
  const stmt = db.prepare('INSERT OR REPLACE INTO ai_response_cache (cache_key, response_json) VALUES (?, ?)');
  stmt.run(key, JSON.stringify(data));
};

const generateCacheKey = (...args: any[]) => {
  const content = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join('|');
  return crypto.createHash('sha256').update(content).digest('hex');
};

import { PRESET_ANSWERS_LIBRARY } from './data/presetAnswers';

// --- PRESET ANSWERS OPTIMIZATION ---
// Hardcoded high-quality responses for the top questions to avoid AI latency
// Now imported from external file for better maintainability
const PRESET_RESPONSES: Record<string, any> = PRESET_ANSWERS_LIBRARY;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  let supabase: SupabaseClient | null = null;
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("[Server] Supabase enabled");
  } else {
    console.log("[Server] Supabase not configured, skipping cloud persistence");
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Doubao API Configuration
  let DOUBAO_API_KEY = process.env.DOUBAO_API_KEY || "11835137-c49e-4e5b-ba1f-cbcc3878dcce";
  let DOUBAO_ENDPOINT = process.env.DOUBAO_ENDPOINT || "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
  let DOUBAO_MODEL_ID = process.env.DOUBAO_MODEL_ID || "ep-m-20260305162457-9q2xm";

  // Robust Auto-fix: Swap if they are misconfigured
  // 1. If Model ID looks like the UUID key
  if (DOUBAO_MODEL_ID.includes("-") && DOUBAO_MODEL_ID.length === 36 && !DOUBAO_MODEL_ID.startsWith("ep-")) {
    console.log("Detected UUID in Model ID field, swapping with API Key...");
    const temp = DOUBAO_MODEL_ID;
    DOUBAO_MODEL_ID = (DOUBAO_API_KEY.startsWith("ep-")) ? DOUBAO_API_KEY : "ep-m-20260305162457-9q2xm";
    DOUBAO_API_KEY = temp;
  }
  // 2. If API Key looks like an endpoint ID
  else if (DOUBAO_API_KEY.startsWith("ep-")) {
    console.log("Detected Endpoint ID in API Key field, swapping...");
    const temp = DOUBAO_API_KEY;
    DOUBAO_API_KEY = (DOUBAO_MODEL_ID.includes("-") && DOUBAO_MODEL_ID.length === 36) ? DOUBAO_MODEL_ID : "11835137-c49e-4e5b-ba1f-cbcc3878dcce";
    DOUBAO_MODEL_ID = temp;
  }

  // Ensure endpoint is an absolute URL and use chat/completions if it's the default
  if (DOUBAO_ENDPOINT && !DOUBAO_ENDPOINT.startsWith("http")) {
    DOUBAO_ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
  }

  // Helper to safely parse AI JSON response
  const safeJsonParse = (text: string) => {
    if (!text) return null;
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      // Attempt to fix common truncation
      if (e instanceof Error && (e.message.includes('Expected') || e.message.includes('Unexpected end'))) {
        let stack = [];
        for (let char of cleaned) {
          if (char === '{' || char === '[') stack.push(char === '{' ? '}' : ']');
          else if (char === '}' || char === ']') stack.pop();
        }
        if (stack.length > 0) {
          try { return JSON.parse(cleaned + stack.reverse().join('')); } catch (inner) {}
        }
      }
      throw e;
    }
  };

  // Common helper to call Doubao API
  async function callDoubao(prompt: string, systemInstruction: string, temperature = 0.7) {
    if (!DOUBAO_API_KEY || !DOUBAO_MODEL_ID) {
      throw new Error("豆包 API 配置缺失");
    }

    const isChatEndpoint = DOUBAO_ENDPOINT.includes("/chat/completions");
    
    const requestBody: any = {
      model: DOUBAO_MODEL_ID,
      stream: false
    };

    if (isChatEndpoint) {
      // Standard OpenAI-compatible format
      requestBody.messages = [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ];
      requestBody.temperature = temperature;
    } else {
      // Response API format (v3/responses)
      requestBody.input = [
        {
          role: "user",
          content: [{ type: "input_text", text: `${systemInstruction}\n\n用户请求: ${prompt}` }]
        }
      ];
    }

    const response = await fetch(DOUBAO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DOUBAO_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("Doubao API Error Response:", text);
      if (text.includes("InvalidEndpointOrModel.NotFound")) {
        throw new Error(`豆包 API 找不到模型或接入点: ${DOUBAO_MODEL_ID}。请确保环境变量 DOUBAO_MODEL_ID 设置为 "ep-m-20260305162457-9q2xm"，而 DOUBAO_API_KEY 设置为您的 UUID 密钥。`);
      }
      throw new Error(`豆包 API 返回错误 (${response.status}): ${text.substring(0, 200)}`);
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Doubao API returned non-JSON. Full text:", text);
      if (text.startsWith("resp_")) {
        throw new Error(`豆包 API 返回了请求 ID 而非内容 (${text})。这通常意味着您使用的模型 ID 与端点不匹配，请尝试将 DOUBAO_ENDPOINT 更改为包含 /v3/chat/completions 的地址。`);
      }
      throw new Error("豆包 API 返回了无效的格式，无法解析为 JSON");
    }

    // Aggressive recursive search for content
    const findContent = (obj: any): string => {
      if (!obj) return "";
      if (typeof obj === 'string') return obj;
      if (Array.isArray(obj)) {
        if (obj.length > 0 && obj[0].text) return obj.map(p => p.text || "").join("");
        for (const item of obj) {
          const found = findContent(item);
          if (found) return found;
        }
      }
      if (typeof obj === 'object') {
        const priorityFields = ['content', 'text', 'output_text', 'message'];
        for (const field of priorityFields) {
          const found = findContent(obj[field]);
          if (found) return found;
        }
        for (const key in obj) {
          if (!priorityFields.includes(key)) {
            const found = findContent(obj[key]);
            if (found) return found;
          }
        }
      }
      return "";
    };

    let content = findContent(data);

    if (!content) {
      console.error("Doubao API structure not recognized. Full response:", JSON.stringify(data, null, 2));
      throw new Error("豆包 API 未返回有效内容，请检查后台日志以确认响应结构");
    }

    return content;
  }

  // AI Routes
  app.post("/api/ai/questions", async (req, res) => {
    const { profile, theme, memoryContext } = req.body;
    console.log(`[AI Questions] Request received. Theme: ${theme}`);

    // Check Cache First
    const cacheKey = generateCacheKey('questions', profile, theme, memoryContext);
    const cached = getCache(cacheKey);
    if (cached) {
      console.log(`[AI Questions] Cache hit! Returning stored response.`);
      return res.json(cached);
    }

    try {
      const prompt = `
        用户画像: ${JSON.stringify(profile)}
        选择的主题: ${theme}
        历史记忆上下文: ${memoryContext}

        基于这位用户的画像、主题和历史，生成6个“猜你想问”的问题。
        确保生成的问题数量始终为6个（偶数），以便于界面布局。
        
        注意：
        1. 所有输出内容必须使用简体中文。
        2. 必须返回严格的 JSON 数组格式。
        格式示例: [{"id": "1", "text": "问题内容", "category": "分类"}]
      `;

      const content = await callDoubao(prompt, "你是一个专业的家庭顾问 AI，只输出 JSON。");

      let questions = safeJsonParse(content);
      if (!Array.isArray(questions) && questions.questions) questions = questions.questions;
      if (!Array.isArray(questions)) questions = [];

      // Store in cache
      setCache(cacheKey, questions);

      res.json(questions);
    } catch (error: any) {
      console.error("Doubao Questions Error:", error);
      res.status(500).json({ error: error.message || "生成建议问题失败" });
    }
  });

  app.post("/api/ai/simulation", async (req, res) => {
    const { theme, input, profile, memoryContext, attempt = 0 } = req.body;
    console.log(`[AI Simulation] Request received. Theme: ${theme}, Attempt: ${attempt}`);

    // Check Cache First
    const cacheKey = generateCacheKey('simulation', theme, input, profile, memoryContext);
    const cached = getCache(cacheKey);
    if (cached) {
      console.log(`[AI Simulation] Cache hit! Returning stored response.`);
      return res.json(cached);
    }

    // Check Preset Responses (Optimization)
    if (PRESET_RESPONSES[input]) {
      console.log(`[AI Simulation] Hit Preset Response for: ${input}`);
      // Simulate a small delay for realistic feel
      await new Promise(resolve => setTimeout(resolve, 800));
      return res.json(PRESET_RESPONSES[input]);
    }

    try {
      const prompt = `
        用户画像: ${JSON.stringify(profile)}
        主题: ${theme}
        用户输入: ${input}
        历史记忆上下文: ${memoryContext}

        你是一位“家庭守护 AI 顾问”。请提供精炼、直击痛点且富有同理心的回复。
        
        要求：
        1. 所有输出内容必须使用简体中文。
        2. 必须返回严格的 JSON 格式。
        
        JSON 结构要求:
        {
          "advice": {
            "stateSummary": "三句话总结，每句不超过30字。",
            "riskReminder": "一句话风险提示",
            "risks": [
              {"type": "health", "level": "low|medium|high", "label": "4字以内标签", "description": "20字以内", "adjustment": "15字以内", "score": 0-100},
              {"type": "finance", "level": "low|medium|high", "label": "4字以内标签", "description": "20字以内", "adjustment": "15字以内", "score": 0-100}
            ],
            "actions": {
              "today": "30字以内行动指令",
              "thisWeek": "30字以内阶段任务",
              "thisMonth": "30字以内长期规划"
            },
            "communicationTip": "30字以内建议话术",
            "resourceSuggestion": "30字以内资源推荐",
            "encouragement": "30字以内鼓励",
            "lifestyleAdvice": {
              "moodRegulation": "15字建议",
              "sleepImprovement": "15字建议",
              "recreation": "15字建议"
            },
            "decisionSimulation": {
              "pathA": {"label": "4字标签", "trend": "15字趋势", "risks": ["10字风险"], "actions": ["10字行动"], "emotionalImpact": "10字影响"},
              "pathB": {"label": "4字标签", "trend": "15字趋势", "risks": ["10字风险"], "actions": ["10字行动"], "emotionalImpact": "10字影响"}
            },
            "perspectives": [{"role": "角色", "psychology": "20字心理分析", "suggestion": "20字建议"}],
            "caseStudy": {
              "title": "案例标题",
              "story": "50字以内案例故事",
              "expertComment": "30字以内点评"
            }
          },
          "memoryUpdate": {"newTags": ["标签"], "anxietyPoints": ["痛点"]},
          "followUpQuestions": ["问题1", "问题2", "问题3"],
          "resonanceScore": 0-100,
          "soulSignature": "10字以内短句"
        }
      `;

      const content = await callDoubao(prompt, "你是一个专业的家庭守护 AI 顾问，只输出 JSON。", attempt === 0 ? 0.7 : 0.4);

      let finalResult = safeJsonParse(content);

      // Fix for nested JSON string in 'response' field
      if (finalResult && typeof finalResult.response === 'string') {
        try {
          finalResult = JSON.parse(finalResult.response);
        } catch (e) {
          console.error("Failed to parse nested JSON in response field:", e);
        }
      }

      // Validate structure
      if (!finalResult || !finalResult.advice) {
        console.error("AI response missing 'advice' field, using fallback");
        throw new Error("AI response malformed");
      }

      // Store in cache
      setCache(cacheKey, finalResult);

      if (supabase) {
        const record = {
          theme,
          input,
          profile,
          result: finalResult,
          resonance_score: finalResult?.resonanceScore ?? null
        };
        void supabase.from("consultations").insert(record);
      }

      console.log("[AI Simulation] Sending to client:", JSON.stringify(finalResult, null, 2));
      res.json(finalResult);
    } catch (error: any) {
      console.error("Doubao Simulation Error:", error);
      // Fallback: If AI fails, check if we have a preset match even if not exact string
      const presetMatch = Object.keys(PRESET_RESPONSES).find(k => input.includes(k) || k.includes(input));
      if (presetMatch) {
        console.log(`[AI Simulation] Fallback to Preset Response for: ${presetMatch}`);
        const resp = PRESET_RESPONSES[presetMatch];
        if (supabase) {
          const record = { theme, input, profile, result: resp, resonance_score: resp?.resonanceScore ?? null };
          void supabase.from("consultations").insert(record);
        }
        return res.json(resp);
      }
      
      // Ultimate Fallback: Return a generic valid structure so the UI doesn't break
      console.log("[AI Simulation] Using Generic Fallback Response");
      const genericFallback = {
        advice: {
          stateSummary: "系统暂时繁忙，但您的困扰我们收到了。1. 现状定性：当前可能面临一些不确定性；2. 核心痛点：需要更清晰的指引；3. 积极展望：稍作调整，事情会向好的方向发展。",
          riskReminder: "建议稍后重试或咨询专业人士。",
          risks: [],
          actions: {
            today: "深呼吸，暂时放下焦虑，做一件让自己放松的小事（如散步、听音乐）。",
            thisWeek: "梳理当前的问题清单，按优先级排序，先解决最紧急的一项。",
            thisMonth: "保持规律的作息，关注身心健康，为应对挑战积蓄能量。"
          },
          encouragement: "路虽远，行则将至；事虽难，做则必成。",
          soulSignature: "静水流深"
        },
        resonanceScore: 80
      };
      if (supabase) {
        const record = { theme, input, profile, result: genericFallback, resonance_score: genericFallback?.resonanceScore ?? null };
        void supabase.from("consultations").insert(record);
      }
      return res.json(genericFallback);
      
      // res.status(500).json({ error: error.message || "生成模拟结果失败" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
    console.log(`[Server] Doubao Endpoint: ${DOUBAO_ENDPOINT}`);
    console.log(`[Server] Doubao Model ID: ${DOUBAO_MODEL_ID}`);
  });
}

startServer();
