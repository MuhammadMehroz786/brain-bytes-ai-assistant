import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const port = process.env.PORT || 8082;
const NODE_ENV = process.env.NODE_ENV || 'development';

// In-memory storage for tokens (in production, use a database)
const tokenStorage = new Map();

// Initialize OpenAI client (optional for AI features)
let openai = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('✅ OpenAI client initialized');
  } else {
    console.log('⚠️  OpenAI API key not found - AI features will be disabled');
  }
} catch (error) {
  console.log('⚠️  Failed to initialize OpenAI client:', error.message);
}

// Configure CORS based on environment
const allowedOrigins = NODE_ENV === 'production' 
  ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://brain-bytes-ai.lovable.app', 'https://preview--brain-bytes-ai-assistant.lovable.app', 'https://*.lovable.app']
  : ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// OAuth credentials from environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Validate required environment variables
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error('❌ Missing required environment variables: GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET');
  process.exit(1);
}

// Logging configuration
const log = {
  info: (message, ...args) => console.log(`[${new Date().toISOString()}] ℹ️  ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[${new Date().toISOString()}] ⚠️  ${message}`, ...args),
  error: (message, ...args) => console.error(`[${new Date().toISOString()}] ❌ ${message}`, ...args),
  success: (message, ...args) => console.log(`[${new Date().toISOString()}] ✅ ${message}`, ...args),
};

log.info('OAuth Configuration:');
log.info('Environment:', NODE_ENV);
log.info('Client ID:', GOOGLE_CLIENT_ID?.substring(0, 20) + '...');
log.info('Redirect URI:', REDIRECT_URI);
log.info('Server starting on port:', port);

// Test endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'OAuth Server Running',
    clientId: GOOGLE_CLIENT_ID,
    redirectUri: REDIRECT_URI,
    port: port
  });
});

// Generate OAuth URL endpoint
app.get('/auth/google', (req, res) => {
  try {
    const state = Math.random().toString(36).substring(2, 15);
    const scope = 'https://www.googleapis.com/auth/gmail.readonly email profile';
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', state);

    console.log('🌐 Generated OAuth URL:', authUrl.toString());
    
    res.json({ 
      authUrl: authUrl.toString(),
      state: state
    });
  } catch (error) {
    console.error('❌ Error generating auth URL:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate OAuth URL endpoint for Calendar
app.get('/auth/google/calendar', (req, res) => {
  try {
    const state = Math.random().toString(36).substring(2, 15);
    const scope = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events email profile';
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', state);

    console.log('🌐 Generated Calendar OAuth URL:', authUrl.toString());
    
    res.json({ 
      authUrl: authUrl.toString(),
      state: state
    });
  } catch (error) {
    console.error('❌ Error generating calendar auth URL:', error);
    res.status(500).json({ error: error.message });
  }
});


// Handle OAuth callback
app.get('/callback', async (req, res) => {
  console.log('🔄 OAuth callback received');
  console.log('📝 Query params:', req.query);
  
  const { code, state, error } = req.query;

  if (error) {
    console.log('❌ OAuth error:', error);
    return res.send(`
      <html>
        <head><title>OAuth Error</title></head>
        <body>
          <h1>OAuth Error</h1>
          <p>Error: ${error}</p>
          <script>
            setTimeout(() => {
              if (window.opener) {
                window.opener.postMessage({ error: '${error}' }, '*');
                window.close();
              }
            }, 1000);
          </script>
        </body>
      </html>
    `);
  }

  if (!code) {
    console.log('❌ No authorization code received');
    return res.send(`
      <html>
        <head><title>OAuth Error</title></head>
        <body>
          <h1>OAuth Error</h1>
          <p>No authorization code received</p>
          <script>
            setTimeout(() => {
              if (window.opener) {
                window.opener.postMessage({ error: 'No authorization code received' }, '*');
                window.close();
              }
            }, 1000);
          </script>
        </body>
      </html>
    `);
  }

  try {
    console.log('🔄 Exchanging code for tokens...');
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokens = await tokenResponse.json();
    console.log('🎫 Token response status:', tokenResponse.status);

    if (!tokenResponse.ok) {
      console.log('❌ Token exchange failed:', tokens);
      throw new Error(`Token exchange failed: ${tokens.error}`);
    }

    console.log('✅ Tokens received successfully');

    // Get user info
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    const userInfo = await userInfoResponse.json();
    console.log('👤 User info received:', userInfo.email);

    // Send success response
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Google Account Connected Successfully</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: #f5f5f5; 
            }
            .success { color: #28a745; }
          </style>
        </head>
        <body>
          <h1 class="success">✅ Google Account Connected Successfully!</h1>
          <p>Email: ${userInfo.email}</p>
          <p>This window will close automatically...</p>
          <script>
            (function() {
              try {
                console.log('📤 Sending success message to parent window');
                if (window.opener && !window.opener.closed) {
                  window.opener.postMessage({ 
                    success: true, 
                    tokens: ${JSON.stringify(tokens)}, 
                    userInfo: ${JSON.stringify(userInfo)},
                    code: '${code}'
                  }, '*');
                  console.log('✅ Success message sent');
                }
              } catch (error) {
                console.error('❌ Error sending message:', error);
              } finally {
                setTimeout(() => {
                  console.log('🪟 Closing popup window');
                  window.close();
                }, 2000);
              }
            })();
          </script>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    res.send(`
      <html>
        <head><title>OAuth Error</title></head>
        <body>
          <h1>OAuth Processing Failed</h1>
          <p>Error: ${error.message}</p>
          <script>
            setTimeout(() => {
              if (window.opener) {
                window.opener.postMessage({ error: 'OAuth processing failed: ${error.message}' }, '*');
                window.close();
              }
            }, 1000);
          </script>
        </body>
      </html>
    `);
  }
});

// Store Gmail tokens endpoint
app.post('/store-tokens', async (req, res) => {
  try {
    const { tokens, userInfo } = req.body;

    console.log('📥 Received token storage request for:', userInfo?.email);

    if (!tokens || !userInfo) {
      return res.status(400).json({
        error: 'Missing required fields: tokens or userInfo'
      });
    }

    // Store tokens in memory with email as key
    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000),
      email: userInfo.email,
      stored_at: new Date()
    };
    
    tokenStorage.set(userInfo.email, tokenData);
    
    console.log('✅ Tokens stored successfully');
    console.log('🎫 Access token:', tokens.access_token ? 'Present' : 'Missing');
    console.log('🔄 Refresh token:', tokens.refresh_token ? 'Present' : 'Missing');
    console.log('👤 User email:', userInfo.email);
    console.log('📊 Total stored users:', tokenStorage.size);
    
    res.json({
      success: true,
      message: 'Tokens stored successfully',
      userEmail: userInfo.email 
    });

  } catch (error) {
    console.error('❌ Token storage error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Store Calendar token endpoint
app.post('/store-calendar-token', async (req, res) => {
  try {
    console.log('📥 Received calendar token storage request. Body:', req.body);
    const { tokens, email } = req.body; // Changed from 'code' to 'tokens'

    if (!tokens || !email) { // Updated condition
      console.error('❌ Missing tokens or email in calendar token request');
      return res.status(400).json({ error: 'Missing tokens or email' });
    }

    // Removed the fetch call to exchange code for tokens, as tokens are now directly provided

    const existingTokenData = tokenStorage.get(email);
    console.log('Existing token data for calendar:', existingTokenData);

    const tokenData = {
      ...existingTokenData,
      calendar_access_token: tokens.access_token,
      calendar_refresh_token: tokens.refresh_token,
      calendar_expires_at: new Date(Date.now() + tokens.expires_in * 1000),
    };

    tokenStorage.set(email, tokenData);
    console.log('✅ Calendar Tokens stored successfully. Updated token data:', tokenStorage.get(email));
    res.json({ success: true });

  } catch (error) {
    console.error('❌ Error storing calendar token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch Gmail emails endpoint
app.post('/fetch-emails', async (req, res) => {
  try {
    const { userEmail, pageToken } = req.body;

    console.log(`📬 Received email fetch request for: ${userEmail} (Page Token: ${pageToken || 'none'})`);

    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }

    // Get stored tokens
    const tokenData = tokenStorage.get(userEmail);
    if (!tokenData) {
      return res.status(404).json({ error: 'No tokens found for this user. Please connect Gmail first.' });
    }

    let accessToken = tokenData.access_token;

    // Check if token needs refresh
    if (new Date() >= tokenData.expires_at && tokenData.refresh_token) {
      console.log('🔄 Refreshing expired access token...');
      
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        accessToken = refreshData.access_token;
        
        // Update stored token
        tokenData.access_token = accessToken;
        tokenData.expires_at = new Date(Date.now() + refreshData.expires_in * 1000);
        tokenStorage.set(userEmail, tokenData);
        
        console.log('✅ Token refreshed successfully');
      } else {
        console.error('❌ Failed to refresh token');
        return res.status(401).json({ error: 'Failed to refresh access token' });
      }
    }

    // Fetch emails from Gmail API
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const afterTimestamp = Math.floor(twentyFourHoursAgo.getTime() / 1000);
    
    const query = `after:${afterTimestamp}`;
    let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=${query}`;
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }

    const gmailResponse = await fetch(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    if (!gmailResponse.ok) {
      console.error('❌ Gmail API error:', gmailResponse.status);
      return res.status(gmailResponse.status).json({ error: 'Gmail API request failed' });
    }

    const gmailData = await gmailResponse.json();
    const messages = gmailData.messages || [];

    console.log(`📨 Found ${messages.length} messages`);

    const processedEmails = [];

    for (const message of messages) {
      try {
        const messageResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }
        );

        if (!messageResponse.ok) continue;

        const messageData = await messageResponse.json();
        const headers = messageData.payload.headers || [];
        
        const getHeader = (name) => headers.find(h => 
          h.name.toLowerCase() === name.toLowerCase()
        )?.value || '';
        
        const from = getHeader('from');
        const subject = getHeader('subject');
        const date = new Date(parseInt(messageData.internalDate)).toISOString();
        
        const fromMatch = from.match(/^(.+?)\\s*<(.+?)>$/) || [null, from.split('@')[0], from];
        const senderName = fromMatch[1]?.replace(/"/g, '').trim() || fromMatch[2]?.split('@')[0] || 'Unknown';
        const senderEmail = fromMatch[2] || from;
        
        processedEmails.push({
          id: messageData.id,
          senderName,
          senderEmail,
          subject: subject || 'No Subject',
          date,
          snippet: messageData.snippet || '',
          aiSummary: `Email from ${senderName}: ${subject}`,
          suggestedReplies: [
            "Thank you for your email.",
            "I'll review this and get back to you.",
            "Thanks for reaching out."
          ],
          body: messageData.snippet || ''
        });
      } catch (error) {
        console.error(`Error processing message ${message.id}:`, error);
      }
    }

    console.log(`✅ Successfully processed ${processedEmails.length} emails`);
    
    res.json({
      success: true,
      emails: processedEmails,
      nextPageToken: gmailData.nextPageToken,
      total: messages.length,
      processed: processedEmails.length
    });

  } catch (error) {
    console.error('❌ Fetch emails error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch Calendar events endpoint
app.post('/fetch-calendar-events', async (req, res) => {
  try {
    console.log('📥 Received fetch calendar events request. Body:', req.body);
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const tokenData = tokenStorage.get(email);
    if (!tokenData || !tokenData.calendar_access_token) {
      return res.status(401).json({ error: 'User not authenticated for calendar access' });
    }

    let accessToken = tokenData.calendar_access_token;

    // Refresh token if expired
    if (new Date() >= tokenData.calendar_expires_at && tokenData.calendar_refresh_token) {
      console.log('🔄 Refreshing expired calendar access token...');
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: tokenData.calendar_refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        accessToken = refreshData.access_token;
        tokenData.calendar_access_token = accessToken;
        tokenData.calendar_expires_at = new Date(Date.now() + refreshData.expires_in * 1000);
        tokenStorage.set(email, tokenData);
        console.log('✅ Calendar token refreshed successfully');
      } else {
        console.error('❌ Failed to refresh calendar token');
        return res.status(401).json({ error: 'Failed to refresh calendar access token' });
      }
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
      const errorData = await eventsResponse.json();
      console.error('❌ Failed to fetch calendar events. Error data:', errorData);
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
      const errorData = await freeBusyResponse.json();
      console.error('❌ Failed to fetch free/busy info. Error data:', errorData);
      throw new Error('Failed to fetch free/busy information');
    }

    const freeBusyData = await freeBusyResponse.json();
    const busySlots = freeBusyData.calendars.primary.busy || [];
    console.log(`🕒 Found ${busySlots.length} busy slots`);

    res.json({ success: true, events, busySlots });

  } catch (error) {
    console.error('❌ Error fetching calendar events:', error);
    res.status(500).json({ error: error.message });
  }
});

// Suggest focus time and task endpoint
app.post('/suggest-focus-time-and-task', async (req, res) => {
  try {
    console.log('📥 Received suggest focus time and task request. Body:', req.body);
    const { email, timezone } = req.body;

    if (!email || !timezone) {
      return res.status(400).json({ error: 'Email and timezone are required' });
    }

    const tokenData = tokenStorage.get(email);
    if (!tokenData || !tokenData.calendar_access_token) {
      return res.status(401).json({ error: 'User not authenticated for calendar access' });
    }

    const accessToken = tokenData.calendar_access_token;

    // Fetch busy slots (same logic as /schedule-focus)
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

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
      throw new Error('Failed to check for free slots');
    }

    const freeBusyData = await freeBusyResponse.json();
    const busySlots = freeBusyData.calendars.primary.busy || [];

    // Prepare prompt for OpenAI
    let prompt = `The user's current time is ${now.toLocaleString('en-US', { timeZone: timezone })} in timezone ${timezone}.\n`;
    prompt += `Here are the user's busy slots for the next 3 days:\n`;
    if (busySlots.length > 0) {
      busySlots.forEach(slot => {
        prompt += `- ${new Date(slot.start).toLocaleString('en-US', { timeZone: timezone })} to ${new Date(slot.end).toLocaleString('en-US', { timeZone: timezone })}\n`;
      });
    } else {
      prompt += `No busy slots found.\n`;
    }
    prompt += `Suggest an optimal 30-minute focus time within the next 1-3 days, avoiding busy slots. Provide the start and end time in ISO format. Also, suggest a relevant task for this focus block. The output should be a JSON object with 'suggestedTime' (ISO string) and 'suggestedTask' (string).`;

    if (!openai) {
      return res.status(503).json({ error: 'AI features are disabled - OpenAI API key not configured' });
    }

    console.log('Sending prompt to OpenAI:', prompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Or a more capable model if available
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);
    console.log('OpenAI response:', aiResponse);

    res.json({ success: true, suggestedTime: aiResponse.suggestedTime, suggestedTask: aiResponse.suggestedTask });

  } catch (error) {
    console.error('❌ Error suggesting focus time and task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Parse natural language calendar command endpoint
app.post('/parse-calendar-command', async (req, res) => {
  try {
    console.log('📥 Received natural language calendar command. Body:', req.body);
    const { command, email, timezone } = req.body;

    if (!command || !email) {
      return res.status(400).json({ error: 'Command and email are required' });
    }

    if (!openai) {
      return res.status(503).json({ error: 'AI features are disabled - OpenAI API key not configured' });
    }

    // Get current time in user's timezone
    const now = new Date();
    const userTime = timezone ? now.toLocaleString('en-US', { timeZone: timezone }) : now.toLocaleString();

    const prompt = `Parse this natural language calendar command and extract the event details.
Current time: ${userTime} (timezone: ${timezone || 'local'})

Command: "${command}"

Extract and return a JSON object with:
- summary: The event title/description
- startTime: ISO datetime string for when the event starts
- endTime: ISO datetime string for when the event ends (default to 1 hour duration if not specified)
- isValid: boolean indicating if this is a valid calendar command

Rules:
- If time is specified as just a number like "10" or "10am", assume today unless date is mentioned
- If "tomorrow" is mentioned, use tomorrow's date
- If no date is mentioned, assume today
- If no duration is specified, default to 1 hour
- Focus blocks should be 30 minutes unless specified otherwise
- If the command doesn't seem like a calendar request, set isValid to false

Examples:
"set a focus block for 10 am about doing homework" -> start at 10:00 AM today for 30 minutes, summary "doing homework"
"schedule meeting with John tomorrow at 2pm" -> start at 2:00 PM tomorrow for 1 hour, summary "meeting with John"
"lunch at 12:30" -> start at 12:30 PM today for 1 hour, summary "lunch"`;

    console.log('Sending natural language parsing prompt to OpenAI');

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);
    console.log('OpenAI parsing response:', aiResponse);

    if (!aiResponse.isValid) {
      return res.status(400).json({ error: 'Invalid calendar command', details: aiResponse });
    }

    res.json({ 
      success: true, 
      summary: aiResponse.summary,
      startTime: aiResponse.startTime,
      endTime: aiResponse.endTime
    });

  } catch (error) {
    console.error('❌ Error parsing calendar command:', error);
    res.status(500).json({ error: error.message });
  }
});

// Schedule focus time endpoint
app.post('/schedule-focus', async (req, res) => {
  try {
    console.log('📥 Received schedule focus request. Body:', req.body);
    const { summary, email, startTime, endTime } = req.body;

    if (!summary || !email || !startTime || !endTime) {
      console.error('❌ Missing summary, email, startTime, or endTime in schedule focus request');
      return res.status(400).json({ error: 'Missing summary, email, startTime, or endTime' });
    }

    const tokenData = tokenStorage.get(email);
    console.log('Existing token data for schedule focus:', tokenData);

    if (!tokenData || !tokenData.calendar_access_token) {
      console.error('❌ User not authenticated for calendar access in schedule focus');
      return res.status(401).json({ error: 'User not authenticated for calendar access' });
    }

    const accessToken = tokenData.calendar_access_token;

    // Schedule the event
    const event = {
      summary: summary,
      start: { dateTime: startTime },
      end: { dateTime: endTime },
    };

    const createEventResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    console.log('Create Event API response status:', createEventResponse.status);
    if (!createEventResponse.ok) {
      const errorData = await createEventResponse.json();
      console.error('❌ Failed to create event. Error data:', errorData);
      throw new Error('Failed to create event');
    }

    res.json({ success: true, event: await createEventResponse.json() });

  } catch (error) {
    console.error('❌ Error scheduling focus time:', error);
    res.status(500).json({ error: error.message });
  }
});


// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler (must be last!)
app.use((req, res) => {
  console.log('🔍 404 - Not found:', req.url);
  res.status(404).json({ error: 'Not found', url: req.url });
});

const host = NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(port, host, () => {
  log.success(`Gmail OAuth server running at http://${host}:${port}`);
  log.info('OAuth callback URL:', REDIRECT_URI);
  log.success('Ready to handle Gmail OAuth requests!');
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down OAuth server...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
