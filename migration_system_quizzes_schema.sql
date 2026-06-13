-- ═══════════════════════════════════════════════════════════════════════════
-- CREDIBLE — Database Migration: System Quizzes Storage Schema
-- Run this in Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- Create the system_quizzes table
CREATE TABLE IF NOT EXISTS public.system_quizzes (
  quiz_type TEXT PRIMARY KEY CHECK (quiz_type IN ('current', 'featured')),
  quiz_data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.system_quizzes ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can SELECT quizzes (public read access for guest/active quizzes)
DROP POLICY IF EXISTS "Anyone can read system quizzes" ON public.system_quizzes;
CREATE POLICY "Anyone can read system quizzes"
  ON public.system_quizzes FOR SELECT
  USING (true);

-- 2. Service role / authenticated system users can do all actions (insert/update)
DROP POLICY IF EXISTS "Service role can write system quizzes" ON public.system_quizzes;
CREATE POLICY "Service role can write system quizzes"
  ON public.system_quizzes FOR ALL
  USING (true);
