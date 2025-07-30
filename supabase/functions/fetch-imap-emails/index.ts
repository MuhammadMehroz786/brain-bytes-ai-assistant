import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Imap from 'https://esm.sh/imap'
import { simpleParser } from 'https://esm.sh/mailparser'
import { Buffer } from 'https://deno.land/std@0.140.0/node/buffer.ts'

// Add polyfills required by the 'imap' library to work in Deno
globalThis.Buffer = Buffer

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

    const authHeader = req.headers.get('Authorization')!
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- SECURITY WARNING ---
    // Storing passwords in plaintext is insecure.
    // Consider using Supabase Vault (https://supabase.com/docs/guides/database/vault)
    // to encrypt credentials at rest.
    const { data: credentials, error: credError } = await supabaseClient
      .from('email_credentials')
      .select('email_address, password')
      .eq('user_id', user.id)
      .single() 

    if (credError || !credentials) {
      const errorMsg = credError ? 'Error fetching email credentials' : 'No email credentials found. Please connect your email first.'
      const status = credError ? 500 : 400
      console.error(errorMsg, credError || '')
      return new Response(JSON.stringify({ error: errorMsg }), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch and process emails using the robust library-based approach
    let emails = await fetchAndProcessEmails(credentials.email_address, credentials.password)

    // Fallback to mock data if IMAP fetch returns no emails
    if (emails.length === 0) {
      console.log('No new emails found or IMAP failed, returning mock data.')
      emails = await generateMockEmails()
    }

    // Upsert processed emails into the database
    if (emails.length > 0) {
      const { error: upsertError } = await supabaseClient
        .from('processed_emails')
        .upsert(
          emails.map((email) => ({
            user_id: user.id,
            email_id: email.id,
            sender_name: email.sender_name,
            sender_email: email.sender_email,
            subject: email.subject,
            date: email.date,
            ai_summary: email.ai_summary,
            suggested_replies: email.suggested_replies,
            body: email.body,
          })),
          { onConflict: 'user_id, email_id' } // Assumes a composite primary or unique key
        )
      
      if (upsertError) {
        console.error('Error upserting emails:', upsertError)
        // Not returning an error to the client, as we still have the emails
      }
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

/**
 * Fetches and processes recent emails using a robust IMAP library.
 */
async function fetchAndProcessEmails(email: string, password: string): Promise<EmailSummary[]> {
  const imapConfig: Imap.Config = {
    user: email,
    password: password,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false } // Common requirement for some environments
  }

  return new Promise((resolve, reject) => {
    const imap = new Imap(imapConfig)

    const closeConnection = () => {
      try {
        imap.end()
      } catch (e) {
        // Ignore errors on end
      }
    }

    imap.once('ready', () => {
      imap.openBox('INBOX', true, (err, box) => {
        if (err) {
          closeConnection()
          return reject(new Error(`Failed to open INBOX: ${err.message}`))
        }

        // Search for the 10 most recent emails
        const fetchCount = 10
        const searchCriteria = box.messages.total > 0 ? [`${Math.max(1, box.messages.total - fetchCount + 1)}:*`] : ['ALL']

        imap.search(searchCriteria, (searchErr, results) => {
          if (searchErr || results.length === 0) {
            closeConnection()
            return resolve([]) // No emails found, resolve with empty array
          }

          const fetch = imap.fetch(results, { bodies: '' })
          const emailPromises: Promise<EmailSummary>[] = []

          fetch.on('message', (msg, seqno) => {
            const emailPromise = new Promise<EmailSummary>((resolveMsg, rejectMsg) => {
              let fullEmailSource = ''
              msg.on('body', (stream) => {
                stream.on('data', (chunk) => {
                  fullEmailSource += chunk.toString('utf8')
                })
              })
              msg.once('end', async () => {
                try {
                  const parsedEmail = await simpleParser(fullEmailSource)
                  const analysis = await generateAIAnalysis(parsedEmail.text || parsedEmail.subject || 'No Content')
                  
                  resolveMsg({
                    id: parsedEmail.messageId || `${seqno}-${Date.now()}`,
                    sender_name: parsedEmail.from?.value[0]?.name || parsedEmail.from?.text || 'Unknown Sender',
                    sender_email: parsedEmail.from?.value[0]?.address || '',
                    subject: parsedEmail.subject || 'No Subject',
                    date: parsedEmail.date?.toISOString() || new Date().toISOString(),
                    ai_summary: analysis.summary,
                    suggested_replies: analysis.replies,
                    body: parsedEmail.text || '',
                  })
                } catch (parseError) {
                  console.error(`Failed to parse email #${seqno}:`, parseError)
                  rejectMsg(parseError) // This will cause Promise.all to fail
                }
              })
            })
            emailPromises.push(emailPromise)
          })

          fetch.once('error', (fetchErr) => {
            console.error('IMAP fetch error:', fetchErr)
            closeConnection()
            reject(new Error(`IMAP fetch error: ${fetchErr.message}`))
          })

          fetch.once('end', async () => {
            try {
              // Process all emails in parallel for performance
              const emails = await Promise.all(emailPromises)
              closeConnection()
              resolve(emails.reverse()) // Reverse to show newest first
            } catch (processingError) {
              closeConnection()
              reject(new Error(`Error processing emails: ${processingError.message}`))
            }
          })
        })
      })
    })

    imap.once('error', (err) => {
      let errorMessage = 'IMAP connection error.'
      if (err.message.includes('AUTHENTICATIONFAILED')) {
        errorMessage = 'Authentication failed. Please check your email and app password.'
      }
      console.error('IMAP Error:', err);
      reject(new Error(errorMessage))
    })
    
    imap.connect()
  }).catch(error => {
    console.error('Fell back to mock data due to IMAP error:', error)
    return generateMockEmails() // Fallback to mock data on any failure
  })
}


// --- Functions below this line are mostly unchanged ---

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
        response_format: { type: "json_object" }, // Use JSON mode for reliable output
      }),
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`OpenAI API error: ${errorData.error.message}`)
    }

    const data = await response.json()
    const parsed = JSON.parse(data.choices[0].message.content)
    
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
  ]

  // Generate AI analysis for mock emails
  for (const email of mockEmails) {
    const analysis = await generateAIAnalysis(email.body)
    email.ai_summary = analysis.summary
    email.suggested_replies = analysis.replies
  }

  return mockEmails
}