import { SimulationResult, UserProfile, RecommendedQuestion } from "../types";
import { MemoryService } from "./memory";

/**
 * Helper to call backend AI endpoints
 */
async function callBackendAI(endpoint: string, body: any): Promise<any> {
  try {
    // Ensure absolute URL for fetch
    const absoluteUrl = endpoint.startsWith("http") 
      ? endpoint 
      : `${window.location.origin}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const response = await fetch(absoluteUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).catch(err => {
      console.error("Fetch network error:", err);
      throw new Error(`网络请求失败: ${err.message || "无法连接到服务器"}`);
    });

    const text = await response.text();

    if (!response.ok) {
      let errorMsg = `服务器请求失败 (${response.status})`;
      try {
        const errorData = JSON.parse(text);
        errorMsg = errorData.error || errorMsg;
      } catch (e) {
        // Not JSON, use the text if it's short, otherwise status
        if (text && text.length < 200 && !text.includes("<!DOCTYPE")) {
          errorMsg = text;
        }
      }
      throw new Error(errorMsg);
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse backend response as JSON:", text);
      throw new Error("服务器返回了无效的格式，请稍后再试");
    }
  } catch (err: any) {
    if (err.message === "The string did not match the expected pattern.") {
      throw new Error("网络请求异常，请检查网络连接或稍后重试");
    }
    throw err;
  }
}

/** 7×24 知识库增强智能客服（后端 /api/ai/knowledge） */
export async function askKnowledgeAssistant(question: string): Promise<string> {
  const data = await callBackendAI("/api/ai/knowledge", { question });
  if (data && typeof data.answer === "string") return data.answer;
  throw new Error("服务器返回格式异常");
}

export async function generateRecommendedQuestions(
  profile: UserProfile,
  theme: string
): Promise<RecommendedQuestion[]> {
  const memoryContext = MemoryService.getMemoryContext();
  
  try {
    return await callBackendAI("/api/ai/questions", {
      profile,
      theme,
      memoryContext
    });
  } catch (err) {
    console.error("Failed to load recommended questions:", err);
    return [];
  }
}

export async function generateLifeSimulation(
  theme: string,
  input: string,
  profile: UserProfile,
  expertId?: string
): Promise<SimulationResult> {
  const memoryContext = MemoryService.getMemoryContext();
  let lastError: any;

  console.log("[Frontend AI Service] Starting simulation request...", { theme, input, expertId });

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await callBackendAI("/api/ai/simulation", {
        theme,
        input,
        profile,
        expertId,
        memoryContext,
        attempt
      });
      console.log("[Frontend AI Service] Simulation request success", result);
      return result;
    } catch (err) {
      console.error(`[Frontend AI Service] Simulation attempt ${attempt + 1} failed:`, err);
      lastError = err;
      if (attempt === 0) {
        // Wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  throw lastError;
}

export type DeepDiveResponse = {
  advice?: Partial<SimulationResult["advice"]>;
};

export async function generateLifeSimulationDeepDive(
  theme: string,
  input: string,
  profile: UserProfile,
  expertId?: string
): Promise<DeepDiveResponse> {
  const memoryContext = MemoryService.getMemoryContext();
  let lastError: any;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await callBackendAI("/api/ai/simulation/deepdive", {
        theme,
        input,
        profile,
        expertId,
        memoryContext,
        attempt
      });
    } catch (err) {
      console.error(`[Frontend AI Service] Deepdive attempt ${attempt + 1} failed:`, err);
      lastError = err;
      if (attempt === 0) {
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
    }
  }
  throw lastError;
}

export async function generatePersona360Report(params: {
  profile: UserProfile;
  theme: string;
  input: string;
  expertId?: string;
  lastAdvice?: SimulationResult["advice"];
}): Promise<any> {
  return await callBackendAI("/api/ai/persona360", {
    profile: params.profile,
    theme: params.theme,
    input: params.input,
    expertId: params.expertId,
    lastAdvice: params.lastAdvice
  });
}
