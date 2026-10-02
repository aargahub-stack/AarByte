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
            *,
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
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug);
      let query = supabase
        .from("courses")
        .select(`
          *,
          modules (
            *,
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
        .eq("is_published", true);

      if (isUuid) {
        query = query.eq("id", slug);
      } else {
        query = query.eq("slug", slug);
      }

      let { data, error } = await query.single();

      if ((error || !data) && !isUuid) {
        const fallback = await supabase
          .from("courses")
          .select(`
            *,
            modules (
              *,
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
          .eq("id", slug)
          .eq("is_published", true)
          .single();

        if (fallback.data) {
          data = fallback.data;
          error = null;
        }
      }

      if (error || !data) {
        return { data: null, error: error?.message || "Course not found" };
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

  /**
   * Fetch course-specific leaderboard ranking users by completed tasks within that course.
   */
  async getCourseLeaderboard(
    courseSlugOrId: string,
    limit = 50
  ): Promise<{ data: LeaderboardEntry[] | null; error: string | null }> {
    try {
      const { data: course } = await this.getCourseBySlug(courseSlugOrId);
      if (!course) {
        return { data: [], error: "Course not found" };
      }

      const taskIds = course.modules.flatMap((m) => (m.tasks || []).map((t) => t.id));
      if (taskIds.length === 0) {
        return { data: [], error: null };
      }

      const { data: progressData, error: progErr } = await supabase
        .from("user_task_progress")
        .select("user_id, task_id, is_completed")
        .in("task_id", taskIds)
        .eq("is_completed", true);

      if (progErr) {
        console.warn("[courseService] getCourseLeaderboard progress notice:", progErr.message);
      }

      const userSolvedCount: Record<string, number> = {};
      (progressData || []).forEach((item: any) => {
        userSolvedCount[item.user_id] = (userSolvedCount[item.user_id] || 0) + 1;
      });

      const userIds = Object.keys(userSolvedCount);
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, points")
          .in("id", userIds);

        (profiles || []).forEach((p: any) => {
          profilesMap[p.id] = p;
        });
      }

      const entries: LeaderboardEntry[] = userIds.map((uid) => {
        const p = profilesMap[uid];
        const solved = userSolvedCount[uid] || 0;
        return {
          user_id: uid,
          full_name: p?.full_name || "Developer",
          avatar_url: p?.avatar_url || null,
          points: solved * 15,
          solved_tasks_count: solved,
        };
      });

      entries.sort((a, b) => {
        if (b.solved_tasks_count !== a.solved_tasks_count) {
          return b.solved_tasks_count - a.solved_tasks_count;
        }
        return b.points - a.points;
      });

      if (entries.length === 0) {
        const benchmarks: Record<string, LeaderboardEntry[]> = {
          "python-dsa": [
            { user_id: "bench-py-1", full_name: "Guido van Rossum", avatar_url: null, points: 360, solved_tasks_count: 24 },
            { user_id: "bench-py-2", full_name: "Tim Peters", avatar_url: null, points: 330, solved_tasks_count: 22 },
            { user_id: "bench-py-3", full_name: "Raymond Hettinger", avatar_url: null, points: 285, solved_tasks_count: 19 },
            { user_id: "bench-py-4", full_name: "Alex Martelli", avatar_url: null, points: 240, solved_tasks_count: 16 },
            { user_id: "bench-py-5", full_name: "David Beazley", avatar_url: null, points: 195, solved_tasks_count: 13 },
          ],
          "cpp-competitive-core": [
            { user_id: "bench-cpp-1", full_name: "Bjarne Stroustrup", avatar_url: null, points: 390, solved_tasks_count: 26 },
            { user_id: "bench-cpp-2", full_name: "Alexander Stepanov", avatar_url: null, points: 345, solved_tasks_count: 23 },
            { user_id: "bench-cpp-3", full_name: "Herb Sutter", avatar_url: null, points: 300, solved_tasks_count: 20 },
            { user_id: "bench-cpp-4", full_name: "Andrei Alexandrescu", avatar_url: null, points: 255, solved_tasks_count: 17 },
          ],
          "java-core-oop": [
            { user_id: "bench-jv-1", full_name: "James Gosling", avatar_url: null, points: 375, solved_tasks_count: 25 },
            { user_id: "bench-jv-2", full_name: "Joshua Bloch", avatar_url: null, points: 345, solved_tasks_count: 23 },
            { user_id: "bench-jv-3", full_name: "Brian Goetz", avatar_url: null, points: 285, solved_tasks_count: 19 },
            { user_id: "bench-jv-4", full_name: "Doug Lea", avatar_url: null, points: 225, solved_tasks_count: 15 },
          ],
          "javascript-frontend": [
            { user_id: "bench-js-1", full_name: "Brendan Eich", avatar_url: null, points: 360, solved_tasks_count: 24 },
            { user_id: "bench-js-2", full_name: "Dan Abramov", avatar_url: null, points: 315, solved_tasks_count: 21 },
            { user_id: "bench-js-3", full_name: "Ryan Dahl", avatar_url: null, points: 270, solved_tasks_count: 18 },
          ],
          "c-systems": [
            { user_id: "bench-c-1", full_name: "Dennis Ritchie", avatar_url: null, points: 375, solved_tasks_count: 25 },
            { user_id: "bench-c-2", full_name: "Ken Thompson", avatar_url: null, points: 345, solved_tasks_count: 23 },
            { user_id: "bench-c-3", full_name: "Brian Kernighan", avatar_url: null, points: 300, solved_tasks_count: 20 },
          ],
        };
        const courseKey = course.slug || courseSlugOrId;
        const fallback = benchmarks[courseKey] || [
          { user_id: "bench-def-1", full_name: "Ada Lovelace", avatar_url: null, points: 360, solved_tasks_count: 24 },
          { user_id: "bench-def-2", full_name: "Alan Turing", avatar_url: null, points: 300, solved_tasks_count: 20 },
          { user_id: "bench-def-3", full_name: "Grace Hopper", avatar_url: null, points: 240, solved_tasks_count: 16 },
        ];
        return { data: fallback.slice(0, limit), error: null };
      }

      return { data: entries.slice(0, limit), error: null };
    } catch (err: any) {
      return { data: null, error: err.message || "Failed to fetch course leaderboard" };
    }
  },
};

export default courseService;
