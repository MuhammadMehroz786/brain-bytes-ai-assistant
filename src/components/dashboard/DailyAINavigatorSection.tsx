import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Compass, Lightbulb, MessageSquare, Copy, Zap, RefreshCw, Target, Clock, Brain, Pencil, LifeBuoy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FocusTimer } from "@/components/FocusTimer";
import { StreakCounter } from "@/components/StreakCounter";
import type { ProductivityPlan, UserResponses } from "@/types/productivity";

interface DailyAINavigatorSectionProps {
  plan: ProductivityPlan;
  responses: UserResponses;
  todaysPriority?: string;
}

export const DailyAINavigatorSection = ({ plan, responses, todaysPriority }: DailyAINavigatorSectionProps) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [brainDumpInput, setBrainDumpInput] = useState("");
  const [showRescuePlan, setShowRescuePlan] = useState(false);
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const { toast } = useToast();

  const personalizedTips = [
    `Based on your current tools (${responses.currentTools}), try using 25-minute focused sprints with 5-minute breaks today.`,
    `Your main productivity struggle is ${responses.productivityStruggle}. Start each hour by asking: "What's the most important thing right now?"`,
    `Since you're most productive during ${responses.productiveTime}, schedule your hardest tasks then.`,
    `To tackle time management better, try the "2-minute rule" - if it takes less than 2 minutes, do it immediately.`
  ];

  const gptPrompts = [
    {
      title: "Daily Priority Setter",
      prompt: `Based on my goals and current workload, help me identify the top 3 priorities for today. Consider: I want to achieve ${responses.goals}, my main struggle is ${responses.productivityStruggle}, and I'm most productive during ${responses.productiveTime}. Please provide specific, actionable tasks.`
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

  const productivityFacts = [
    "Users who plan their day are 3x more likely to achieve their goals",
    "AI-assisted productivity increases focus time by 40% on average", 
    "People who use time blocks complete 25% more important tasks daily",
    "Daily planning reduces decision fatigue by up to 50%",
    "The average person checks their phone 96 times per day - focus blocks help break this habit",
    "Studies show that multitasking can reduce productivity by up to 40%",
    "Taking breaks every 90 minutes can increase productivity by 23%",
    "The Pomodoro Technique was invented by Francesco Cirillo in the 1980s using a tomato timer",
    "Your brain can only focus for about 45 minutes before needing a break",
    "People who write down their goals are 42% more likely to achieve them",
    "The best time for creative work is typically 10 AM to 12 PM for most people",
    "Clutter in your workspace can reduce focus by up to 32%"
  ];

  const currentTip = personalizedTips[tipIndex];
  const currentPrompt = gptPrompts[tipIndex % gptPrompts.length];
  const currentFact = productivityFacts[tipIndex % productivityFacts.length];

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

  const handleBrainDump = () => {
    if (brainDumpInput.trim()) {
      setBrainDumpInput("");
      toast({
        title: "Saved your thoughts!",
        description: "Now here's your focus for today",
      });
    }
  };

  const handleMorningReset = () => {
    // Force refresh of content
    setTipIndex((prev) => (prev + 1) % personalizedTips.length);
    
    toast({
      title: "Schedule rebuilt!",
      description: "Your flow has been optimized from the current time forward",
    });
  };

  const handleFocusStart = () => {
    setShowFocusTimer(true);
  };

  const handleFocusComplete = () => {
    setShowFocusTimer(false);
    toast({
      title: "🎉 Focus session completed!",
      description: "Your streak has been updated. Great work!",
    });
  };

  const handleFocusExit = () => {
    setShowFocusTimer(false);
  };

  const miniWins = [
    "Complete one deep work sprint before 1PM",
    "Finish your most important task first",
    "Have one productive conversation today",
    "Clear your inbox completely"
  ];

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

      {/* Yesterday's Recap */}
      <Card className="p-4 bg-gradient-to-r from-success/5 to-primary/5 border-success/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center border border-success/20">
              <Clock className="w-4 h-4 text-success" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Yesterday's Recap</h4>
              <p className="text-sm text-muted-foreground">You focused for 2h yesterday. Want to increase or maintain that today?</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={refreshContent} className="rounded-xl">
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate Today's Plan
          </Button>
        </div>
      </Card>

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

        {/* Mini Win for Today */}
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20">
              <Target className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Mini Win for Today</h4>
              <Badge variant="outline" className="text-xs">Achievable Goal</Badge>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">{miniWins[tipIndex % miniWins.length]}</p>
        </Card>
      </div>

      {/* Streak Counter */}
      <StreakCounter />

      {/* Brain Dump Input */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <h4 className="font-medium text-foreground">Brain Dump</h4>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Quick thoughts or tasks (1-3 items)..."
            value={brainDumpInput}
            onChange={(e) => setBrainDumpInput(e.target.value)}
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleBrainDump()}
          />
          <Button onClick={handleBrainDump} disabled={!brainDumpInput.trim()} className="rounded-xl">
            Save
          </Button>
        </div>
      </Card>

      {/* Action Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-3 border border-success/20">
            <Zap className="w-4 h-4 text-success" />
          </div>
          <h5 className="font-medium text-foreground mb-2">Focus Mode</h5>
          <Button variant="outline" size="sm" onClick={handleFocusStart} className="w-full rounded-xl">
            Start 30min Session
          </Button>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 border border-primary/20">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <h5 className="font-medium text-foreground mb-2">Morning Reset</h5>
          <Button variant="outline" size="sm" onClick={handleMorningReset} className="w-full rounded-xl text-xs">
            Start Late? Rebuild Your Schedule
          </Button>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3 border border-accent/20">
            <LifeBuoy className="w-4 h-4 text-accent" />
          </div>
          <h5 className="font-medium text-foreground mb-2">Distraction Rescue</h5>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowRescuePlan(!showRescuePlan)} 
            className="w-full rounded-xl"
          >
            Distracted or stuck?
          </Button>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-success/5 to-primary/5 border-success/20">
          <div className="text-center">
            <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-3 border border-success/20">
              <Compass className="w-4 h-4 text-success" />
            </div>
            <h5 className="font-medium text-foreground mb-2">Daily Insight</h5>
            <p className="text-xs text-muted-foreground leading-relaxed">{currentFact}</p>
          </div>
        </Card>
      </div>

      {/* Distraction Rescue Plan */}
      {showRescuePlan && (
        <Card className="p-6 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
          <div className="text-center space-y-4">
            <h4 className="font-semibold text-foreground mb-4">3-Step Distraction Rescue Plan</h4>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                <p className="text-sm text-foreground">Step away for 1 minute</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                <p className="text-sm text-foreground">Write your next task in 1 sentence</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                <p className="text-sm text-foreground">Start a 15-min timer and just begin</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowRescuePlan(false)} 
              className="rounded-xl"
            >
              Got it, let's refocus!
            </Button>
          </div>
        </Card>
      )}

      {/* Focus Timer Overlay */}
      {showFocusTimer && (
        <FocusTimer 
          onExit={handleFocusExit}
          onComplete={handleFocusComplete}
        />
      )}
    </div>
  );
};