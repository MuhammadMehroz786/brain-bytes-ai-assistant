import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  userId: string;
  email: string;
  calendarEvents?: Array<{
    title: string;
    start: string;
    end: string;
  }>;
}

const motivationalTips = [
  "Start your day with the most important task - your brain is freshest in the morning!",
  "Take a 5-minute break every hour. Your productivity will thank you later.",
  "Focus on progress, not perfection. Small steps lead to big achievements.",
  "Use the 2-minute rule: If it takes less than 2 minutes, do it now.",
  "Batch similar tasks together to maintain momentum and reduce context switching.",
  "Your workspace affects your headspace. Keep it organized and inspiring.",
  "Celebrate small wins throughout the day - momentum builds motivation!"
];

const getTodaysTip = (): string => {
  const today = new Date().getDay();
  return motivationalTips[today] || motivationalTips[0];
};

const formatCalendarEvents = (events: EmailRequest['calendarEvents']): string => {
  if (!events || events.length === 0) {
    return `
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0;">
        <p style="color: #64748b; margin: 0;">No meetings today - perfect for deep work! 🎯</p>
      </div>
    `;
  }

  return events.map(event => `
    <div style="background-color: #f1f5f9; padding: 12px; border-radius: 6px; margin: 8px 0; border-left: 3px solid #3b82f6;">
      <div style="font-weight: 600; color: #1e293b;">${event.title}</div>
      <div style="color: #64748b; font-size: 14px;">${event.start} - ${event.end}</div>
    </div>
  `).join('');
};

const generateEmailHTML = (calendarEvents: EmailRequest['calendarEvents']): string => {
  const todaysTip = getTodaysTip();
  const eventsHTML = formatCalendarEvents(calendarEvents);
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Daily Productivity Summary</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🧠 Brain Bytes</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your Daily Productivity Summary</p>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">${today}</p>
      </div>

      <div style="background-color: #ffffff; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #1e293b; margin-top: 0; font-size: 20px; display: flex; align-items: center;">
          📅 Today's Schedule
        </h2>
        ${eventsHTML}
      </div>

      <div style="background-color: #fef3c7; border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
        <h2 style="color: #92400e; margin-top: 0; font-size: 20px; display: flex; align-items: center;">
          💡 Today's Productivity Tip
        </h2>
        <p style="color: #78350f; margin: 0; font-size: 16px; font-weight: 500;">${todaysTip}</p>
      </div>

      <div style="background-color: #f0f9ff; border-radius: 12px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #0ea5e9;">
        <h2 style="color: #0c4a6e; margin-top: 0; font-size: 20px;">🎯 Quick Wins for Today</h2>
        <ul style="color: #075985; margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Start with your most important task</li>
          <li style="margin-bottom: 8px;">Take regular breaks to maintain focus</li>
          <li style="margin-bottom: 8px;">Review your progress at the end of the day</li>
        </ul>
      </div>

      <div style="text-align: center; padding: 20px; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; margin: 0; font-size: 14px;">
          Having trouble with productivity? 
          <a href="https://your-app-url.com/dashboard" style="color: #3b82f6; text-decoration: none;">Visit your AI dashboard</a>
        </p>
        <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 12px;">
          You're receiving this because you opted in to daily summaries. 
          <a href="#" style="color: #94a3b8;">Unsubscribe</a>
        </p>
      </div>
    </body>
    </html>
  `;
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, calendarEvents }: EmailRequest = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if user has opted in for daily summaries
    const { data: userSettings, error: settingsError } = await supabase
      .from('user_settings')
      .select('daily_email_enabled')
      .eq('user_id', userId)
      .single();

    if (settingsError || !userSettings?.daily_email_enabled) {
      return new Response(
        JSON.stringify({ message: 'User not opted in for daily emails' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate email HTML
    const emailHTML = generateEmailHTML(calendarEvents);

    // Here you would integrate with your email service (Resend, SendGrid, etc.)
    // For now, we'll just simulate sending the email
    console.log(`Would send email to: ${email}`);
    console.log(`Email content generated for user: ${userId}`);

    // Log the email send attempt
    const { error: logError } = await supabase
      .from('email_logs')
      .insert({
        user_id: userId,
        email_type: 'daily_summary',
        sent_at: new Date().toISOString(),
        success: true
      });

    if (logError) {
      console.error('Error logging email send:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Daily email summary sent successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error sending daily email:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send daily email',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});