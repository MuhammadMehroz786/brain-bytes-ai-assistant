import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// OAuth credentials from environment variables
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") || "your-google-client-id-here"
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET") || "your-google-client-secret-here"
const REDIRECT_URI = "https://preview--brain-bytes-ai-assistant.lovable.app/callback"

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    if (action === 'authorize') {
      // Generate OAuth URL using provided credentials
      const scope = 'https://www.googleapis.com/auth/gmail.readonly email profile'
      const state = crypto.randomUUID()
      
      // Store state for validation (in production, use Redis or database)
      // For now, we'll validate on callback using basic checks

      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID)
      authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', scope)
      authUrl.searchParams.set('access_type', 'offline')
      authUrl.searchParams.set('prompt', 'consent')
      authUrl.searchParams.set('state', state)

      return new Response(JSON.stringify({ 
        authUrl: authUrl.toString() 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'callback') {
      // Handle OAuth callback
      const code = url.searchParams.get('code')
      const state = url.searchParams.get('state')
      const error = url.searchParams.get('error')
      
      // Basic state validation (prevent CSRF)
      if (!state || state.length < 10) {
        throw new Error('Invalid or missing state parameter')
      }

      if (error) {
        console.error('OAuth error:', error)
        // Sanitize error message
        const sanitizedError = error === 'access_denied' ? 'access_denied' : 'oauth_error'
        return new Response(`
          <html>
            <body>
              <script>
                window.opener.postMessage({ error: '${sanitizedError}' }, '*');
                window.close();
              </script>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' }
        })
      }

      if (!code) {
        throw new Error('No authorization code received')
      }

      // Exchange code for token using provided credentials
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI,
        }),
      })

      const tokens = await tokenResponse.json()

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokens.error}`)
      }

      // Get user info
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      })

      const userInfo = await userInfoResponse.json()

      // Send success message and close popup immediately
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>body { margin: 0; background: white; }</style>
          </head>
          <body>
            <script>
              (function() {
                try {
                  console.log('OAuth success - sending message to parent');
                  if (window.opener && !window.opener.closed) {
                    window.opener.postMessage({ 
                      success: true, 
                      tokens: ${JSON.stringify(tokens)}, 
                      userInfo: ${JSON.stringify(userInfo)} 
                    }, window.opener.location.origin);
                    console.log('Success message sent to parent');
                  }
                } catch (error) {
                  console.error('Error sending message:', error);
                } finally {
                  // Close popup immediately
                  setTimeout(() => window.close(), 100);
                }
              })();
            </script>
          </body>
        </html>
      `, {
        headers: { 
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      })
    }

    if (req.method === 'POST') {
      // Store tokens in database
      const { tokens, userInfo } = await req.json()
      
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        throw new Error('No authorization header')
      }

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: authHeader },
          },
        }
      )

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

      // Upsert the token
      const { error } = await supabase
        .from('gmail_tokens')
        .upsert({
          user_id: user.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: expiresAt.toISOString(),
          email: userInfo.email,
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        throw error
      }

      // Log security event
      const supabaseService = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
      )

      await supabaseService.from("security_audit").insert({
        user_id: user.id,
        event_type: "gmail_oauth_connected",
        event_data: { email: userInfo.email },
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown"
      })

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    throw new Error('Invalid request')
  } catch (error) {
    console.error('Gmail OAuth error:', error)
    
    // Sanitize error message for security
    const sanitizedError = error instanceof Error ? 
      (error.message.includes("authenticated") ? "Authentication required" : 
       error.message.includes("state") ? "Invalid request" : "OAuth processing failed") :
      "OAuth processing failed"
    
    return new Response(JSON.stringify({ 
      error: sanitizedError 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})