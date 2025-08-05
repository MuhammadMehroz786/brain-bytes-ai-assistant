import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserResponses {
  productiveTime: string;
  productivityStruggle: string;
  currentTools: string;
  aiFamiliarity: string;
  goals: string;
}

interface TimeBlock {
  time: string;
  activity: string;
  description: string;
  duration: string;
}

interface AITool {
  name: string;
  description: string;
  category: string;
}

interface ProductivityPlan {
  timeBlocks: TimeBlock[];
  aiTools: AITool[];
  gptPrompts: string[];
  summary: string;
}

const generateProductivityPlan = (responses: UserResponses): ProductivityPlan => {
  // Time blocks based on productive time
  const timeBlocksMap: Record<string, TimeBlock[]> = {
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

  // AI tools based on current tools and experience
  const baseTools = [
    { name: "ChatGPT", description: "AI assistant for writing, brainstorming, and problem-solving", category: "AI Assistant" },
    { name: "Notion AI", description: "Smart note-taking and content generation", category: "Productivity" },
    { name: "Grammarly", description: "AI-powered writing assistant", category: "Writing" }
  ];

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

  const struggleTools: Record<string, AITool> = {
    focus: { name: "Brain.fm", description: "AI-generated focus music", category: "Focus" },
    overwhelm: { name: "Motion", description: "AI task prioritization and scheduling", category: "Task Management" },
    procrastination: { name: "Toggl Track", description: "AI insights for time tracking", category: "Time Management" },
    "time-management": { name: "RescueTime", description: "AI-powered time analytics", category: "Analytics" },
    motivation: { name: "Habitica", description: "Gamified productivity with AI coaching", category: "Motivation" }
  };

  const timeBlocks = timeBlocksMap[responses.productiveTime] || timeBlocksMap["morning"];
  const experienceTools = toolsByExperience[responses.currentTools] || [];
  const struggleTool = struggleTools[responses.productivityStruggle];
  const aiTools = [...baseTools, ...experienceTools, struggleTool].filter(Boolean);

  const gptPrompts = [
    `Help me break down my most important task today into 3 actionable steps, considering that my main challenge is ${responses.productivityStruggle}. Make each step specific and time-bound.`,
    `I want to ${responses.goals}. Give me 5 specific strategies I can implement this week to make measurable progress toward this goal.`,
    `Create a personalized focus ritual that helps me overcome ${responses.productivityStruggle}. Include specific actions I can take before starting deep work.`,
    `Help me design a weekly review process that addresses my struggle with ${responses.productivityStruggle}. Include questions that help me identify what's working and what needs adjustment.`,
    `Generate a template for daily reflection that supports my goal to ${responses.goals} while helping me manage ${responses.productivityStruggle}. Keep it under 5 minutes to complete.`
  ];

  const summary = `Your personalized productivity plan addresses your main challenge of ${responses.productivityStruggle} and helps you achieve ${responses.goals}. The schedule is optimized for your ${responses.productiveTime} peak productivity hours and integrates well with your current ${responses.currentTools} workflow approach. Based on your ${responses.aiFamiliarity} level with AI tools, we've selected the right mix of technologies to enhance your productivity without overwhelming you.`;

  return {
    timeBlocks,
    aiTools,
    gptPrompts,
    summary
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { responses }: { responses: UserResponses } = await req.json();

    if (!responses) {
      return new Response(JSON.stringify({ error: 'Missing responses data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate productivity plan
    const plan = generateProductivityPlan(responses);

    // Log security event
    await supabaseClient.from('enhanced_security_audit').insert({
      user_id: user.id,
      event_type: 'productivity_plan_generated',
      event_details: {
        productive_time: responses.productiveTime,
        struggle: responses.productivityStruggle,
        tools: responses.currentTools
      },
      risk_score: 0
    });

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-productivity-plan function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});