export const ROUTES = {
  // Core
  HOME: "/",
  ODYSSEY: "/odyssey",
  FOCUS: "/focus",
  SETTINGS: "/settings",
  TIMER: "/timer",
  POMODORO: "/pomodoro",

  // Life OS
  HABITS: "/habits",
  JOURNAL: "/journal",
  LEARNING: "/learning",
  MISSIONS: "/missions",
  TIMELINE: "/timeline",
  DECISIONS: "/decisions",
  REVIEWS: "/reviews",
  BRAIN: "/brain",

  // Health
  HEALTH: "/health",
  GYM: "/gym",
  WEIGHT: "/weight",
  SLEEP: "/sleep",

  // Data
  STOCKS: "/stocks",
  PROJECTS: "/projects",
  OPENCODE: "/opencode",

  // Study Mode
  STUDY: "/study",
  STUDY_STATS: "/study/stats",
  STUDY_TASKS: "/study/tasks",
  STUDY_EXAMS: "/study/exams",
  STUDY_FILES: "/study/files",
  STUDY_SOUNDS: "/study/sounds",
  STUDY_COMMUTE: "/study/commute",

  // JARVIS 2.0 Intelligence
  VOICE: "/voice",
  BRIEFINGS: "/briefings",
  MEMORY: "/memory",
  CORRELATIONS: "/correlations",
  FUTURE: "/future",
  REPORT: "/report",
} as const

export type RouteKey = keyof typeof ROUTES
