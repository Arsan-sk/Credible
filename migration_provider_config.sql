-- ═══════════════════════════════════════════════════════════════════════════
-- CREDIBLE — Database Migration: Multi-Provider API & Model Configuration
-- Run this in Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Upgrade user_api_keys table with provider, models, and metadata
ALTER TABLE public.user_api_keys
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'openrouter',
ADD COLUMN IF NOT EXISTS selected_model TEXT,
ADD COLUMN IF NOT EXISTS agent1_model TEXT,
ADD COLUMN IF NOT EXISTS agent2_model TEXT,
ADD COLUMN IF NOT EXISTS use_same_model BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_used TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 2. Add UPDATE policy for user_api_keys to allow users to update their keys
DROP POLICY IF EXISTS "Users can update own api keys" ON public.user_api_keys;
CREATE POLICY "Users can update own api keys"
  ON public.user_api_keys FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. Upgrade attempts and guest_attempts tables to store generation metadata
ALTER TABLE public.attempts
ADD COLUMN IF NOT EXISTS provider TEXT,
ADD COLUMN IF NOT EXISTS model TEXT;

ALTER TABLE public.guest_attempts
ADD COLUMN IF NOT EXISTS provider TEXT,
ADD COLUMN IF NOT EXISTS model TEXT;

-- 4. Re-create store_api_key RPC function to support the new configuration
CREATE OR REPLACE FUNCTION public.store_api_key(
  p_key_name TEXT,
  p_key_value TEXT,
  p_provider TEXT DEFAULT 'openrouter',
  p_selected_model TEXT DEFAULT NULL,
  p_agent1_model TEXT DEFAULT NULL,
  p_agent2_model TEXT DEFAULT NULL,
  p_use_same_model BOOLEAN DEFAULT true
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_preview TEXT;
  v_secret TEXT;
BEGIN
  -- Generate a preview (first 6 chars + masked)
  v_preview := LEFT(p_key_value, 6) || '••••••••';
  
  -- Use a server-side secret for encryption
  v_secret := current_setting('app.settings.jwt_secret', true);
  IF v_secret IS NULL OR v_secret = '' THEN
    v_secret := 'credible-encryption-key-default';
  END IF;

  INSERT INTO public.user_api_keys (
    user_id, key_name, encrypted_key, key_preview,
    provider, selected_model, agent1_model, agent2_model, use_same_model
  )
  VALUES (
    auth.uid(),
    p_key_name,
    encode(pgp_sym_encrypt(p_key_value, v_secret)::bytea, 'base64'),
    v_preview,
    p_provider,
    p_selected_model,
    p_agent1_model,
    p_agent2_model,
    p_use_same_model
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
