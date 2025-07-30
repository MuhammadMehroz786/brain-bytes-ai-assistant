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

    const { email, password } = await req.json()

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Test IMAP connection
    const testConnection = await testIMAPConnection(email, password)
    if (!testConnection.success) {
      return new Response(JSON.stringify({ error: testConnection.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Store credentials (in production, encrypt the password)
    const { error: storeError } = await supabaseClient
      .from('email_credentials')
      .upsert({
        user_id: user.id,
        email_address: email,
        password: password, // In production, encrypt this
      })

    if (storeError) {
      console.error('Error storing credentials:', storeError)
      return new Response(JSON.stringify({ error: 'Failed to store credentials' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in connect-email-imap:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function testIMAPConnection(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Since Deno doesn't have direct IMAP support, we'll use a basic approach
    // For a production app, you'd want to use a proper IMAP library
    
    // For now, we'll do a basic validation
    if (!email.includes('@') || password.length < 1) {
      return { success: false, error: 'Invalid email or password format' }
    }
    
    // In a real implementation, you would:
    // 1. Create an IMAP connection to imap.gmail.com:993
    // 2. Attempt to login with the credentials
    // 3. Return success/failure based on the result
    
    // For now, we'll assume the connection is valid if the format is correct
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to test IMAP connection' }
  }
}