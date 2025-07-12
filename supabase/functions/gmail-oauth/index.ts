import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    if (action === 'authorize') {
      // Generate OAuth URL
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
      if (!clientId) {
        throw new Error('Google Client ID not configured')
      }

      const redirectUri = `https://tvbetqvpiypncjtkchcc.supabase.co/functions/v1/gmail-oauth?action=callback`
      const scope = 'https://www.googleapis.com/auth/gmail.readonly email profile'
      const state = crypto.randomUUID()

      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      authUrl.searchParams.set('client_id', clientId)
      authUrl.searchParams.set('redirect_uri', redirectUri)
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
      const error = url.searchParams.get('error')

      if (error) {
        console.error('OAuth error:', error)
        return new Response(`
          <html>
            <body>
              <script>
                window.opener.postMessage({ error: '${error}' }, '*');
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

      // Exchange code for token
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
      const redirectUri = `https://tvbetqvpiypncjtkchcc.supabase.co/functions/v1/gmail-oauth?action=callback`

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
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

      return new Response(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ 
                success: true, 
                tokens: ${JSON.stringify(tokens)}, 
                userInfo: ${JSON.stringify(userInfo)} 
              }, '*');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
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

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    throw new Error('Invalid request')
  } catch (error) {
    console.error('Gmail OAuth error:', error)
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})