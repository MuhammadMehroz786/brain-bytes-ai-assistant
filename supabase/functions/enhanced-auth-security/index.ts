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

const validateInput = (input: string, type: 'email' | 'password'): { isValid: boolean; error?: string } => {
  if (!input || !input.trim()) {
    return { isValid: false, error: `${type} is required` };
  }

  if (type === 'email') {
    const trimmedEmail = input.trim();
    if (trimmedEmail.length > 320) {
      return { isValid: false, error: "Email address is too long" };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { isValid: false, error: "Please enter a valid email address" };
    }
  }

  if (type === 'password') {
    if (input.length < 6) {
      return { isValid: false, error: "Password must be at least 6 characters long" };
    }
    if (input.length > 128) {
      return { isValid: false, error: "Password must be less than 128 characters" };
    }
    
    // Check password strength
    const hasLowerCase = /[a-z]/.test(input);
    const hasUpperCase = /[A-Z]/.test(input);
    const hasNumbers = /\d/.test(input);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(input);
    
    const strengthChecks = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChar];
    const strengthScore = strengthChecks.filter(Boolean).length;
    
    if (strengthScore < 2) {
      return { 
        isValid: false, 
        error: "Password should contain at least 2 of: lowercase, uppercase, numbers, special characters" 
      };
    }
  }

  return { isValid: true };
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>"'&]/g, '');
};

const getClientIP = (req: Request): string => {
  return req.headers.get('x-forwarded-for')?.split(',')[0] || 
         req.headers.get('x-real-ip') || 
         'unknown';
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { action, email, password } = await req.json();
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Sanitize inputs
    const sanitizedEmail = email ? sanitizeInput(email.toLowerCase()) : '';
    const sanitizedPassword = password ? sanitizeInput(password) : '';

    // Validate inputs
    if (sanitizedEmail) {
      const emailValidation = validateInput(sanitizedEmail, 'email');
      if (!emailValidation.isValid) {
        return new Response(JSON.stringify({ error: emailValidation.error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (sanitizedPassword) {
      const passwordValidation = validateInput(sanitizedPassword, 'password');
      if (!passwordValidation.isValid) {
        return new Response(JSON.stringify({ error: passwordValidation.error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Check rate limits
    const eventType = action === 'signup' ? 'signup_attempt' : 'login_attempt';
    const maxAttempts = action === 'signup' ? 3 : 5;
    
    const securityCheck = await supabaseClient.rpc('enhanced_security_check', {
      event_type_param: eventType,
      ip_param: clientIP,
      max_attempts: maxAttempts,
      window_minutes: 15
    });

    if (!securityCheck.data?.allowed) {
      // Log rate limit violation
      await supabaseClient.from('enhanced_security_audit').insert({
        event_type: `${eventType}_rate_limit_exceeded`,
        event_details: {
          email: sanitizedEmail.substring(0, 3) + '***',
          ip_address: clientIP,
          user_agent: userAgent,
          security_check: securityCheck.data
        },
        ip_address: clientIP,
        user_agent: userAgent,
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

    let result;
    let userId = null;

    if (action === 'signup') {
      result = await supabaseClient.auth.signUp({
        email: sanitizedEmail,
        password: sanitizedPassword,
        options: {
          emailRedirectTo: `${req.headers.get('origin') || 'http://localhost:8080'}/`
        }
      });
      userId = result.data.user?.id;
    } else if (action === 'login') {
      result = await supabaseClient.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword
      });
      userId = result.data.user?.id;
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log the attempt
    await supabaseClient.from('enhanced_security_audit').insert({
      user_id: userId,
      event_type: eventType,
      event_details: {
        email: sanitizedEmail.substring(0, 3) + '***',
        success: !result.error,
        error: result.error?.message,
        ip_address: clientIP,
        user_agent: userAgent
      },
      ip_address: clientIP,
      user_agent: userAgent,
      risk_score: result.error ? 75 : 25
    });

    if (result.error) {
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      user: result.data.user,
      session: result.data.session
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced-auth-security function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});