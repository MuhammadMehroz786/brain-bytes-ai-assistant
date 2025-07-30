-- Create table to store email credentials
CREATE TABLE public.email_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,
  password TEXT NOT NULL, -- This will be encrypted
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.email_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own email credentials" 
ON public.email_credentials 
FOR ALL 
USING (auth.uid() = user_id);

-- Create table to store processed emails
CREATE TABLE public.processed_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_id TEXT NOT NULL,
  sender_name TEXT,
  sender_email TEXT,
  subject TEXT,
  date TEXT,
  ai_summary TEXT,
  suggested_replies JSONB,
  body TEXT,
  is_done BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, email_id)
);

-- Enable RLS
ALTER TABLE public.processed_emails ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own processed emails" 
ON public.processed_emails 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_email_credentials_updated_at
BEFORE UPDATE ON public.email_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();