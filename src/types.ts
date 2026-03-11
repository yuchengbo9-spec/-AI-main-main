export type LifeTheme = 'health' | 'family' | 'children' | 'grandchildren' | 'business' | 'emotion';

export interface UserProfile {
  ageRange: string;
  role: string;
  mainConcern: string;
  stressLevel: 'low' | 'medium' | 'high';
  preference: 'action' | 'comfort' | 'both';
  familyMembers?: FamilyMember[];
}

export interface FamilyMember {
  id: string;
  role: string;
  age?: string;
  concern?: string;
}

export interface RecommendedQuestion {
  id: string;
  text: string;
  category: string;
}

export interface RiskIndicator {
  type: 'health' | 'relationship' | 'finance' | 'psychology';
  level: 'low' | 'medium' | 'high'; // green, yellow, red
  label: string;
  description: string;
  adjustment?: string;
  score?: number; // 0-100 representing pressure or risk level
}

export interface WisdomTips {
  title: string;
  insight: string;
  avoid: string;
}

export interface DecisionPath {
  label: string;
  trend: string;
  risks: string[];
  actions: string[];
  emotionalImpact: string;
}

export interface Perspective {
  role: string;
  psychology: string;
  suggestion: string;
}

export interface StructuredAdvice {
  stateSummary: string;
  riskReminder: string;
  risks: RiskIndicator[];
  wisdomTips?: WisdomTips;
  actions: {
    today: string;
    thisWeek: string;
    thisMonth: string;
  };
  communicationTip: string;
  resourceSuggestion: string;
  encouragement: string;
  lifestyleAdvice?: {
    moodRegulation: string;
    sleepImprovement: string;
    recreation: string;
  };
  healthAdvice?: {
    diet: string;
    exercise: string;
    sleep: string;
  };
  decisionSimulation?: {
    pathA: DecisionPath;
    pathB: DecisionPath;
  };
  perspectives?: Perspective[];
  caseStudy?: {
    title: string;
    story: string;
    expertComment: string;
  };
}

export interface UserTag {
  name: string;
  category: 'theme' | 'anxiety' | 'interest' | 'role';
  count: number;
  lastSeen: string;
}

export interface UserMemory {
  tags: UserTag[];
  sessionCount: number;
  lastActive: string;
  personaSummary?: string;
  stressHistory?: { date: string; score: number }[];
}

export interface SimulationResult {
  advice: StructuredAdvice;
  followUpQuestions: string[];
  memoryUpdate?: {
    newTags: string[];
    anxietyPoints: string[];
  };
  resonanceScore: number;
  soulSignature: string;
}

export interface Confession {
  id: string;
  age: string;
  content: string;
  tags: string[];
}
