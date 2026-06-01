import type { RiskIndicator, SimulationResult } from "../types";

const RISK_TYPES = new Set<RiskIndicator["type"]>(["health", "relationship", "finance", "psychology"]);
const RISK_LEVELS = new Set<RiskIndicator["level"]>(["low", "medium", "high"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function hasStringFields(value: unknown, fields: string[]): value is Record<string, string> {
  return isRecord(value) && fields.every((field) => isString(value[field]));
}

function isRiskIndicator(value: unknown): value is RiskIndicator {
  if (!isRecord(value)) return false;
  if (!isString(value.type) || !RISK_TYPES.has(value.type as RiskIndicator["type"])) return false;
  if (!isString(value.level) || !RISK_LEVELS.has(value.level as RiskIndicator["level"])) return false;
  if (!isString(value.label) || !isString(value.description)) return false;
  if (value.adjustment !== undefined && !isString(value.adjustment)) return false;
  if (value.score !== undefined && typeof value.score !== "number") return false;
  return true;
}

function isDecisionPath(value: unknown): boolean {
  return (
    hasStringFields(value, ["label", "trend", "emotionalImpact"]) &&
    isStringArray(value.risks) &&
    isStringArray(value.actions)
  );
}

function isSimulationAdvice(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (!hasStringFields(value, ["stateSummary", "riskReminder", "communicationTip", "resourceSuggestion", "encouragement"])) return false;
  if (!Array.isArray(value.risks) || !value.risks.every(isRiskIndicator)) return false;
  if (!hasStringFields(value.actions, ["today", "thisWeek", "thisMonth"])) return false;

  if (value.lifestyleAdvice !== undefined && !hasStringFields(value.lifestyleAdvice, ["moodRegulation", "sleepImprovement", "recreation"])) return false;
  if (value.healthAdvice !== undefined && !hasStringFields(value.healthAdvice, ["diet", "exercise", "sleep"])) return false;

  if (value.decisionSimulation !== undefined) {
    if (!isRecord(value.decisionSimulation)) return false;
    if (!isDecisionPath(value.decisionSimulation.pathA) || !isDecisionPath(value.decisionSimulation.pathB)) return false;
  }

  if (value.perspectives !== undefined) {
    if (!Array.isArray(value.perspectives) || !value.perspectives.every((item) => hasStringFields(item, ["role", "psychology", "suggestion"]))) return false;
  }

  if (value.caseStudy !== undefined && !hasStringFields(value.caseStudy, ["title", "story", "expertComment"])) return false;

  return true;
}

export function isSimulationResult(value: unknown): value is SimulationResult {
  if (!isRecord(value)) return false;
  if (!isSimulationAdvice(value.advice)) return false;
  if (!isStringArray(value.followUpQuestions)) return false;
  if (typeof value.resonanceScore !== "number") return false;
  if (!isString(value.soulSignature)) return false;

  if (value.memoryUpdate !== undefined) {
    if (!isRecord(value.memoryUpdate)) return false;
    if (!isStringArray(value.memoryUpdate.newTags) || !isStringArray(value.memoryUpdate.anxietyPoints)) return false;
  }

  return true;
}
