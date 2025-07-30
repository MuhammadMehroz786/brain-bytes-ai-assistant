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
    console.log(`Testing IMAP connection for ${email}`)
    
    // Validate email format
    if (!email.includes('@') || password.length < 1) {
      return { success: false, error: 'Invalid email or password format' }
    }
    
    // Connect to Gmail IMAP server
    const conn = await Deno.connect({
      hostname: 'imap.gmail.com',
      port: 993, // SSL port for IMAP
    })

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    try {
      // Read initial response
      const buffer = new Uint8Array(1024)
      const bytesRead = await conn.read(buffer)
      if (bytesRead === null) throw new Error('Connection closed')
      const response = decoder.decode(buffer.subarray(0, bytesRead))
      console.log('IMAP initial response:', response)

      // Send login command
      const loginCommand = `A001 LOGIN ${email} ${password}\r\n`
      await conn.write(encoder.encode(loginCommand))
      
      // Read login response
      const loginBuffer = new Uint8Array(1024)
      const loginBytesRead = await conn.read(loginBuffer)
      if (loginBytesRead === null) throw new Error('Connection closed')
      const loginResponse = decoder.decode(loginBuffer.subarray(0, loginBytesRead))
      console.log('IMAP login response:', loginResponse)

      conn.close()

      // Check if login was successful
      if (loginResponse.includes('A001 OK')) {
        console.log('IMAP connection test successful')
        return { success: true }
      } else {
        console.log('IMAP login failed:', loginResponse)
        return { success: false, error: 'Invalid credentials or IMAP access not enabled' }
      }
    } catch (error) {
      conn.close()
      throw error
    }
  } catch (error) {
    console.error('IMAP connection test failed:', error)
    return { success: false, error: 'Failed to connect to IMAP server. Please check credentials and ensure IMAP is enabled.' }
  }
}