-- ═══════════════════════════════════════════════════════════════════════════
-- CREDIBLE — Database Migration: Public Read Access for Verified Attempts
-- Run this in Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable public select access on attempts table if a certificate is linked
-- This allows verification links to fetch details of the quiz attempt (like questions and answers)
-- without revealing uncertified attempts.

DROP POLICY IF EXISTS "Anyone can read attempts with certificates" ON public.attempts;

CREATE POLICY "Anyone can read attempts with certificates"
  ON public.attempts
  FOR SELECT
  USING (certificate_id IS NOT NULL);
