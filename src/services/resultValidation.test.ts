import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { PRESET_ANSWERS_LIBRARY } from "../../data/presetAnswers";
import { assertSimulationResult, isSimulationResult } from "./resultValidation";

describe("simulation result validation", () => {
  it("accepts renderable preset simulation results", () => {
    for (const [question, preset] of Object.entries(PRESET_ANSWERS_LIBRARY)) {
      assert.equal(assertSimulationResult(preset, question), preset);
      assert.equal(isSimulationResult(preset), true);
    }
  });

  it("rejects generic fallback-shaped responses that would crash the report", () => {
    const malformed = {
      advice: {
        stateSummary: "系统暂时繁忙",
        riskReminder: "建议稍后重试",
        risks: [],
        actions: {
          today: "深呼吸",
          thisWeek: "梳理问题",
          thisMonth: "保持作息",
        },
        encouragement: "一切都会好起来",
      },
      resonanceScore: 80,
    };

    assert.equal(isSimulationResult(malformed), false);
    assert.throws(
      () => assertSimulationResult(malformed),
      /communicationTip must be a non-empty string/,
    );
  });

  it("requires follow-up questions before rendering", () => {
    const preset = PRESET_ANSWERS_LIBRARY["老伴总是固执不听劝，怎么沟通才有效？"];
    const malformed = { ...preset, followUpQuestions: undefined };

    assert.throws(
      () => assertSimulationResult(malformed),
      /followUpQuestions must be an array of strings/,
    );
  });
});
