-- ═══════════════════════════════════════════════════════════════════════════
-- CREDIBLE — Supabase Database Schema
-- Paste this entire file into Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Enable Required Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. PROFILES (linked to auth.users)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow insert during signup (trigger runs as SECURITY DEFINER)
CREATE POLICY "Allow insert for authenticated users"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ── Auto-create profile on signup ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid conflicts on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ═══════════════════════════════════════════════════════════════════════════
-- 2. ATTEMPTS (logged-in user quiz attempts)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.attempts (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_id TEXT,
  title TEXT,
  video_url TEXT,
  user_name TEXT,
  score INTEGER,
  passed BOOLEAN DEFAULT false,
  total INTEGER,
  correct INTEGER,
  wrong INTEGER,
  skipped INTEGER,
  answers JSONB DEFAULT '{}'::jsonb,
  questions JSONB DEFAULT '[]'::jsonb,
  certificate_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

-- Users can CRUD their own attempts
CREATE POLICY "Users can read own attempts"
  ON public.attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON public.attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts"
  ON public.attempts FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════════════════════
-- 3. CERTIFICATES (logged-in user certificates)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.certificates (
  certificate_id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  video_title TEXT,
  video_url TEXT,
  score INTEGER,
  quiz_id TEXT,
  status TEXT DEFAULT 'verified',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Users can read their own certificates
CREATE POLICY "Users can read own certificates"
  ON public.certificates FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert own certificates
CREATE POLICY "Users can insert own certificates"
  ON public.certificates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Anyone can verify a certificate (read by certificate_id)
CREATE POLICY "Anyone can verify certificates"
  ON public.certificates FOR SELECT
  USING (true);


-- ═══════════════════════════════════════════════════════════════════════════
-- 4. GUEST ATTEMPTS (tracked by browser cookie)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.guest_attempts (
  id TEXT PRIMARY KEY,
  guest_id TEXT NOT NULL,
  quiz_id TEXT,
  title TEXT,
  video_url TEXT,
  user_name TEXT,
  score INTEGER,
  passed BOOLEAN DEFAULT false,
  total INTEGER,
  correct INTEGER,
  wrong INTEGER,
  skipped INTEGER,
  answers JSONB DEFAULT '{}'::jsonb,
  questions JSONB DEFAULT '[]'::jsonb,
  certificate_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.guest_attempts ENABLE ROW LEVEL SECURITY;

-- Guests can read/write using anon key (no auth required)
CREATE POLICY "Anyone can read guest attempts"
  ON public.guest_attempts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert guest attempts"
  ON public.guest_attempts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update guest attempts"
  ON public.guest_attempts FOR UPDATE
  USING (true);


-- ═══════════════════════════════════════════════════════════════════════════
-- 5. GUEST CERTIFICATES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.guest_certificates (
  certificate_id TEXT PRIMARY KEY,
  guest_id TEXT NOT NULL,
  user_name TEXT,
  video_title TEXT,
  video_url TEXT,
  score INTEGER,
  quiz_id TEXT,
  status TEXT DEFAULT 'verified',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.guest_certificates ENABLE ROW LEVEL SECURITY;

-- Anyone can read/insert guest certificates (anon access for verification)
CREATE POLICY "Anyone can read guest certificates"
  ON public.guest_certificates FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert guest certificates"
  ON public.guest_certificates FOR INSERT
  WITH CHECK (true);


-- ═══════════════════════════════════════════════════════════════════════════
-- 6. USER API KEYS (encrypted storage)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.user_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  key_name TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  key_preview TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

-- Users can CRUD their own API keys
CREATE POLICY "Users can read own api keys"
  ON public.user_api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own api keys"
  ON public.user_api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own api keys"
  ON public.user_api_keys FOR DELETE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════════════════════
-- 7. RPC FUNCTIONS FOR API KEY ENCRYPTION
-- ═══════════════════════════════════════════════════════════════════════════

-- Encrypt and store an API key
CREATE OR REPLACE FUNCTION public.store_api_key(
  p_key_name TEXT,
  p_key_value TEXT
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
  -- This uses the database's built-in encryption
  v_secret := current_setting('app.settings.jwt_secret', true);
  IF v_secret IS NULL OR v_secret = '' THEN
    v_secret := 'credible-encryption-key-default';
  END IF;

  INSERT INTO public.user_api_keys (user_id, key_name, encrypted_key, key_preview)
  VALUES (
    auth.uid(),
    p_key_name,
    encode(pgp_sym_encrypt(p_key_value, v_secret)::bytea, 'base64'),
    v_preview
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrypt and retrieve an API key
CREATE OR REPLACE FUNCTION public.get_api_key_value(p_key_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_encrypted TEXT;
  v_user_id UUID;
  v_secret TEXT;
BEGIN
  -- Verify ownership
  SELECT encrypted_key, user_id INTO v_encrypted, v_user_id
  FROM public.user_api_keys
  WHERE id = p_key_id;

  IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  v_secret := current_setting('app.settings.jwt_secret', true);
  IF v_secret IS NULL OR v_secret = '' THEN
    v_secret := 'credible-encryption-key-default';
  END IF;

  RETURN pgp_sym_decrypt(decode(v_encrypted, 'base64')::bytea, v_secret);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ═══════════════════════════════════════════════════════════════════════════
-- 8. INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON public.attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_quiz_id ON public.attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_guest_attempts_guest_id ON public.guest_attempts(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_certificates_guest_id ON public.guest_certificates(guest_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON public.user_api_keys(user_id);


-- ═══════════════════════════════════════════════════════════════════════════
-- 9. USER GENERATED ASSESSMENTS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.user_assessments (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own assessments"
  ON public.user_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read assessments"
  ON public.user_assessments FOR SELECT
  USING (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 10. GENERATION JOBS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.credible_generation_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('queued', 'processing', 'completed', 'failed')) DEFAULT 'queued',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  assessment_id TEXT REFERENCES public.user_assessments(id) ON DELETE SET NULL,
  provider TEXT,
  video_title TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.credible_generation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own generation jobs"
  ON public.credible_generation_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generation jobs"
  ON public.credible_generation_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users/Service role can update own generation jobs"
  ON public.credible_generation_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_assessments_user_id ON public.user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_credible_generation_jobs_user_id ON public.credible_generation_jobs(user_id);
