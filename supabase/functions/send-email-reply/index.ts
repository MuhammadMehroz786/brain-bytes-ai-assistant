import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { to_email, subject, reply_text, message_id_header } = await req.json()

    if (!to_email || !subject || !reply_text) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
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

    // Send email (mock implementation for now)
    const success = await sendEmailReply({
      from: credentials.email_address,
      password: credentials.password,
      to: to_email,
      subject: subject.startsWith('Re:') ? subject : `Re: ${subject}`,
      body: reply_text,
      inReplyTo: message_id_header
    })

    if (success) {
      return new Response(JSON.stringify({ status: 'success', message: 'Reply sent successfully!' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else {
      return new Response(JSON.stringify({ status: 'error', message: 'Failed to send reply' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

  } catch (error) {
    console.error('Error in send-email-reply:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function sendEmailReply(params: {
  from: string
  password: string
  to: string
  subject: string
  body: string
  inReplyTo?: string
}): Promise<boolean> {
  try {
    // Mock implementation - in production, this would use SMTP
    console.log('Sending email reply:', {
      from: params.from,
      to: params.to,
      subject: params.subject,
      body: params.body,
      inReplyTo: params.inReplyTo
    })
    
    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // For now, always return success
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}