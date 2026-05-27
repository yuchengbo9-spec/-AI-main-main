import { SimulationResult } from "../types";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isNonEmptyString);

const hasStringFields = (value: unknown, fields: string[]): value is Record<string, unknown> =>
  isObject(value) && fields.every((field) => isNonEmptyString(value[field]));

const isValidRisk = (value: unknown): boolean => {
  if (!hasStringFields(value, ["type", "level", "label", "description"])) return false;
  if (!["health", "relationship", "finance", "psychology"].includes(value.type as string)) return false;
  if (!["low", "medium", "high"].includes(value.level as string)) return false;
  if (value.adjustment !== undefined && !isNonEmptyString(value.adjustment)) return false;
  if (value.score !== undefined && typeof value.score !== "number") return false;
  return true;
};

const isValidDecisionPath = (value: unknown): boolean => {
  if (!hasStringFields(value, ["label", "trend", "emotionalImpact"])) return false;
  return isStringArray(value.risks) && isStringArray(value.actions);
};

export function isValidSimulationResult(value: unknown): value is SimulationResult {
  if (!isObject(value) || !isObject(value.advice)) return false;

  const { advice } = value;
  if (!hasStringFields(advice, [
    "stateSummary",
    "riskReminder",
    "communicationTip",
    "resourceSuggestion",
    "encouragement",
  ])) {
    return false;
  }

  if (!isObject(advice.actions) || !hasStringFields(advice.actions, ["today", "thisWeek", "thisMonth"])) {
    return false;
  }

  if (!Array.isArray(advice.risks) || !advice.risks.every(isValidRisk)) return false;
  if (!isStringArray(value.followUpQuestions)) return false;
  if (typeof value.resonanceScore !== "number") return false;
  if (!isNonEmptyString(value.soulSignature)) return false;

  if (advice.lifestyleAdvice !== undefined && !hasStringFields(advice.lifestyleAdvice, ["moodRegulation", "sleepImprovement", "recreation"])) {
    return false;
  }

  if (advice.healthAdvice !== undefined && !hasStringFields(advice.healthAdvice, ["diet", "exercise", "sleep"])) {
    return false;
  }

  if (advice.decisionSimulation !== undefined) {
    if (!isObject(advice.decisionSimulation)) return false;
    if (!isValidDecisionPath(advice.decisionSimulation.pathA)) return false;
    if (!isValidDecisionPath(advice.decisionSimulation.pathB)) return false;
  }

  if (advice.perspectives !== undefined) {
    if (!Array.isArray(advice.perspectives)) return false;
    if (!advice.perspectives.every((item) => hasStringFields(item, ["role", "psychology", "suggestion"]))) {
      return false;
    }
  }

  if (advice.caseStudy !== undefined && !hasStringFields(advice.caseStudy, ["title", "story", "expertComment"])) {
    return false;
  }

  return true;
}

export function assertValidSimulationResult(value: unknown, source: string): SimulationResult {
  if (isValidSimulationResult(value)) return value;
  throw new Error(`${source} returned an invalid simulation result`);
}
