import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Compass, Lightbulb, MessageSquare, Copy, Zap, Calendar, Focus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProductivityPlan, UserResponses } from "@/types/productivity";

interface DailyAINavigatorSectionProps {
  plan: ProductivityPlan;
  responses: UserResponses;
}

export const DailyAINavigatorSection = ({ plan, responses }: DailyAINavigatorSectionProps) => {
  const [tipIndex, setTipIndex] = useState(0);
  const { toast } = useToast();

  const personalizedTips = [
    `Since you work as a ${responses.jobType}, try using 25-minute focused sprints with 5-minute breaks today.`,
    `Your main productivity struggle is ${responses.productivityStruggle}. Start each hour by asking: "What's the most important thing right now?"`,
    `Based on your ${responses.preferredWorkflow} workflow preference, your peak focus time is likely mid-morning. Schedule your hardest task then.`,
    `To tackle time management better, try the "2-minute rule" - if it takes less than 2 minutes, do it immediately.`
  ];

  const gptPrompts = [
    {
      title: "Daily Priority Setter",
      prompt: `Based on my goals and current workload, help me identify the top 3 priorities for today. Consider: I'm a ${responses.jobType} working ${responses.workHours}, my main goals are ${responses.goals}, and I prefer ${responses.preferredWorkflow} approaches. Please provide specific, actionable tasks.`
    },
    {
      title: "Focus Session Planner", 
      prompt: `Create a detailed focus session plan for me. I want to work on [specific task] for the next 2 hours. Break it down into manageable chunks, suggest timing, and provide strategies for maintaining concentration. I prefer structured approaches.`
    },
    {
      title: "Weekly Review Assistant",
      prompt: `Help me conduct a comprehensive weekly review. Ask me about: 1) What went well this week, 2) What challenges I faced, 3) Progress on my productivity goals, 4) Key learnings, and 5) Priorities for next week. Guide me through each section with follow-up questions.`
    }
  ];

  const motivationalStats = [
    "Users who plan their day are 3x more likely to achieve their goals",
    "AI-assisted productivity increases focus time by 40% on average", 
    "People who use time blocks complete 25% more important tasks daily",
    "Daily planning reduces decision fatigue by up to 50%"
  ];

  const currentTip = personalizedTips[tipIndex];
  const currentPrompt = gptPrompts[tipIndex % gptPrompts.length];
  const currentStat = motivationalStats[tipIndex % motivationalStats.length];

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Prompt copied!",
      description: "Paste it into ChatGPT or your preferred AI assistant",
    });
  };

  const refreshContent = () => {
    setTipIndex((prev) => (prev + 1) % personalizedTips.length);
    toast({
      title: "Content refreshed!",
      description: "Here's your new daily guidance",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Daily AI Navigator</h2>
          <p className="text-muted-foreground">
            Your personalized productivity guidance for today
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshContent}
          className="rounded-xl"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's AI Tip */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Today's AI Tip</h4>
              <Badge variant="secondary" className="text-xs">Personalized</Badge>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">{currentTip}</p>
        </Card>

        {/* GPT Prompt Suggestion */}
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20">
              <MessageSquare className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">{currentPrompt.title}</h4>
              <Badge variant="outline" className="text-xs">Ready to Copy</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyPrompt(currentPrompt.prompt)}
              className="rounded-xl"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {currentPrompt.prompt.substring(0, 120)}...
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyPrompt(currentPrompt.prompt)}
            className="w-full rounded-xl"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Full Prompt
          </Button>
        </Card>
      </div>

      {/* Quick Actions & Motivation */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-3 border border-success/20">
            <Zap className="w-4 h-4 text-success" />
          </div>
          <h5 className="font-medium text-foreground mb-2">Focus Mode</h5>
          <Button variant="outline" size="sm" className="w-full rounded-xl">
            Start 25min Session
          </Button>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 border border-primary/20">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <h5 className="font-medium text-foreground mb-2">Quick Sync</h5>
          <Button variant="outline" size="sm" className="w-full rounded-xl">
            Update Calendar
          </Button>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-success/5 to-primary/5 border-success/20">
          <div className="text-center">
            <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-3 border border-success/20">
              <Compass className="w-4 h-4 text-success" />
            </div>
            <h5 className="font-medium text-foreground mb-2">Daily Insight</h5>
            <p className="text-xs text-muted-foreground leading-relaxed">{currentStat}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};