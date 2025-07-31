export interface UserResponses {
  productivityStruggle: string;
  goals: string;
  currentTools: string;
  aiFamiliarity: string;
  productiveTime: string;
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