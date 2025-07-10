import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Play, ExternalLink, RefreshCw, Info, CheckCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProductivityPlan, UserResponses } from "@/types/productivity";

interface DailyFlowSectionProps {
  plan: ProductivityPlan;
  responses: UserResponses;
}

export const DailyFlowSection = ({ plan }: DailyFlowSectionProps) => {
  const [completedBlocks, setCompletedBlocks] = useState<number[]>([]);
  const { toast } = useToast();

  const handleAddToCalendar = (timeBlock: any) => {
    // Create calendar event - simplified implementation
    const title = encodeURIComponent(timeBlock.activity);
    const details = encodeURIComponent(timeBlock.description);
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
    window.open(googleCalendarUrl, '_blank');
  };

  const handleRecalculateFlow = () => {
    toast({
      title: "Flow recalculated!",
      description: "Your daily schedule has been optimized based on current preferences",
    });
  };

  const toggleBlockCompletion = (index: number) => {
    setCompletedBlocks(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const startNowSession = () => {
    toast({
      title: "25-minute focus session started!",
      description: "Stay focused - you've got this!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Your Optimized Daily Flow</h2>
          <p className="text-muted-foreground">
            A timeline-based schedule designed to maximize your energy and focus throughout the day
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={startNowSession}
            className="rounded-xl"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Now (25min)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculateFlow}
            className="rounded-xl"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Recalculate Today's Flow
          </Button>
          <Badge variant="outline" className="px-3 py-1">
            <Clock className="w-4 h-4 mr-1" />
            {plan.timeBlocks.length} Time Blocks
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {plan.timeBlocks.map((block, index) => {
          const isCompleted = completedBlocks.includes(index);
          return (
            <Card key={index} className={`p-4 hover:shadow-md transition-all duration-200 ${isCompleted ? 'bg-success/5 border-success/20' : ''}`}>
              <div className="flex items-center gap-4">
                {/* Completion toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBlockCompletion(index)}
                  className={`p-1 rounded-full ${isCompleted ? 'text-success' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <CheckCircle2 className={`w-5 h-5 ${isCompleted ? 'fill-current' : ''}`} />
                </Button>

                {/* Time indicator */}
                <div className="flex flex-col items-center min-w-0">
                  <Badge variant="secondary" className="text-xs font-medium whitespace-nowrap">
                    {block.time}
                  </Badge>
                  <Badge variant="outline" className="text-xs mt-1">
                    {block.duration}
                  </Badge>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold text-foreground ${isCompleted ? 'line-through opacity-60' : ''}`}>
                      {block.activity}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-6 w-6 opacity-50 hover:opacity-100"
                        title="Why this time block works for you"
                      >
                        <Info className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddToCalendar(block)}
                        className="rounded-xl"
                      >
                        <Calendar className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className={`text-sm text-muted-foreground mb-2 ${isCompleted ? 'line-through opacity-60' : ''}`}>
                    {block.description}
                  </p>

                  {/* Tool suggestion - compact */}
                  <div className="text-xs text-muted-foreground">
                    Tool: {plan.aiTools[index % plan.aiTools.length]?.name || 'Focus Timer'}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Summary card */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <div className="text-center space-y-4">
          <h4 className="font-semibold text-foreground mb-2">Your Daily Flow Summary</h4>
          <p className="text-muted-foreground text-sm mb-4">
            This schedule is optimized for your workflow and daily productivity goals
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" className="rounded-xl">
              <Calendar className="w-4 h-4 mr-2" />
              Export Full Schedule
            </Button>
            <Button variant="ghost" className="rounded-xl text-primary hover:bg-primary/10">
              <ExternalLink className="w-4 h-4 mr-2" />
              Upgrade for Auto-Sync
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};