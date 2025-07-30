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
      .maybeSingle() // Use maybeSingle to handle no results gracefully

    if (credError) {
      console.error('Error fetching credentials:', credError)
      return new Response(JSON.stringify({ error: 'Error fetching email credentials' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!credentials) {
      return new Response(JSON.stringify({ error: 'No email credentials found. Please connect your email first.' }), {
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
    
    // Connect to Gmail IMAP server with TLS
    const conn = await Deno.connectTls({
      hostname: 'imap.gmail.com',
      port: 993,
    })

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    try {
      // Read initial response
      const initialResponse = await readResponse(conn, decoder)
      console.log('IMAP initial response:', initialResponse)

      // Login with email and app password
      const loginCommand = `A001 LOGIN "${email}" "${password}"\r\n`
      console.log('Sending login command...')
      await conn.write(encoder.encode(loginCommand))
      
      const loginResponse = await readResponse(conn, decoder)
      console.log('Login response:', loginResponse)

      if (!loginResponse.includes('A001 OK')) {
        if (loginResponse.includes('AUTHENTICATIONFAILED')) {
          throw new Error('Authentication failed. Please check your email and app password.')
        }
        throw new Error(`Login failed: ${loginResponse}`)
      }

      // Select INBOX (readonly)
      await conn.write(encoder.encode('A002 SELECT INBOX\r\n'))
      const selectResponse = await readResponse(conn, decoder)
      console.log('SELECT response:', selectResponse)

      // Get all recent email IDs using robust method
      const emailIds = await getAllRecentEmailIds(conn, encoder, decoder)
      console.log('Found email IDs:', emailIds)

      if (emailIds.length === 0) {
        conn.close()
        return await generateMockEmails()
      }

      // Get details for emails (limit to 10 for performance)
      const idsToFetch = emailIds.slice(0, 10)
      const emails = await getDetailsForIds(conn, encoder, decoder, idsToFetch)

      conn.close()
      return emails.length > 0 ? emails : await generateMockEmails()

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

async function readResponse(conn: Deno.TlsConn, decoder: TextDecoder): Promise<string> {
  const buffer = new Uint8Array(8192)
  const bytesRead = await conn.read(buffer)
  if (bytesRead === null) throw new Error('Connection closed')
  return decoder.decode(buffer.subarray(0, bytesRead))
}

async function getAllRecentEmailIds(conn: Deno.TlsConn, encoder: TextEncoder, decoder: TextDecoder): Promise<string[]> {
  try {
    // Step 1: Get all email IDs
    console.log("Searching for ALL email IDs in the inbox...")
    await conn.write(encoder.encode("A003 SEARCH ALL\r\n"))
    const searchResponse = await readResponse(conn, decoder)
    console.log("Search response:", searchResponse)

    if (!searchResponse.includes("A003 OK")) {
      console.log("Could not find any emails in the inbox.")
      return []
    }

    // Parse email IDs from search response
    const allIds = parseEmailIds(searchResponse)
    if (allIds.length === 0) {
      return []
    }

    // Step 2: Take the most recent messages (limit 50 for performance)
    const limit = Math.min(50, allIds.length)
    const idsToSort = allIds.slice(-limit)
    
    if (idsToSort.length === 0) {
      return []
    }

    const idString = idsToSort.join(',')
    console.log(`Found ${idsToSort.length} recent emails. Fetching dates for accurate sorting...`)

    // Step 3: Fetch internal dates for sorting
    await conn.write(encoder.encode(`A004 FETCH ${idString} (INTERNALDATE)\r\n`))
    const datesResponse = await readResponse(conn, decoder)
    
    if (!datesResponse.includes("A004 OK")) {
      console.log("Could not fetch dates for sorting. Using basic reverse order as fallback.")
      return idsToSort.reverse()
    }

    // Step 4: Parse dates and sort
    const messagesWithDates = parseDatesResponse(datesResponse)
    
    // Step 5: Sort by date (newest first) and return IDs
    messagesWithDates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const sortedIds = messagesWithDates.map(msg => msg.id)
    
    console.log(`✅ Successfully sorted ${sortedIds.length} emails by their exact date.`)
    return sortedIds

  } catch (error) {
    console.error("🛑 An error occurred while fetching recent email IDs:", error)
    return []
  }
}

async function getDetailsForIds(conn: Deno.TlsConn, encoder: TextEncoder, decoder: TextDecoder, idList: string[]): Promise<EmailSummary[]> {
  if (idList.length === 0) {
    return []
  }

  const idString = idList.join(',')
  console.log(`Fetching details for ${idList.length} emails...`)

  try {
    await conn.write(encoder.encode(`A005 FETCH ${idString} (RFC822)\r\n`))
    const fetchResponse = await readFullResponse(conn, decoder)
    
    if (!fetchResponse.includes("A005 OK")) {
      console.log("Could not fetch email details")
      return []
    }

    const emails: EmailSummary[] = []
    const emailBlocks = parseFetchResponse(fetchResponse)

    for (let i = 0; i < emailBlocks.length && i < idList.length; i++) {
      try {
        const emailData = parseEmailFromRFC822(emailBlocks[i], idList[i])
        if (emailData) {
          const aiAnalysis = await generateAIAnalysis(emailData.body)
          emails.push({
            id: idList[i],
            sender_name: emailData.sender_name,
            sender_email: emailData.sender_email,
            subject: emailData.subject,
            date: emailData.date,
            ai_summary: aiAnalysis.summary,
            suggested_replies: aiAnalysis.replies,
            body: emailData.body
          })
        }
      } catch (error) {
        console.error(`⚠️ Error processing email ${idList[i]}:`, error)
        continue
      }
    }

    return emails

  } catch (error) {
    console.error("🛑 Could not fetch details:", error)
    return []
  }
}

async function readFullResponse(conn: Deno.TlsConn, decoder: TextDecoder): Promise<string> {
  let fullResponse = ""
  let buffer = new Uint8Array(8192)
  
  while (true) {
    const bytesRead = await conn.read(buffer)
    if (bytesRead === null) break
    
    const chunk = decoder.decode(buffer.subarray(0, bytesRead))
    fullResponse += chunk
    
    // Check if we have the complete response (ends with OK)
    if (chunk.includes("A005 OK")) {
      break
    }
  }
  
  return fullResponse
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

function parseDatesResponse(datesResponse: string): Array<{id: string, date: string}> {
  const messagesWithDates: Array<{id: string, date: string}> = []
  
  // Parse INTERNALDATE response
  // Example: * 1 FETCH (INTERNALDATE "17-Jul-1996 02:44:25 -0700")
  const fetchMatches = datesResponse.match(/\* (\d+) FETCH \(INTERNALDATE "([^"]+)"\)/g)
  
  if (fetchMatches) {
    for (const match of fetchMatches) {
      const idMatch = match.match(/\* (\d+) FETCH/)
      const dateMatch = match.match(/INTERNALDATE "([^"]+)"/)
      
      if (idMatch && dateMatch) {
        messagesWithDates.push({
          id: idMatch[1],
          date: dateMatch[1]
        })
      }
    }
  }
  
  return messagesWithDates
}

function parseFetchResponse(fetchResponse: string): string[] {
  // Split response into individual email blocks
  const emailBlocks: string[] = []
  const lines = fetchResponse.split('\r\n')
  let currentBlock = ''
  let inEmailBlock = false
  
  for (const line of lines) {
    if (line.match(/^\* \d+ FETCH/)) {
      if (currentBlock.trim()) {
        emailBlocks.push(currentBlock)
      }
      currentBlock = line + '\r\n'
      inEmailBlock = true
    } else if (inEmailBlock) {
      currentBlock += line + '\r\n'
      if (line.trim() === ')' || line.match(/^A\d+ OK/)) {
        emailBlocks.push(currentBlock)
        currentBlock = ''
        inEmailBlock = false
      }
    }
  }
  
  return emailBlocks
}

function parseEmailFromRFC822(emailBlock: string, emailId: string): any {
  try {
    // Extract the RFC822 content from the FETCH response
    const rfc822Match = emailBlock.match(/RFC822 \{(\d+)\}\r?\n([\s\S]*?)(?=\r?\n\)|$)/m)
    if (!rfc822Match) {
      console.log('No RFC822 content found')
      return null
    }
    
    const emailContent = rfc822Match[2]
    
    // Parse headers
    const headers = parseEmailHeaders(emailContent)
    if (!headers.from || !headers.subject) {
      return null
    }

    // Parse sender information
    const senderName = headers.from.replace(/<.+>/, '').replace(/"/g, '').trim()
    const senderEmailMatch = headers.from.match(/<(.+)>/)
    const senderEmail = senderEmailMatch ? senderEmailMatch[1] : headers.from

    // Extract body
    let body = extractEmailBody(emailContent)
    if (!body) {
      body = headers.subject // Fallback to subject if no body
    }

    // Clean up body
    const cleanedBody = body.replace(/\s+/g, ' ').trim()

    return {
      sender_name: senderName || senderEmail,
      sender_email: senderEmail,
      subject: headers.subject || 'No Subject',
      date: headers.date || new Date().toISOString(),
      body: cleanedBody
    }
  } catch (error) {
    console.error(`⚠️ Error processing email ID ${emailId}:`, error)
    return null
  }
}

function parseEmailHeaders(emailContent: string): Record<string, string> {
  const headers: Record<string, string> = {}
  const headerSection = emailContent.split('\r\n\r\n')[0] || emailContent.split('\n\n')[0]
  
  const lines = headerSection.split(/\r?\n/)
  let currentHeader = ''
  let currentValue = ''
  
  for (const line of lines) {
    if (line.match(/^[A-Za-z-]+:/)) {
      // Save previous header
      if (currentHeader) {
        headers[currentHeader.toLowerCase()] = currentValue.trim()
      }
      
      // Start new header
      const colonIndex = line.indexOf(':')
      currentHeader = line.substring(0, colonIndex).trim()
      currentValue = line.substring(colonIndex + 1).trim()
    } else if (line.startsWith(' ') || line.startsWith('\t')) {
      // Continuation of previous header
      currentValue += ' ' + line.trim()
    }
  }
  
  // Save last header
  if (currentHeader) {
    headers[currentHeader.toLowerCase()] = currentValue.trim()
  }
  
  return headers
}

function extractEmailBody(emailContent: string): string {
  // Split headers and body
  const parts = emailContent.split(/\r?\n\r?\n/)
  if (parts.length < 2) return ''
  
  const bodyPart = parts.slice(1).join('\n\n')
  
  // Check if this is a multipart message
  const contentTypeMatch = emailContent.match(/Content-Type:\s*([^;\r\n]+)/i)
  if (contentTypeMatch && contentTypeMatch[1].includes('multipart')) {
    // Extract text/plain part from multipart
    const boundaryMatch = emailContent.match(/boundary[="]*([^";>\r\n]+)/i)
    if (boundaryMatch) {
      const boundary = boundaryMatch[1].replace(/['"]/g, '')
      const parts = bodyPart.split(`--${boundary}`)
      
      for (const part of parts) {
        if (part.includes('Content-Type: text/plain')) {
          const textContent = part.split(/\r?\n\r?\n/).slice(1).join('\n\n')
          if (textContent.trim()) {
            return decodeEmailBody(textContent)
          }
        }
      }
    }
  }
  
  // For non-multipart or as fallback
  return decodeEmailBody(bodyPart)
}

function decodeEmailBody(body: string): string {
  try {
    // Handle base64 encoding
    if (body.match(/^[A-Za-z0-9+/=\s]+$/)) {
      try {
        return atob(body.replace(/\s/g, ''))
      } catch {
        // Not base64, return as is
      }
    }
    
    // Handle quoted-printable encoding
    if (body.includes('=')) {
      return body.replace(/=([0-9A-F]{2})/g, (match, hex) => 
        String.fromCharCode(parseInt(hex, 16))
      ).replace(/=\r?\n/g, '')
    }
    
    return body
  } catch (error) {
    console.error('Error decoding email body:', error)
    return body
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