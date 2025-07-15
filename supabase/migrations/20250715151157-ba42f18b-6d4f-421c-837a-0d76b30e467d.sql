-- Create focus sessions table
CREATE TABLE public.focus_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'focus',
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  was_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for focus sessions
CREATE POLICY "Users can view their own focus sessions" 
ON public.focus_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own focus sessions" 
ON public.focus_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own focus sessions" 
ON public.focus_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own focus sessions" 
ON public.focus_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create user streaks table
CREATE TABLE public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_session_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Create policies for user streaks
CREATE POLICY "Users can view their own streak" 
ON public.user_streaks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own streak" 
ON public.user_streaks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streak" 
ON public.user_streaks 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_focus_sessions_updated_at
BEFORE UPDATE ON public.focus_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at
BEFORE UPDATE ON public.user_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update streak when session is completed
CREATE OR REPLACE FUNCTION public.update_user_streak(user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;