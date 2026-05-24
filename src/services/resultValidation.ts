import type { SimulationResult } from "../types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const hasRequiredStrings = (
  value: Record<string, unknown>,
  keys: string[]
): boolean => keys.every((key) => isNonEmptyString(value[key]));

export function isSimulationResult(value: unknown): value is SimulationResult {
  if (!isRecord(value) || !isRecord(value.advice)) return false;

  const advice = value.advice;
  if (!hasRequiredStrings(advice, [
    "stateSummary",
    "riskReminder",
    "communicationTip",
    "resourceSuggestion",
    "encouragement",
  ])) {
    return false;
  }

  if (!Array.isArray(advice.risks)) return false;

  if (!isRecord(advice.actions) || !hasRequiredStrings(advice.actions, [
    "today",
    "thisWeek",
    "thisMonth",
  ])) {
    return false;
  }

  if (!Array.isArray(value.followUpQuestions) || !value.followUpQuestions.every(isNonEmptyString)) {
    return false;
  }

  return typeof value.resonanceScore === "number" && isNonEmptyString(value.soulSignature);
}

export function validateSimulationResult(value: unknown): SimulationResult {
  if (!isSimulationResult(value)) {
    throw new Error("AI 返回的数据格式不完整，请稍后重试。");
  }

  return value;
}
