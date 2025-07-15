import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock, Calendar, Play, CheckCircle2, MoreHorizontal, Check, SkipForward, Edit, Calendar as CalendarIcon, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ProductivityPlan, UserResponses } from "@/types/productivity";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  isGoogleEvent?: boolean;
  isFocusBlock?: boolean;
  originalIndex?: number;
}

interface DailyFlowSectionProps {
  plan: ProductivityPlan;
  responses: UserResponses;
}

export const DailyFlowSection = ({ plan }: DailyFlowSectionProps) => {
  const [completedBlocks, setCompletedBlocks] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [googleEvents, setGoogleEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const { toast } = useToast();

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Google Calendar events
  useEffect(() => {
    const fetchGoogleEvents = async () => {
      setIsLoadingEvents(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check if user has Gmail tokens (which includes calendar access)
        const { data: tokens } = await supabase
          .from('gmail_tokens')
          .select('access_token')
          .eq('user_id', user.id)
          .single();

        if (tokens?.access_token) {
          // Mock Google Calendar events for now - in a real app, you'd fetch from Google Calendar API
          const mockEvents: CalendarEvent[] = [
            {
              id: 'gc-1',
              title: 'Team Standup',
              start: '09:00',
              end: '09:30',
              description: 'Daily sync with development team',
              isGoogleEvent: true
            },
            {
              id: 'gc-2',
              title: 'Client Call',
              start: '11:00',
              end: '12:00',
              description: 'Project review with client',
              isGoogleEvent: true
            },
            {
              id: 'gc-3',
              title: 'Lunch Break',
              start: '12:30',
              end: '13:30',
              description: 'Lunch with team',
              isGoogleEvent: true
            },
            {
              id: 'gc-4',
              title: '1:1 with Manager',
              start: '15:00',
              end: '15:30',
              description: 'Weekly check-in',
              isGoogleEvent: true
            }
          ];
          setGoogleEvents(mockEvents);
        }
      } catch (error) {
        console.error('Error fetching Google Calendar events:', error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchGoogleEvents();
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

  // Combine and sort all events
  const allEvents = [
    ...plan.timeBlocks.slice(0, 4).map((block, index) => ({
      id: `focus-${index}`,
      title: block.activity.toLowerCase().includes('focus') || block.activity.toLowerCase().includes('deep work') || index % 2 === 0 
        ? 'Focus Time' 
        : block.activity,
      start: block.time,
      end: block.time, // We'll calculate end time from duration
      description: `${block.duration} focus session`,
      isGoogleEvent: false,
      isFocusBlock: true,
      originalIndex: index
    })),
    ...googleEvents
  ].sort((a, b) => {
    // Simple time sorting - in a real app, you'd parse times properly
    const timeA = a.start.replace(/[^\d:]/g, '');
    const timeB = b.start.replace(/[^\d:]/g, '');
    return timeA.localeCompare(timeB);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Your Smart Calendar</h2>
          <p className="text-muted-foreground">
            Today's optimized schedule with AI focus blocks and Google Calendar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Clock className="w-4 h-4 mr-1" />
            {plan.timeBlocks.length} Focus Blocks
          </Badge>
          {googleEvents.length > 0 && (
            <Badge variant="secondary" className="px-3 py-1">
              <ExternalLink className="w-4 h-4 mr-1" />
              {googleEvents.length} Google Events
            </Badge>
          )}
        </div>
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

            {/* Combined events from AI and Google Calendar */}
            <div className="space-y-2 sm:space-y-3">
              {allEvents.map((event) => {
                const isCompleted = event.originalIndex !== undefined ? completedBlocks.includes(event.originalIndex) : false;
                const isFocusTime = event.isFocusBlock && (event.title === 'Focus Time' || event.originalIndex % 2 === 0);
                const isPast = isBlockInPast(event.start);
                const isGoogleEvent = event.isGoogleEvent;
                
                return (
                  <div
                    key={event.id}
                    className={`relative p-3 sm:p-4 rounded-lg transition-all duration-200 ${
                      isFocusTime 
                        ? 'bg-green-400 text-white' 
                        : isGoogleEvent
                          ? 'bg-blue-400 text-white'
                          : 'bg-gray-200 text-gray-700'
                    } ${isCompleted ? 'opacity-60' : ''} ${isPast && !isCompleted ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        {event.isFocusBlock && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBlockCompletion(event.originalIndex!)}
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
                        )}
                        {isGoogleEvent && (
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium text-sm sm:text-base truncate ${isCompleted ? 'line-through' : ''}`}>
                            {event.title}
                          </h4>
                          <p className={`text-xs sm:text-sm opacity-80 ${isCompleted ? 'line-through' : ''}`}>
                            {event.start} {event.end && event.end !== event.start ? `- ${event.end}` : ''} 
                            {event.description && ` • ${event.description}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        {/* Action Menu - only for focus blocks */}
                        {event.isFocusBlock && (
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
                                  onClick={() => handleBlockAction('done', event.originalIndex!)}
                                  className="w-full justify-start h-8 text-xs"
                                >
                                  <Check className="w-3 h-3 mr-2" />
                                  Mark as Done
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleBlockAction('skip', event.originalIndex!)}
                                  className="w-full justify-start h-8 text-xs"
                                >
                                  <SkipForward className="w-3 h-3 mr-2" />
                                  Skip
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleBlockAction('edit', event.originalIndex!)}
                                  className="w-full justify-start h-8 text-xs"
                                >
                                  <Edit className="w-3 h-3 mr-2" />
                                  Edit Duration
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleBlockAction('reschedule', event.originalIndex!)}
                                  className="w-full justify-start h-8 text-xs"
                                >
                                  <CalendarIcon className="w-3 h-3 mr-2" />
                                  Reschedule
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}

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

          {/* Daily progress bar */}
          <div className="mt-6 sm:mt-8 bg-gradient-to-r from-white to-blue-50 rounded-xl p-4 sm:p-5 border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">Today's Focus Progress</span>
              <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {completedBlocks.length}/{plan.timeBlocks.slice(0, 4).length}
              </span>
            </div>
            
            {/* Enhanced progress bar */}
            <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-2 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${(completedBlocks.length / plan.timeBlocks.slice(0, 4).length) * 100}%` }}
              ></div>
            </div>
            
            {googleEvents.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{googleEvents.length} Google Calendar events integrated</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};