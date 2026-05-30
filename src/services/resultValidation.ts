import { SimulationResult } from "../types";

const VALID_RISK_TYPES = new Set(["health", "relationship", "finance", "psychology"]);
const VALID_RISK_LEVELS = new Set(["low", "medium", "high"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

function hasRequiredStringFields(value: unknown, fields: string[]): value is Record<string, unknown> {
  return isRecord(value) && fields.every(field => isNonEmptyString(value[field]));
}

function isValidRisk(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.type === "string" &&
    VALID_RISK_TYPES.has(value.type) &&
    typeof value.level === "string" &&
    VALID_RISK_LEVELS.has(value.level) &&
    isNonEmptyString(value.label) &&
    isNonEmptyString(value.description) &&
    (value.adjustment === undefined || isNonEmptyString(value.adjustment)) &&
    (value.score === undefined || (typeof value.score === "number" && Number.isFinite(value.score)))
  );
}

function isValidDecisionPath(value: unknown): boolean {
  return (
    hasRequiredStringFields(value, ["label", "trend", "emotionalImpact"]) &&
    isStringArray(value.risks) &&
    isStringArray(value.actions)
  );
}

function isValidSimulationResult(value: unknown): value is SimulationResult {
  if (!isRecord(value) || !isRecord(value.advice)) return false;

  const { advice } = value;
  if (
    !hasRequiredStringFields(advice, [
      "stateSummary",
      "riskReminder",
      "communicationTip",
      "resourceSuggestion",
      "encouragement",
    ])
  ) {
    return false;
  }

  if (
    !isRecord(advice.actions) ||
    !hasRequiredStringFields(advice.actions, ["today", "thisWeek", "thisMonth"])
  ) {
    return false;
  }

  if (!Array.isArray(advice.risks) || !advice.risks.every(isValidRisk)) return false;

  if (
    advice.decisionSimulation !== undefined &&
    (!isRecord(advice.decisionSimulation) ||
      !isValidDecisionPath(advice.decisionSimulation.pathA) ||
      !isValidDecisionPath(advice.decisionSimulation.pathB))
  ) {
    return false;
  }

  return (
    isStringArray(value.followUpQuestions) &&
    typeof value.resonanceScore === "number" &&
    Number.isFinite(value.resonanceScore) &&
    isNonEmptyString(value.soulSignature)
  );
}

export function assertIsSimulationResult(value: unknown, source = "simulation result"): SimulationResult {
  if (!isValidSimulationResult(value)) {
    throw new Error(`Invalid ${source}: missing required simulation result fields`);
  }

  return value;
}
