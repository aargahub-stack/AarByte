export type UserRole = "admin" | "student";
export type TaskType = "algorithm" | "web_dom";
export type Difficulty = "easy" | "medium" | "hard";
export type SubmissionStatus =
  | "passed"
  | "failed"
  | "compile_error"
  | "runtime_error"
  | "timeout";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  points: number;
  created_at?: string;
  updated_at?: string;
};

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_published: boolean;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Module = {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  created_at?: string;
};

export type Task = {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  description: string;
  task_type: TaskType;
  language: string;
  difficulty: Difficulty;
  starter_code: string | null;
  solution_code: string | null;
  hints: string[];
  points: number;
  order_index: number;
  created_at?: string;
  updated_at?: string;
};

export type TestCase = {
  id: string;
  task_id: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
  explanation: string | null;
  created_at?: string;
};

export type Submission = {
  id: string;
  user_id: string;
  task_id: string;
  code: string;
  status: SubmissionStatus;
  passed_cases: number;
  total_cases: number;
  execution_time_ms: number | null;
  error_message: string | null;
  created_at?: string;
};

export type UserTaskProgress = {
  user_id: string;
  task_id: string;
  is_completed: boolean;
  best_submission_id: string | null;
  completed_at: string | null;
};

export type LeaderboardEntry = {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  points: number;
  solved_tasks_count: number;
};

// Joined / nested view helper types
export type TaskWithPublicTestCases = Task & {
  test_cases?: TestCase[];
};

export type ModuleWithTasks = Module & {
  tasks: Task[];
};

export type CourseWithModules = Course & {
  modules: ModuleWithTasks[];
};

// Supabase Database generic definition for typed Supabase client
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          avatar_url: string | null;
          role: UserRole;
          points: number;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          avatar_url?: string | null;
          role?: UserRole;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          avatar_url?: string | null;
          role?: UserRole;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          icon: string | null;
          is_published: boolean;
          created_by: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          order_index: number;
          created_at?: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          order_index?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          slug: string;
          description: string;
          task_type: TaskType;
          language: string;
          difficulty: Difficulty;
          starter_code: string | null;
          solution_code: string | null;
          hints: string[];
          points: number;
          order_index: number;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          slug: string;
          description: string;
          task_type?: TaskType;
          language: string;
          difficulty?: Difficulty;
          starter_code?: string | null;
          solution_code?: string | null;
          hints?: string[];
          points?: number;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          slug?: string;
          description?: string;
          task_type?: TaskType;
          language?: string;
          difficulty?: Difficulty;
          starter_code?: string | null;
          solution_code?: string | null;
          hints?: string[];
          points?: number;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      test_cases: {
        Row: {
          id: string;
          task_id: string;
          input: string;
          expected_output: string;
          is_hidden: boolean;
          explanation: string | null;
          created_at?: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          input?: string;
          expected_output: string;
          is_hidden?: boolean;
          explanation?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          input?: string;
          expected_output?: string;
          is_hidden?: boolean;
          explanation?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      submissions: {
        Row: {
          id: string;
          user_id: string;
          task_id: string;
          code: string;
          status: SubmissionStatus;
          passed_cases: number;
          total_cases: number;
          execution_time_ms: number | null;
          error_message: string | null;
          created_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id: string;
          code: string;
          status: SubmissionStatus;
          passed_cases?: number;
          total_cases?: number;
          execution_time_ms?: number | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          task_id?: string;
          code?: string;
          status?: SubmissionStatus;
          passed_cases?: number;
          total_cases?: number;
          execution_time_ms?: number | null;
          error_message?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_task_progress: {
        Row: {
          user_id: string;
          task_id: string;
          is_completed: boolean;
          best_submission_id: string | null;
          completed_at: string | null;
        };
        Insert: {
          user_id: string;
          task_id: string;
          is_completed?: boolean;
          best_submission_id?: string | null;
          completed_at?: string | null;
        };
        Update: {
          user_id?: string;
          task_id?: string;
          is_completed?: boolean;
          best_submission_id?: string | null;
          completed_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      leaderboard: {
        Row: {
          user_id: string;
          full_name: string;
          avatar_url: string | null;
          points: number;
          solved_tasks_count: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
