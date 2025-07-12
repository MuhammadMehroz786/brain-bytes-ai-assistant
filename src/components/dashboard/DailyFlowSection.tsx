import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock, Calendar, Play, CheckCircle2, MoreHorizontal, Check, SkipForward, Edit, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProductivityPlan, UserResponses } from "@/types/productivity";

interface DailyFlowSectionProps {
  plan: ProductivityPlan;
  responses: UserResponses;
}

export const DailyFlowSection = ({ plan }: DailyFlowSectionProps) => {
  const [completedBlocks, setCompletedBlocks] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const toggleBlockCompletion = (index: number) => {
    setCompletedBlocks(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
    toast({
      title: "Block updated",
      description: "Time block marked as completed",
    });
  };

  const handleBlockAction = (action: string, blockIndex: number) => {
    switch (action) {
      case 'done':
        toggleBlockCompletion(blockIndex);
        break;
      case 'skip':
        toast({
          title: "Block skipped",
          description: "Time block has been skipped",
        });
        break;
      case 'edit':
        toast({
          title: "Edit duration",
          description: "Duration editing coming soon",
        });
        break;
      case 'reschedule':
        toast({
          title: "Reschedule",
          description: "Rescheduling coming soon",
        });
        break;
    }
  };

  // Calculate if a time block is in the past
  const isBlockInPast = (timeString: string) => {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;
    
    const blockTime = new Date();
    blockTime.setHours(hour24, minutes || 0, 0, 0);
    
    return blockTime < currentTime;
  };

  // Calculate the "now" line position based on current time
  const getCurrentTimePosition = () => {
    const now = currentTime;
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Assuming the calendar shows 8 AM to 6 PM (10 hours)
    const startHour = 8;
    const endHour = 18;
    const totalHours = endHour - startHour;
    
    if (hour < startHour || hour >= endHour) return null;
    
    const currentMinuteOfDay = (hour - startHour) * 60 + minute;
    const totalMinutes = totalHours * 60;
    
    return (currentMinuteOfDay / totalMinutes) * 100;
  };

  const nowPosition = getCurrentTimePosition();

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
      <Card className="relative p-4 sm:p-6 bg-gradient-to-br from-violet-50 to-indigo-100 border-none overflow-hidden">
        <div className="space-y-4">
          {/* Day header */}
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4">{currentDay}</h3>
          </div>

          {/* Timeline container with "now" line */}
          <div className="relative">
            {/* "Now" line - only show if within business hours */}
            {nowPosition !== null && (
              <div 
                className="absolute left-0 right-0 z-10 pointer-events-none"
                style={{ top: `${nowPosition}%` }}
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500 to-blue-300"></div>
                </div>
                <div className="text-xs text-blue-600 ml-4 mt-1 font-medium">
                  Now {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}

            {/* Focus time blocks */}
            <div className="space-y-2 sm:space-y-3">
              {plan.timeBlocks.slice(0, 4).map((block, index) => {
                const isCompleted = completedBlocks.includes(index);
                const isFocusTime = block.activity.toLowerCase().includes('focus') || 
                                   block.activity.toLowerCase().includes('deep work') ||
                                   index % 2 === 0; // Alternate green blocks for demo
                const isPast = isBlockInPast(block.time);
                
                return (
                  <div
                    key={index}
                    className={`relative p-3 sm:p-4 rounded-lg transition-all duration-200 ${
                      isFocusTime 
                        ? 'bg-green-400 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    } ${isCompleted ? 'opacity-60' : ''} ${isPast && !isCompleted ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBlockCompletion(index)}
                          className={`p-1 rounded-full flex-shrink-0 ${
                            isCompleted 
                              ? 'text-white' 
                              : isFocusTime 
                                ? 'text-white hover:text-gray-200' 
                                : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 ${isCompleted ? 'fill-current' : ''}`} />
                        </Button>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium text-sm sm:text-base truncate ${isCompleted ? 'line-through' : ''}`}>
                            {isFocusTime ? 'Focus Time' : block.activity}
                          </h4>
                          <p className={`text-xs sm:text-sm opacity-80 ${isCompleted ? 'line-through' : ''}`}>
                            {block.time} • {block.duration}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        {/* Action Menu */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`p-1 h-8 w-8 rounded-full ${
                                isFocusTime 
                                  ? 'text-white hover:text-gray-200 hover:bg-white/20' 
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-300/50'
                              }`}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-2" align="end">
                            <div className="space-y-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleBlockAction('done', index)}
                                className="w-full justify-start h-8 text-xs"
                              >
                                <Check className="w-3 h-3 mr-2" />
                                Mark as Done
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleBlockAction('skip', index)}
                                className="w-full justify-start h-8 text-xs"
                              >
                                <SkipForward className="w-3 h-3 mr-2" />
                                Skip
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleBlockAction('edit', index)}
                                className="w-full justify-start h-8 text-xs"
                              >
                                <Edit className="w-3 h-3 mr-2" />
                                Edit Duration
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleBlockAction('reschedule', index)}
                                className="w-full justify-start h-8 text-xs"
                              >
                                <CalendarIcon className="w-3 h-3 mr-2" />
                                Reschedule
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>

                        {/* Start button for focus time */}
                        {isFocusTime && !isCompleted && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-white/20 text-white hover:bg-white/30 border-white/30 text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-8"
                          >
                            <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="hidden sm:inline">Start</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Progress Timeline */}
          <div className="mt-6 sm:mt-8 bg-white rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-sm sm:text-lg font-semibold text-foreground">
                <span className="text-blue-500">Today's</span> Progress Timeline
              </h4>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
            </div>
            
            {/* Vertical Timeline */}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {/* Timeline blocks */}
              <div className="space-y-4">
                {plan.timeBlocks.map((block, index) => {
                  const isCompleted = completedBlocks.includes(index);
                  const isPast = isBlockInPast(block.time);
                  const isFocusTime = block.activity.toLowerCase().includes('focus') || 
                                     block.activity.toLowerCase().includes('deep work') ||
                                     index % 2 === 0;
                  
                  // Calculate height based on duration (assuming 1 hour = 60px)
                  const durationMatch = block.duration.match(/(\d+)/);
                  const hours = durationMatch ? parseInt(durationMatch[1]) : 1;
                  const height = Math.max(hours * 60, 40); // Minimum 40px height
                  
                  return (
                    <div key={index} className="relative flex items-start gap-4">
                      {/* Timeline dot */}
                      <div className={`relative z-10 w-3 h-3 rounded-full border-2 border-white ${
                        isCompleted 
                          ? 'bg-green-500' 
                          : isPast 
                            ? 'bg-gray-400' 
                            : isFocusTime 
                              ? 'bg-blue-500' 
                              : 'bg-orange-400'
                      }`}>
                        {isCompleted && (
                          <CheckCircle2 className="w-3 h-3 text-white absolute -inset-0.5" />
                        )}
                      </div>
                      
                      {/* Time block card */}
                      <div 
                        className={`flex-1 rounded-lg transition-all duration-200 ${
                          isFocusTime 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'bg-gray-50 border border-gray-200'
                        } ${isCompleted ? 'opacity-60' : ''} ${isPast && !isCompleted ? 'opacity-50' : ''}`}
                        style={{ minHeight: `${height}px` }}
                      >
                        <div className="p-3 sm:p-4 h-full flex flex-col justify-center">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs sm:text-sm font-medium ${
                              isFocusTime ? 'text-blue-700' : 'text-gray-700'
                            }`}>
                              {block.time}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isFocusTime 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {block.duration}
                            </span>
                          </div>
                          <h5 className={`font-medium text-sm sm:text-base ${
                            isCompleted ? 'line-through' : ''
                          } ${isFocusTime ? 'text-blue-800' : 'text-gray-800'}`}>
                            {isFocusTime ? 'Focus Time' : block.activity}
                          </h5>
                          {!isFocusTime && (
                            <p className={`text-xs sm:text-sm mt-1 ${
                              isFocusTime ? 'text-blue-600' : 'text-gray-600'
                            } ${isCompleted ? 'line-through' : ''}`}>
                              {block.activity}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Progress summary */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {completedBlocks.length} of {plan.timeBlocks.length} blocks completed
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-600 font-medium">
                      {Math.round((completedBlocks.length / plan.timeBlocks.length) * 100)}% done
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};