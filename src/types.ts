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

export interface ExpertRole {
  id: string;
  name: string;
  title: string;
  description: string;
  avatar: string;
  persona: string;
  voiceConfig: {
    pitch: number;
    rate: number;
  };
  color: string;
}

export interface SkillCard {
  name: string;
  description: string;
  points: number;
  challenge: string;
}

export interface StructuredAdvice {
  stateSummary: string;
  riskReminder: string;
  risks: RiskIndicator[];
  wisdomTips?: WisdomTips;
  skillCard?: SkillCard; // 新增技能卡片，用于游戏化学习
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
  wellAly?: WellAlyData;
}

export interface WellAlyData {
  healthRecords: { type: string; suggestion: string }[];
  medicationTracker?: { name: string; frequency: string; note: string }[];
  reportAnalysis?: { item: string; result: string; advice: string }[];
  familyHealth?: { member: string; advice: string }[];
  emotionalRituals?: { ritualName: string; frequency: string; benefit: string }[]; // 情感互动仪式
  relationshipDynamics?: { indicator: string; status: string; advice: string }[]; // 关系动态分析
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

export interface Persona360Dimension {
  name: '养生' | '健康' | '运动' | '穿搭' | '情绪' | '家庭' | '事业' | '社交';
  summary: string; // 1-2 sentences
  doToday: string; // one concrete action
  doThisWeek: string; // one concrete action
  avoid: string; // one red-flag / avoid
  metrics?: string[]; // optional measurable indicators
}

export interface Persona360Report {
  createdAt: string;
  title: string;
  personaSummary: string;
  keySignals: string[]; // key observed facts
  topConcerns: string[]; // ranked concerns
  strengths: string[]; // positive traits
  blindSpots: string[]; // likely blind spots
  dimensions: Persona360Dimension[];
  next7DaysPlan: { day: string; focus: string; task: string }[]; // 7 items
  disclaimer: string;
}

export interface ConsultationSession {
  id: string;
  createdAt: string;
  expertId: string;
  themeLabel: string;
  input: string;
  resonanceScore?: number;
  soulSignature?: string;
  report360?: Persona360Report;
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
