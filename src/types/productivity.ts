export interface UserResponses {
  jobType: string;
  productivityStruggle: string;
  preferredWorkflow: string;
  workHours: string;
  goals: string;
}

export interface AITool {
  name: string;
  description: string;
  category: string;
  affiliateLink?: string;
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