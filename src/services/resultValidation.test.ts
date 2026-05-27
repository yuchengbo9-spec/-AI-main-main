import assert from "node:assert/strict";
import test from "node:test";
import { assertValidSimulationResult, isValidSimulationResult } from "./resultValidation";

const validResult = {
  advice: {
    stateSummary: "第一句\n第二句",
    riskReminder: "请注意风险",
    risks: [
      {
        type: "health",
        level: "high",
        label: "健康",
        description: "需要关注",
        adjustment: "及时就医",
        score: 90,
      },
    ],
    actions: {
      today: "今天行动",
      thisWeek: "本周行动",
      thisMonth: "本月行动",
    },
    communicationTip: "沟通建议",
    resourceSuggestion: "资源建议",
    encouragement: "鼓励文字",
    decisionSimulation: {
      pathA: {
        label: "方案A",
        trend: "趋势A",
        risks: ["风险A"],
        actions: ["行动A"],
        emotionalImpact: "影响A",
      },
      pathB: {
        label: "方案B",
        trend: "趋势B",
        risks: ["风险B"],
        actions: ["行动B"],
        emotionalImpact: "影响B",
      },
    },
    perspectives: [
      {
        role: "家人",
        psychology: "担心",
        suggestion: "多沟通",
      },
    ],
    caseStudy: {
      title: "案例",
      story: "案例故事",
      expertComment: "专家点评",
    },
  },
  followUpQuestions: ["追问1", "追问2"],
  resonanceScore: 88,
  soulSignature: "心安处",
};

test("accepts renderable simulation results", () => {
  assert.equal(isValidSimulationResult(validResult), true);
  assert.deepEqual(assertValidSimulationResult(validResult, "test"), validResult);
});

test("rejects generic fallback results that would crash result rendering", () => {
  const invalidResult = {
    advice: {
      stateSummary: "系统暂时繁忙",
      riskReminder: "稍后重试",
      risks: [],
      actions: {
        today: "休息",
        thisWeek: "梳理问题",
        thisMonth: "保持作息",
      },
      encouragement: "加油",
    },
    resonanceScore: 80,
  };

  assert.equal(isValidSimulationResult(invalidResult), false);
  assert.throws(
    () => assertValidSimulationResult(invalidResult, "server fallback"),
    /server fallback returned an invalid simulation result/,
  );
});

test("rejects malformed optional decision simulation payloads", () => {
  const invalidResult = structuredClone(validResult);
  invalidResult.advice.decisionSimulation.pathA.risks = undefined as unknown as string[];

  assert.equal(isValidSimulationResult(invalidResult), false);
});
