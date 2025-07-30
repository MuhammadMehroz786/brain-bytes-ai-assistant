// Legacy UserResponses - keeping for compatibility
export interface UserResponses {
  productivityStruggle: string;
  goals: string;
  currentTools: string;
  aiFamiliarity: string;
  productiveTime: string;
}

// New onboarding responses
export interface OnboardingResponses {
  aiGoal: string;
  workflowType: string;
  biggestChallenge: string;
  learningPreference: string;
  focusTime: string;
  workDescription?: string;
}

// Workflow definition
export interface Workflow {
  id: string;
  title: string;
  description: string;
  demoVideoUrl?: string;
  targetAiGoals: string[];
  targetChallenges: string[];
  targetWorkflows: string[];
}

export interface UserPreferences {
  priority: string;
  experienceLevel: string;
  toolPreference: string;
}

export interface AITool {
  name: string;
  description: string;
  category: string;
  affiliateLink?: string;
  url?: string;
  categories?: string[];
  complexity?: string;
  setupComplexity?: string;
}

export interface ProductivityPlan {
  timeBlocks: TimeBlock[];
  aiTools: AITool[];
  gptPrompts: string[];
  summary: string;
}

export interface TimeBlock {
  time: string;
  activity: string;
  description: string;
  duration: string;
}