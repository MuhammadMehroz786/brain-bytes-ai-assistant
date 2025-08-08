import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Calendar, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

export const GoogleCalendarSection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFocusPopup, setShowFocusPopup] = useState(false);
  const [focusText, setFocusText] = useState('');
  const [suggestedTime, setSuggestedTime] = useState<string | null>(null);
  const [suggestedTask, setSuggestedTask] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [busySlots, setBusySlots] = useState<any[]>([]);

  useEffect(() => {
    const calendarConnected = localStorage.getItem('google_calendar_connected');
    const gmailConnected = localStorage.getItem('gmail_connected');
    const accessToken = localStorage.getItem('google_calendar_access_token');
    
    if (calendarConnected === 'true' && accessToken) {
      setIsConnected(true);
      const lastSync = localStorage.getItem('google_calendar_last_sync');
      if (lastSync) {
        setLastSyncTime(new Date(lastSync).toLocaleString());
      }
      fetchCalendarEvents(); // Fetch events on mount if connected
    }
    if (gmailConnected === 'true') {
      setIsGmailConnected(true);
    }
  }, []);

  const handleSetFocusClick = async () => {
    setShowFocusPopup(true);
    setIsSuggesting(true);
    setFocusText('');
    setSuggestedTime(null);
    setSuggestedTask(null);

    try {
      const accessToken = localStorage.getItem('google_calendar_access_token');
      if (!accessToken) {
        toast.error('Please connect your calendar first.');
        setIsSuggesting(false);
        return;
      }

      // Simple suggestion logic - find the next available hour during business hours
      const now = new Date();
      const suggestedTime = new Date(now);
      suggestedTime.setMinutes(0, 0, 0);
      
      // If it's after business hours, suggest tomorrow at 9 AM
      if (now.getHours() >= 17) {
        suggestedTime.setDate(suggestedTime.getDate() + 1);
        suggestedTime.setHours(9);
      } else if (now.getHours() < 9) {
        suggestedTime.setHours(9);
      } else {
        suggestedTime.setHours(now.getHours() + 1);
      }

      setSuggestedTime(suggestedTime.toISOString());
      setSuggestedTask('Deep work focus session');
      setFocusText('Deep work focus session');
    } catch (error) {
      console.error('Error creating suggestions:', error);
      toast.error('Error creating focus suggestions.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      const accessToken = localStorage.getItem('google_calendar_access_token');
      if (!accessToken) {
        toast.error('Please connect your calendar first.');
        return;
      }

      const now = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(now.getDate() + 3);

      // Fetch events
      const eventsResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now.toISOString()}&timeMax=${threeDaysFromNow.toISOString()}&singleEvents=true&orderBy=startTime`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );

      if (!eventsResponse.ok) {
        throw new Error('Failed to fetch calendar events');
      }

      const eventsData = await eventsResponse.json();
      const events = eventsData.items || [];
      console.log(`🗓️ Found ${events.length} calendar events`);

      // Fetch free/busy information
      const freeBusyResponse = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timeMin: now.toISOString(),
          timeMax: threeDaysFromNow.toISOString(),
          items: [{ id: 'primary' }]
        })
      });

      if (!freeBusyResponse.ok) {
        throw new Error('Failed to fetch free/busy information');
      }

      const freeBusyData = await freeBusyResponse.json();
      const busySlots = freeBusyData.calendars.primary.busy || [];
      console.log(`🕒 Found ${busySlots.length} busy slots`);

      setCalendarEvents(events);
      setBusySlots(busySlots);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      toast.error('Error fetching calendar events.');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log('Google OAuth success:', tokenResponse);
        
        // Store the access token
        localStorage.setItem('google_calendar_access_token', tokenResponse.access_token);
        localStorage.setItem('google_calendar_connected', 'true');
        
        const now = new Date();
        setLastSyncTime(now.toLocaleString());
        localStorage.setItem('google_calendar_last_sync', now.toISOString());
        
        setIsConnected(true);
        toast.success('✅ Calendar Connected');
        setShowFocusPopup(true);
        
        // Fetch calendar events after successful connection
        await fetchCalendarEvents();
      } catch (error) {
        console.error('Error handling OAuth success:', error);
        toast.error('Error connecting calendar');
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
      toast.error('Failed to connect Google Calendar');
    },
    scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events',
  });

  const handleSyncCalendar = async () => {
    setIsLoading(true);
    try {
      googleLogin();
    } catch (error) {
      console.error('Error syncing calendar:', error);
      toast.error('Error syncing calendar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocusSubmit = async () => {
    if (!focusText) return;

    try {
      const accessToken = localStorage.getItem('google_calendar_access_token');
      if (!accessToken) {
        toast.error('Please connect your calendar first.');
        return;
      }

      const startTime = suggestedTime ? new Date(suggestedTime) : new Date();
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

      const event = {
        summary: focusText,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
      };

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });

      if (response.ok) {
        toast.success(`Scheduled: ${focusText} at ${startTime.toLocaleTimeString()}`);
        setShowFocusPopup(false);
        setFocusText('');
        setSuggestedTime(null);
        setSuggestedTask(null);
        fetchCalendarEvents(); // Refresh calendar events after scheduling
      } else {
        const errorData = await response.json();
        console.error('Failed to create event:', errorData);
        toast.error('Failed to schedule focus time.');
      }
    } catch (error) {
      console.error('Error scheduling focus time:', error);
      toast.error('Error scheduling focus time.');
    }
  };

  const handleDisconnectCalendar = () => {
    localStorage.removeItem('google_calendar_connected');
    localStorage.removeItem('google_calendar_last_sync');
    localStorage.removeItem('google_calendar_access_token');
    setIsConnected(false);
    setLastSyncTime(null);
    setCalendarEvents([]);
    setBusySlots([]);
    toast.info('Calendar disconnected.');
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString();
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium">Your Smart Calendar</h3>
      {isConnected ? (
        <div className="mt-4">
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>Calendar Connected</span>
          </div>
          {lastSyncTime && (
            <p className="text-sm text-gray-500 mt-1">Last sync: {lastSyncTime}</p>
          )}
          <Button onClick={handleSetFocusClick} className="mt-4">Set Today's Focus</Button>
          <Button onClick={handleDisconnectCalendar} variant="outline" className="mt-4 ml-2">Disconnect Calendar</Button>
          <Button onClick={fetchCalendarEvents} variant="outline" className="mt-4 ml-2">Refresh Calendar</Button>

          <h4 className="text-md font-medium mt-6">Upcoming Events:</h4>
          {calendarEvents.length > 0 ? (
            <ul className="list-disc pl-5 mt-2">
              {calendarEvents.map(event => (
                <li key={event.id} className="text-sm text-gray-700">
                  {event.summary} ({formatDate(event.start.dateTime || event.start.date)} {formatTime(event.start.dateTime || event.start.date)} - {formatTime(event.end.dateTime || event.end.date)})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 mt-2">No upcoming events found for the next 3 days.</p>
          )}

          <h4 className="text-md font-medium mt-6">Busy Slots:</h4>
          {busySlots.length > 0 ? (
            <ul className="list-disc pl-5 mt-2">
              {busySlots.map((slot, index) => (
                <li key={index} className="text-sm text-gray-700">
                  {formatDate(slot.start)} {formatTime(slot.start)} - {formatTime(slot.end)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 mt-2">No busy slots found for the next 3 days.</p>
          )}

          <h4 className="text-md font-medium mt-6">Full Day Calendar:</h4>
          <div className="mt-2 border rounded-lg p-4">
            {/* This is a simplified representation. A real calendar view would be more complex. */}
            {Array.from({ length: 24 }).map((_, hour) => {
              const hourStart = new Date();
              hourStart.setHours(hour, 0, 0, 0);
              const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

              const isBusy = busySlots.some(slot => {
                const slotStart = new Date(slot.start);
                const slotEnd = new Date(slot.end);
                return (hourStart < slotEnd && hourEnd > slotStart);
              });

              const eventsInHour = calendarEvents.filter(event => {
                const eventStart = new Date(event.start.dateTime || event.start.date);
                const eventEnd = new Date(event.end.dateTime || event.end.date);
                return (eventStart < hourEnd && eventEnd > hourStart);
              });

              return (
                <div key={hour} className="flex items-center py-1 border-b last:border-b-0">
                  <span className="w-16 text-sm text-gray-600">{hour}:00</span>
                  <div className="flex-1 ml-2">
                    {isBusy ? (
                      <span className="text-red-500 text-sm">Busy</span>
                    ) : (
                      <span className="text-green-500 text-sm">Free</span>
                    )}
                    {eventsInHour.map(event => (
                      <span key={event.id} className="ml-2 text-blue-700 text-sm">{event.summary}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <Button onClick={handleSyncCalendar} disabled={isLoading} className="mt-4">
            {isLoading ? <Loader className="animate-spin w-5 h-5 mr-2" /> : <Calendar className="w-5 h-5 mr-2" />}
            Sync Calendar
          </Button>
        </div>
      )}

      {showFocusPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h4 className="text-lg font-medium mb-4">What do you want to focus on today?</h4>
            {isSuggesting ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="animate-spin w-8 h-8 mr-3 text-primary" />
                <span className="text-gray-600">Getting smart suggestions...</span>
              </div>
            ) : (
              <>
                {suggestedTime && suggestedTask && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-800">
                    <p className="text-sm font-medium">AI Suggestion:</p>
                    <p className="text-sm">Task: {suggestedTask}</p>
                    <p className="text-sm">Time: {new Date(suggestedTime).toLocaleString()}</p>
                  </div>
                )}
                <Input 
                  value={focusText}
                  onChange={(e) => setFocusText(e.target.value)}
                  placeholder='e.g., Finish outline for article'
                  className="mt-4"
                />
                <div className="mt-6 flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setShowFocusPopup(false)}>Cancel</Button>
                  <Button onClick={handleFocusSubmit}>Schedule 30-Min Block</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
