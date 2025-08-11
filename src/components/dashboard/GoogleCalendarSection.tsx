import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Calendar, CheckCircle, XCircle, Loader, MoreHorizontal, Lightbulb } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { NaturalLanguageCalendar } from '../NaturalLanguageCalendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
const [viewMode, setViewMode] = useState<'day'|'week'|'agenda'|'compact'>('day');
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

// Derived summary data
const nowTs = new Date();
const nextEvent = calendarEvents
  .map((e) => ({ e, start: new Date(e.start.dateTime || e.start.date) }))
  .filter(({ start }) => start > nowTs)
  .sort((a, b) => a.start.getTime() - b.start.getTime())[0]?.e;

const dayStart = new Date(selectedDate); dayStart.setHours(0,0,0,0);
const dayEnd = new Date(dayStart.getTime() + 24*60*60*1000);
const dayBusy = busySlots
  .map((s:any)=>({ start: new Date(s.start), end: new Date(s.end) }))
  .filter(({start,end}) => start < dayEnd && end > dayStart);
const workStartM = parseHHMM(workingHours.start);
const workEndM = parseHHMM(workingHours.end);
const totalWorkM = workStartM <= workEndM ? (workEndM - workStartM) : ((24*60 - workStartM) + workEndM);
const busyMinutes = dayBusy.reduce((acc:number,{start,end}:{start:Date,end:Date})=>{
  const s = Math.max(start.getTime(), dayStart.getTime());
  const e = Math.min(end.getTime(), dayEnd.getTime());
  return acc + Math.max(0, Math.round((e - s)/60000));
},0);
const freeHoursToday = Math.max(0, Math.round((totalWorkM - busyMinutes)/60));

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
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSetFocusClick}>Set Today's Focus</Button>
              <Button onClick={handleDisconnectCalendar} variant="outline">Disconnect Calendar</Button>
              <Button onClick={fetchCalendarEvents} variant="outline">Refresh Calendar</Button>
            </div>

            {/* Summary strip */}
            <div className="mt-6 flex flex-wrap gap-2">
              <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--cal-focus-accent))] p-[1px] rounded-full">
                <div className="rounded-full bg-background/60 backdrop-blur px-3 py-1 text-xs flex items-center gap-2">
                  <span className="font-medium">Next</span>
                  <span className="text-muted-foreground truncate max-w-[180px]">{nextEvent ? `${nextEvent.summary}` : 'None'}</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--cal-focus-accent))] p-[1px] rounded-full">
                <div className="rounded-full bg-background/60 backdrop-blur px-3 py-1 text-xs flex items-center gap-2">
                  <span className="font-medium">Free today</span>
                  <span className="text-muted-foreground">{freeHoursToday}h</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--cal-focus-accent))] p-[1px] rounded-full">
                <div className="rounded-full bg-background/60 backdrop-blur px-3 py-1 text-xs flex items-center gap-2">
                  <span className="font-medium">Focus goal</span>
                  <span className="text-muted-foreground truncate max-w-[140px]">{focusText || 'Unset'}</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--cal-focus-accent))] p-[1px] rounded-full">
                <div className="rounded-full bg-background/60 backdrop-blur px-3 py-1 text-xs flex items-center gap-2">
                  <span className="font-medium">Last sync</span>
                  <span className="text-muted-foreground">{lastSyncTime || '—'}</span>
                </div>
              </div>

              <Button onClick={()=>setSuggestionsOpen(true)} className="ml-auto bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--cal-focus-accent))] text-primary-foreground rounded-full h-7 px-3 text-xs">Plan with AI</Button>
            </div>

            {/* Daily Snapshot - minimal premium view */}
            <div className="mt-6">
              <header className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <h4 className="text-base sm:text-lg font-semibold tracking-tight">
                  {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </h4>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <Button onClick={handleSetFocusClick} variant="secondary" className="rounded-full">Set Focus</Button>
                  <Button onClick={()=>setSuggestionsOpen(true)} className="rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--cal-focus-accent))] text-primary-foreground">Plan with AI</Button>
                </div>
              </header>

              {/* Events for the selected day */}
              {(() => {
                const dayStart = new Date(selectedDate); dayStart.setHours(0,0,0,0);
                const dayEnd = new Date(dayStart.getTime() + 24*60*60*1000);
                const todaysEvents = calendarEvents
                  .filter(e => {
                    const s = new Date(e.start.dateTime || e.start.date);
                    const en = new Date(e.end.dateTime || e.end.date);
                    return s < dayEnd && en > dayStart;
                  })
                  .sort((a,b) => new Date(a.start.dateTime || a.start.date).getTime() - new Date(b.start.dateTime || b.start.date).getTime());

                const getType = (title: string): 'focus'|'meeting'|'personal'|'busy' => {
                  const lower = (title||'').toLowerCase();
                  if (lower.includes('focus') || lower.includes('deep work')) return 'focus';
                  if (lower.includes('meet') || lower.includes('call')) return 'meeting';
                  if (lower.includes('gym') || lower.includes('walk') || lower.includes('break') || lower.includes('lunch') || lower.includes('personal')) return 'personal';
                  return 'busy';
                };
                const typeToVar: Record<string,string> = { focus: '--cal-focus', meeting: '--cal-meeting', personal: '--cal-personal', busy: '--cal-busy' };

                return (
                  <section aria-label="Daily snapshot" className="mt-4 space-y-2">
                    {todaysEvents.length === 0 && (
                      <p className="text-sm text-muted-foreground">No events today. Enjoy the focus time!</p>
                    )}
                    {todaysEvents.map(ev => {
                      const s = new Date(ev.start.dateTime || ev.start.date);
                      const e = new Date(ev.end.dateTime || ev.end.date);
                      const type = getType(ev.summary || '');
                      const colorVar = typeToVar[type];
                      return (
                        <article key={ev.id} className="relative rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-200 bg-card/70 backdrop-blur">
                          <div className="absolute left-0 inset-y-0 w-1 rounded-l-2xl" style={{ backgroundColor: `hsl(var(${colorVar}))` }} />
                          <div className="flex items-center gap-3 px-4 py-3">
                            <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `hsl(var(${colorVar}))` }} aria-hidden />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <time className="text-sm font-medium text-foreground/80">
                                  {s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </time>
                                <span className="sr-only">to</span>
                                <span className="text-xs text-muted-foreground">{e.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <h5 className="text-sm sm:text-base font-semibold leading-tight truncate">
                                {ev.summary || 'Untitled'}
                              </h5>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </section>
                );
              })()}

              {/* Suggestions section */}
              <section className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold">Suggestions</h5>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={()=>setSuggestionsOpen(true)}>See more</Button>
                </div>
                {(() => {
                  const suggestions = [
                    { id: 's1', title: 'Deep work focus', start: '09:00', end: '09:30', type: 'focus' as const },
                    { id: 's2', title: 'Walk and reset', start: '12:30', end: '13:00', type: 'personal' as const },
                    { id: 's3', title: 'Inbox zero sweep', start: '16:00', end: '16:30', type: 'meeting' as const },
                  ];
                  const typeToVar: Record<string,string> = { focus: '--cal-focus', meeting: '--cal-meeting', personal: '--cal-personal' };
                  const createEvent = async (title: string, startHHMM: string, endHHMM: string) => {
                    const accessToken = localStorage.getItem('google_calendar_access_token');
                    if (!accessToken) { toast.error('Please connect your calendar first.'); return; }
                    const [sh, sm] = startHHMM.split(':').map(Number);
                    const [eh, em] = endHHMM.split(':').map(Number);
                    const start = new Date(selectedDate); start.setHours(sh, sm, 0, 0);
                    const end = new Date(selectedDate); end.setHours(eh, em, 0, 0);
                    const evt = { summary: title, start: { dateTime: start.toISOString() }, end: { dateTime: end.toISOString() } };
                    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', { method:'POST', headers:{ 'Authorization': `Bearer ${accessToken}`, 'Content-Type':'application/json' }, body: JSON.stringify(evt) });
                    if (res.ok) { toast.success('Added to calendar'); await fetchCalendarEvents(); } else { toast.error('Failed to add'); }
                  };
                  return (
                    <div className="space-y-2">
                      {suggestions.map(s => (
                        <button key={s.id} onClick={()=>createEvent(s.title, s.start, s.end)} className="group relative w-full text-left rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-200 bg-card/70 backdrop-blur">
                          <div className="absolute left-0 inset-y-0 w-1 rounded-l-2xl" style={{ backgroundColor: `hsl(var(${typeToVar[s.type]}))` }} />
                          <div className="flex items-center justify-between gap-3 px-4 py-3">
                            <div className="min-w-0">
                              <div className="text-xs text-muted-foreground">{s.start} - {s.end}</div>
                              <div className="text-sm font-semibold truncate">{s.title}</div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                              <Button type="button" size="sm" variant="secondary" onClick={(e)=>{ e.stopPropagation(); createEvent(s.title, s.start, s.end); }}>Accept</Button>
                              <Button type="button" size="sm" variant="outline" onClick={(e)=>{ e.stopPropagation(); toast.message('TODO: Snooze'); }}>Snooze</Button>
                              <Button type="button" size="sm" variant="ghost" onClick={(e)=>{ e.stopPropagation(); toast.message('Dismissed'); }}>Dismiss</Button>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </section>
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
            {(() => {
              const suggestions = [
                { id: 's1', title: 'Deep work focus', start: '09:00', end: '09:30', type: 'focus' as const },
                { id: 's2', title: 'Plan weekly review', start: '16:00', end: '16:30', type: 'meeting' as const },
                { id: 's3', title: 'Walk outside', start: '12:30', end: '13:00', type: 'personal' as const },
              ];
              const typeToVar: Record<string,string> = { focus: '--cal-focus', meeting: '--cal-meeting', personal: '--cal-personal' };
              return (
                <div className="space-y-3">
                  {suggestions.map(s => (
                    <div key={s.id} className="relative rounded-xl px-3 py-2 shadow-sm hover:shadow-lg transition duration-200" style={{ backgroundColor: `hsl(var(${typeToVar[s.type]}) / 0.10)` }}>
                      <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl" style={{ backgroundColor: `hsl(var(${typeToVar[s.type]}))` }} />
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{s.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{s.start} - {s.end}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="secondary" onClick={()=>toast.message('TODO: Accept handler')}>Accept</Button>
                          <Button size="sm" variant="outline" onClick={()=>toast.message('TODO: Snooze handler')}>Snooze</Button>
                          <Button size="sm" variant="ghost" onClick={()=>toast.message('TODO: Dismiss handler')}>Dismiss</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
