import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Secure AES-GCM encryption for email passwords
const generateKey = async (): Promise<CryptoKey> => {
  return await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
};

const getOrCreateMasterKey = async (): Promise<CryptoKey> => {
  // In production, this should be managed by a proper key management service
  // For now, we'll use a deterministic key derived from environment
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.substring(0, 32) || 'fallback-key-32-chars-long-123'),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  
  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode("email-credential-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

const encryptPassword = async (password: string): Promise<string> => {
  try {
    const key = await getOrCreateMasterKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedPassword = new TextEncoder().encode(password);
    
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encodedPassword
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Return base64 encoded result
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt password');
  }
};

const decryptPassword = async (encryptedPassword: string): Promise<string> => {
  try {
    const key = await getOrCreateMasterKey();
    const combined = new Uint8Array(
      atob(encryptedPassword).split('').map(char => char.charCodeAt(0))
    );
    
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    // Fallback for legacy base64 encoded passwords
    try {
      const decoded = atob(encryptedPassword);
      if (decoded.includes('_encrypted_')) {
        return decoded.split('_encrypted_')[0];
      }
    } catch {}
    throw new Error('Failed to decrypt password');
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
      const encryptedPassword = await encryptPassword(password);

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
      let decryptedPassword: string;
      if (credentials.encrypted_password) {
        try {
          decryptedPassword = await decryptPassword(credentials.encrypted_password);
        } catch (error) {
          console.error('Failed to decrypt password, falling back to plain text:', error);
          decryptedPassword = credentials.password || '';
        }
      } else {
        decryptedPassword = credentials.password || '';
      }

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