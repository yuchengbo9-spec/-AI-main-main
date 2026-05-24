import assert from "node:assert/strict";
import { isSimulationResult, validateSimulationResult } from "../src/services/resultValidation";

const validResult = {
  advice: {
    stateSummary: "当前问题清晰。\n需要稳妥处理。\n可以逐步改善。",
    riskReminder: "避免仓促决策。",
    risks: [],
    actions: {
      today: "先写下最担心的问题。",
      thisWeek: "和家人安排一次沟通。",
      thisMonth: "复盘进展并调整计划。",
    },
    communicationTip: "我们一起慢慢商量。",
    resourceSuggestion: "记录沟通重点。",
    encouragement: "一步一步来。",
  },
  followUpQuestions: ["还可以怎么做？"],
  resonanceScore: 80,
  soulSignature: "稳中求进",
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

assert.equal(isSimulationResult(validResult), true);
assert.equal(validateSimulationResult(validResult), validResult);

const missingFollowUps = clone(validResult);
delete (missingFollowUps as any).followUpQuestions;
assert.equal(isSimulationResult(missingFollowUps), false);
assert.throws(() => validateSimulationResult(missingFollowUps), /格式不完整/);

const missingRenderableAdvice = clone(validResult);
delete (missingRenderableAdvice as any).advice.communicationTip;
assert.equal(isSimulationResult(missingRenderableAdvice), false);
assert.throws(() => validateSimulationResult(missingRenderableAdvice), /格式不完整/);

const genericServerFallback = {
  advice: {
    stateSummary: "系统暂时繁忙。",
    riskReminder: "建议稍后重试。",
    risks: [],
    actions: {
      today: "深呼吸。",
      thisWeek: "梳理问题。",
      thisMonth: "保持规律作息。",
    },
    encouragement: "路虽远，行则将至。",
  },
  resonanceScore: 80,
};

assert.equal(isSimulationResult(genericServerFallback), false);

console.log("result validation tests passed");
