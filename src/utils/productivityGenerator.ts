import type { UserResponses, ProductivityPlan, TimeBlock, AITool } from "@/types/productivity";

const generateTimeBlocks = (responses: UserResponses): TimeBlock[] => {
  const { workHours, preferredWorkflow, jobType, productivityStruggle } = responses;
  
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
    "night": [
      { time: "9:00 PM", activity: "Evening Setup", description: "Environment preparation, goal setting", duration: "15 min" },
      { time: "9:15 PM", activity: "Deep Work Block", description: "Complex, focused work", duration: "2.5 hours" },
      { time: "11:45 PM", activity: "Break", description: "Stretch, hydrate, brief rest", duration: "15 min" },
      { time: "12:00 AM", activity: "Creative Work", description: "When creativity peaks", duration: "1.5 hours" },
      { time: "1:30 AM", activity: "Wrap Up", description: "Tomorrow's planning, gradual wind down", duration: "30 min" },
    ]
  };

  return baseSchedule[workHours] || baseSchedule["morning"];
};

const generateAITools = (responses: UserResponses): AITool[] => {
  const { jobType, productivityStruggle, preferredWorkflow } = responses;
  
  const toolDatabase: Record<string, AITool[]> = {
    creative: [
      { name: "Midjourney", description: "AI image generation for visual concepts", category: "Design" },
      { name: "Copy.ai", description: "AI writing assistant for creative content", category: "Writing" },
      { name: "Notion AI", description: "Smart note-taking and content organization", category: "Organization" },
    ],
    technical: [
      { name: "GitHub Copilot", description: "AI pair programming assistant", category: "Development" },
      { name: "ChatGPT Plus", description: "Advanced problem-solving and code review", category: "AI Assistant" },
      { name: "Linear", description: "AI-powered project management", category: "Project Management" },
    ],
    business: [
      { name: "Grammarly", description: "AI writing enhancement for professional communication", category: "Communication" },
      { name: "Calendly", description: "Smart scheduling with AI optimization", category: "Scheduling" },
      { name: "Loom", description: "AI-powered video messaging", category: "Communication" },
    ],
    freelance: [
      { name: "Freelancer Tools AI", description: "Client communication and project management", category: "Business" },
      { name: "Canva AI", description: "Quick design creation for proposals", category: "Design" },
      { name: "Wave AI", description: "Automated invoicing and expense tracking", category: "Finance" },
    ],
    student: [
      { name: "Quillbot", description: "AI paraphrasing and research assistant", category: "Research" },
      { name: "Anki", description: "AI-optimized spaced repetition learning", category: "Learning" },
      { name: "Forest", description: "AI-powered focus and study sessions", category: "Focus" },
    ]
  };

  const baseTools = toolDatabase[jobType] || toolDatabase.business;
  
  // Add struggle-specific tools
  const struggleTools: Record<string, AITool> = {
    focus: { name: "Freedom", description: "AI-powered distraction blocking", category: "Focus" },
    overwhelm: { name: "Todoist", description: "AI task prioritization and scheduling", category: "Task Management" },
    procrastination: { name: "Toggl Track", description: "AI insights for time tracking", category: "Time Management" },
    organization: { name: "Obsidian", description: "AI-enhanced knowledge management", category: "Organization" },
    motivation: { name: "Habitica", description: "Gamified productivity with AI coaching", category: "Motivation" }
  };

  return [...baseTools, struggleTools[productivityStruggle]].filter(Boolean);
};

const generateGPTPrompts = (responses: UserResponses): string[] => {
  const { jobType, productivityStruggle, goals } = responses;
  
  const prompts = [
    `As a ${jobType} professional struggling with ${productivityStruggle}, help me break down my most important task today into 3 actionable steps. Make each step specific and time-bound.`,
    
    `I'm a ${jobType} who wants to ${goals}. Give me 5 specific strategies I can implement this week to make measurable progress toward this goal.`,
    
    `Create a personalized focus ritual for a ${jobType} that helps overcome ${productivityStruggle}. Include specific actions I can take before starting deep work.`,
    
    `Help me design a weekly review process tailored for ${jobType} work. Include questions that help me identify what's working and what needs adjustment.`,
    
    `Generate a template for daily reflection that addresses ${productivityStruggle} and supports my goal to ${goals}. Keep it under 5 minutes to complete.`
  ];

  return prompts;
};

const generateSummary = (responses: UserResponses): string => {
  const { jobType, productivityStruggle, goals, preferredWorkflow, workHours } = responses;
  
  return `Your personalized productivity plan is designed for a ${jobType} professional who works best during ${workHours.replace('-', ' ')} hours and prefers ${preferredWorkflow.replace('-', ' ')} work sessions. 

This plan specifically addresses your challenge with ${productivityStruggle.replace('-', ' ')} while supporting your goal to ${goals.replace('-', ' ')}. 

The time-blocked schedule optimizes your natural energy patterns, the AI tools are selected to enhance your workflow, and the GPT prompts are crafted to provide ongoing support for your specific needs.`;
};

export const generateProductivityPlan = (responses: UserResponses): ProductivityPlan => {
  return {
    timeBlocks: generateTimeBlocks(responses),
    aiTools: generateAITools(responses),
    gptPrompts: generateGPTPrompts(responses),
    summary: generateSummary(responses)
  };
};