import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Play, ExternalLink, RefreshCw, Edit3, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProductivityPlan, UserResponses } from "@/types/productivity";

interface DailyFlowSectionProps {
  plan: ProductivityPlan;
  responses: UserResponses;
}

export const DailyFlowSection = ({ plan }: DailyFlowSectionProps) => {
  const [editMode, setEditMode] = useState(false);
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

      <div className="space-y-4">
        {plan.timeBlocks.map((block, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start gap-6">
              {/* Time indicator */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                {index < plan.timeBlocks.length - 1 && (
                  <div className="w-0.5 h-12 bg-primary/20 mt-4" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-sm font-medium">
                      {block.time}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {block.duration}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddToCalendar(block)}
                    className="rounded-xl"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Add to Calendar
                  </Button>
                </div>

                <div className="flex items-start gap-2 mb-2">
                  <h4 className="text-lg font-semibold text-foreground">
                    {block.activity}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6 opacity-50 hover:opacity-100"
                    title="Why this time block works for you"
                  >
                    <Info className="w-3 h-3" />
                  </Button>
                </div>
                
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {block.description}
                </p>

                {/* Tool suggestion */}
                <div className="bg-gradient-to-r from-accent/5 to-primary/5 rounded-xl p-4 border border-accent/10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-foreground mb-1">
                        Recommended Tool: {plan.aiTools[index % plan.aiTools.length]?.name || 'Focus Timer'}
                      </h5>
                      <p className="text-sm text-muted-foreground">
                        {plan.aiTools[index % plan.aiTools.length]?.description || 'Stay focused during this time block'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="ghost" size="sm" className="rounded-xl">
                        <Play className="w-4 h-4 mr-1" />
                        Demo
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-xl">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
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