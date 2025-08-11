import { LucideIcon, Wand2, FileText, Bot } from "lucide-react";

export type SkillLevel = 'beginner' | 'advanced';

export interface UserPrefs {
  skill?: SkillLevel;
  openRefine?: boolean;
  role?: string;
  goal?: string;
  tools?: string[];
  focus?: string;
  tone?: string;
}

export interface EducationCard {
  id: string;
  step: number;
  title: string;
  defaults: Record<string, string>;
  quickSteps: string[];
  prompt: { beginner: string; advanced?: string };
  pitfalls: string[];
  mistakes: string[];
  whyThisWorks: string;
}

export interface EducationTool {
  id: string;
  name: string;
  category: string;
  icon: LucideIcon;
  gradient: [string, string];
  recommended: boolean;
  nextLabel: string;
  openUrl?: string;
  shortcuts: string[];
  cards: EducationCard[];
}

export interface StarterPath {
  id: string;
  title: string;
  cards: { toolId: string; cardId: string; title: string }[];
  progressPercent: number;
}

export const Icons = { Wand2, FileText, Bot };
