-- Add missing SELECT policy for email_credentials table
CREATE POLICY "Users can view their own email credentials" 
ON public.email_credentials 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update RLS policies for processed_emails to be more granular
DROP POLICY IF EXISTS "Users can manage their own processed emails" ON public.processed_emails;

CREATE POLICY "Users can view their own processed emails" 
ON public.processed_emails 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own processed emails" 
ON public.processed_emails 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own processed emails" 
ON public.processed_emails 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own processed emails" 
ON public.processed_emails 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add additional security logging table for better audit trail
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL,
  event_details jsonb,
  severity text NOT NULL DEFAULT 'low',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security_events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only service role can manage security events
CREATE POLICY "Service role can manage security events" 
ON public.security_events 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type_param text,
  event_details_param jsonb DEFAULT NULL,
  severity_param text DEFAULT 'low',
  user_id_param uuid DEFAULT auth.uid(),
  ip_param inet DEFAULT NULL,
  user_agent_param text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_events (
    user_id,
    event_type,
    event_details,
    severity,
    ip_address,
    user_agent
  ) VALUES (
    user_id_param,
    event_type_param,
    event_details_param,
    severity_param,
    ip_param,
    user_agent_param
  );
END;
$$;