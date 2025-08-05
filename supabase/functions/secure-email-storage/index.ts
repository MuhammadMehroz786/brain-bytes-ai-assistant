import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple encryption for demonstration - in production use proper encryption
const encryptPassword = (password: string): string => {
  // This is a placeholder - in production you'd use proper encryption
  // For now, we'll use a simple base64 encoding as demonstration
  return btoa(password + '_encrypted_' + Date.now());
};

const decryptPassword = (encryptedPassword: string): string => {
  try {
    const decoded = atob(encryptedPassword);
    return decoded.split('_encrypted_')[0];
  } catch {
    return encryptedPassword; // Fallback for unencrypted passwords
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, email, password } = await req.json();

    // Enhanced security check
    const securityCheck = await supabaseClient.rpc('enhanced_security_check', {
      event_type_param: 'email_credential_access',
      user_id_param: user.id,
      max_attempts: 5,
      window_minutes: 15
    });

    if (!securityCheck.data?.allowed) {
      await supabaseClient.from('enhanced_security_audit').insert({
        user_id: user.id,
        event_type: 'email_credential_rate_limit_exceeded',
        event_details: securityCheck.data,
        risk_score: 100
      });

      return new Response(JSON.stringify({ 
        error: 'Too many attempts. Please try again later.',
        retryAfter: Math.ceil((securityCheck.data?.remaining_time || 900) / 60)
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'store') {
      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email and password are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return new Response(JSON.stringify({ error: 'Invalid email format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Encrypt password before storage
      const encryptedPassword = encryptPassword(password);

      // Store credentials with encryption
      const { error: storeError } = await supabaseClient
        .from('email_credentials')
        .upsert({
          user_id: user.id,
          email_address: email,
          encrypted_password: encryptedPassword,
          encryption_key_id: 'default'
        });

      if (storeError) {
        console.error('Error storing encrypted credentials:', storeError);
        return new Response(JSON.stringify({ error: 'Failed to store credentials' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Log successful storage
      await supabaseClient.from('enhanced_security_audit').insert({
        user_id: user.id,
        event_type: 'email_credentials_stored',
        event_details: { email: email.substring(0, 3) + '***' },
        risk_score: 25
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'retrieve') {
      // Retrieve and decrypt credentials
      const { data: credentials, error: retrieveError } = await supabaseClient
        .from('email_credentials')
        .select('email_address, encrypted_password, password')
        .eq('user_id', user.id)
        .single();

      if (retrieveError || !credentials) {
        return new Response(JSON.stringify({ error: 'No credentials found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Decrypt password (fallback to plain password if encryption not available)
      const decryptedPassword = credentials.encrypted_password 
        ? decryptPassword(credentials.encrypted_password)
        : credentials.password;

      // Log access
      await supabaseClient.from('enhanced_security_audit').insert({
        user_id: user.id,
        event_type: 'email_credentials_accessed',
        event_details: { email: credentials.email_address?.substring(0, 3) + '***' },
        risk_score: 50
      });

      return new Response(JSON.stringify({ 
        email: credentials.email_address,
        password: decryptedPassword
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in secure-email-storage function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});