import assert from "node:assert/strict";
import test from "node:test";
import { PRESET_ANSWERS_LIBRARY } from "../../data/presetAnswers";
import { isSimulationResult } from "./resultValidation";

const validResult = {
  advice: {
    stateSummary: "第一句总结。\n第二句总结。",
    riskReminder: "请关注潜在风险。",
    risks: [
      {
        type: "health",
        level: "medium",
        label: "睡眠",
        description: "睡眠不足",
        adjustment: "规律作息",
        score: 60,
      },
    ],
    actions: {
      today: "今天先梳理问题。",
      thisWeek: "本周安排一次沟通。",
      thisMonth: "本月复盘行动结果。",
    },
    communicationTip: "先倾听，再表达自己的感受。",
    resourceSuggestion: "记录一次完整沟通过程。",
    encouragement: "小步行动也会带来改变。",
    decisionSimulation: {
      pathA: {
        label: "稳妥",
        trend: "风险较低",
        risks: ["推进较慢"],
        actions: ["分步沟通"],
        emotionalImpact: "更安心",
      },
      pathB: {
        label: "直接",
        trend: "见效更快",
        risks: ["冲突升级"],
        actions: ["坦诚表达"],
        emotionalImpact: "有压力",
      },
    },
    perspectives: [
      {
        role: "自我",
        psychology: "希望被理解",
        suggestion: "先明确边界",
      },
    ],
  },
  followUpQuestions: ["如何开始沟通？"],
  resonanceScore: 88,
  soulSignature: "稳中求进",
};

test("accepts a complete renderable simulation result", () => {
  assert.equal(isSimulationResult(validResult), true);
});

test("rejects generic fallback responses that would render as successful advice", () => {
  const genericFallback = {
    advice: {
      stateSummary: "系统暂时繁忙，但您的困扰我们收到了。",
      riskReminder: "建议稍后重试或咨询专业人士。",
      risks: [],
      actions: {
        today: "深呼吸。",
        thisWeek: "梳理当前的问题清单。",
        thisMonth: "保持规律的作息。",
      },
      encouragement: "路虽远，行则将至。",
    },
    resonanceScore: 80,
  };

  assert.equal(isSimulationResult(genericFallback), false);
});

test("rejects malformed decision simulations before they reach the UI", () => {
  const malformed = structuredClone(validResult);
  malformed.advice.decisionSimulation.pathA.risks = undefined as unknown as string[];

  assert.equal(isSimulationResult(malformed), false);
});

test("all preset simulation responses match the renderable result contract", () => {
  for (const [question, result] of Object.entries(PRESET_ANSWERS_LIBRARY)) {
    assert.equal(isSimulationResult(result), true, `Invalid preset result for "${question}"`);
  }
});
