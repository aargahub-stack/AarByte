-- Supabase Database Schema for AarByte
-- Execute this script in the Supabase SQL Editor

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT, -- e.g., 'code', 'layout', 'terminal'
    is_published BOOLEAN DEFAULT false,
    category TEXT,
    difficulty TEXT DEFAULT 'Beginner',
    enrollment_status TEXT DEFAULT 'open' CHECK (enrollment_status IN ('open', 'closed', 'coming_soon')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MODULES TABLE (Chapters inside a course)
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 1,
    is_pro_only BOOLEAN DEFAULT false,
    about_content TEXT, -- Markdown study guide ("What is it, where to use, examples")
    youtube_url TEXT, -- Video tutorial link
    youtube_title TEXT, -- Video title
    reading_time_mins INTEGER DEFAULT 5,
    key_takeaways JSONB DEFAULT '[]'::jsonb,
    code_examples JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TASKS TABLE (Individual coding problems)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT NOT NULL, -- Markdown problem statement
    task_type TEXT DEFAULT 'algorithm' CHECK (task_type IN ('algorithm', 'web_dom')),
    language TEXT NOT NULL, -- 'python', 'java', 'cpp', 'html', etc.
    difficulty TEXT DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    is_pro_only BOOLEAN DEFAULT false,
    starter_code TEXT, -- Default boilerplate code in Monaco editor
    solution_code TEXT, -- Reference solution (admin view only)
    hints JSONB DEFAULT '[]'::jsonb, -- Array of string hints
    options JSONB DEFAULT '[]'::jsonb, -- Array of strings for MCQs
    correct_answer TEXT, -- Answer for MCQs
    points INTEGER DEFAULT 10,
    order_index INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(module_id, slug)
);

-- 6. TEST CASES TABLE
CREATE TABLE IF NOT EXISTS public.test_cases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    input TEXT DEFAULT '', -- Stdin data
    expected_output TEXT NOT NULL, -- Exact stdout or DOM expectation
    is_hidden BOOLEAN DEFAULT false, -- false = public sample; true = evaluation testcase
    explanation TEXT, -- Optional hint for failed public test cases
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'compile_error', 'runtime_error', 'timeout')),
    passed_cases INTEGER DEFAULT 0,
    total_cases INTEGER DEFAULT 0,
    execution_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. USER PROGRESS TABLE (Track unlocked / completed tasks)
CREATE TABLE IF NOT EXISTS public.user_task_progress (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    best_submission_id UUID REFERENCES public.submissions(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    PRIMARY KEY (user_id, task_id)
);

-- 9. AUTO PROFILE CREATION ON USER SIGNUP (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. LEADERBOARD VIEW
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    p.id AS user_id,
    p.full_name,
    p.avatar_url,
    p.points,
    COUNT(DISTINCT utp.task_id) FILTER (WHERE utp.is_completed = true) AS solved_tasks_count
FROM public.profiles p
LEFT JOIN public.user_task_progress utp ON p.id = utp.user_id
GROUP BY p.id, p.full_name, p.avatar_url, p.points
ORDER BY p.points DESC, solved_tasks_count DESC;

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_task_progress ENABLE ROW LEVEL SECURITY;

-- 11. ROW LEVEL SECURITY POLICIES

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Courses
DROP POLICY IF EXISTS "Published courses are viewable" ON public.courses;
CREATE POLICY "Published courses are viewable" ON public.courses FOR SELECT USING (is_published = true OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Admin can manage courses" ON public.courses;
CREATE POLICY "Admin can manage courses" ON public.courses FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Modules
DROP POLICY IF EXISTS "Modules viewable" ON public.modules;
CREATE POLICY "Modules viewable" ON public.modules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage modules" ON public.modules;
CREATE POLICY "Admin can manage modules" ON public.modules FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Tasks
DROP POLICY IF EXISTS "Tasks viewable" ON public.tasks;
CREATE POLICY "Tasks viewable" ON public.tasks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage tasks" ON public.tasks;
CREATE POLICY "Admin can manage tasks" ON public.tasks FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Test Cases
DROP POLICY IF EXISTS "Students see public testcases" ON public.test_cases;
CREATE POLICY "Students see public testcases" ON public.test_cases FOR SELECT USING (is_hidden = false OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Admin manage testcases" ON public.test_cases;
CREATE POLICY "Admin manage testcases" ON public.test_cases FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Submissions
DROP POLICY IF EXISTS "Users see own submissions" ON public.submissions;
CREATE POLICY "Users see own submissions" ON public.submissions FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Users can create submissions" ON public.submissions;
CREATE POLICY "Users can create submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Progress
DROP POLICY IF EXISTS "User progress view" ON public.user_task_progress;
CREATE POLICY "User progress view" ON public.user_task_progress FOR ALL USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
