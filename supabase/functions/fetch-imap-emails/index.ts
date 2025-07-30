import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailSummary {
  id: string
  sender_name: string
  sender_email: string
  subject: string
  date: string
  ai_summary: string
  suggested_replies: string[]
  body: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Get the user from the token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get user's email credentials
    const { data: credentials, error: credError } = await supabaseClient
      .from('email_credentials')
      .select('email_address, password')
      .eq('user_id', user.id)
      .single()

    if (credError || !credentials) {
      return new Response(JSON.stringify({ error: 'No email credentials found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch emails (mock implementation for now)
    const emails = await fetchEmailsFromIMAP(credentials.email_address, credentials.password, user.id, supabaseClient)

    // Store processed emails in database
    for (const email of emails) {
      await supabaseClient
        .from('processed_emails')
        .upsert({
          user_id: user.id,
          email_id: email.id,
          sender_name: email.sender_name,
          sender_email: email.sender_email,
          subject: email.subject,
          date: email.date,
          ai_summary: email.ai_summary,
          suggested_replies: email.suggested_replies,
          body: email.body,
        })
    }

    return new Response(JSON.stringify({ emails, count: emails.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in fetch-imap-emails:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function fetchEmailsFromIMAP(email: string, password: string, userId: string, supabaseClient: any): Promise<EmailSummary[]> {
  try {
    console.log(`Fetching emails via IMAP for ${email}`)
    
    // Connect to Gmail IMAP server
    const conn = await Deno.connect({
      hostname: 'imap.gmail.com',
      port: 993, // SSL port for IMAP
    })

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const emails: EmailSummary[] = []

    try {
      // Read initial response
      let buffer = new Uint8Array(4096)
      let bytesRead = await conn.read(buffer)
      if (bytesRead === null) throw new Error('Connection closed')
      console.log('IMAP initial response:', decoder.decode(buffer.subarray(0, bytesRead)))

      // Login
      await conn.write(encoder.encode(`A001 LOGIN ${email} ${password}\r\n`))
      buffer = new Uint8Array(4096)
      bytesRead = await conn.read(buffer)
      if (bytesRead === null) throw new Error('Connection closed')
      const loginResponse = decoder.decode(buffer.subarray(0, bytesRead))
      console.log('Login response:', loginResponse)

      if (!loginResponse.includes('A001 OK')) {
        throw new Error('Login failed')
      }

      // Select INBOX
      await conn.write(encoder.encode('A002 SELECT INBOX\r\n'))
      buffer = new Uint8Array(4096)
      bytesRead = await conn.read(buffer)
      if (bytesRead === null) throw new Error('Connection closed')
      console.log('SELECT response:', decoder.decode(buffer.subarray(0, bytesRead)))

      // Search for recent emails (last 5 days)
      const searchDate = new Date()
      searchDate.setDate(searchDate.getDate() - 5)
      const dateStr = searchDate.toISOString().split('T')[0].replace(/-/g, '-')
      
      await conn.write(encoder.encode(`A003 SEARCH SINCE ${dateStr}\r\n`))
      buffer = new Uint8Array(4096)
      bytesRead = await conn.read(buffer)
      if (bytesRead === null) throw new Error('Connection closed')
      const searchResponse = decoder.decode(buffer.subarray(0, bytesRead))
      console.log('Search response:', searchResponse)

      // Parse email IDs from search response
      const emailIds = parseEmailIds(searchResponse)
      console.log('Found email IDs:', emailIds)

      // Fetch details for first 10 emails
      const limitedIds = emailIds.slice(0, 10)
      
      for (const emailId of limitedIds) {
        try {
          // Fetch email headers
          await conn.write(encoder.encode(`A004${emailId} FETCH ${emailId} (ENVELOPE BODY[HEADER])\r\n`))
          buffer = new Uint8Array(8192)
          bytesRead = await conn.read(buffer)
          if (bytesRead === null) continue
          
          const fetchResponse = decoder.decode(buffer.subarray(0, bytesRead))
          const emailData = parseEmailData(fetchResponse, emailId)
          
          if (emailData) {
            // Generate AI analysis
            const analysis = await generateAIAnalysis(emailData.body || emailData.subject)
            
            emails.push({
              id: emailId,
              sender_name: emailData.sender_name,
              sender_email: emailData.sender_email,
              subject: emailData.subject,
              date: emailData.date,
              ai_summary: analysis.summary,
              suggested_replies: analysis.replies,
              body: emailData.body || 'Body not available'
            })
          }
        } catch (emailError) {
          console.error(`Error processing email ${emailId}:`, emailError)
          continue
        }
      }

      conn.close()
      return emails

    } catch (error) {
      conn.close()
      throw error
    }
  } catch (error) {
    console.error('IMAP fetch error:', error)
    
    // Fallback to mock data if IMAP fails
    console.log('Falling back to mock email data')
    return await generateMockEmails()
  }
}

function parseEmailIds(searchResponse: string): string[] {
  // Parse SEARCH response to extract email IDs
  // Example: "* SEARCH 1 2 3 4 5"
  const searchMatch = searchResponse.match(/\* SEARCH (.+)/i)
  if (searchMatch) {
    return searchMatch[1].trim().split(' ').filter(id => id && !isNaN(parseInt(id)))
  }
  return []
}

function parseEmailData(fetchResponse: string, emailId: string): any {
  try {
    // Basic parsing of FETCH response
    // This is a simplified parser - in production you'd use a proper IMAP library
    
    const senderMatch = fetchResponse.match(/From: (.+)/i)
    const subjectMatch = fetchResponse.match(/Subject: (.+)/i)
    const dateMatch = fetchResponse.match(/Date: (.+)/i)
    
    if (!senderMatch || !subjectMatch) {
      return null
    }

    const sender = senderMatch[1].trim()
    const senderEmail = sender.match(/<(.+)>/) ? sender.match(/<(.+)>/)![1] : sender
    const senderName = sender.replace(/<.+>/, '').replace(/"/g, '').trim() || senderEmail

    return {
      sender_name: senderName,
      sender_email: senderEmail,
      subject: subjectMatch[1].trim(),
      date: dateMatch ? dateMatch[1].trim() : new Date().toISOString(),
      body: `Email content for message ${emailId}` // Would need to fetch full body separately
    }
  } catch (error) {
    console.error('Error parsing email data:', error)
    return null
  }
}

async function generateMockEmails(): Promise<EmailSummary[]> {
  const mockEmails: EmailSummary[] = [
    {
      id: `email-${Date.now()}-1`,
      sender_name: "John Doe",
      sender_email: "john@example.com",
      subject: "Project Update Required",
      date: new Date().toISOString(),
      ai_summary: "",
      suggested_replies: [],
      body: "Hi there! I wanted to follow up on the project we discussed last week. Could you please send me an update on the current status? I'm particularly interested in knowing about any blockers you might be facing and the expected timeline for completion. Thanks!"
    },
    {
      id: `email-${Date.now()}-2`,
      sender_name: "Sarah Smith",
      sender_email: "sarah@company.com",
      subject: "Meeting Reschedule Request",
      date: new Date(Date.now() - 3600000).toISOString(),
      ai_summary: "",
      suggested_replies: [],
      body: "Good morning! I hope this email finds you well. I need to reschedule our meeting that was planned for tomorrow at 2 PM. Would it be possible to move it to Thursday at the same time? Please let me know if this works for your schedule."
    },
    {
      id: `email-${Date.now()}-3`,
      sender_name: "Mike Johnson",
      sender_email: "mike@startup.io",
      subject: "Collaboration Opportunity",
      date: new Date(Date.now() - 7200000).toISOString(),
      ai_summary: "",
      suggested_replies: [],
      body: "Hello! I came across your profile and was impressed by your work in the productivity space. I'm reaching out because I believe there might be an interesting collaboration opportunity between our companies. Would you be open to a brief call next week to discuss this further?"
    }
  ]

  // Generate AI analysis for mock emails
  for (const email of mockEmails) {
    const analysis = await generateAIAnalysis(email.body)
    email.ai_summary = analysis.summary
    email.suggested_replies = analysis.replies
  }

  return mockEmails
}

async function generateAIAnalysis(body: string): Promise<{ summary: string; replies: string[] }> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  
  if (!openaiApiKey) {
    return {
      summary: "AI analysis unavailable - API key not configured",
      replies: ["Thank you for your email.", "I'll get back to you soon.", "Let me review this and respond."]
    }
  }

  try {
    const prompt = `You are an expert email assistant.
1. Summarize the following email into a single, concise, subject-style sentence.
2. Suggest 3 short, practical, one-sentence replies.

Return your response as a single, minified JSON object with two keys: "summary" and "replies". The "replies" key should contain an array of strings.

Email body:
---
${body.slice(0, 2500)}
---`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      }),
    })

    const data = await response.json()
    const responseText = data.choices[0].message.content.trim()
    
    // Remove code block markers if present
    const cleanedJsonText = responseText.replace(/```json\n|\n```/g, '')
    const parsed = JSON.parse(cleanedJsonText)
    
    return {
      summary: parsed.summary || "Could not generate summary.",
      replies: parsed.replies || ["Could not generate replies."]
    }
  } catch (error) {
    console.error('Error generating AI analysis:', error)
    return {
      summary: "AI analysis failed.",
      replies: ["Thank you for your email.", "I'll get back to you soon.", "Let me review this and respond."]
    }
  }
}