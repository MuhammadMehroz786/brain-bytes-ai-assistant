import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailMessage {
  id: string
  threadId: string
  snippet: string
  payload: {
    headers: Array<{ name: string; value: string }>
    body?: { data?: string }
    parts?: Array<{
      mimeType: string
      body?: { data?: string }
      parts?: Array<{ mimeType: string; body?: { data?: string } }>
    }>
  }
  internalDate: string
}

interface ProcessedEmail {
  id: string
  senderName: string
  senderEmail: string
  subject: string
  date: string
  aiSummary: string
  suggestedReplies: string[]
  body: string
  snippet: string
}

function getHeader(headers: Array<{ name: string; value: string }>, name: string): string {
  const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase())
  return header?.value || ''
}

function extractEmailBody(payload: EmailMessage['payload']): string {
  // Try to get plain text first
  if (payload.body?.data) {
    return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'))
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'))
      }
      
      // Check nested parts
      if (part.parts) {
        for (const nestedPart of part.parts) {
          if (nestedPart.mimeType === 'text/plain' && nestedPart.body?.data) {
            return atob(nestedPart.body.data.replace(/-/g, '+').replace(/_/g, '/'))
          }
        }
      }
    }
    
    // Fallback to HTML if plain text not found
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'))
      }
    }
  }

  return ''
}

async function generateAiAnalysis(body: string, subject: string): Promise<{ summary: string; replies: string[] }> {
  // For now, return a simple analysis. In production, integrate with OpenAI API
  const summary = `Email about: ${subject}. ${body.substring(0, 100)}...`
  const replies = [
    "Thank you for your email. I'll review this and get back to you soon.",
    "I appreciate you reaching out. Let me look into this matter.",
    "Thanks for the information. I'll follow up on this shortly."
  ]
  
  return { summary, replies }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
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

    // Get the user's Gmail token
    const { data: tokenData, error: tokenError } = await supabase
      .from('gmail_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', user.id)
      .single()

    if (tokenError || !tokenData) {
      throw new Error('Gmail not connected. Please connect your Gmail account first.')
    }

    // Check if token needs refresh
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)
    
    let accessToken = tokenData.access_token

    if (now >= expiresAt && tokenData.refresh_token) {
      // Refresh the token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token',
        }),
      })

      const refreshData = await refreshResponse.json()
      
      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh token')
      }

      accessToken = refreshData.access_token
      
      // Update the token in database
      const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000)
      await supabase
        .from('gmail_tokens')
        .update({
          access_token: accessToken,
          expires_at: newExpiresAt.toISOString(),
        })
        .eq('user_id', user.id)
    }

    // Fetch emails from Gmail API
    const gmailResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=in:inbox newer_than:1d`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!gmailResponse.ok) {
      throw new Error(`Gmail API error: ${gmailResponse.status}`)
    }

    const gmailData = await gmailResponse.json()
    console.log('Gmail API Response:', JSON.stringify(gmailData, null, 2))
    const messages = gmailData.messages || []

    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No recent emails found in the last 24 hours.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const processedEmails: ProcessedEmail[] = []

    // Fetch detailed information for each message
    for (const message of messages.slice(0, 10)) {
      try {
        const messageResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        )

        if (!messageResponse.ok) {
          console.error(`Failed to fetch message ${message.id}`)
          continue
        }

        const messageData: EmailMessage = await messageResponse.json()
        
        const headers = messageData.payload.headers
        const from = getHeader(headers, 'from')
        const subject = getHeader(headers, 'subject')
        const date = new Date(parseInt(messageData.internalDate)).toISOString()
        
        // Extract sender name and email
        const fromMatch = from.match(/^(.+?)\s*<(.+?)>$/) || from.match(/^(.+)$/)
        const senderName = fromMatch ? (fromMatch[2] ? fromMatch[1].trim() : fromMatch[1].split('@')[0]) : 'Unknown'
        const senderEmail = fromMatch ? (fromMatch[2] || fromMatch[1]) : 'unknown@example.com'
        
        const body = extractEmailBody(messageData.payload)
        const aiAnalysis = await generateAiAnalysis(body, subject)

        processedEmails.push({
          id: messageData.id,
          senderName: senderName.replace(/"/g, ''),
          senderEmail,
          subject,
          date,
          aiSummary: aiAnalysis.summary,
          suggestedReplies: aiAnalysis.replies,
          body,
          snippet: messageData.snippet
        })
      } catch (error) {
        console.error(`Error processing message ${message.id}:`, error)
      }
    }

    return new Response(JSON.stringify(processedEmails), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Fetch Gmail emails error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch emails'
    
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})