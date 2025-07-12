import type { UserResponses, ProductivityPlan, TimeBlock, AITool } from "@/types/productivity";

const generateTimeBlocks = (responses: UserResponses): TimeBlock[] => {
  const { productiveTime, productivityStruggle } = responses;
  
  const baseSchedule: Record<string, TimeBlock[]> = {
    "early-morning": [
      { time: "6:00 AM", activity: "Morning Routine", description: "Mindfulness, exercise, or planning", duration: "30 min" },
      { time: "6:30 AM", activity: "Deep Work Block", description: "Most important task of the day", duration: "2-3 hours" },
      { time: "9:30 AM", activity: "Break & Communication", description: "Check emails, team updates", duration: "30 min" },
      { time: "10:00 AM", activity: "Creative Work", description: "Projects requiring creativity", duration: "1.5 hours" },
      { time: "11:30 AM", activity: "Administrative Tasks", description: "Planning, organizing, admin work", duration: "1 hour" },
    ],
    "morning": [
      { time: "9:00 AM", activity: "Planning & Priorities", description: "Review goals and set daily priorities", duration: "15 min" },
      { time: "9:15 AM", activity: "Deep Work Block", description: "Most challenging task first", duration: "2.5 hours" },
      { time: "11:45 AM", activity: "Break & Movement", description: "Walk, stretch, hydrate", duration: "15 min" },
      { time: "12:00 PM", activity: "Collaboration Time", description: "Meetings, calls, team work", duration: "1.5 hours" },
      { time: "1:30 PM", activity: "Lunch & Recharge", description: "Proper break and nutrition", duration: "45 min" },
    ],
    "afternoon": [
      { time: "12:00 PM", activity: "Energy Building", description: "Light tasks, communication", duration: "1 hour" },
      { time: "1:00 PM", activity: "Lunch Break", description: "Proper meal and mental break", duration: "45 min" },
      { time: "1:45 PM", activity: "Deep Work Block", description: "Core productive work", duration: "2.5 hours" },
      { time: "4:15 PM", activity: "Review & Planning", description: "Wrap up, plan next day", duration: "30 min" },
      { time: "4:45 PM", activity: "Learning Time", description: "Skill development, reading", duration: "45 min" },
    ],
    "evening": [
      { time: "5:00 PM", activity: "Transition Ritual", description: "Switch from day mode to evening productivity", duration: "15 min" },
      { time: "5:15 PM", activity: "Deep Work Block", description: "Main productive session", duration: "2 hours" },
      { time: "7:15 PM", activity: "Break & Meal", description: "Dinner and relaxation", duration: "45 min" },
      { time: "8:00 PM", activity: "Creative Projects", description: "Personal or side projects", duration: "1.5 hours" },
      { time: "9:30 PM", activity: "Wind Down", description: "Planning tomorrow, reflection", duration: "30 min" },
    ],
    "varies": [
      { time: "9:00 AM", activity: "Morning Planning", description: "Review goals and plan your day", duration: "15 min" },
      { time: "9:15 AM", activity: "Deep Work Block", description: "Focus on priority tasks", duration: "2 hours" },
      { time: "11:15 AM", activity: "Break & Movement", description: "Take a walk or do light stretching", duration: "15 min" },
      { time: "11:30 AM", activity: "Communication", description: "Check emails and messages", duration: "30 min" },
      { time: "12:00 PM", activity: "Lunch Break", description: "Mindful eating and relaxation", duration: "1 hour" },
      { time: "1:00 PM", activity: "Focused Work", description: "Continue important tasks", duration: "90 min" },
      { time: "2:30 PM", activity: "Quick Break", description: "Hydrate and reset", duration: "10 min" },
      { time: "2:40 PM", activity: "Creative Tasks", description: "Brainstorming or creative work", duration: "80 min" },
      { time: "4:00 PM", activity: "Admin & Planning", description: "Administrative tasks and tomorrow's prep", duration: "1 hour" },
    ]
  };

  return baseSchedule[productiveTime] || baseSchedule["morning"];
};

const generateAITools = (responses: UserResponses): AITool[] => {
  const { currentTools, productivityStruggle, aiFamiliarity } = responses;
  
  const baseTools = [
    { name: "ChatGPT", description: "AI assistant for writing, brainstorming, and problem-solving", category: "AI Assistant" },
    { name: "Notion AI", description: "Smart note-taking and content generation", category: "Productivity" },
    { name: "Grammarly", description: "AI-powered writing assistant", category: "Writing" }
  ];
  
  // Add tools based on current tools experience
  const toolsByExperience: Record<string, AITool[]> = {
    none: [
      { name: "Todoist", description: "Simple AI-powered task management", category: "Task Management" },
    ],
    basic: [
      { name: "Calendly", description: "Smart scheduling with AI optimization", category: "Scheduling" },
    ],
    digital: [
      { name: "Linear", description: "AI-powered project management", category: "Project Management" },
      { name: "Zapier", description: "AI workflow automation", category: "Automation" },
    ],
    advanced: [
      { name: "GitHub Copilot", description: "AI pair programming assistant", category: "Development" },
      { name: "Midjourney", description: "AI image generation for creative projects", category: "Creative" },
    ],
    multiple: [
      { name: "Make (Integromat)", description: "Advanced workflow automation", category: "Integration" },
    ]
  };

  // Add struggle-specific tools
  const struggleTools: Record<string, AITool> = {
    focus: { name: "Brain.fm", description: "AI-generated focus music", category: "Focus" },
    overwhelm: { name: "Motion", description: "AI task prioritization and scheduling", category: "Task Management" },
    procrastination: { name: "Toggl Track", description: "AI insights for time tracking", category: "Time Management" },
    "time-management": { name: "RescueTime", description: "AI-powered time analytics", category: "Analytics" },
    motivation: { name: "Habitica", description: "Gamified productivity with AI coaching", category: "Motivation" }
  };

  const experienceTools = toolsByExperience[currentTools] || [];
  const struggleTool = struggleTools[productivityStruggle];

  return [...baseTools, ...experienceTools, struggleTool].filter(Boolean);
};

const generateGPTPrompts = (responses: UserResponses): string[] => {
  const { productivityStruggle, goals } = responses;
  
  const prompts = [
    `Help me break down my most important task today into 3 actionable steps, considering that my main challenge is ${productivityStruggle}. Make each step specific and time-bound.`,
    
    `I want to ${goals}. Give me 5 specific strategies I can implement this week to make measurable progress toward this goal.`,
    
    `Create a personalized focus ritual that helps me overcome ${productivityStruggle}. Include specific actions I can take before starting deep work.`,
    
    `Help me design a weekly review process that addresses my struggle with ${productivityStruggle}. Include questions that help me identify what's working and what needs adjustment.`,
    
    `Generate a template for daily reflection that supports my goal to ${goals} while helping me manage ${productivityStruggle}. Keep it under 5 minutes to complete.`
  ];

  return prompts;
};

const generateSummary = (responses: UserResponses): string => {
  const { productivityStruggle, goals, currentTools, aiFamiliarity, productiveTime } = responses;
  
  const struggleText = productivityStruggle || "productivity challenges";
  const goalsText = goals || "improve efficiency";
  const toolsText = currentTools || "basic tools";
  const aiText = aiFamiliarity || "some AI experience";
  const timeText = productiveTime || "morning";
  
  return `Your personalized productivity plan addresses your main challenge of ${struggleText} and helps you achieve ${goalsText}. The schedule is optimized for your ${timeText} peak productivity hours and integrates well with your current ${toolsText} workflow approach. Based on your ${aiText} level with AI tools, we've selected the right mix of technologies to enhance your productivity without overwhelming you.`;
};

export const generateProductivityPlan = (responses: UserResponses): ProductivityPlan => {
  return {
    timeBlocks: generateTimeBlocks(responses),
    aiTools: generateAITools(responses),
    gptPrompts: generateGPTPrompts(responses),
    summary: generateSummary(responses)
  };
};