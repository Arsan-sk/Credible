-- ═══════════════════════════════════════════════════════════════════════════
-- CREDIBLE — Database Migration: Remove Username Uniqueness Constraint
-- Run this in Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop the unique constraint on username in the profiles table to allow multiple users to have the same display name.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_key;
