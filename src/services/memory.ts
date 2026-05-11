import { ConsultationSession, Persona360Report, UserMemory, UserTag } from "../types";

const MEMORY_KEY = "family_guardian_user_memory";
const ARCHIVE_KEY = "family_guardian_archive_sessions";

export const MemoryService = {
  getMemory(): UserMemory {
    const stored = localStorage.getItem(MEMORY_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse memory", e);
      }
    }
    return {
      tags: [],
      sessionCount: 0,
      lastActive: new Date().toISOString(),
    };
  },

  saveMemory(memory: UserMemory) {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  },

  updateFromSession(newTags: string[], anxietyPoints: string[], psychologyScore?: number) {
    const memory = this.getMemory();
    const now = new Date().toISOString();

    // Update stress history
    if (psychologyScore !== undefined) {
      if (!memory.stressHistory) memory.stressHistory = [];
      memory.stressHistory.push({ date: now, score: psychologyScore });
      // Keep only last 10 entries
      if (memory.stressHistory.length > 10) {
        memory.stressHistory = memory.stressHistory.slice(-10);
      }
    }

    // Update tags
    newTags.forEach(tagName => {
      const existing = memory.tags.find(t => t.name === tagName && t.category === 'theme');
      if (existing) {
        existing.count++;
        existing.lastSeen = now;
      } else {
        memory.tags.push({ name: tagName, category: 'theme', count: 1, lastSeen: now });
      }
    });

    // Update anxiety points
    anxietyPoints.forEach(point => {
      const existing = memory.tags.find(t => t.name === point && t.category === 'anxiety');
      if (existing) {
        existing.count++;
        existing.lastSeen = now;
      } else {
        memory.tags.push({ name: point, category: 'anxiety', count: 1, lastSeen: now });
      }
    });

    memory.sessionCount++;
    memory.lastActive = now;
    this.saveMemory(memory);
  },

  getTopAnxieties(limit = 3): string[] {
    return this.getMemory().tags
      .filter(t => t.category === 'anxiety')
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(t => t.name);
  },

  getTopThemes(limit = 3): string[] {
    return this.getMemory().tags
      .filter(t => t.category === 'theme')
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(t => t.name);
  },

  getMemoryContext(): string {
    const memory = this.getMemory();
    if (memory.sessionCount === 0) return "";

    const anxieties = this.getTopAnxieties();
    const themes = this.getTopThemes();

    return `
      用户历史背景:
      - 这是第 ${memory.sessionCount + 1} 次咨询。
      - 高频焦虑点: ${anxieties.join(", ")}。
      - 偏好主题: ${themes.join(", ")}。
      - 上次活跃时间: ${memory.lastActive}。
      
      请利用这些背景信息，使建议更具个性化，并体现出对用户长期关注点的“深度理解”。
    `;
  }
  ,

  getArchiveSessions(): ConsultationSession[] {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveArchiveSessions(sessions: ConsultationSession[]) {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(sessions));
  },

  upsertArchiveSession(session: ConsultationSession) {
    const sessions = this.getArchiveSessions();
    const idx = sessions.findIndex(s => s.id === session.id);
    const next = idx >= 0
      ? [...sessions.slice(0, idx), session, ...sessions.slice(idx + 1)]
      : [session, ...sessions];
    // keep latest 20
    this.saveArchiveSessions(next.slice(0, 20));
  },

  attach360ReportToLatest(report: Persona360Report) {
    const sessions = this.getArchiveSessions();
    if (sessions.length === 0) return;
    const latest = { ...sessions[0], report360: report };
    this.saveArchiveSessions([latest, ...sessions.slice(1)]);
  }
};
