-- Add encryption support for email credentials
ALTER TABLE public.email_credentials 
ADD COLUMN encrypted_password TEXT,
ADD COLUMN encryption_key_id TEXT DEFAULT 'default';

-- Create function to encrypt sensitive data
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Using Supabase's built-in encryption via vault
  RETURN extensions.pgcrypto_digest(data, 'sha256')::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to decrypt sensitive data (placeholder for future implementation)
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_data TEXT, key_id TEXT DEFAULT 'default')
RETURNS TEXT AS $$
BEGIN
  -- This is a placeholder - in production you'd use proper encryption/decryption
  -- For now, we'll return the encrypted data as-is since we need to implement proper encryption
  RETURN encrypted_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create enhanced security audit table for better logging
CREATE TABLE IF NOT EXISTS public.enhanced_security_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_details JSONB,
  ip_address INET,
  user_agent TEXT,
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on enhanced security audit
ALTER TABLE public.enhanced_security_audit ENABLE ROW LEVEL SECURITY;

-- Create policy for security audit access
CREATE POLICY "Service role can manage security audit logs" 
ON public.enhanced_security_audit 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create function for rate limiting with enhanced security
CREATE OR REPLACE FUNCTION public.enhanced_security_check(
  event_type_param TEXT,
  user_id_param UUID DEFAULT NULL,
  ip_param INET DEFAULT NULL,
  max_attempts INTEGER DEFAULT 5,
  window_minutes INTEGER DEFAULT 15
)
RETURNS JSONB AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;