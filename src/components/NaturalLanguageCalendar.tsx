import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { MessageSquare, Calendar, Loader2, Send } from 'lucide-react';

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
  
  // If the time has passed today, move to tomorrow
  if (targetDate <= today && !lowerCommand.includes('tomorrow') && !lowerCommand.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/)) {
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

export const NaturalLanguageCalendar: React.FC<NaturalLanguageCalendarProps> = ({ 
  isCalendarConnected 
}) => {
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScheduledEvent, setLastScheduledEvent] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);

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
    "set a focus block for 10 am about doing homework",
    "schedule meeting with John tomorrow at 2pm", 
    "lunch at 12:30",
    "dentist appointment on Friday at 3pm",
    "gym workout today at 6pm for 2 hours",
    "focus time for 9am about writing reports"
  ];

  return (
    <Card className="p-4">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-slate-700">Quick Add (natural language)</h3>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            id="nlc-input"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., set a focus block for 10 am about doing homework"
            className="flex-1"
            disabled={isProcessing || !isCalendarConnected}
            aria-label="Natural language quick add"
          />
          <Button 
            onClick={handleNaturalLanguageInput}
            disabled={isProcessing || !isCalendarConnected || !command.trim()}
            size="icon"
            aria-label="Submit quick add"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {!isCalendarConnected && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <Calendar className="w-4 h-4 inline mr-1" />
              Connect your Google Calendar first to use natural language scheduling
            </p>
          </div>
        )}

        {lastScheduledEvent && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{lastScheduledEvent}</p>
          </div>
        )}

        <div className="mt-3">
          <button type="button" className="text-xs text-muted-foreground hover:text-foreground underline" onClick={()=>setShowExamples(v=>!v)}>
            {showExamples ? 'Hide examples' : 'Show examples'}
          </button>
          {showExamples && (
            <div className="mt-2 grid grid-cols-1 gap-2">
              {exampleCommands.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setCommand(example)}
                  className="text-left text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 p-2 rounded transition-colors"
                  disabled={isProcessing || !isCalendarConnected}
                >
                  "{example}"
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};