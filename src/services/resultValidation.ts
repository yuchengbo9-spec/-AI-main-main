import type { DecisionPath, Perspective, RiskIndicator, SimulationResult } from '../types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString);

const isRiskIndicator = (value: unknown): value is RiskIndicator => {
  if (!isRecord(value)) return false;
  return (
    isString(value.type) &&
    isString(value.level) &&
    isString(value.label) &&
    isString(value.description) &&
    (value.adjustment === undefined || isString(value.adjustment)) &&
    (value.score === undefined || isFiniteNumber(value.score))
  );
};

const isDecisionPath = (value: unknown): value is DecisionPath => {
  if (!isRecord(value)) return false;
  return (
    isString(value.label) &&
    isString(value.trend) &&
    isStringArray(value.risks) &&
    isStringArray(value.actions) &&
    isString(value.emotionalImpact)
  );
};

const isPerspective = (value: unknown): value is Perspective => {
  if (!isRecord(value)) return false;
  return isString(value.role) && isString(value.psychology) && isString(value.suggestion);
};

export function getSimulationResultValidationError(value: unknown): string | null {
  if (!isRecord(value)) return 'result must be an object';

  const { advice } = value;
  if (!isRecord(advice)) return 'result.advice must be an object';

  if (!isString(advice.stateSummary)) return 'result.advice.stateSummary must be a string';
  if (!isString(advice.riskReminder)) return 'result.advice.riskReminder must be a string';
  if (!Array.isArray(advice.risks) || !advice.risks.every(isRiskIndicator)) {
    return 'result.advice.risks must be an array of risk indicators';
  }

  if (!isRecord(advice.actions)) return 'result.advice.actions must be an object';
  if (!isString(advice.actions.today)) return 'result.advice.actions.today must be a string';
  if (!isString(advice.actions.thisWeek)) return 'result.advice.actions.thisWeek must be a string';
  if (!isString(advice.actions.thisMonth)) return 'result.advice.actions.thisMonth must be a string';

  if (!isString(advice.communicationTip)) return 'result.advice.communicationTip must be a string';
  if (!isString(advice.resourceSuggestion)) return 'result.advice.resourceSuggestion must be a string';
  if (!isString(advice.encouragement)) return 'result.advice.encouragement must be a string';

  if (advice.lifestyleAdvice !== undefined) {
    if (!isRecord(advice.lifestyleAdvice)) return 'result.advice.lifestyleAdvice must be an object';
    if (!isString(advice.lifestyleAdvice.moodRegulation)) return 'result.advice.lifestyleAdvice.moodRegulation must be a string';
    if (!isString(advice.lifestyleAdvice.sleepImprovement)) return 'result.advice.lifestyleAdvice.sleepImprovement must be a string';
    if (!isString(advice.lifestyleAdvice.recreation)) return 'result.advice.lifestyleAdvice.recreation must be a string';
  }

  if (advice.healthAdvice !== undefined) {
    if (!isRecord(advice.healthAdvice)) return 'result.advice.healthAdvice must be an object';
    if (!isString(advice.healthAdvice.diet)) return 'result.advice.healthAdvice.diet must be a string';
    if (!isString(advice.healthAdvice.exercise)) return 'result.advice.healthAdvice.exercise must be a string';
    if (!isString(advice.healthAdvice.sleep)) return 'result.advice.healthAdvice.sleep must be a string';
  }

  if (advice.decisionSimulation !== undefined) {
    if (!isRecord(advice.decisionSimulation)) return 'result.advice.decisionSimulation must be an object';
    if (!isDecisionPath(advice.decisionSimulation.pathA)) return 'result.advice.decisionSimulation.pathA is invalid';
    if (!isDecisionPath(advice.decisionSimulation.pathB)) return 'result.advice.decisionSimulation.pathB is invalid';
  }

  if (advice.perspectives !== undefined) {
    if (!Array.isArray(advice.perspectives) || !advice.perspectives.every(isPerspective)) {
      return 'result.advice.perspectives must be an array of perspectives';
    }
  }

  if (advice.caseStudy !== undefined) {
    if (!isRecord(advice.caseStudy)) return 'result.advice.caseStudy must be an object';
    if (!isString(advice.caseStudy.title)) return 'result.advice.caseStudy.title must be a string';
    if (!isString(advice.caseStudy.story)) return 'result.advice.caseStudy.story must be a string';
    if (!isString(advice.caseStudy.expertComment)) return 'result.advice.caseStudy.expertComment must be a string';
  }

  if (!isStringArray(value.followUpQuestions)) return 'result.followUpQuestions must be an array of strings';
  if (!isFiniteNumber(value.resonanceScore)) return 'result.resonanceScore must be a finite number';
  if (!isString(value.soulSignature)) return 'result.soulSignature must be a string';

  return null;
}

export function isValidSimulationResult(value: unknown): value is SimulationResult {
  return getSimulationResultValidationError(value) === null;
}
