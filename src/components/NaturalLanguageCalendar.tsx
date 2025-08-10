import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { MessageSquare, Calendar, Loader2, Send } from 'lucide-react';

interface NaturalLanguageCalendarProps {
  isCalendarConnected: boolean;
}

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
      // Get user's email from localStorage (should be stored when calendar is connected)
      const userEmail = localStorage.getItem('user_email') || 'user@example.com';
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // First, parse the natural language command
      const parseResponse = await fetch('http://localhost:8082/parse-calendar-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: command.trim(),
          email: userEmail,
          timezone: timezone,
        }),
      });

      const parseData = await parseResponse.json();

      if (!parseResponse.ok) {
        throw new Error(parseData.error || 'Failed to parse command');
      }

      console.log('Parsed command:', parseData);

      // Now schedule the event using the parsed data
      const scheduleResponse = await fetch('http://localhost:8082/schedule-focus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: parseData.summary,
          email: userEmail,
          startTime: parseData.startTime,
          endTime: parseData.endTime,
        }),
      });

      const scheduleData = await scheduleResponse.json();

      if (!scheduleResponse.ok) {
        throw new Error(scheduleData.error || 'Failed to create calendar event');
      }

      const startTime = new Date(parseData.startTime);
      const successMessage = `✅ Scheduled "${parseData.summary}" for ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}`;
      
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
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
        <h3 className="text-lg font-medium">Natural Language Calendar</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Tell me what you want to schedule, and I'll create the calendar event for you!
      </p>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., set a focus block for 10 am about doing homework"
            className="flex-1"
            disabled={isProcessing || !isCalendarConnected}
          />
          <Button 
            onClick={handleNaturalLanguageInput}
            disabled={isProcessing || !isCalendarConnected || !command.trim()}
            size="icon"
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

        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Example commands:</h4>
          <div className="grid grid-cols-1 gap-2">
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
        </div>
      </div>
    </Card>
  );
};