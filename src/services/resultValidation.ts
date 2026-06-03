import { DecisionPath, Perspective, RiskIndicator, SimulationResult } from "../types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const hasOnlyStrings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString);

const isRiskLevel = (value: unknown): value is RiskIndicator["level"] =>
  value === "low" || value === "medium" || value === "high";

const isRiskType = (value: unknown): value is RiskIndicator["type"] =>
  value === "health" || value === "relationship" || value === "finance" || value === "psychology";

const isRisk = (value: unknown): value is RiskIndicator => {
  if (!isRecord(value)) return false;
  return (
    isRiskType(value.type) &&
    isRiskLevel(value.level) &&
    isNonEmptyString(value.label) &&
    isNonEmptyString(value.description) &&
    (value.adjustment === undefined || isNonEmptyString(value.adjustment)) &&
    (value.score === undefined || (typeof value.score === "number" && Number.isFinite(value.score)))
  );
};

const isDecisionPath = (value: unknown): value is DecisionPath => {
  if (!isRecord(value)) return false;
  return (
    isNonEmptyString(value.label) &&
    isNonEmptyString(value.trend) &&
    hasOnlyStrings(value.risks) &&
    hasOnlyStrings(value.actions) &&
    isNonEmptyString(value.emotionalImpact)
  );
};

const isPerspective = (value: unknown): value is Perspective => {
  if (!isRecord(value)) return false;
  return (
    isNonEmptyString(value.role) &&
    isNonEmptyString(value.psychology) &&
    isNonEmptyString(value.suggestion)
  );
};

export function isValidSimulationResult(value: unknown): value is SimulationResult {
  if (!isRecord(value) || !isRecord(value.advice)) return false;

  const { advice } = value;
  if (
    !isNonEmptyString(advice.stateSummary) ||
    !isNonEmptyString(advice.riskReminder) ||
    !Array.isArray(advice.risks) ||
    advice.risks.length === 0 ||
    !advice.risks.every(isRisk) ||
    !isRecord(advice.actions) ||
    !isNonEmptyString(advice.actions.today) ||
    !isNonEmptyString(advice.actions.thisWeek) ||
    !isNonEmptyString(advice.actions.thisMonth) ||
    !isNonEmptyString(advice.communicationTip) ||
    !isNonEmptyString(advice.resourceSuggestion) ||
    !isNonEmptyString(advice.encouragement) ||
    !hasOnlyStrings(value.followUpQuestions) ||
    typeof value.resonanceScore !== "number" ||
    !Number.isFinite(value.resonanceScore) ||
    !isNonEmptyString(value.soulSignature)
  ) {
    return false;
  }

  if (advice.lifestyleAdvice !== undefined) {
    if (
      !isRecord(advice.lifestyleAdvice) ||
      !isNonEmptyString(advice.lifestyleAdvice.moodRegulation) ||
      !isNonEmptyString(advice.lifestyleAdvice.sleepImprovement) ||
      !isNonEmptyString(advice.lifestyleAdvice.recreation)
    ) {
      return false;
    }
  }

  if (advice.healthAdvice !== undefined) {
    if (
      !isRecord(advice.healthAdvice) ||
      !isNonEmptyString(advice.healthAdvice.diet) ||
      !isNonEmptyString(advice.healthAdvice.exercise) ||
      !isNonEmptyString(advice.healthAdvice.sleep)
    ) {
      return false;
    }
  }

  if (advice.decisionSimulation !== undefined) {
    if (
      !isRecord(advice.decisionSimulation) ||
      !isDecisionPath(advice.decisionSimulation.pathA) ||
      !isDecisionPath(advice.decisionSimulation.pathB)
    ) {
      return false;
    }
  }

  if (advice.perspectives !== undefined) {
    if (!Array.isArray(advice.perspectives) || advice.perspectives.length === 0 || !advice.perspectives.every(isPerspective)) {
      return false;
    }
  }

  return true;
}

export function assertValidSimulationResult(value: unknown, source: string): SimulationResult {
  if (!isValidSimulationResult(value)) {
    throw new Error(`${source} returned an incomplete simulation result`);
  }
  return value;
}
