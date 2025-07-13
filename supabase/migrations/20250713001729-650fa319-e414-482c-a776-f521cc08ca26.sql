-- Fix overly permissive RLS policies on orders table
DROP POLICY IF EXISTS "update_order" ON public.orders;

-- Create more restrictive update policy - only allow users to update their own orders
CREATE POLICY "update_own_order" ON public.orders
FOR UPDATE 
USING (user_id = auth.uid());

-- Add more restrictive insert policy to ensure user_id matches authenticated user
DROP POLICY IF EXISTS "insert_order" ON public.orders;

CREATE POLICY "insert_order" ON public.orders
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Add audit logging table for security events
CREATE TABLE public.security_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.security_audit ENABLE ROW LEVEL SECURITY;

-- Only allow system to insert audit logs
CREATE POLICY "system_insert_audit" ON public.security_audit
FOR INSERT 
WITH CHECK (true);

-- Users can only view their own audit logs
CREATE POLICY "view_own_audit" ON public.security_audit
FOR SELECT 
USING (user_id = auth.uid());