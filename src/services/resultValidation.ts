import { SimulationResult } from "../types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isNonEmptyString);

const hasRequiredActionPlan = (value: unknown): boolean => {
  if (!isRecord(value)) return false;

  return (
    isNonEmptyString(value.today) &&
    isNonEmptyString(value.thisWeek) &&
    isNonEmptyString(value.thisMonth)
  );
};

const hasRenderableRisk = (value: unknown): boolean => {
  if (!isRecord(value)) return false;

  return (
    isNonEmptyString(value.type) &&
    isNonEmptyString(value.level) &&
    isNonEmptyString(value.label) &&
    isNonEmptyString(value.description)
  );
};

const hasRenderableDecisionPath = (value: unknown): boolean => {
  if (!isRecord(value)) return false;

  return (
    isNonEmptyString(value.label) &&
    isNonEmptyString(value.trend) &&
    isStringArray(value.risks) &&
    isStringArray(value.actions) &&
    isNonEmptyString(value.emotionalImpact)
  );
};

const hasRenderableDecisionSimulation = (value: unknown): boolean => {
  if (!isRecord(value)) return false;

  return (
    hasRenderableDecisionPath(value.pathA) &&
    hasRenderableDecisionPath(value.pathB)
  );
};

const hasRenderablePerspective = (value: unknown): boolean => {
  if (!isRecord(value)) return false;

  return (
    isNonEmptyString(value.role) &&
    isNonEmptyString(value.psychology) &&
    isNonEmptyString(value.suggestion)
  );
};

export function isSimulationResult(value: unknown): value is SimulationResult {
  if (!isRecord(value) || !isRecord(value.advice)) return false;

  const { advice } = value;

  if (
    !isNonEmptyString(advice.stateSummary) ||
    !isNonEmptyString(advice.riskReminder) ||
    !Array.isArray(advice.risks) ||
    !advice.risks.every(hasRenderableRisk) ||
    !hasRequiredActionPlan(advice.actions) ||
    !isNonEmptyString(advice.communicationTip) ||
    !isNonEmptyString(advice.resourceSuggestion) ||
    !isNonEmptyString(advice.encouragement) ||
    !isStringArray(value.followUpQuestions) ||
    typeof value.resonanceScore !== "number" ||
    !Number.isFinite(value.resonanceScore) ||
    !isNonEmptyString(value.soulSignature)
  ) {
    return false;
  }

  if (
    advice.decisionSimulation !== undefined &&
    !hasRenderableDecisionSimulation(advice.decisionSimulation)
  ) {
    return false;
  }

  if (
    advice.perspectives !== undefined &&
    (!Array.isArray(advice.perspectives) ||
      !advice.perspectives.every(hasRenderablePerspective))
  ) {
    return false;
  }

  return true;
}

export function assertSimulationResult(value: unknown): SimulationResult {
  if (!isSimulationResult(value)) {
    throw new Error("AI 返回的数据格式不完整");
  }

  return value;
}
