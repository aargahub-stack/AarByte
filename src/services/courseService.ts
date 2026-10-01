import { supabase } from "./supabase";
import type {
  Course,
  CourseWithModules,
  ModuleWithTasks,
  Task,
  TaskWithPublicTestCases,
  TestCase,
  LeaderboardEntry,
  UserTaskProgress,
} from "@/types/database.types";

export const courseService = {
  /**
   * Fetch all published courses with their modules.
   */
  async getCourses(): Promise<{ data: CourseWithModules[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          modules (
            id,
            course_id,
            title,
            order_index,
            created_at,
            tasks (
              id,
              module_id,
              title,
              slug,
              description,
              task_type,
              language,
              difficulty,
              starter_code,
              hints,
              points,
              order_index,
              created_at,
              updated_at
            )
          )
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: true });

      if (error) {
        return { data: null, error: error.message };
      }

      // Sort modules and tasks by order_index
      const sortedCourses: CourseWithModules[] = (data || []).map((course: any) => ({
        ...course,
        modules: (course.modules || [])
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((mod: any) => ({
            ...mod,
            tasks: (mod.tasks || []).sort((a: any, b: any) => a.order_index - b.order_index),
          })),
      }));

      return { data: sortedCourses, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || "Failed to fetch courses" };
    }
  },

  /**
   * Fetch a single course by its slug, including modules and task roadmap.
   * Solution codes are excluded for students.
   */
  async getCourseBySlug(
    slug: string
  ): Promise<{ data: CourseWithModules | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          modules (
            id,
            course_id,
            title,
            order_index,
            created_at,
            tasks (
              id,
              module_id,
              title,
              slug,
              description,
              task_type,
              language,
              difficulty,
              starter_code,
              hints,
              points,
              order_index,
              created_at,
              updated_at
            )
          )
        `)
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      const courseData = data as any;
      const sortedCourse: CourseWithModules = {
        ...courseData,
        modules: (courseData.modules || [])
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((mod: any) => ({
            ...mod,
            tasks: (mod.tasks || []).sort((a: any, b: any) => a.order_index - b.order_index),
          })),
      };

      return { data: sortedCourse, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || "Failed to fetch course details" };
    }
  },

  /**
   * Fetch task info, starter code, and ONLY public test cases (is_hidden = false).
   */
  async getTaskDetails(
    taskId: string
  ): Promise<{ data: TaskWithPublicTestCases | null; error: string | null }> {
    try {
      // 1. Fetch task without solution_code
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .select(`
          id,
          module_id,
          title,
          slug,
          description,
          task_type,
          language,
          difficulty,
          starter_code,
          hints,
          points,
          order_index,
          created_at,
          updated_at
        `)
        .eq("id", taskId)
        .single();

      if (taskError || !task) {
        return { data: null, error: taskError?.message || "Task not found" };
      }

      // 2. Fetch public test cases ONLY
      const { data: testCases, error: testCaseError } = await supabase
        .from("test_cases")
        .select("id, task_id, input, expected_output, is_hidden, explanation, created_at")
        .eq("task_id", taskId)
        .eq("is_hidden", false)
        .order("created_at", { ascending: true });

      if (testCaseError) {
        return { data: null, error: testCaseError.message };
      }

      const result: TaskWithPublicTestCases = {
        ...(task as Task),
        test_cases: (testCases as TestCase[]) || [],
      };

      return { data: result, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || "Failed to fetch task details" };
    }
  },

  /**
   * Fetch user progress for a list of task IDs.
   */
  async getUserProgress(
    userId: string,
    taskIds?: string[]
  ): Promise<{ data: Record<string, UserTaskProgress> | null; error: string | null }> {
    try {
      let query = supabase
        .from("user_task_progress")
        .select("*")
        .eq("user_id", userId);

      // Only apply .in("task_id", ...) if valid UUIDs are present, as task_id is a UUID column in Postgres
      if (taskIds && taskIds.length > 0) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const validUuids = taskIds.filter((id) => uuidRegex.test(id));
        if (validUuids.length > 0) {
          query = query.in("task_id", validUuids);
        }
      }

      const { data, error } = await query;
      if (error) {
        console.warn("[courseService] getUserProgress query notice:", error.message);
        return { data: {}, error: error.message };
      }

      const progressMap: Record<string, UserTaskProgress> = {};
      (data || []).forEach((item: any) => {
        progressMap[item.task_id] = item as UserTaskProgress;
      });

      return { data: progressMap, error: null };
    } catch (err: any) {
      console.warn("[courseService] getUserProgress error:", err.message);
      return { data: {}, error: err.message || "Failed to fetch progress" };
    }
  },

  /**
   * Fetch public leaderboard.
   */
  async getLeaderboard(
    limit = 50
  ): Promise<{ data: LeaderboardEntry[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("leaderboard")
        .select("*")
        .limit(limit);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: (data as LeaderboardEntry[]) || [], error: null };
    } catch (err: any) {
      return { data: null, error: err.message || "Failed to fetch leaderboard" };
    }
  },
};

export default courseService;
