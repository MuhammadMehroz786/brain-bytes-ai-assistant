import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Calendar, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { NaturalLanguageCalendar } from '../NaturalLanguageCalendar';

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
        
        // Store the access token directly from implicit flow
        localStorage.setItem('google_calendar_access_token', tokenResponse.access_token);
        localStorage.setItem('google_calendar_connected', 'true');
        
        // Get user info to store email for natural language calendar
        try {
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              'Authorization': `Bearer ${tokenResponse.access_token}`,
            },
          });
          if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json();
            localStorage.setItem('user_email', userInfo.email);
            console.log('Stored user email:', userInfo.email);
          }
        } catch (userInfoError) {
          console.warn('Could not fetch user info:', userInfoError);
        }
        
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
    localStorage.removeItem('user_email');
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
    <div className="space-y-6">
      {/* Natural Language Calendar Component */}
      <NaturalLanguageCalendar isCalendarConnected={isConnected} />
      
      {/* Original Calendar Component */}
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

          <h4 className="text-md font-medium mt-6 mb-3">Upcoming Events:</h4>
          {calendarEvents.length > 0 ? (
            <div className="space-y-3">
              {calendarEvents.map(event => (
                <div key={event.id} className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <Calendar className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{event.summary}</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(event.start.dateTime || event.start.date)} • {formatTime(event.start.dateTime || event.start.date)} - {formatTime(event.end.dateTime || event.end.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500 text-center">No upcoming events found for the next 3 days.</p>
            </div>
          )}

          <h4 className="text-md font-medium mt-6 mb-3">Quick Overview:</h4>
          {busySlots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {busySlots.map((slot, index) => (
                <div key={index} className="flex items-center p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
                  <div className="text-sm">
                    <div className="font-medium text-red-800">{formatDate(slot.start)}</div>
                    <div className="text-red-600">{formatTime(slot.start)} - {formatTime(slot.end)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm text-green-700 text-center">No busy time slots - you're free for the next 3 days!</p>
            </div>
          )}

          <h4 className="text-md font-medium mt-6 mb-3">Today's Schedule:</h4>
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 shadow-sm">
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

              const timeLabel = hour === 0 ? '12:00 AM' : 
                               hour < 12 ? `${hour}:00 AM` : 
                               hour === 12 ? '12:00 PM' : 
                               `${hour - 12}:00 PM`;

              return (
                <div key={hour} className="flex items-center py-3 border-b border-gray-100 last:border-b-0 hover:bg-white/50 transition-colors duration-150 rounded-lg px-2 -mx-2">
                  <div className="w-20 text-sm font-medium text-gray-700">
                    {timeLabel}
                  </div>
                  <div className="flex-1 ml-4">
                    {isBusy ? (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-400 rounded-full mr-3 shadow-sm"></div>
                        <div className="flex-1">
                          {eventsInHour.map(event => (
                            <div key={event.id} className="inline-flex items-center bg-red-100 text-red-800 px-3 py-1.5 rounded-full text-sm font-medium mr-2 mb-1 border border-red-200 shadow-sm">
                              <Calendar className="w-3 h-3 mr-2" />
                              {event.summary}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full mr-3 shadow-sm"></div>
                        <span className="text-green-700 text-sm font-medium bg-green-100 px-3 py-1 rounded-full border border-green-200">
                          Available
                        </span>
                      </div>
                    )}
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
    </div>
  );
};
