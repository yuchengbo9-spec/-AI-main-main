import assert from 'node:assert/strict';
import { PRESET_ANSWERS_LIBRARY } from '../data/presetAnswers';
import { getSimulationResultValidationError, isValidSimulationResult } from '../src/services/resultValidation';

const validPresetEntries = Object.entries(PRESET_ANSWERS_LIBRARY);

assert.ok(validPresetEntries.length > 0, 'preset answer library should not be empty');

for (const [question, result] of validPresetEntries) {
  assert.equal(
    getSimulationResultValidationError(result),
    null,
    `preset answer should be renderable: ${question}`,
  );
  assert.equal(isValidSimulationResult(result), true, `preset answer should pass type guard: ${question}`);
}

const malformedServerFallback = {
  advice: {
    stateSummary: '系统暂时繁忙',
    riskReminder: '请稍后重试',
    risks: [],
    actions: {
      today: '休息一下',
      thisWeek: '整理问题',
      thisMonth: '保持作息',
    },
    encouragement: '保持耐心',
  },
  resonanceScore: 80,
};

assert.match(
  getSimulationResultValidationError(malformedServerFallback) ?? '',
  /communicationTip|followUpQuestions/,
  'malformed fallback must be rejected before it can crash result rendering',
);
assert.equal(isValidSimulationResult(malformedServerFallback), false);

const missingDecisionPathArrays = {
  ...validPresetEntries[0][1],
  advice: {
    ...validPresetEntries[0][1].advice,
    decisionSimulation: {
      pathA: { label: 'A', trend: 'ok', risks: 'not-array', actions: [], emotionalImpact: 'calm' },
      pathB: { label: 'B', trend: 'ok', risks: [], actions: [], emotionalImpact: 'calm' },
    },
  },
};

assert.match(
  getSimulationResultValidationError(missingDecisionPathArrays) ?? '',
  /decisionSimulation\.pathA/,
  'decision simulator payloads must include array fields used by the UI',
);

console.log('resultValidation tests passed');
