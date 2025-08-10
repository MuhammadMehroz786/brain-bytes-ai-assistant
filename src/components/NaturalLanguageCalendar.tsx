import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { MessageSquare, Calendar, Loader2, Send, Clock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface NaturalLanguageCalendarProps {
  isCalendarConnected: boolean;
}

interface ParsedEvent {
  summary: string;
  startTime: string;
  endTime: string;
}

// Simple client-side natural language parser
const parseNaturalLanguageCommand = (command: string, timezone: string): ParsedEvent | null => {
  const lowerCommand = command.toLowerCase();
  
  // Extract time patterns
  const timePatterns = [
    /(\d{1,2})\s*(am|pm)/gi,
    /(\d{1,2}):(\d{2})\s*(am|pm)/gi,
    /(\d{1,2}):(\d{2})/gi,
    /(\d{1,2})\s*o'?clock/gi
  ];
  
  let timeMatch = null;
  let timeStr = '';
  
  for (const pattern of timePatterns) {
    const match = pattern.exec(lowerCommand);
    if (match) {
      timeMatch = match;
      timeStr = match[0];
      break;
    }
  }
  
  if (!timeMatch) {
    return null;
  }
  
  // Parse the time
  let hour = parseInt(timeMatch[1]);
  let minute = parseInt(timeMatch[2]) || 0;
  const ampm = timeMatch[2] || timeMatch[3];
  
  if (ampm && ampm.toLowerCase() === 'pm' && hour < 12) {
    hour += 12;
  } else if (ampm && ampm.toLowerCase() === 'am' && hour === 12) {
    hour = 0;
  }
  
  // Determine the date
  const today = new Date();
  let targetDate = new Date(today);
  
  if (lowerCommand.includes('tomorrow')) {
    targetDate.setDate(today.getDate() + 1);
  } else if (lowerCommand.includes('monday')) {
    const daysToAdd = (1 + 7 - today.getDay()) % 7;
    targetDate.setDate(today.getDate() + daysToAdd);
  } else if (lowerCommand.includes('tuesday')) {
    const daysToAdd = (2 + 7 - today.getDay()) % 7;
    targetDate.setDate(today.getDate() + daysToAdd);
  } else if (lowerCommand.includes('wednesday')) {
    const daysToAdd = (3 + 7 - today.getDay()) % 7;
    targetDate.setDate(today.getDate() + daysToAdd);
  } else if (lowerCommand.includes('thursday')) {
    const daysToAdd = (4 + 7 - today.getDay()) % 7;
    targetDate.setDate(today.getDate() + daysToAdd);
  } else if (lowerCommand.includes('friday')) {
    const daysToAdd = (5 + 7 - today.getDay()) % 7;
    targetDate.setDate(today.getDate() + daysToAdd);
  }
  
  // Set the time
  targetDate.setHours(hour, minute, 0, 0);
  
  // Only move to tomorrow if the time has already passed today AND it's not explicitly for tomorrow or a specific day
  // Allow booking for later times on the same day (like 11pm)
  if (targetDate < today && !lowerCommand.includes('tomorrow') && !lowerCommand.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/)) {
    targetDate.setDate(targetDate.getDate() + 1);
  }
  
  // Extract the task/summary
  let summary = command;
  
  // Remove common scheduling words
  summary = summary.replace(/set a focus block for|schedule|at|about|for|on (today|tomorrow)/gi, '');
  summary = summary.replace(timeStr, '');
  summary = summary.replace(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi, '');
  summary = summary.trim();
  
  // If the summary starts with "about", remove it
  if (summary.toLowerCase().startsWith('about ')) {
    summary = summary.substring(6);
  }
  
  if (!summary) {
    summary = 'Focus time';
  }
  
  // Determine duration
  let duration = 60; // default 1 hour in minutes
  if (lowerCommand.includes('focus block') || lowerCommand.includes('focus time')) {
    duration = 30; // focus blocks are 30 minutes
  }
  
  // Check for explicit duration
  const durationMatch = lowerCommand.match(/for (\d+) (hour|hours|minute|minutes)/);
  if (durationMatch) {
    const num = parseInt(durationMatch[1]);
    const unit = durationMatch[2];
    if (unit.startsWith('hour')) {
      duration = num * 60;
    } else {
      duration = num;
    }
  }
  
  const startTime = targetDate.toISOString();
  const endTime = new Date(targetDate.getTime() + duration * 60 * 1000).toISOString();
  
  return {
    summary: summary.charAt(0).toUpperCase() + summary.slice(1),
    startTime,
    endTime
  };
};

// Check if a time slot is available
const checkTimeSlotAvailability = async (
  accessToken: string, 
  startTime: string, 
  endTime: string
): Promise<{
  available: boolean;
  conflictStart?: string;
  conflictEnd?: string;
  conflictSummary?: string;
}> => {
  try {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    // Fetch events for the day to check conflicts
    const dayStart = new Date(startDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(startDate);
    dayEnd.setHours(23, 59, 59, 999);

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${dayStart.toISOString()}&timeMax=${dayEnd.toISOString()}&singleEvents=true&orderBy=startTime`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      console.warn('Could not check availability, proceeding with booking');
      return { available: true };
    }

    const data = await response.json();
    const events = data.items || [];

    // Check for conflicts
    for (const event of events) {
      if (!event.start?.dateTime || !event.end?.dateTime) continue;
      
      const eventStart = new Date(event.start.dateTime);
      const eventEnd = new Date(event.end.dateTime);
      
      // Check if there's an overlap
      if (startDate < eventEnd && endDate > eventStart) {
        return {
          available: false,
          conflictStart: event.start.dateTime,
          conflictEnd: event.end.dateTime,
          conflictSummary: event.summary || 'Busy'
        };
      }
    }

    return { available: true };
  } catch (error) {
    console.warn('Error checking availability:', error);
    return { available: true }; // Default to available if check fails
  }
};

export const NaturalLanguageCalendar: React.FC<NaturalLanguageCalendarProps> = ({ 
  isCalendarConnected 
}) => {
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScheduledEvent, setLastScheduledEvent] = useState<string | null>(null);

  const handleNaturalLanguageInput = async () => {
    if (!command.trim()) {
      toast.error('Please enter a calendar command');
      return;
    }

    if (!isCalendarConnected) {
      toast.error('Please connect your Google Calendar first');
      return;
    }

    setIsProcessing(true);

    try {
      // Get access token for direct Google Calendar API calls
      const accessToken = localStorage.getItem('google_calendar_access_token');
      if (!accessToken) {
        throw new Error('Calendar not connected. Please connect your Google Calendar first.');
      }
      
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Use a simple client-side parser for now (can be enhanced with OpenAI later)
      const parsedEvent = parseNaturalLanguageCommand(command.trim(), timezone);
      
      if (!parsedEvent) {
        throw new Error('Could not understand the command. Try: "set a focus block for 10 am about doing homework"');
      }

      console.log('Parsed command:', parsedEvent);

      // Check availability first
      const isAvailable = await checkTimeSlotAvailability(
        accessToken, 
        parsedEvent.startTime, 
        parsedEvent.endTime
      );

      if (!isAvailable.available) {
        const conflictTime = new Date(isAvailable.conflictStart!).toLocaleTimeString();
        throw new Error(
          `⚠️ Time slot conflicts with existing event "${isAvailable.conflictSummary}" at ${conflictTime}. Please choose a different time.`
        );
      }

      // Create the event directly with Google Calendar API
      const event = {
        summary: parsedEvent.summary,
        start: { dateTime: parsedEvent.startTime },
        end: { dateTime: parsedEvent.endTime },
      };

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Google Calendar API error:', errorData);
        throw new Error('Failed to create calendar event. Please reconnect your calendar.');
      }

      const startTime = new Date(parsedEvent.startTime);
      const successMessage = `✅ Scheduled "${parsedEvent.summary}" for ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}`;
      
      toast.success(successMessage);
      setLastScheduledEvent(successMessage);
      setCommand('');

    } catch (error) {
      console.error('Error processing natural language command:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process calendar command');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNaturalLanguageInput();
    }
  };

  const exampleCommands = [
    "book a block for 30 minutes for 11pm",
    "set a focus block for 10 am about doing homework",
    "schedule meeting with John tomorrow at 2pm", 
    "lunch at 12:30",
    "dentist appointment on Friday at 3pm",
    "gym workout today at 6pm for 2 hours"
  ];

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 shadow-lg">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative p-8">
        {/* Header with enhanced styling */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                AI Calendar Assistant
              </h3>
              <p className="text-sm text-gray-500 mt-1">Smart scheduling with natural language</p>
            </div>
          </div>
          {isCalendarConnected && (
            <div className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Connected
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Enhanced input section */}
          <div className="relative">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tell me what to schedule... e.g., book a block for 30 minutes for 11pm"
                  className="pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-xl shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  disabled={isProcessing || !isCalendarConnected}
                />
                <MessageSquare className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <Button 
                onClick={handleNaturalLanguageInput}
                disabled={isProcessing || !isCalendarConnected || !command.trim()}
                className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Schedule
                  </>
                )}
              </Button>
            </div>
            
            {isProcessing && (
              <div className="mt-3 flex items-center text-blue-600">
                <Clock className="w-4 h-4 mr-2 animate-pulse" />
                <span className="text-sm">Checking availability and creating your event...</span>
              </div>
            )}
          </div>

          {/* Connection status */}
          {!isCalendarConnected && (
            <div className="flex items-start p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl shadow-sm">
              <AlertCircle className="w-5 h-5 text-amber-600 mr-3 mt-0.5" />
              <div>
                <h4 className="text-amber-800 font-medium">Calendar Connection Required</h4>
                <p className="text-amber-700 text-sm mt-1">
                  Connect your Google Calendar below to start using AI-powered scheduling
                </p>
              </div>
            </div>
          )}

          {/* Success message with enhanced styling */}
          {lastScheduledEvent && (
            <div className="flex items-start p-4 bg-green-50 border-l-4 border-green-400 rounded-r-xl shadow-sm animate-in slide-in-from-left duration-300">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
              <div>
                <h4 className="text-green-800 font-medium">Event Created Successfully!</h4>
                <p className="text-green-700 text-sm mt-1">{lastScheduledEvent.replace('✅', '')}</p>
              </div>
            </div>
          )}

          {/* Enhanced examples section */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-3"></div>
              <h4 className="font-semibold text-gray-800">Try these smart commands:</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exampleCommands.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setCommand(example)}
                  className="group text-left p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 disabled:hover:bg-transparent"
                  disabled={isProcessing || !isCalendarConnected}
                >
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 mt-2 group-hover:bg-blue-600 transition-colors"></div>
                    <span className="text-sm text-gray-700 group-hover:text-blue-800 font-medium">
                      "{example}"
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};