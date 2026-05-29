import type {
  DecisionPath,
  Perspective,
  RiskIndicator,
  SimulationResult,
  StructuredAdvice,
} from "../types";

type JsonRecord = Record<string, unknown>;

const riskTypes = new Set<RiskIndicator["type"]>([
  "health",
  "relationship",
  "finance",
  "psychology",
]);
const riskLevels = new Set<RiskIndicator["level"]>(["low", "medium", "high"]);

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown, path: string): JsonRecord {
  if (!isRecord(value)) {
    throw new Error(`${path} must be an object`);
  }
  return value;
}

function requireString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${path} must be a non-empty string`);
  }
  return value;
}

function requireNumber(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${path} must be a finite number`);
  }
  return value;
}

function requireStringArray(value: unknown, path: string): string[] {
  if (!Array.isArray(value) || value.some(item => typeof item !== "string")) {
    throw new Error(`${path} must be an array of strings`);
  }
  return value;
}

function validateRisk(value: unknown, path: string): RiskIndicator {
  const risk = requireRecord(value, path);
  const type = requireString(risk.type, `${path}.type`);
  if (!riskTypes.has(type as RiskIndicator["type"])) {
    throw new Error(`${path}.type is not supported`);
  }

  const level = requireString(risk.level, `${path}.level`);
  if (!riskLevels.has(level as RiskIndicator["level"])) {
    throw new Error(`${path}.level is not supported`);
  }

  requireString(risk.label, `${path}.label`);
  requireString(risk.description, `${path}.description`);

  if (risk.adjustment !== undefined) {
    requireString(risk.adjustment, `${path}.adjustment`);
  }
  if (risk.score !== undefined) {
    requireNumber(risk.score, `${path}.score`);
  }

  return value as RiskIndicator;
}

function validateDecisionPath(value: unknown, path: string): DecisionPath {
  const decisionPath = requireRecord(value, path);
  requireString(decisionPath.label, `${path}.label`);
  requireString(decisionPath.trend, `${path}.trend`);
  requireStringArray(decisionPath.risks, `${path}.risks`);
  requireStringArray(decisionPath.actions, `${path}.actions`);
  requireString(decisionPath.emotionalImpact, `${path}.emotionalImpact`);
  return value as DecisionPath;
}

function validatePerspective(value: unknown, path: string): Perspective {
  const perspective = requireRecord(value, path);
  requireString(perspective.role, `${path}.role`);
  requireString(perspective.psychology, `${path}.psychology`);
  requireString(perspective.suggestion, `${path}.suggestion`);
  return value as Perspective;
}

function validateStructuredAdvice(value: unknown, path: string): StructuredAdvice {
  const advice = requireRecord(value, path);
  requireString(advice.stateSummary, `${path}.stateSummary`);
  requireString(advice.riskReminder, `${path}.riskReminder`);
  requireString(advice.communicationTip, `${path}.communicationTip`);
  requireString(advice.resourceSuggestion, `${path}.resourceSuggestion`);
  requireString(advice.encouragement, `${path}.encouragement`);

  if (!Array.isArray(advice.risks)) {
    throw new Error(`${path}.risks must be an array`);
  }
  advice.risks.forEach((risk, index) => validateRisk(risk, `${path}.risks[${index}]`));

  const actions = requireRecord(advice.actions, `${path}.actions`);
  requireString(actions.today, `${path}.actions.today`);
  requireString(actions.thisWeek, `${path}.actions.thisWeek`);
  requireString(actions.thisMonth, `${path}.actions.thisMonth`);

  if (advice.wisdomTips !== undefined) {
    const wisdomTips = requireRecord(advice.wisdomTips, `${path}.wisdomTips`);
    requireString(wisdomTips.title, `${path}.wisdomTips.title`);
    requireString(wisdomTips.insight, `${path}.wisdomTips.insight`);
    requireString(wisdomTips.avoid, `${path}.wisdomTips.avoid`);
  }

  if (advice.lifestyleAdvice !== undefined) {
    const lifestyleAdvice = requireRecord(advice.lifestyleAdvice, `${path}.lifestyleAdvice`);
    requireString(lifestyleAdvice.moodRegulation, `${path}.lifestyleAdvice.moodRegulation`);
    requireString(lifestyleAdvice.sleepImprovement, `${path}.lifestyleAdvice.sleepImprovement`);
    requireString(lifestyleAdvice.recreation, `${path}.lifestyleAdvice.recreation`);
  }

  if (advice.healthAdvice !== undefined) {
    const healthAdvice = requireRecord(advice.healthAdvice, `${path}.healthAdvice`);
    requireString(healthAdvice.diet, `${path}.healthAdvice.diet`);
    requireString(healthAdvice.exercise, `${path}.healthAdvice.exercise`);
    requireString(healthAdvice.sleep, `${path}.healthAdvice.sleep`);
  }

  if (advice.decisionSimulation !== undefined) {
    const decisionSimulation = requireRecord(advice.decisionSimulation, `${path}.decisionSimulation`);
    validateDecisionPath(decisionSimulation.pathA, `${path}.decisionSimulation.pathA`);
    validateDecisionPath(decisionSimulation.pathB, `${path}.decisionSimulation.pathB`);
  }

  if (advice.perspectives !== undefined) {
    if (!Array.isArray(advice.perspectives)) {
      throw new Error(`${path}.perspectives must be an array`);
    }
    advice.perspectives.forEach((perspective, index) =>
      validatePerspective(perspective, `${path}.perspectives[${index}]`),
    );
  }

  if (advice.caseStudy !== undefined) {
    const caseStudy = requireRecord(advice.caseStudy, `${path}.caseStudy`);
    requireString(caseStudy.title, `${path}.caseStudy.title`);
    requireString(caseStudy.story, `${path}.caseStudy.story`);
    requireString(caseStudy.expertComment, `${path}.caseStudy.expertComment`);
  }

  return value as StructuredAdvice;
}

export function assertSimulationResult(value: unknown, source = "Simulation result"): SimulationResult {
  const result = requireRecord(value, source);
  validateStructuredAdvice(result.advice, `${source}.advice`);
  requireStringArray(result.followUpQuestions, `${source}.followUpQuestions`);
  requireNumber(result.resonanceScore, `${source}.resonanceScore`);
  requireString(result.soulSignature, `${source}.soulSignature`);

  if (result.memoryUpdate !== undefined) {
    const memoryUpdate = requireRecord(result.memoryUpdate, `${source}.memoryUpdate`);
    requireStringArray(memoryUpdate.newTags, `${source}.memoryUpdate.newTags`);
    requireStringArray(memoryUpdate.anxietyPoints, `${source}.memoryUpdate.anxietyPoints`);
  }

  return value as SimulationResult;
}

export function isSimulationResult(value: unknown): value is SimulationResult {
  try {
    assertSimulationResult(value);
    return true;
  } catch {
    return false;
  }
}
