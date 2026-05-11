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

db.exec(`
  CREATE TABLE IF NOT EXISTS consultation_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    input TEXT,
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

const normalizeUserInput = (input: string): string => {
  if (!input) return "";
  return input
    .trim()
    // Normalize common full-width punctuation/spaces to reduce cache misses
    .replace(/\s+/g, " ")
    .replace(/[，、]/g, ",")
    .replace(/[。．]/g, ".")
    .replace(/[！]/g, "!")
    .replace(/[？]/g, "?")
    .replace(/[：]/g, ":")
    .replace(/[；]/g, ";")
    .replace(/[（]/g, "(")
    .replace(/[）]/g, ")")
    .replace(/[【]/g, "[")
    .replace(/[】]/g, "]")
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'")
    // Remove trailing punctuation (keep content)
    .replace(/[.!,?;:]+$/g, "");
};

  const recordHistory = (input: string, data: any) => {
    try {
      // Simple deduplication check
      const check = db.prepare('SELECT id FROM consultation_history WHERE input = ? LIMIT 1');
      if (!check.get(input)) {
        const stmt = db.prepare('INSERT INTO consultation_history (input, response_json) VALUES (?, ?)');
        stmt.run(input, JSON.stringify(data));
      }
    } catch (e) {
      console.error("[Server] Failed to record history:", e);
    }
  };

  import { PRESET_ANSWERS_LIBRARY } from './data/presetAnswers';

// --- PRESET ANSWERS OPTIMIZATION ---
// Hardcoded high-quality responses for the top questions to avoid AI latency
// Now imported from external file for better maintainability
const PRESET_RESPONSES: Record<string, any> = PRESET_ANSWERS_LIBRARY;

async function startServer() {
  const app = express();
  // Allow port to be set via environment variable or command line argument
  const PORT = parseInt(process.env.PORT || process.argv.find(arg => arg.startsWith('--port='))?.split('=')[1] || "3000");

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

    // Endpoint to download knowledge base (Presets + History)
    app.get("/api/knowledge/export", (req, res) => {
      try {
        // 1. Get Presets
        const exportData: any[] = [];
        
        // Add Presets
        for (const [question, answer] of Object.entries(PRESET_ANSWERS_LIBRARY)) {
          exportData.push({
            type: "preset",
            question: question,
            answer: answer,
            source: "system_knowledge_base"
          });
        }

        // 2. Get History from DB
        const stmt = db.prepare('SELECT input, response_json, created_at FROM consultation_history ORDER BY created_at DESC');
        const history = stmt.all() as any[];
        
        for (const row of history) {
          try {
            // Avoid duplicates if already in preset
            if (!PRESET_ANSWERS_LIBRARY[row.input]) {
              exportData.push({
                type: "history",
                question: row.input,
                answer: JSON.parse(row.response_json),
                source: "user_history",
                created_at: row.created_at
              });
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }

        res.setHeader('Content-Disposition', 'attachment; filename="knowledge_base_report.json"');
        res.setHeader('Content-Type', 'application/json');
        res.json(exportData);
      } catch (error: any) {
        console.error("Export Error:", error);
        res.status(500).json({ error: "Failed to export knowledge base" });
      }
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

  app.post("/api/ai/knowledge", async (req, res) => {
    // This could be an AI call or database lookup in the future
    res.json({ status: "success", message: "Knowledge base endpoint placeholder" });
  });

  app.post("/api/ai/about", async (req, res) => {
    // This could be an AI call or database lookup in the future
    res.json({ status: "success", message: "About us endpoint placeholder" });
  });

  app.post("/api/ai/simulation", async (req, res) => {
    const { theme, input, profile, memoryContext, expertId = "default", attempt = 0 } = req.body;
    console.log(`[AI Simulation] Request received. Theme: ${theme}, Expert: ${expertId}, Attempt: ${attempt}`);

    const normalizedInput = normalizeUserInput(String(input || ""));

    // Check Cache First
    const cacheKey = generateCacheKey('simulation:v2:base', theme, normalizedInput, profile, expertId, memoryContext);
    const cached = getCache(cacheKey);
    if (cached) {
      console.log(`[AI Simulation] Cache hit! Returning stored response.`);
      return res.json(cached);
    }

    // Check Preset Responses (Optimization)
    if (PRESET_RESPONSES[normalizedInput] && expertId === "default") {
      console.log(`[AI Simulation] Hit Preset Response for: ${normalizedInput}`);
      // Simulate a small delay for realistic feel
      await new Promise(resolve => setTimeout(resolve, 800));
      return res.json(PRESET_RESPONSES[normalizedInput]);
    }

    // Expert Persona Configuration
    const EXPERT_PERSONAS: Record<string, string> = {
      "sports": "你是一位专业的『运动康复专家』健指导。性格阳光、科学严谨，总是用充满能量的话语鼓励用户。你擅长将复杂的运动康复科学转化为简单易行的每日小挑战，帮助30-60岁用户安全地提升体能、改善腰酸背痛。你的语气像金牌康复教练一样有感染力且专业。你需要提供相关的康复运动库知识。",
      "diet": "你是一位资深的『饮食营养专家』禾营养师。性格耐心、亲切，像家里的营养师一样关心用户的每一餐。你擅长用生活化的比喻讲解临床营养学知识，帮助用户通过精准的饮食调配来改善肠胃健康和代谢指标，培养良好的饮食习惯。你需要提供相关的健康食谱知识。",
      "tcm": "你是一位经验丰富、沉稳慢条斯理的『中医养生专家』李大夫。性格温和、富有长者智慧。你喜欢用阴阳、气血、五行等中医概念，结合二十四节气和药膳食疗，给用户最地道的传统养生建议。你的语气像一位慈祥且学识渊博的老中医。你需要提供中医典籍中的相关知识。",
      "western": "你是一位严谨、理性、干练的『全科医学专家』Dr. 陈。性格严谨、科学，注重循证医学和前沿研究。你擅长用通俗易懂的语言深度解读体检报告、病理机制和用药原理。你直接给出最高效、最现代的医学建议，绝不拖泥带水。你需要提供最新的医疗研究数据知识。",
      "sleep": "你是一位极具同理心的『睡眠心理专家』眠咨询师。性格轻柔、包容、充满耐心。你的文字仿佛带有白噪音般的安抚力量，擅长运用认知行为疗法（CBT-I）从心理和生理双重角度分析失眠原因，帮助用户放下焦虑，安然入睡。你需要提供睡眠相关的脑神经科学知识。",
      "default": "你是一位专业的『家庭关系专家』智囊顾问。洞察入微、情商极高，需要根据用户的具体输入提供高度定制化的生活与家庭关系建议，擅长化解家庭矛盾和指导子女教育。你需要提供家庭心理学和沟通技巧的知识。"
    };

    const systemPersona = EXPERT_PERSONAS[expertId] || EXPERT_PERSONAS["default"];

    const EXPERT_OUTPUT_RULES: Record<string, string> = {
      sports: `
        【输出差异化要求 - 运动康复专家】
        - 所有建议必须以“可执行动作/训练计划”为核心（如：热身-主练-拉伸）。
        - 行动建议里至少包含 1 个具体动作名 + 频次/组数/时间（例如：靠墙静蹲 3组×30秒）。
        - 风险提醒优先覆盖：膝/腰/肩损伤风险、循序渐进、疼痛红线（出现剧痛/麻木需停止）。
        - 资源推荐优先：训练计划工具、动作库、康复科/运动医学就诊建议。
      `,
      diet: `
        【输出差异化要求 - 饮食营养专家】
        - 所有建议必须以“饮食结构/一日三餐”可落地为核心（包含替代食物建议）。
        - 行动建议里至少出现 1 条“具体食物+份量+时间点”（例如：早餐加 1 份无糖酸奶 200g）。
        - 风险提醒优先覆盖：高糖高油、肠胃负担、补剂相互作用与用量边界。
        - 资源推荐优先：食物记录 App、控糖/低盐工具、营养门诊。
      `,
      tcm: `
        【输出差异化要求 - 中医养生专家】
        - 必须使用中医框架表达（气血/阴阳/脾胃/肝郁等），但落地到“作息+食疗+功法”。
        - 行动建议里至少包含 1 个具体食疗方（材料+做法）或功法（如八段锦/揉腹/泡脚细节）。
        - 风险提醒优先覆盖：体质不合、寒热偏性、孕期/慢病/用药冲突需线下辨证。
        - 资源推荐优先：二十四节气作息、经典书目（黄帝内经入门）或中医门诊。
      `,
      western: `
        【输出差异化要求 - 全科医学专家】
        - 必须以循证与“就医/检查/指标”表述为主，给出分级处置（哪些需要尽快就医）。
        - 行动建议里至少包含 1 条“检查/监测项+频次”（例如：一周内测 3 次晨起血压并记录）。
        - 风险提醒优先覆盖：危险信号（胸痛/气促/黑便等）、不要自行停药/加量。
        - 资源推荐优先：指南/科普来源、就诊科室建议、记录模板。
      `,
      sleep: `
        【输出差异化要求 - 睡眠心理专家】
        - 必须以 CBT-I（睡眠限制/刺激控制/认知重建/放松训练）为主线。
        - 行动建议里至少包含 1 个“睡前流程”步骤（例如：固定关灯时间、10分钟渐进肌肉放松）。
        - 风险提醒优先覆盖：安眠药依赖风险、打鼾憋醒需筛查睡眠呼吸暂停。
        - 资源推荐优先：睡眠日记、冥想/白噪音工具、睡眠门诊。
      `,
      default: `
        【输出差异化要求 - 家庭关系专家】
        - 必须用“同理心 + 结构化沟通”输出（如：非暴力沟通四步：观察-感受-需要-请求）。
        - 行动建议里至少包含 1 句可直接复制的“沟通话术”，并提供 1 个备选说法。
        - 风险提醒优先覆盖：升级冲突、冷暴力、财务/边界问题的长期隐患。
        - 资源推荐优先：沟通书籍/练习工具、家庭咨询建议。
      `
    };
    const outputRules = EXPERT_OUTPUT_RULES[expertId] || EXPERT_OUTPUT_RULES["default"];

    try {
      const prompt = `
        用户画像: ${JSON.stringify(profile)}
        主题: ${theme}
        用户输入: ${normalizedInput}
        历史记忆上下文: ${memoryContext}

        ${systemPersona}
        ${outputRules}
        
        【重要原则】
        1. 必须完全代入你当前的角色（${expertId}）。语气、用词、专业侧重点都要符合人设。
        2. 严禁使用笼统的套话。必须针对具体问题给出具体操作建议。
        3. 为了增加用户的学习粘性和趣味性，必须包含一个“技能卡片(skillCard)”，设计一个像玩游戏一样的每日小挑战。
        4. 首屏速度优先：本次只生成“核心可执行建议”，不要生成深度模块（案例、多视角、中西医推演、长篇知识库）。
        5. 【强制对齐】必须围绕“用户画像的 mainConcern + 本次用户输入 + 主题”作答。除非用户输入明确提到，否则禁止突然切到不相关的身体部位/疾病/场景（例如未提膝盖，不要输出膝盖方案）。
        
        要求：
        1. 所有输出内容必须使用简体中文。
        2. 必须返回严格的 JSON 格式。
        
        JSON 结构要求:
        {
          "advice": {
            "stateSummary": "三句话精准总结（带入你的人设语气）：1. 现状定性；2. 核心痛点；3. 改善方向。",
            "riskReminder": "针对用户输入内容的特定风险提示。",
            "risks": [
              {"type": "health", "level": "low|medium|high", "label": "4字以内标签", "description": "针对用户情况的20字具体描述", "adjustment": "具体15字对策", "score": 0-100}
            ],
            "skillCard": {
              "name": "有趣的技能名称，如'护肝达人初级修炼'",
              "description": "用玩游戏的方式解释这个技能对生活质量的提升",
              "points": 获得该技能可奖励的积分(10-100的整数),
              "challenge": "今天就可以完成的一个简单有趣的小挑战，用于记住这个技能"
            },
            "actions": {
              "today": "针对用户问题，今天立刻能做的一件具体小事（30字以内）。",
              "thisWeek": "本周内需要完成的一项具体任务，用于改善现状（30字以内）。",
              "thisMonth": "本月需要坚持的一个具体习惯或规划（30字以内）。"
            },
            "communicationTip": "针对用户具体场景的一句高情商话术（例如：如果是婆媳矛盾，给出一句具体的话；如果是看病，给出一句具体的问诊话术）。",
            "resourceSuggestion": "针对用户问题推荐一本具体的书、一部电影、一个工具或一种服务（30字以内）。",
            "encouragement": "一句温暖人心且与用户处境相关的鼓励（30字以内）。"
          },
          "memoryUpdate": {"newTags": ["标签"], "anxietyPoints": ["痛点"]},
          "followUpQuestions": ["针对回答内容的追问1", "针对回答内容的追问2", "针对回答内容的追问3"],
          "resonanceScore": 0-100,
          "soulSignature": "一句符合用户当前心境的诗词或格言（10字以内）"
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
      // Record in history for export
      recordHistory(normalizedInput, finalResult);

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
      const presetMatch = Object.keys(PRESET_RESPONSES).find(k => normalizedInput.includes(k) || k.includes(normalizedInput));
      if (presetMatch) {
        console.log(`[AI Simulation] Fallback to Preset Response for: ${presetMatch}`);
        const resp = PRESET_RESPONSES[presetMatch];
        if (supabase) {
          const record = { theme, input: normalizedInput, profile, result: resp, resonance_score: resp?.resonanceScore ?? null };
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
          skillCard: {
            name: "从容不迫的探索者",
            description: "遇到系统延迟也能保持好心情，这本身就是一种高级的情绪管理技能！",
            points: 10,
            challenge: "喝一杯温水，深呼吸一次，然后再试一次。"
          },
          actions: {
            today: "深呼吸，暂时放下焦虑，做一件让自己放松的小事（如散步、听音乐）。",
            thisWeek: "梳理当前的问题清单，按优先级排序，先解决最紧急的一项。",
            thisMonth: "保持规律的作息，关注身心健康，为应对挑战积蓄能量。"
          },
          communicationTip: "我理解你现在很不容易。我们先把最紧急的一点理清，然后一步步来，好吗？",
          resourceSuggestion: "用手机备忘录写下“我能控制的3件事”。",
          encouragement: "路虽远，行则将至；事虽难，做则必成。",
          wellAly: {
            healthRecords: [{ type: "咨询要点记录", suggestion: "把关键事实、时间线、目标写成3条，方便下次咨询更精准。" }]
          }
        },
        followUpQuestions: ["你希望优先解决哪一件事？", "这件事最糟的情况你担心什么？", "你目前能投入的时间/精力大概是多少？"],
        resonanceScore: 80,
        soulSignature: "静水流深"
      };
      if (supabase) {
        const record = { theme, input: normalizedInput, profile, result: genericFallback, resonance_score: genericFallback?.resonanceScore ?? null };
        void supabase.from("consultations").insert(record);
      }
      return res.json(genericFallback);
      
      // res.status(500).json({ error: error.message || "生成模拟结果失败" });
    }
  });

  app.post("/api/ai/simulation/deepdive", async (req, res) => {
    const { theme, input, profile, memoryContext, expertId = "default", attempt = 0 } = req.body;
    console.log(`[AI DeepDive] Request received. Theme: ${theme}, Expert: ${expertId}, Attempt: ${attempt}`);

    const normalizedInput = normalizeUserInput(String(input || ""));

    const cacheKey = generateCacheKey('simulation:v2:deepdive', theme, normalizedInput, profile, expertId, memoryContext);
    const cached = getCache(cacheKey);
    if (cached) {
      console.log(`[AI DeepDive] Cache hit! Returning stored response.`);
      return res.json(cached);
    }

    // Expert Persona Configuration (reuse)
    const EXPERT_PERSONAS: Record<string, string> = {
      "sports": "你是一位专业的『运动康复专家』健指导。性格阳光、科学严谨，总是用充满能量的话语鼓励用户。你擅长将复杂的运动康复科学转化为简单易行的每日小挑战，帮助30-60岁用户安全地提升体能、改善腰酸背痛。你的语气像金牌康复教练一样有感染力且专业。你需要提供相关的康复运动库知识。",
      "diet": "你是一位资深的『饮食营养专家』禾营养师。性格耐心、亲切，像家里的营养师一样关心用户的每一餐。你擅长用生活化的比喻讲解临床营养学知识，帮助用户通过精准的饮食调配来改善肠胃健康和代谢指标，培养良好的饮食习惯。你需要提供相关的健康食谱知识。",
      "tcm": "你是一位经验丰富、沉稳慢条斯理的『中医养生专家』李大夫。性格温和、富有长者智慧。你喜欢用阴阳、气血、五行等中医概念，结合二十四节气和药膳食疗，给用户最地道的传统养生建议。你的语气像一位慈祥且学识渊博的老中医。你需要提供中医典籍中的相关知识。",
      "western": "你是一位严谨、理性、干练的『全科医学专家』Dr. 陈。性格严谨、科学，注重循证医学和前沿研究。你擅长用通俗易懂的语言深度解读体检报告、病理机制和用药原理。你直接给出最高效、最现代的医学建议，绝不拖泥带水。你需要提供最新的医疗研究数据知识。",
      "sleep": "你是一位极具同理心的『睡眠心理专家』眠咨询师。性格轻柔、包容、充满耐心。你的文字仿佛带有白噪音般的安抚力量，擅长运用认知行为疗法（CBT-I）从心理和生理双重角度分析失眠原因，帮助用户放下焦虑，安然入睡。你需要提供睡眠相关的脑神经科学知识。",
      "default": "你是一位专业的『家庭关系专家』智囊顾问。洞察入微、情商极高，需要根据用户的具体输入提供高度定制化的生活与家庭关系建议，擅长化解家庭矛盾和指导子女教育。你需要提供家庭心理学和沟通技巧的知识。"
    };
    const systemPersona = EXPERT_PERSONAS[expertId] || EXPERT_PERSONAS["default"];

    const EXPERT_DEEPDIVE_RULES: Record<string, string> = {
      sports: `
        - 决策推演的 actions 必须是康复训练/拉伸/力量计划，避免保健品堆砌。
        - wellAly.reportAnalysis 优先给“疼痛/活动度/心率/步数”等可跟踪指标。
      `,
      diet: `
        - 决策推演的 actions 必须是饮食结构与食谱/替代方案，保健品仅作为辅助并给边界。
        - wellAly.reportAnalysis 优先给“体重/腰围/血糖/血脂/便秘频率”等。
      `,
      tcm: `
        - 决策推演中 pathA 重点写“食疗+功法+作息”，给出材料与做法；pathB 作为现代辅助。
        - wellAly.healthRecords 优先建议“舌象/睡眠/大便/月经(如适用)”记录。
      `,
      western: `
        - 决策推演中 pathB 重点写“检查-干预-复查”闭环；pathA 作为生活方式辅助。
        - caseStudy 必须突出“何时就医/做了什么检查/结果如何”。
      `,
      sleep: `
        - lifestyleAdvice 必须显式体现 CBT-I 的步骤与时间安排。
        - wellAly.healthRecords 必须包含“睡眠日记”。
      `,
      default: `
        - perspectives 必须至少包含“对方视角 + 第三方(如医生/老师/亲友)视角”。
        - caseStudy 必须突出“沟通前后对比 + 具体话术/边界设定”。
      `
    };
    const deepdiveRules = EXPERT_DEEPDIVE_RULES[expertId] || EXPERT_DEEPDIVE_RULES["default"];

    try {
      const prompt = `
        用户画像: ${JSON.stringify(profile)}
        主题: ${theme}
        用户输入: ${normalizedInput}
        历史记忆上下文: ${memoryContext}

        ${systemPersona}
        ${deepdiveRules}

        现在请生成“深度分析模块”，用于用户在结果页展开后查看。必须更具体、更可执行。
        注意：不要重复输出首屏的 stateSummary、actions、risks 等；只输出以下深度字段。

        要求：
        1. 所有输出内容必须使用简体中文。
        2. 必须返回严格的 JSON 格式。

        JSON 结构要求:
        {
          "advice": {
            "lifestyleAdvice": {
              "moodRegulation": "针对用户当前情绪的具体调节方法（15字）。",
              "sleepImprovement": "针对用户睡眠问题的具体改善建议（15字）。",
              "recreation": "推荐一项适合用户画像的具体休闲活动（15字）。"
            },
            "wellAly": {
              "healthRecords": [{"type": "建议归档的具体资料名", "suggestion": "针对该资料的整理建议"}],
              "medicationTracker": [{"name": "推测可能需要的药品/保健品（必须根据用户症状具体推荐，如鱼油、氨糖、褪黑素等）", "frequency": "建议频次", "note": "针对该药品的具体注意事项和保护身体的原理"}],
              "reportAnalysis": [{"item": "用户提到的或相关的关键指标", "result": "基于用户描述的推测分析", "advice": "针对该指标的具体建议"}],
              "familyHealth": [{"member": "具体家庭成员", "advice": "针对该成员的具体健康/相处建议"}],
              "emotionalRituals": [{"ritualName": "具体的情感互动仪式（如：睡前感恩、周末散步）", "frequency": "建议频次", "benefit": "对关系修复的具体益处"}],
              "relationshipDynamics": [{"indicator": "核心关系指标（如：沟通频率、情绪温度）", "status": "当前状态评估", "advice": "针对该状态的破冰或维持建议"}]
            },
            "decisionSimulation": {
              "pathA": {"label": "中医食疗与功法调理", "trend": "详细说明气血、经络的改善过程及周期", "risks": ["说明具体的体质排异反应或见效慢的原因"], "actions": ["提供极其具体的食疗配方或功法"], "emotionalImpact": "调理后的身心综合感受"},
              "pathB": {"label": "西医精准营养干预", "trend": "详细说明细胞代谢、特定营养素吸收的过程及周期", "risks": ["说明具体的肝肾代谢负担或潜在副作用"], "actions": ["提供极其具体的现代医学干预方案"], "emotionalImpact": "调理后的身心综合感受"}
            },
            "perspectives": [{"role": "换位角色（如子女/伴侣/医生）", "psychology": "该角色此时的真实心理活动", "suggestion": "基于该角色的具体建议"}],
            "caseStudy": {
              "title": "与用户情况高度相似的案例标题",
              "story": "一个与用户当前困境非常相似的真实案例故事（50字以内）。",
              "expertComment": "专家对该案例的关键点评（30字以内）。"
            }
          }
        }
      `;

      const content = await callDoubao(prompt, "你是一个专业的家庭守护 AI 顾问，只输出 JSON。", attempt === 0 ? 0.5 : 0.3);
      let deep = safeJsonParse(content);

      if (!deep || !deep.advice) {
        throw new Error("AI deepdive response malformed");
      }

      setCache(cacheKey, deep);
      res.json(deep);
    } catch (error: any) {
      console.error("Doubao DeepDive Error:", error);
      const fallback = {
        advice: {
          lifestyleAdvice: {
            moodRegulation: "写下3件可控小事",
            sleepImprovement: "睡前30分钟不刷屏",
            recreation: "晚饭后散步20分钟"
          },
          wellAly: {
            healthRecords: [{ type: "关键事实清单", suggestion: "把人、事、钱、时间线列成4行，便于复盘。" }]
          }
        }
      };
      return res.json(fallback);
    }
  });

  app.post("/api/ai/persona360", async (req, res) => {
    const { profile, theme, input, expertId = "default", lastAdvice } = req.body || {};
    console.log(`[AI Persona360] Request received. Theme: ${theme}, Expert: ${expertId}`);

    const normalizedInput = normalizeUserInput(String(input || ""));
    const cacheKey = generateCacheKey("persona360:v1", profile, theme, normalizedInput, expertId);
    const cached = getCache(cacheKey);
    if (cached) {
      console.log("[AI Persona360] Cache hit! Returning stored response.");
      return res.json(cached);
    }

    try {
      const prompt = `
        你是一位专业、谨慎、以科学与可执行建议为核心的“360 生活健康管理智能体”。

        用户画像: ${JSON.stringify(profile)}
        本次主题: ${theme}
        用户输入(归一化): ${normalizedInput}
        本次已给出的核心建议(可能为空): ${JSON.stringify(lastAdvice || {})}

        目标：生成一份“用户人像 360 报告”，让用户产生长期使用依赖。
        规则：
        - 必须与用户输入高度对齐，禁止跑题。
        - 输出必须具体、可执行、可量化，尽量避免空泛鸡汤。
        - 维度必须覆盖：养生、健康、运动、穿搭、情绪、家庭；可额外包含事业/社交但不要喧宾夺主。
        - 每个维度都给出：总结、今天可做、这周可做、避免事项、可量化指标（如适用）。
        - 给出未来 7 天的“每日重点 + 任务”计划（7条）。
        - 所有内容使用简体中文。
        - 必须返回严格 JSON（不要 markdown）。

        JSON 格式：
        {
          "createdAt": "ISO时间",
          "title": "报告标题",
          "personaSummary": "150字以内总体画像",
          "keySignals": ["关键事实1","关键事实2","关键事实3"],
          "topConcerns": ["关注点1","关注点2","关注点3"],
          "strengths": ["优势1","优势2","优势3"],
          "blindSpots": ["盲点1","盲点2","盲点3"],
          "dimensions": [
            {
              "name": "养生|健康|运动|穿搭|情绪|家庭|事业|社交",
              "summary": "1-2句总结",
              "doToday": "一句具体行动",
              "doThisWeek": "一句具体行动",
              "avoid": "一句避免事项",
              "metrics": ["指标1","指标2"]
            }
          ],
          "next7DaysPlan": [
            {"day":"Day1","focus":"重点","task":"任务"},
            {"day":"Day2","focus":"重点","task":"任务"},
            {"day":"Day3","focus":"重点","task":"任务"},
            {"day":"Day4","focus":"重点","task":"任务"},
            {"day":"Day5","focus":"重点","task":"任务"},
            {"day":"Day6","focus":"重点","task":"任务"},
            {"day":"Day7","focus":"重点","task":"任务"}
          ],
          "disclaimer": "免责声明"
        }
      `;

      const content = await callDoubao(prompt, "你是一个只输出 JSON 的专业生活健康管理智能体。", 0.4);
      const data = safeJsonParse(content);
      if (!data || !data.dimensions) {
        throw new Error("persona360 response malformed");
      }
      setCache(cacheKey, data);
      res.json(data);
    } catch (error: any) {
      console.error("Doubao Persona360 Error:", error);
      res.status(500).json({ error: error.message || "生成 360 报告失败" });
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
