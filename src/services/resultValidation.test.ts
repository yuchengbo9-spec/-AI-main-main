import assert from "node:assert/strict";
import { PRESET_ANSWERS_LIBRARY } from "../../data/presetAnswers";
import { isValidSimulationResult } from "./resultValidation";

const validPreset = PRESET_ANSWERS_LIBRARY["老伴总是固执不听劝，怎么沟通才有效？"];

assert.equal(isValidSimulationResult(validPreset), true, "known complete preset should validate");

assert.equal(
  isValidSimulationResult({
    advice: {
      stateSummary: "系统繁忙",
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
  }),
  false,
  "generic fallback payload should be rejected before rendering or persistence",
);

assert.equal(
  isValidSimulationResult({
    ...validPreset,
    advice: {
      ...validPreset.advice,
      actions: {
        today: validPreset.advice.actions.today,
      },
    },
  }),
  false,
  "partial action plans should be rejected",
);

console.log("resultValidation tests passed");
