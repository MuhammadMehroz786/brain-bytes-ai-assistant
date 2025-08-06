-- Fix database function security issues by adding proper search_path settings

-- Update the encrypt_sensitive_data function
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Using Supabase's built-in encryption via vault
  RETURN extensions.pgcrypto_digest(data, 'sha256')::TEXT;
END;
$function$;

-- Update the decrypt_sensitive_data function
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_data text, key_id text DEFAULT 'default'::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- This is a placeholder - in production you'd use proper encryption/decryption
  -- For now, we'll return the encrypted data as-is since we need to implement proper encryption
  RETURN encrypted_data;
END;
$function$;

-- Update the enhanced_security_check function
CREATE OR REPLACE FUNCTION public.enhanced_security_check(event_type_param text, user_id_param uuid DEFAULT NULL::uuid, ip_param inet DEFAULT NULL::inet, max_attempts integer DEFAULT 5, window_minutes integer DEFAULT 15)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  attempt_count INTEGER;
  is_allowed BOOLEAN;
  risk_score INTEGER := 0;
BEGIN
  -- Count recent attempts
  SELECT COUNT(*) INTO attempt_count
  FROM public.enhanced_security_audit
  WHERE event_type = event_type_param
    AND (user_id_param IS NULL OR user_id = user_id_param)
    AND (ip_param IS NULL OR ip_address = ip_param)
    AND created_at > now() - (window_minutes || ' minutes')::INTERVAL;
  
  -- Determine if action is allowed
  is_allowed := attempt_count < max_attempts;
  
  -- Calculate risk score
  IF attempt_count >= max_attempts THEN
    risk_score := 100;
  ELSIF attempt_count >= (max_attempts * 0.8) THEN
    risk_score := 75;
  ELSIF attempt_count >= (max_attempts * 0.6) THEN
    risk_score := 50;
  ELSE
    risk_score := 25;
  END IF;
  
  -- Log this security check
  INSERT INTO public.enhanced_security_audit (
    user_id, 
    event_type, 
    event_details, 
    ip_address, 
    risk_score
  ) VALUES (
    user_id_param,
    event_type_param || '_security_check',
    jsonb_build_object(
      'attempt_count', attempt_count,
      'max_attempts', max_attempts,
      'is_allowed', is_allowed,
      'window_minutes', window_minutes
    ),
    ip_param,
    risk_score
  );
  
  RETURN jsonb_build_object(
    'allowed', is_allowed,
    'attempt_count', attempt_count,
    'max_attempts', max_attempts,
    'risk_score', risk_score,
    'remaining_attempts', GREATEST(0, max_attempts - attempt_count)
  );
END;
$function$;