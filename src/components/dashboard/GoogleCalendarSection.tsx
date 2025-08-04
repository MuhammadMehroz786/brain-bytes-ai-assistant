import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Calendar, CheckCircle, XCircle, Loader } from 'lucide-react';

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
    if (calendarConnected === 'true') {
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
      const userEmail = localStorage.getItem('gmail_email');
      if (!userEmail) {
        toast.error('Please connect your Gmail account first.');
        setIsSuggesting(false);
        return;
      }

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const response = await fetch('http://localhost:8082/suggest-focus-time-and-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, timezone }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestedTime(data.suggestedTime);
        setSuggestedTask(data.suggestedTask);
        setFocusText(data.suggestedTask); // Pre-fill input with suggested task
      } else {
        toast.error('Failed to get focus suggestions.');
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast.error('Error fetching focus suggestions.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      const userEmail = localStorage.getItem('gmail_email');
      if (!userEmail) {
        toast.error('Please connect your Gmail account first.');
        return;
      }

      const response = await fetch('http://localhost:8082/fetch-calendar-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        setCalendarEvents(data.events);
        setBusySlots(data.busySlots);
        console.log('Fetched events:', data.events);
        console.log('Fetched busy slots:', data.busySlots);
      } else {
        toast.error('Failed to fetch calendar events.');
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      toast.error('Error fetching calendar events.');
    }
  };

  const handleSyncCalendar = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8082/auth/google/calendar');
      const { authUrl } = await response.json();

      const popup = window.open(authUrl, 'google-calendar-oauth', 'width=600,height=700');

      const handleMessage = async (event: MessageEvent) => {
        if (event.data.success) {
          popup?.close();
          window.removeEventListener('message', handleMessage);
          
          console.log('Received OAuth success event. Tokens:', event.data.tokens);
          console.log('Received OAuth success event. User Info:', event.data.userInfo);
          const tokenResponse = await fetch('http://localhost:8082/store-calendar-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              tokens: event.data.tokens,
              email: event.data.userInfo.email
            }),
          });

          if(tokenResponse.ok) {
            setIsConnected(true);
            const now = new Date();
            setLastSyncTime(now.toLocaleString());
            localStorage.setItem('google_calendar_connected', 'true');
            localStorage.setItem('google_calendar_last_sync', now.toISOString());
            toast.success('✅ Calendar Connected');
            setShowFocusPopup(true);
          } else {
            toast.error('Failed to store calendar token.');
          }

        } else if (event.data.error) {
          popup?.close();
          window.removeEventListener('message', handleMessage);
          toast.error(`OAuth failed: ${event.data.error}`);
        }
      };

      window.addEventListener('message', handleMessage);

    } catch (error) {
      console.error('Error syncing calendar:', error);
      toast.error('Error syncing calendar. Is the OAuth server running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocusSubmit = async () => {
    if (!focusText) return;

    try {
      const startTime = suggestedTime ? new Date(suggestedTime) : new Date();
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

      const response = await fetch('http://localhost:8082/schedule-focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: focusText,
          email: localStorage.getItem('gmail_email'),
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });

      if (response.ok) {
        toast.success(`Scheduled: ${focusText} at ${startTime.toLocaleTimeString()}`);
        setShowFocusPopup(false);
        setFocusText('');
        setSuggestedTime(null);
        setSuggestedTask(null);
        fetchCalendarEvents(); // Refresh calendar events after scheduling
      } else {
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
    localStorage.removeItem('google_calendar_email'); // Clear associated email if any
    setIsConnected(false);
    setLastSyncTime(null);
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
          <Button onClick={handleSyncCalendar} disabled={isLoading || !isGmailConnected} className="mt-4">
            {isLoading ? <Loader className="animate-spin w-5 h-5 mr-2" /> : <Calendar className="w-5 h-5 mr-2" />}
            Sync Calendar
          </Button>
          {!isGmailConnected && (
            <p className="text-sm text-red-500 mt-2">Please connect your Gmail account first.</p>
          )}
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
