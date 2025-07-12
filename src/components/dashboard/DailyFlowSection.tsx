import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Play, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProductivityPlan, UserResponses } from "@/types/productivity";

interface DailyFlowSectionProps {
  plan: ProductivityPlan;
  responses: UserResponses;
}

export const DailyFlowSection = ({ plan }: DailyFlowSectionProps) => {
  const [completedBlocks, setCompletedBlocks] = useState<number[]>([]);
  const { toast } = useToast();

  const toggleBlockCompletion = (index: number) => {
    setCompletedBlocks(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // Get current day
  const getCurrentDay = () => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[new Date().getDay()];
  };

  const currentDay = getCurrentDay();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Your Smart Calendar</h2>
          <p className="text-muted-foreground">
            Today's optimized schedule with focus time blocks
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Clock className="w-4 h-4 mr-1" />
          {plan.timeBlocks.length} Focus Blocks
        </Badge>
      </div>

      {/* Calendar visualization like the image */}
      <Card className="p-6 bg-gradient-to-br from-violet-50 to-indigo-100 border-none">
        <div className="space-y-4">
          {/* Day header */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground mb-4">{currentDay}</h3>
          </div>

          {/* Focus time blocks */}
          <div className="space-y-3">
            {plan.timeBlocks.slice(0, 4).map((block, index) => {
              const isCompleted = completedBlocks.includes(index);
              const isFocusTime = block.activity.toLowerCase().includes('focus') || 
                                 block.activity.toLowerCase().includes('deep work') ||
                                 index % 2 === 0; // Alternate green blocks for demo
              
              return (
                <div
                  key={index}
                  className={`relative p-4 rounded-lg transition-all duration-200 ${
                    isFocusTime 
                      ? 'bg-green-400 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  } ${isCompleted ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBlockCompletion(index)}
                        className={`p-1 rounded-full ${
                          isCompleted 
                            ? 'text-white' 
                            : isFocusTime 
                              ? 'text-white hover:text-gray-200' 
                              : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        <CheckCircle2 className={`w-5 h-5 ${isCompleted ? 'fill-current' : ''}`} />
                      </Button>
                      <div>
                        <h4 className={`font-medium ${isCompleted ? 'line-through' : ''}`}>
                          {isFocusTime ? 'Focus Time' : block.activity}
                        </h4>
                        <p className={`text-sm opacity-80 ${isCompleted ? 'line-through' : ''}`}>
                          {block.time} • {block.duration}
                        </p>
                      </div>
                    </div>
                    {isFocusTime && !isCompleted && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/20 text-white hover:bg-white/30 border-white/30"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weekly goal section */}
          <div className="mt-8 bg-white rounded-lg p-6 text-center">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-foreground">
                <span className="text-blue-500">Focus Time</span> Weekly Goal
              </h4>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="relative w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: '65%' }}
              ></div>
              <div 
                className="absolute top-1/2 left-3/5 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"
              ></div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-2">20 hrs</p>
          </div>
        </div>
      </Card>
    </div>
  );
};