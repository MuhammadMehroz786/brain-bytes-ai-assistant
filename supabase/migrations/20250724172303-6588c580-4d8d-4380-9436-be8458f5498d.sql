-- Fix function search path security issues
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_streak(uuid) CASCADE;

-- Recreate update_updated_at_column with secure search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Recreate update_user_streak with secure search_path
CREATE OR REPLACE FUNCTION public.update_user_streak(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  today_date DATE := CURRENT_DATE;
  yesterday_date DATE := CURRENT_DATE - INTERVAL '1 day';
  current_streak_val INTEGER;
  last_session_date_val DATE;
BEGIN
  -- Get current streak data
  SELECT current_streak, last_session_date 
  INTO current_streak_val, last_session_date_val
  FROM public.user_streaks 
  WHERE user_id = user_id_param;
  
  -- If no streak record exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_session_date)
    VALUES (user_id_param, 1, 1, today_date);
    RETURN;
  END IF;
  
  -- If last session was today, don't update streak
  IF last_session_date_val = today_date THEN
    RETURN;
  END IF;
  
  -- If last session was yesterday, increment streak
  IF last_session_date_val = yesterday_date THEN
    UPDATE public.user_streaks 
    SET 
      current_streak = current_streak_val + 1,
      longest_streak = GREATEST(longest_streak, current_streak_val + 1),
      last_session_date = today_date,
      updated_at = now()
    WHERE user_id = user_id_param;
  -- If last session was more than a day ago, reset streak
  ELSE
    UPDATE public.user_streaks 
    SET 
      current_streak = 1,
      longest_streak = GREATEST(longest_streak, 1),
      last_session_date = today_date,
      updated_at = now()
    WHERE user_id = user_id_param;
  END IF;
END;
$function$;

-- Fix IP address validation issues in security_audit table
-- Create a function to safely parse IP addresses
CREATE OR REPLACE FUNCTION public.safe_inet_cast(ip_text text)
RETURNS inet
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Handle comma-separated IPs by taking the first valid one
  IF ip_text IS NULL OR ip_text = '' THEN
    RETURN NULL;
  END IF;
  
  -- Split by comma and take first part, trim whitespace
  DECLARE
    clean_ip text := trim(split_part(ip_text, ',', 1));
  BEGIN
    -- Validate that it's a proper IP format
    IF clean_ip ~ '^([0-9]{1,3}\.){3}[0-9]{1,3}$' OR clean_ip ~ '^([0-9a-fA-F:]+)$' THEN
      RETURN clean_ip::inet;
    ELSE
      RETURN NULL;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN NULL;
  END;
END;
$function$;

-- Add constraint to validate IP addresses properly
ALTER TABLE public.security_audit 
DROP CONSTRAINT IF EXISTS valid_ip_address;

-- Add a check constraint using our safe function
ALTER TABLE public.security_audit 
ADD CONSTRAINT valid_ip_address 
CHECK (ip_address IS NULL OR public.safe_inet_cast(ip_address::text) IS NOT NULL);

-- Recreate triggers with the updated function
DROP TRIGGER IF EXISTS update_user_streaks_updated_at ON public.user_streaks;
DROP TRIGGER IF EXISTS update_focus_sessions_updated_at ON public.focus_sessions;
DROP TRIGGER IF EXISTS update_gmail_tokens_updated_at ON public.gmail_tokens;
DROP TRIGGER IF EXISTS update_ai_tool_preferences_updated_at ON public.ai_tool_preferences;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;

CREATE TRIGGER update_user_streaks_updated_at
    BEFORE UPDATE ON public.user_streaks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_focus_sessions_updated_at
    BEFORE UPDATE ON public.focus_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gmail_tokens_updated_at
    BEFORE UPDATE ON public.gmail_tokens
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_tool_preferences_updated_at
    BEFORE UPDATE ON public.ai_tool_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();