-- Create Brain Bytes Pro waitlist table
CREATE TABLE public.brain_bytes_pro_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.brain_bytes_pro_waitlist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can join Brain Bytes Pro waitlist" 
ON public.brain_bytes_pro_waitlist 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own Brain Bytes Pro waitlist entry" 
ON public.brain_bytes_pro_waitlist 
FOR SELECT 
USING (auth.uid() = user_id);