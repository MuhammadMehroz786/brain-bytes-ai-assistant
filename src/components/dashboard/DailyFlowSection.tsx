import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Play, ExternalLink } from "lucide-react";
import type { ProductivityPlan, UserResponses } from "@/types/productivity";

interface DailyFlowSectionProps {
  plan: ProductivityPlan;
  responses: UserResponses;
}

export const DailyFlowSection = ({ plan }: DailyFlowSectionProps) => {
  const handleAddToCalendar = (timeBlock: any) => {
    // Create calendar event - simplified implementation
    const title = encodeURIComponent(timeBlock.activity);
    const details = encodeURIComponent(timeBlock.description);
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
    window.open(googleCalendarUrl, '_blank');
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
        <Badge variant="outline" className="px-3 py-1">
          <Clock className="w-4 h-4 mr-1" />
          {plan.timeBlocks.length} Time Blocks
        </Badge>
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

                <h4 className="text-lg font-semibold text-foreground mb-2">
                  {block.activity}
                </h4>
                
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
        <div className="text-center">
          <h4 className="font-semibold text-foreground mb-2">Your Daily Flow Summary</h4>
          <p className="text-muted-foreground text-sm mb-4">
            This schedule is optimized for your workflow and daily productivity goals
          </p>
          <Button variant="outline" className="rounded-xl">
            <Calendar className="w-4 h-4 mr-2" />
            Export Full Schedule
          </Button>
        </div>
      </Card>
    </div>
  );
};