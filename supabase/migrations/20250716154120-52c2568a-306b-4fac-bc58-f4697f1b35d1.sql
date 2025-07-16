-- Create table for storing user AI tool preferences
CREATE TABLE public.ai_tool_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  priority TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  tool_preference TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_tool_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own AI tool preferences" 
ON public.ai_tool_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI tool preferences" 
ON public.ai_tool_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI tool preferences" 
ON public.ai_tool_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create table for system upgrade waitlist
CREATE TABLE public.system_upgrade_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.system_upgrade_waitlist ENABLE ROW LEVEL SECURITY;

-- Create policies for waitlist
CREATE POLICY "Anyone can join the waitlist" 
ON public.system_upgrade_waitlist 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own waitlist entries" 
ON public.system_upgrade_waitlist 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_tool_preferences_updated_at
BEFORE UPDATE ON public.ai_tool_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();