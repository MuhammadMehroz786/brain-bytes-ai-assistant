-- Sanitize legacy plaintext passwords by nullifying, then drop the column
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='email_credentials' AND column_name='password'
  ) THEN
    UPDATE public.email_credentials SET password = NULL WHERE password IS NOT NULL;
    ALTER TABLE public.email_credentials DROP COLUMN password;
  END IF;
END $$;

-- Ensure one credentials row per user
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'email_credentials_user_id_key'
  ) THEN
    ALTER TABLE public.email_credentials
      ADD CONSTRAINT email_credentials_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Ensure one gmail token row per user
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gmail_tokens_user_id_key'
  ) THEN
    ALTER TABLE public.gmail_tokens
      ADD CONSTRAINT gmail_tokens_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Tighten RLS for email_credentials: disallow SELECT from clients
DROP POLICY IF EXISTS "Users can manage their own email credentials" ON public.email_credentials;

CREATE POLICY "Users can insert their own email credentials"
ON public.email_credentials
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email credentials"
ON public.email_credentials
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email credentials"
ON public.email_credentials
FOR DELETE
USING (auth.uid() = user_id);

-- Restrict SELECT on gmail_tokens by removing client read policy
DROP POLICY IF EXISTS "Users can view their own Gmail tokens" ON public.gmail_tokens;
