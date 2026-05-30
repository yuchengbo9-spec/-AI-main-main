import test from "node:test";
import assert from "node:assert/strict";
import { assertIsSimulationResult } from "../src/services/resultValidation";

const validResult = {
  advice: {
    stateSummary: "Summary line one\nSummary line two",
    riskReminder: "Watch the primary risk.",
    risks: [
      {
        type: "health",
        level: "medium",
        label: "Sleep",
        description: "Sleep is unstable",
        adjustment: "Keep a routine",
        score: 50,
      },
    ],
    actions: {
      today: "Write one concrete next step.",
      thisWeek: "Discuss the plan with family.",
      thisMonth: "Review progress and adjust.",
    },
    communicationTip: "Use calm language.",
    resourceSuggestion: "Read a trusted guide.",
    encouragement: "Small steps count.",
    decisionSimulation: {
      pathA: {
        label: "Steady",
        trend: "Risk decreases",
        risks: ["Progress is slower"],
        actions: ["Set boundaries"],
        emotionalImpact: "More stable",
      },
      pathB: {
        label: "Fast",
        trend: "Change accelerates",
        risks: ["Stress may spike"],
        actions: ["Ask for support"],
        emotionalImpact: "More intense",
      },
    },
  },
  followUpQuestions: ["What should I do first?"],
  resonanceScore: 88,
  soulSignature: "Keep going",
};

test("accepts complete simulation results", () => {
  assert.equal(assertIsSimulationResult(validResult), validResult);
});

test("rejects generic fallback-shaped responses missing render-critical fields", () => {
  assert.throws(
    () =>
      assertIsSimulationResult({
        advice: {
          stateSummary: "System is busy.",
          riskReminder: "Try again later.",
          risks: [],
          actions: {
            today: "Relax.",
            thisWeek: "Make a list.",
            thisMonth: "Keep a routine.",
          },
          encouragement: "Keep going.",
        },
        resonanceScore: 80,
      }),
    /Invalid simulation result/
  );
});

test("rejects malformed decision paths that would crash the result view", () => {
  const malformed = structuredClone(validResult);
  malformed.advice.decisionSimulation.pathA.risks = undefined as unknown as string[];

  assert.throws(
    () => assertIsSimulationResult(malformed),
    /Invalid simulation result/
  );
});
