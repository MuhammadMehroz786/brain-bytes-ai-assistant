import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { CheckCircle, Play } from "lucide-react";
import type { OnboardingResponses, Workflow } from "@/types/productivity";

interface WorkflowToolkitProps {
  responses: OnboardingResponses;
}

// Predefined workflows pool - you can add demo video URLs here
const workflowsDatabase: Workflow[] = [
  // Content Creation Workflows
  {
    id: "content-batch",
    title: "Build a week of content in 20 minutes",
    description: "AI-powered content planning and batch creation system",
    demoVideoUrl: "", // Add your demo video URL here
    targetAiGoals: ["content"],
    targetChallenges: ["manual-tasks", "structure"],
    targetWorkflows: ["solo", "student", "business"]
  },
  {
    id: "social-automation",
    title: "Automate your social media presence",
    description: "Set up AI-driven social content scheduling and engagement",
    demoVideoUrl: "", // Add your demo video URL here
    targetAiGoals: ["content", "automation"],
    targetChallenges: ["manual-tasks", "structure"],
    targetWorkflows: ["business", "solo"]
  },
  // Automation Workflows
  {
    id: "email-automation",
    title: "Smart email management system",
    description: "AI-powered email sorting, prioritization, and auto-responses",
    demoVideoUrl: "", // Add your demo video URL here
    targetAiGoals: ["automation", "organization"],
    targetChallenges: ["overwhelm", "manual-tasks"],
    targetWorkflows: ["leader", "business", "small-team"]
  },
  {
    id: "task-automation",
    title: "Eliminate repetitive daily tasks",
    description: "Connect your apps with no-code automation workflows",
    demoVideoUrl: "", // Add your demo video URL here
    targetAiGoals: ["automation"],
    targetChallenges: ["manual-tasks", "structure"],
    targetWorkflows: ["solo", "business", "leader"]
  },
  // Learning Workflows
  {
    id: "skill-accelerator",
    title: "Master new skills 3x faster",
    description: "AI-curated learning paths with personalized practice",
    demoVideoUrl: "", // Add your demo video URL here
    targetAiGoals: ["learning"],
    targetChallenges: ["trust", "structure"],
    targetWorkflows: ["student", "solo"]
  },
  {
    id: "tool-discovery",
    title: "Find and test the perfect AI tools",
    description: "Personalized tool recommendations with trial tracking",
    demoVideoUrl: "", // Add your demo video URL here
    targetAiGoals: ["learning"],
    targetChallenges: ["trust", "distractions"],
    targetWorkflows: ["all"]
  },
  // Organization Workflows
  {
    id: "focus-system",
    title: "Deep work protection system",
    description: "Block distractions and maintain laser focus",
    demoVideoUrl: "", // Add your demo video URL here
    targetAiGoals: ["organization"],
    targetChallenges: ["distractions", "structure"],
    targetWorkflows: ["solo", "student", "leader"]
  },
  {
    id: "productivity-dashboard",
    title: "Personal productivity command center",
    description: "Unified dashboard for tasks, calendar, and progress tracking",
    demoVideoUrl: "", // Add your demo video URL here
    targetAiGoals: ["organization"],
    targetChallenges: ["structure", "overwhelm"],
    targetWorkflows: ["leader", "business", "small-team"]
  },
  // Business Growth Workflows
  {
    id: "customer-insights",
    title: "AI-powered customer intelligence",
    description: "Analyze feedback and behavior to grow your business",
    demoVideoUrl: "", // Add your demo video URL here
    targetAiGoals: ["business"],
    targetChallenges: ["manual-tasks", "trust"],
    targetWorkflows: ["business", "leader"]
  },
  {
    id: "growth-experiments",
    title: "Rapid testing and optimization",
    description: "Run growth experiments with AI-powered insights",
    demoVideoUrl: "", // Add your demo video URL here
    targetAiGoals: ["business"],
    targetChallenges: ["structure", "manual-tasks"],
    targetWorkflows: ["business", "leader"]
  }
];

export const WorkflowToolkit = ({ responses }: WorkflowToolkitProps) => {
  const [personalizedWorkflows, setPersonalizedWorkflows] = useState<Workflow[]>([]);
  const [completedWorkflows, setCompletedWorkflows] = useState<Set<string>>(new Set());

  useEffect(() => {
    generatePersonalizedWorkflows();
    loadCompletedWorkflows();
  }, [responses]);

  const generatePersonalizedWorkflows = () => {
    let scoredWorkflows = workflowsDatabase.map(workflow => {
      let score = 0;
      
      // Score based on AI goal match
      if (workflow.targetAiGoals.includes(responses.aiGoal)) {
        score += 10;
      }
      
      // Score based on challenge match
      if (workflow.targetChallenges.includes(responses.biggestChallenge)) {
        score += 8;
      }
      
      // Score based on workflow type match
      if (workflow.targetWorkflows.includes(responses.workflowType) || workflow.targetWorkflows.includes("all")) {
        score += 6;
      }
      
      return { ...workflow, score };
    });

    // Sort by score and take top 5
    scoredWorkflows.sort((a, b) => b.score - a.score);
    setPersonalizedWorkflows(scoredWorkflows.slice(0, 5));
  };

  const loadCompletedWorkflows = () => {
    const completed = localStorage.getItem('completed-workflows');
    if (completed) {
      setCompletedWorkflows(new Set(JSON.parse(completed)));
    }
  };

  const handleMarkComplete = (workflowId: string) => {
    const newCompleted = new Set(completedWorkflows);
    if (newCompleted.has(workflowId)) {
      newCompleted.delete(workflowId);
    } else {
      newCompleted.add(workflowId);
    }
    setCompletedWorkflows(newCompleted);
    localStorage.setItem('completed-workflows', JSON.stringify(Array.from(newCompleted)));
  };

  const handleWatchDemo = (workflow: Workflow) => {
    if (workflow.demoVideoUrl) {
      window.open(workflow.demoVideoUrl, '_blank');
    } else {
      // Placeholder for when demo URLs are added
      console.log(`Demo for ${workflow.title} - URL to be added`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-3">
          Your Personalized AI Productivity Toolkit
        </h2>
        <p className="text-muted-foreground">
          Based on your responses, here are 5 workflows tailored specifically for you
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personalizedWorkflows.map((workflow) => {
          const isCompleted = completedWorkflows.has(workflow.id);
          
          return (
            <Card key={workflow.id} className="p-6 hover:shadow-lg transition-all duration-200">
              <div className="space-y-4">
                {/* Workflow header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground mb-2 leading-tight">
                      {workflow.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {workflow.description}
                    </p>
                  </div>
                  {isCompleted && (
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 ml-2" />
                  )}
                </div>

                {/* Video Demo Placeholder */}
                <div className="relative">
                  <AspectRatio ratio={16 / 9} className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-black/5 transition-colors"
                         onClick={() => handleWatchDemo(workflow)}>
                      <div className="text-center">
                        <Play className="w-12 h-12 text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground font-medium">Watch Demo</p>
                      </div>
                    </div>
                  </AspectRatio>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button 
                    size="sm" 
                    className="flex-1 rounded-xl"
                    onClick={() => handleWatchDemo(workflow)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Try This Workflow
                  </Button>
                  <Button 
                    variant={isCompleted ? "default" : "outline"}
                    size="sm" 
                    className="rounded-xl"
                    onClick={() => handleMarkComplete(workflow.id)}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      "Mark as Complete"
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};