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

    // Get stored Gmail token
    const { data: tokenData, error: tokenError } = await supabase
      .from('gmail_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (tokenError || !tokenData) {
      throw new Error('Gmail not connected. Please sync Gmail first.')
    }

    // Check if token is expired and refresh if needed
    let accessToken = tokenData.access_token
    if (tokenData.expires_at && new Date(tokenData.expires_at) <= new Date()) {
      if (!tokenData.refresh_token) {
        throw new Error('Token expired and no refresh token available')
      }

      // Refresh the token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token',
        }),
      })

      const refreshTokens = await refreshResponse.json()
      if (!refreshResponse.ok) {
        throw new Error(`Token refresh failed: ${refreshTokens.error}`)
      }

      accessToken = refreshTokens.access_token
      
      // Update stored token
      await supabase
        .from('gmail_tokens')
        .update({
          access_token: refreshTokens.access_token,
          expires_at: new Date(Date.now() + refreshTokens.expires_in * 1000).toISOString(),
        })
        .eq('user_id', user.id)
    }

    // Fetch emails from the past 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const query = `in:inbox after:${yesterday.getFullYear()}/${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getDate().toString().padStart(2, '0')}`

    // Search for messages
    const searchResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    const searchData = await searchResponse.json()
    
    if (!searchResponse.ok) {
      throw new Error(`Gmail API error: ${searchData.error?.message}`)
    }

    if (!searchData.messages || searchData.messages.length === 0) {
      return new Response(JSON.stringify({ emails: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Fetch details for each message
    const emails = await Promise.all(
      searchData.messages.slice(0, 20).map(async (message: any) => {
        const messageResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        )

        const messageData = await messageResponse.json()
        
        if (!messageResponse.ok) {
          console.error('Error fetching message:', messageData)
          return null
        }

        const headers = messageData.payload?.headers || []
        const fromHeader = headers.find((h: any) => h.name === 'From')
        const subjectHeader = headers.find((h: any) => h.name === 'Subject')
        const dateHeader = headers.find((h: any) => h.name === 'Date')

        // Extract sender name and email
        const fromValue = fromHeader?.value || 'Unknown'
        let senderName = fromValue
        let senderEmail = fromValue

        const emailMatch = fromValue.match(/<(.+)>/)
        if (emailMatch) {
          senderEmail = emailMatch[1]
          senderName = fromValue.replace(/<.+>/, '').trim().replace(/^"|"$/g, '')
        } else if (fromValue.includes('@')) {
          senderEmail = fromValue
          senderName = fromValue.split('@')[0]
        }

        return {
          id: message.id,
          sender: senderName,
          senderEmail,
          subject: subjectHeader?.value || 'No Subject',
          time: dateHeader?.value ? new Date(dateHeader.value).toISOString() : new Date().toISOString(),
          isUnread: messageData.labelIds?.includes('UNREAD') || false,
          summary: `Email from ${senderName}`, // Basic summary for now
          tags: messageData.labelIds?.includes('IMPORTANT') ? ['Important'] : []
        }
      })
    )

    const validEmails = emails.filter(email => email !== null)

    return new Response(JSON.stringify({ 
      emails: validEmails,
      totalCount: searchData.resultSizeEstimate || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Fetch Gmail emails error:', error)
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})