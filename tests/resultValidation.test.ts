import assert from "node:assert/strict";
import { isSimulationResult } from "../src/services/resultValidation";

const validResult = {
  advice: {
    stateSummary: "当前问题可以分步处理。\n核心挑战是沟通。\n稳步行动会改善。",
    riskReminder: "请避免仓促作出重大决定。",
    risks: [
      {
        type: "relationship",
        level: "medium",
        label: "沟通",
        description: "双方表达容易错位",
        adjustment: "先复述再回应",
        score: 60
      }
    ],
    actions: {
      today: "记录最困扰的一件事。",
      thisWeek: "安排一次平静沟通。",
      thisMonth: "复盘沟通改善情况。"
    },
    communicationTip: "我想先理解你的真实想法。",
    resourceSuggestion: "可阅读家庭沟通相关资料。",
    encouragement: "慢慢来，关系修复需要耐心。"
  },
  followUpQuestions: ["下一步怎么沟通？"],
  resonanceScore: 88,
  soulSignature: "心安处是归途"
};

assert.equal(isSimulationResult(validResult), true);
assert.equal(isSimulationResult({ ...validResult, followUpQuestions: undefined }), false);
assert.equal(isSimulationResult({ ...validResult, advice: { ...validResult.advice, actions: undefined } }), false);
assert.equal(isSimulationResult({ ...validResult, advice: {} }), false);

console.log("resultValidation tests passed");
