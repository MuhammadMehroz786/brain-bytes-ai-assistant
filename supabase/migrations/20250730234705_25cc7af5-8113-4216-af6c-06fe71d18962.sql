-- Create user_onboarding_responses table to store new questionnaire responses
CREATE TABLE public.user_onboarding_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_goal TEXT NOT NULL, -- What are you mainly trying to achieve with AI?
  workflow_type TEXT NOT NULL, -- Which best describes your daily workflow?
  biggest_challenge TEXT NOT NULL, -- What's your biggest current challenge?
  learning_preference TEXT NOT NULL, -- How do you prefer to learn new tools?
  focus_time TEXT NOT NULL, -- When do you usually do focused work?
  work_description TEXT, -- Optional: What do you do for work?
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_onboarding_responses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own onboarding responses" 
ON public.user_onboarding_responses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own onboarding responses" 
ON public.user_onboarding_responses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding responses" 
ON public.user_onboarding_responses 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create feedback table for the feedback collection feature
CREATE TABLE public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for feedback
CREATE POLICY "Users can insert their own feedback" 
ON public.user_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" 
ON public.user_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE TRIGGER update_user_onboarding_responses_updated_at
BEFORE UPDATE ON public.user_onboarding_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();