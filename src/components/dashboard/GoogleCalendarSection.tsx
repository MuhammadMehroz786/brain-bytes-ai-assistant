import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Calendar, CheckCircle, XCircle, Loader, MoreHorizontal } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { NaturalLanguageCalendar } from '../NaturalLanguageCalendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent } from '@/components/ui/sheet';

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
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [compact, setCompact] = useState(false);
  // Quick Add UI state
  const [qaOpen, setQaOpen] = useState(false);
  const [qaTitle, setQaTitle] = useState("");
  const [qaType, setQaType] = useState<'focus'|'meeting'|'other'>('other');
  const [qaStart, setQaStart] = useState<Date | null>(null);
  const [qaDuration, setQaDuration] = useState<number>(30);
  const [dragStartHour, setDragStartHour] = useState<number | null>(null);
  const [dragEndHour, setDragEndHour] = useState<number | null>(null);

  // View state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [now, setNow] = useState<Date>(new Date());
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [workingHours, setWorkingHours] = useState<{ start: string; end: string }>(() => {
    try { return JSON.parse(localStorage.getItem('bb_calendar_working_hours') || '{"start":"08:00","end":"20:00"}'); } catch { return { start: '08:00', end: '20:00' }; }
  });
  const [quietHours, setQuietHours] = useState<{ start: string; end: string }>(() => {
    try { return JSON.parse(localStorage.getItem('bb_calendar_quiet_hours') || '{"start":"22:00","end":"07:00"}'); } catch { return { start: '22:00', end: '07:00' }; }
  });

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

    // Ensure prefs exist and start timer for "now" marker
    if (!localStorage.getItem('bb_calendar_working_hours')) {
      localStorage.setItem('bb_calendar_working_hours', JSON.stringify({ start: '08:00', end: '20:00' }));
    }
    if (!localStorage.getItem('bb_calendar_quiet_hours')) {
      localStorage.setItem('bb_calendar_quiet_hours', JSON.stringify({ start: '22:00', end: '07:00' }));
    }

    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
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

  const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const parseHHMM = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const inWorkingHours = (hour: number) => {
    const mins = hour * 60;
    const start = parseHHMM(workingHours.start);
    const end = parseHHMM(workingHours.end);
    return start <= end ? (mins >= start && mins < end) : (mins >= start || mins < end);
  };
  const inQuietHours = (hour: number) => {
    const mins = hour * 60;
    const start = parseHHMM(quietHours.start);
    const end = parseHHMM(quietHours.end);
    return start <= end ? (mins >= start && mins < end) : (mins >= start || mins < end);
  };
  const canShowHint = (hour: number) => aiSuggestions && inWorkingHours(hour) && !inQuietHours(hour);

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

          <div className="mt-6 border rounded-lg">
            <div className="max-h-[520px] overflow-y-auto">
              <div className="sticky top-0 z-20 bg-white/80 backdrop-blur px-4 py-2 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-slate-700 font-semibold">
                    {selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <Input
                    type="date"
                    aria-label="Choose date"
                    value={new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset()*60000)).toISOString().slice(0,10)}
                    onChange={(e)=>{ const d = new Date(e.target.value + 'T00:00:00'); setSelectedDate(d); }}
                    className="h-8 w-[9.5rem]"
                  />
                  <div className="sm:hidden flex items-center gap-1 text-[11px] text-muted-foreground">
                    <a href="#morning" className="chips rounded-full px-2.5 py-1 border bg-white/60 backdrop-blur border-slate-200">Morning</a>
                    <span>&bull;</span>
                    <a href="#afternoon" className="chips rounded-full px-2.5 py-1 border bg-white/60 backdrop-blur border-slate-200">Afternoon</a>
                    <span>&bull;</span>
                    <a href="#evening" className="chips rounded-full px-2.5 py-1 border bg-white/60 backdrop-blur border-slate-200">Evening</a>
                    <span>&bull;</span>
                    <a href="#night" className="chips rounded-full px-2.5 py-1 border bg-white/60 backdrop-blur border-slate-200">Night</a>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: 'hsl(var(--cal-focus))' }} /> Focus</span>
                  <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: 'hsl(var(--cal-meeting))' }} /> Meeting</span>
                  <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: 'hsl(var(--cal-personal))' }} /> Personal</span>
                  <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: 'hsl(var(--cal-busy))' }} /> Busy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant={aiSuggestions ? 'secondary' : 'outline'} size="sm" aria-pressed={aiSuggestions} onClick={() => setAiSuggestions((v)=>!v)} className="rounded-full px-2.5 py-1 text-xs">
                    Hints
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" aria-label="Preferences" className="rounded-full px-2.5 py-1 text-xs">Preferences</Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-64">
                      <div className="space-y-3">
                        <div className="text-sm font-medium">Working Hours</div>
                        <div className="flex items-center gap-2 text-xs">
                          <input type="time" aria-label="Working hours start" value={workingHours.start} onChange={(e)=>{ const v={...workingHours,start:e.target.value}; setWorkingHours(v); localStorage.setItem('bb_calendar_working_hours', JSON.stringify(v)); }} className="border rounded px-2 py-1 bg-background" />
                          <span>&ndash;</span>
                          <input type="time" aria-label="Working hours end" value={workingHours.end} onChange={(e)=>{ const v={...workingHours,end:e.target.value}; setWorkingHours(v); localStorage.setItem('bb_calendar_working_hours', JSON.stringify(v)); }} className="border rounded px-2 py-1 bg-background" />
                        </div>
                        <div className="text-sm font-medium">Quiet Hours</div>
                        <div className="flex items-center gap-2 text-xs">
                          <input type="time" aria-label="Quiet hours start" value={quietHours.start} onChange={(e)=>{ const v={...quietHours,start:e.target.value}; setQuietHours(v); localStorage.setItem('bb_calendar_quiet_hours', JSON.stringify(v)); }} className="border rounded px-2 py-1 bg-background" />
                          <span>&ndash;</span>
                          <input type="time" aria-label="Quiet hours end" value={quietHours.end} onChange={(e)=>{ const v={...quietHours,end:e.target.value}; setQuietHours(v); localStorage.setItem('bb_calendar_quiet_hours', JSON.stringify(v)); }} className="border rounded px-2 py-1 bg-background" />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button variant="outline" size="sm" onClick={()=>setSuggestionsOpen(true)} aria-label="Open AI Suggestions" className="rounded-full px-2.5 py-1 text-xs">AI Suggestions</Button>
                  <Button variant={compact ? 'secondary' : 'outline'} size="sm" aria-pressed={compact} onClick={() => setCompact((v)=>!v)} className="rounded-full px-2.5 py-1 text-xs">
                    Compact
                  </Button>
                </div>
              </div>
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
                  const dayStart = new Date(selectedDate); dayStart.setHours(0,0,0,0);
                  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
                  const inSelectedDay = (eventStart < dayEnd && eventEnd > dayStart);
                  return inSelectedDay && (eventStart < hourEnd && eventEnd > hourStart);
                });

                const sectionBg = (hour >= 6 && hour < 12)
                  ? 'hsl(var(--cal-morning-bg))'
                  : (hour >= 12 && hour < 18)
                  ? 'hsl(var(--cal-afternoon-bg))'
                  : (hour >= 18 && hour < 22)
                  ? 'hsl(var(--cal-evening-bg))'
                  : 'hsl(var(--cal-night-bg))';

                const showSectionHeader = hour === 6 || hour === 12 || hour === 18 || hour === 22;
                const sectionTitle = hour === 6 ? 'Morning' : hour === 12 ? 'Afternoon' : hour === 18 ? 'Evening' : 'Night';

                const rowClasses = compact ? 'py-1.5' : 'py-2.5';

                return (
                  <div key={hour} id={showSectionHeader ? sectionTitle.toLowerCase() : undefined} style={{ backgroundColor: sectionBg }} className="relative">
                    {showSectionHeader && (
                      <div className="sticky top-[40px] z-10 px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white/70 backdrop-blur border-b">
                        {sectionTitle}
                      </div>
                    )}

                    <div 
                      className={`group flex items-stretch ${rowClasses} px-4 odd:bg-muted/20 hover:bg-muted/30`}
                      onMouseDown={(e) => {
                        if (eventsInHour.length === 0 && !isBusy) {
                          setDragStartHour(hour);
                          setDragEndHour(hour);
                        }
                      }}
                      onMouseEnter={() => {
                        if (dragStartHour !== null) setDragEndHour(hour);
                      }}
                      onMouseUp={() => {
                        if (dragStartHour !== null) {
                          const start = new Date(); start.setHours(Math.min(dragStartHour, hour), 0, 0, 0);
                          const end = new Date(); end.setHours(Math.max(dragStartHour, hour) + 1, 0, 0, 0);
                          setQaStart(start);
                          setQaDuration(Math.max(15, Math.round((end.getTime() - start.getTime()) / 60000)));
                          setQaTitle('');
                          setQaType('other');
                          setQaOpen(true);
                          setDragStartHour(null);
                          setDragEndHour(null);
                        }
                      }}
                    >
                      <span className="w-16 shrink-0 text-xs text-muted-foreground leading-6">{hour.toString().padStart(2, '0')}:00</span>
                      <div className="flex-1 min-h-[28px] relative">
                        {eventsInHour.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {eventsInHour.map(event => {
                              const title = event.summary || 'Untitled';
                              const lower = title.toLowerCase();
                              const type: 'focus'|'meeting'|'personal'|'busy' = lower.includes('focus') ? 'focus' : (lower.includes('meet') || lower.includes('call')) ? 'meeting' : 'personal';
                              const colorVar = type === 'focus' ? '--cal-focus' : type === 'meeting' ? '--cal-meeting' : '--cal-personal';
                              return (
                                <TooltipProvider key={event.id}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className={`relative rounded-lg border ${compact ? 'px-2 py-1.5' : 'px-3 py-2'} shadow-sm hover:shadow-lg transition`}
                                        style={{ backgroundColor: `hsl(var(${colorVar}) / 0.12)`, borderColor: `hsl(var(${colorVar}) / 0.2)` }}
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="min-w-0">
                                            <div className="text-sm font-medium truncate"><span className="mr-1">{type==='focus'?'🧠':type==='meeting'?'👥':'✅'}</span>{title}</div>
                                            <div className="text-xs text-muted-foreground truncate">
                                              {formatTime(event.start.dateTime || event.start.date)} - {formatTime(event.end.dateTime || event.end.date)}
                                            </div>
                                          </div>
                                          <button aria-label="Event actions" className="opacity-0 group-hover:opacity-100 transition text-muted-foreground">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="max-w-xs">
                                        <div className="font-semibold text-sm mb-1">{title}</div>
                                        <div className="text-xs text-muted-foreground mb-1">{formatTime(event.start.dateTime || event.start.date)} - {formatTime(event.end.dateTime || event.end.date)}</div>
                                        {event.location && <div className="text-xs">{event.location}</div>}
                                        {event.description && <div className="text-xs truncate">{event.description}</div>}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-slate-400">
                            <span>&mdash;</span>
                            <Popover open={qaOpen} onOpenChange={setQaOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  aria-label={`Quick add at ${hour}:00`}
                                  onClick={() => {
                                    const start = new Date(); start.setHours(hour, 0, 0, 0);
                                    setQaStart(start);
                                    setQaDuration(30);
                                    setQaTitle('');
                                    setQaType('other');
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition text-xs"
                                >
                                  + Quick add
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-72" align="end">
                                <div className="space-y-2">
                                  <Input value={qaTitle} onChange={(e)=>setQaTitle(e.target.value)} placeholder="Title" aria-label="Title" />
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{qaStart ? qaStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `${hour.toString().padStart(2,'0')}:00`}</span>
                                    <span>&middot;</span>
                                    <select value={qaDuration} onChange={(e)=>setQaDuration(parseInt(e.target.value))} className="border rounded px-2 py-1 bg-background">
                                      {[15,30,60,90].map(d => <option key={d} value={d}>{d}m</option>)}
                                    </select>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {(['focus','meeting','other'] as const).map(t => (
                                      <Button key={t} type="button" variant={qaType===t?'secondary':'outline'} size="sm" className="rounded-full px-2.5 py-1 text-xs" onClick={()=>setQaType(t)}>
                                        {t.charAt(0).toUpperCase()+t.slice(1)}
                                      </Button>
                                    ))}
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={()=>setQaOpen(false)}>Cancel</Button>
                                    <Button size="sm" onClick={async()=>{
                                      const accessToken = localStorage.getItem('google_calendar_access_token');
                                      if (!accessToken) { toast.error('Please connect your calendar first.'); return; }
                                      const start = qaStart || new Date(new Date().setHours(hour,0,0,0));
                                      const end = new Date(start.getTime() + qaDuration*60000);
                                      const event = { summary: qaTitle || (qaType==='focus'?'Focus':qaType==='meeting'?'Meeting':'Task'), start: { dateTime: start.toISOString() }, end: { dateTime: end.toISOString() } };
                                      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', { method:'POST', headers:{ 'Authorization': `Bearer ${accessToken}`, 'Content-Type':'application/json' }, body: JSON.stringify(event) });
                                      if (res.ok) { toast.success('Event added'); setQaOpen(false); setQaTitle(''); setQaStart(null); fetchCalendarEvents(); } else { toast.error('Failed to add'); }
                                    }}>Add</Button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        )}
                        {isSameDay(selectedDate, now) && hour === now.getHours() && (
                          <div className="absolute left-0 right-0 h-px bg-primary/50" style={{ top: (now.getMinutes() / 60) * 100 + '%' }} />
                        )}
                      </div>

                    {canShowHint(hour) && eventsInHour.length === 0 && !isBusy && (hour % 3 === 0) && (
                      <div className="px-4 pb-1">
                        <button className="text-xs italic text-slate-400/70 hover:text-slate-500" onClick={() => { setQaOpen(true); const start = new Date(); start.setHours(hour,0,0,0); setQaStart(start); setQaTitle('Quick writing block'); setQaDuration(30); }}>✍️ 30‑min writing block?</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
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
      </Card>

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

      <Sheet open={suggestionsOpen} onOpenChange={setSuggestionsOpen}>
        <SheetContent side="right" className="w-[360px] sm:w-[420px]">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">AI Suggestions</h3>
            <div className="text-sm text-muted-foreground">Nothing for now</div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
