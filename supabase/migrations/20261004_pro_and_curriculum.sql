-- =========================================================================
-- AarCode Database Migration: Curriculum, Pro Tier & Availability Controls
-- Run this script in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- =========================================================================

-- 1. COURSES TABLE EXTENSIONS
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Beginner';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS enrollment_status TEXT DEFAULT 'open';

-- 2. MODULES TABLE EXTENSIONS (Pro Tier Enforcement)
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS is_pro_only BOOLEAN DEFAULT false;

-- 3. TASKS TABLE EXTENSIONS (Pro Diagnostics & MCQs)
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_pro_only BOOLEAN DEFAULT false;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS correct_answer TEXT;

-- 4. UPDATE EXISTING MODULES 5 THROUGH 9 AS PRO TIER
UPDATE public.modules
SET is_pro_only = true
WHERE order_index >= 5;

UPDATE public.modules
SET is_pro_only = false
WHERE order_index < 5;

-- 5. UPDATE COURSE ENROLLMENT STATUSES FOR NEW TRACKS
UPDATE public.courses
SET enrollment_status = 'open', category = 'Algorithms & DSA', difficulty = 'Beginner'
WHERE slug = 'basics-to-advanced-dsa';

UPDATE public.courses
SET enrollment_status = 'open', category = 'Core Computer Science', difficulty = 'Intermediate'
WHERE slug = 'java-core-oop';

UPDATE public.courses
SET enrollment_status = 'open', category = 'Interview Preparation', difficulty = 'Advanced'
WHERE slug = 'zoho-tcs-assessment';
