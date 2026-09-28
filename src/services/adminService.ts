import { supabase } from "./supabase";
import type {
  Course,
  Module,
  Task,
  TestCase,
} from "@/types/database.types";

export interface CreateCourseInput {
  title: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  is_published?: boolean;
}

export interface UpdateCourseInput {
  title?: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  is_published?: boolean;
}

export interface CreateModuleInput {
  course_id: string;
  title: string;
  order_index?: number;
}

export interface UpdateModuleInput {
  title?: string;
  order_index?: number;
}

export interface CreateTaskInput {
  module_id: string;
  title: string;
  slug: string;
  description: string;
  task_type?: "algorithm" | "web_dom";
  language: string;
  difficulty?: "easy" | "medium" | "hard";
  starter_code?: string | null;
  solution_code?: string | null;
  hints?: string[];
  points?: number;
  order_index?: number;
}

export interface UpdateTaskInput {
  module_id?: string;
  title?: string;
  slug?: string;
  description?: string;
  task_type?: "algorithm" | "web_dom";
  language?: string;
  difficulty?: "easy" | "medium" | "hard";
  starter_code?: string | null;
  solution_code?: string | null;
  hints?: string[];
  points?: number;
  order_index?: number;
}

export interface CreateTestCaseInput {
  task_id: string;
  input?: string;
  expected_output: string;
  is_hidden?: boolean;
  explanation?: string | null;
}

export interface UpdateTestCaseInput {
  input?: string;
  expected_output?: string;
  is_hidden?: boolean;
  explanation?: string | null;
}

export const adminService = {
  // ================= COURSES =================

  /**
   * Fetch all courses (published and unpublished) for admin management.
   */
  async getAllCourses(): Promise<{ data: Course[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) return { data: null, error: error.message };
      return { data: data as Course[], error: null };
    } catch (err: any) {
      return { data: null, error: err.message || "Failed to fetch courses" };
    }
  },

  /**
   * Create a new course.
   */
  async createCourse(
    input: CreateCourseInput
  ): Promise<{ data: Course | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("courses")
        .insert({
          title: input.title,
          slug: input.slug,
          description: input.description ?? null,
          icon: input.icon ?? null,
          is_published: input.is_published ?? false,
          created_by: user?.id ?? null,
        })
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as Course, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || "Failed to create course" };
    }
  },

  /**
   * Update an existing course.
   */
  async updateCourse(
    courseId: string,
    updates: UpdateCourseInput
  ): Promise<{ data: Course | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("courses")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", courseId)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as Course, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || "Failed to update course" };
    }
  },

  /**
   * Delete a course (cascades to modules, tasks, and test cases).
   */
  async deleteCourse(courseId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to delete course" };
    }
  },

  // ================= MODULES =================

  /**
   * Fetch modules for a specific course.
   */
  async getModulesByCourse(
    courseId: string
  ): Promise<{ data: Module[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (error) return { data: null, error: error.message };
      return { data: data as Module[], error: null };
    } catch (err: any) {
      return { data: null, error: err.message || "Failed to fetch modules" };
    }
  },

  /**
   * Create a new module inside a course.
   */
  async createModule(
    input: CreateModuleInput
  ): Promise<{ data: Module | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("modules")
        .insert({
          course_id: input.course_id,
          title: input.title,
          order_index: input.order_index ?? 1,
        })
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as Module, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || "Failed to create module" };
    }
  },

  /**
   * Update an existing module.
   */
  async updateModule(
    moduleId: string,
    updates: UpdateModuleInput
  ): Promise<{ data: Module | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("modules")
        .update(updates)
        .eq("id", moduleId)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as Module, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || "Failed to update module" };
    }
  },

  /**
   * Delete a module (cascades to its tasks).
   */
  async deleteModule(moduleId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from("modules")
        .delete()
        .eq("id", moduleId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to delete module" };
    }
  },

  // ================= TASKS =================

  /**
   * Fetch a task with all public AND hidden test cases (Admin access).
   */
  async getTaskWithAllTestCases(
    taskId: string
  ): Promise<{ data: (Task & { test_cases: TestCase[] }) | null; error: string | null }> {
    try {
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();

      if (taskError || !task) {
        return { data: null, error: taskError?.message || "Task not found" };
      }

      const { data: testCases, error: testCaseError } = await supabase
        .from("test_cases")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });

      if (testCaseError) {
        return { data: null, error: testCaseError.message };
      }

      return {
        data: {
          ...(task as Task),
          test_cases: (testCases as TestCase[]) || [],
        },
        error: null,
      };
    } catch (err: any) {
      return { data: null, error: err.message || "Failed to fetch task and test cases" };
    }
  },

  /**
   * Create a new task, optionally inserting initial public & hidden test cases.
   */
  async createTask(
    input: CreateTaskInput,
    testCases?: Array<Omit<CreateTestCaseInput, "task_id">>
  ): Promise<{ data: Task | null; error: string | null }> {
    try {
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .insert({
          module_id: input.module_id,
          title: input.title,
          slug: input.slug,
          description: input.description,
          task_type: input.task_type ?? "algorithm",
          language: input.language,
          difficulty: input.difficulty ?? "easy",
          starter_code: input.starter_code ?? null,
          solution_code: input.solution_code ?? null,
          hints: input.hints ?? [],
          points: input.points ?? 10,
          order_index: input.order_index ?? 1,
        })
        .select()
        .single();

      if (taskError || !task) {
        return { data: null, error: taskError?.message || "Failed to create task" };
      }

      // If test cases are provided, bulk insert them
      if (testCases && testCases.length > 0) {
        const testCasesToInsert = testCases.map((tc) => ({
          task_id: task.id,
          input: tc.input ?? "",
          expected_output: tc.expected_output,
          is_hidden: tc.is_hidden ?? false,
          explanation: tc.explanation ?? null,
        }));

        const { error: tcError } = await supabase
          .from("test_cases")
          .insert(testCasesToInsert);

        if (tcError) {
          console.error("[adminService] Failed to insert initial test cases:", tcError.message);
        }
      }

      return { data: task as Task, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || "Failed to create task" };
    }
  },

  /**
   * Update task fields.
   */
  async updateTask(
    taskId: string,
    updates: UpdateTaskInput
  ): Promise<{ data: Task | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as Task, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || "Failed to update task" };
    }
  },

  /**
   * Delete a task.
   */
  async deleteTask(taskId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to delete task" };
    }
  },

  // ================= TEST CASES =================

  /**
   * Create a single test case (public or hidden).
   */
  async createTestCase(
    input: CreateTestCaseInput
  ): Promise<{ data: TestCase | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("test_cases")
        .insert({
          task_id: input.task_id,
          input: input.input ?? "",
          expected_output: input.expected_output,
          is_hidden: input.is_hidden ?? false,
          explanation: input.explanation ?? null,
        })
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as TestCase, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || "Failed to create testcase" };
    }
  },

  /**
   * Update a testcase.
   */
  async updateTestCase(
    testCaseId: string,
    updates: UpdateTestCaseInput
  ): Promise<{ data: TestCase | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("test_cases")
        .update(updates)
        .eq("id", testCaseId)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as TestCase, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || "Failed to update testcase" };
    }
  },

  /**
   * Delete a testcase.
   */
  async deleteTestCase(testCaseId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from("test_cases")
        .delete()
        .eq("id", testCaseId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to delete testcase" };
    }
  },
};

export default adminService;
