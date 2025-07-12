import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  RefreshCw,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
}

export const GoogleCalendarSection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock events for demonstration
  const mockEvents: CalendarEvent[] = [
    {
      id: "1",
      title: "Team Standup",
      start: "09:00",
      end: "09:30",
      description: "Daily sync with development team"
    },
    {
      id: "2", 
      title: "Client Presentation",
      start: "10:00",
      end: "11:00",
      description: "Q4 proposal presentation"
    },
    {
      id: "3",
      title: "Focus Block - Deep Work",
      start: "14:00",
      end: "16:00",
      description: "Uninterrupted coding session"
    },
    {
      id: "4",
      title: "1:1 with Manager",
      start: "16:30",
      end: "17:00",
      description: "Weekly check-in"
    }
  ];

  const handleConnect = async () => {
    setIsLoading(true);
    
    // Simulate OAuth flow
    setTimeout(() => {
      setIsConnected(true);
      setEvents(mockEvents);
      setIsLoading(false);
      toast({
        title: "Calendar Connected!",
        description: "Your Google Calendar has been synced successfully.",
      });
    }, 2000);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    
    // Simulate refresh
    setTimeout(() => {
      setEvents(mockEvents);
      setIsLoading(false);
      toast({
        title: "Calendar Refreshed",
        description: "Your events have been updated.",
      });
    }, 1000);
  };

  const formatTime = (timeStr: string) => {
    return timeStr;
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const isEventCurrent = (start: string, end: string) => {
    const now = getCurrentTime();
    return now >= start && now <= end;
  };

  const isEventUpcoming = (start: string) => {
    const now = getCurrentTime();
    return start > now;
  };

  if (!isConnected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Google Calendar Sync</h3>
        </div>

        <Card className="p-6 text-center bg-white/50 backdrop-blur-sm border border-primary/10">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-semibold text-foreground mb-2">Connect Your Calendar</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Sync your Google Calendar to see today's events alongside your AI plan
          </p>
          <Button 
            onClick={handleConnect}
            disabled={isLoading}
            className="rounded-xl"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Connect Google Calendar
              </>
            )}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Today's Schedule</h3>
            <p className="text-sm text-muted-foreground">From Google Calendar</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="rounded-xl"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>

      <div className="space-y-3">
        {events.length === 0 ? (
          <Card className="p-6 text-center bg-white/50 backdrop-blur-sm border border-primary/10">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No events today - perfect for deep work!</p>
          </Card>
        ) : (
          events.map((event) => {
            const isCurrent = isEventCurrent(event.start, event.end);
            const isUpcoming = isEventUpcoming(event.start);
            
            return (
              <Card 
                key={event.id}
                className={`p-4 bg-white/50 backdrop-blur-sm border transition-all duration-200 ${
                  isCurrent 
                    ? "border-primary/30 bg-primary/5" 
                    : "border-primary/10 hover:border-primary/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">
                      {formatTime(event.start)} - {formatTime(event.end)}
                    </span>
                    {isCurrent && (
                      <Badge variant="default" className="text-xs bg-primary/20 text-primary">
                        Now
                      </Badge>
                    )}
                    {isUpcoming && !isCurrent && (
                      <Badge variant="secondary" className="text-xs">
                        Upcoming
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="font-medium text-foreground">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};