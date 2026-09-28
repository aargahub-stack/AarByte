import { useState, useEffect } from "react";
import {
  ShieldAlert,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Code2,
  ListOrdered,
  Eye,
  EyeOff,
  Sparkles,
  BarChart3,
  Loader2,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { adminService, type CreateCourseInput, type CreateTaskInput } from "@/services/adminService";
import { courseService } from "@/services/courseService";
import { supabase } from "@/services/supabase";
import type { Course, Module, Task, TestCase, Submission } from "@/types";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils/cn";

interface AdminDashboardPageProps {
  navigate: (to: string, params?: Record<string, string>) => void;
}

interface NewTestCaseItem {
  input: string;
  expected_output: string;
  is_hidden: boolean;
  explanation: string;
}

export function AdminDashboardPage({ navigate }: AdminDashboardPageProps) {
  const { user, profile, isAdmin, loading: authLoading } = useAdminAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"courses" | "tasks" | "submissions">("courses");

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Course Form
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseSlug, setCourseSlug] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseIsPublished, setCourseIsPublished] = useState(true);

  // Module Form
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleOrder, setModuleOrder] = useState(1);

  // Task Creator Form
  const [taskCourseId, setTaskCourseId] = useState("");
  const [taskModuleId, setTaskModuleId] = useState("");
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskSlug, setTaskSlug] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskLanguage, setTaskLanguage] = useState("python");
  const [taskDifficulty, setTaskDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [taskPoints, setTaskPoints] = useState(10);
  const [taskStarterCode, setTaskStarterCode] = useState("");
  const [taskSolutionCode, setTaskSolutionCode] = useState("");
  const [taskOrderIndex, setTaskOrderIndex] = useState(1);
  const [taskTestCases, setTaskTestCases] = useState<NewTestCaseItem[]>([
    { input: "1 2\n", expected_output: "3", is_hidden: false, explanation: "Sample case 1" },
    { input: "10 20\n", expected_output: "30", is_hidden: true, explanation: "Hidden testcase" },
  ]);

  // Submissions State
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Load all courses on mount
  useEffect(() => {
    if (isAdmin) {
      loadCourses();
      loadSubmissions();
    }
  }, [isAdmin]);

  const loadCourses = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await adminService.getAllCourses();
      if (data) {
        setCourses(data);
        if (data.length > 0 && !selectedCourse) {
          selectCourse(data[0]);
        }
      }
    } catch (e: any) {
      showToast("error", e.message || "Failed to load courses");
    } finally {
      setLoadingData(false);
    }
  };

  const selectCourse = async (course: Course) => {
    setSelectedCourse(course);
    try {
      const { data } = await adminService.getModulesByCourse(course.id);
      setModules(data || []);
    } catch (e: any) {
      console.error(e);
    }
  };

  // Handle task course selection change
  useEffect(() => {
    if (taskCourseId) {
      adminService.getModulesByCourse(taskCourseId).then(({ data }) => {
        setAvailableModules(data || []);
        if (data && data.length > 0) {
          setTaskModuleId(data[0].id);
        } else {
          setTaskModuleId("");
        }
      });
    }
  }, [taskCourseId]);

  const loadSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select(`
          id,
          user_id,
          task_id,
          code,
          status,
          passed_cases,
          total_cases,
          execution_time_ms,
          created_at,
          profiles:user_id (full_name, email),
          tasks:task_id (title, language)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        setSubmissions(data);
      }
    } catch (e) {
      console.error("Submissions load error:", e);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Create Course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim() || !courseSlug.trim()) {
      showToast("error", "Title and slug are required");
      return;
    }

    const { data, error } = await adminService.createCourse({
      title: courseTitle.trim(),
      slug: courseSlug.trim().toLowerCase(),
      description: courseDescription.trim(),
      is_published: courseIsPublished,
    });

    if (error) {
      showToast("error", error);
    } else if (data) {
      showToast("success", `Course "${data.title}" created!`);
      setShowCourseModal(false);
      setCourseTitle("");
      setCourseSlug("");
      setCourseDescription("");
      loadCourses();
      selectCourse(data);
    }
  };

  // Create Module
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) {
      showToast("error", "Please select a course first");
      return;
    }
    if (!moduleTitle.trim()) {
      showToast("error", "Module title required");
      return;
    }

    const { data, error } = await adminService.createModule({
      course_id: selectedCourse.id,
      title: moduleTitle.trim(),
      order_index: moduleOrder,
    });

    if (error) {
      showToast("error", error);
    } else if (data) {
      showToast("success", "Module added!");
      setModuleTitle("");
      setModuleOrder(modules.length + 2);
      selectCourse(selectedCourse);
    }
  };

  // Delete Course
  const handleDeleteCourse = async (courseId: string) => {
    if (confirm("Are you sure? This will delete all modules and tasks under this course.")) {
      const { success, error } = await adminService.deleteCourse(courseId);
      if (success) {
        showToast("info", "Course deleted");
        setSelectedCourse(null);
        setModules([]);
        loadCourses();
      } else {
        showToast("error", error || "Failed to delete");
      }
    }
  };

  // Delete Module
  const handleDeleteModule = async (moduleId: string) => {
    if (confirm("Delete this module and its tasks?")) {
      const { success, error } = await adminService.deleteModule(moduleId);
      if (success && selectedCourse) {
        showToast("info", "Module deleted");
        selectCourse(selectedCourse);
      } else {
        showToast("error", error || "Failed to delete module");
      }
    }
  };

  // Task Test Case dynamic handlers
  const handleAddTestCase = () => {
    setTaskTestCases((prev) => [
      ...prev,
      { input: "", expected_output: "", is_hidden: false, explanation: "" },
    ]);
  };

  const handleUpdateTestCase = (index: number, patch: Partial<NewTestCaseItem>) => {
    setTaskTestCases((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  };

  const handleRemoveTestCase = (index: number) => {
    setTaskTestCases((prev) => prev.filter((_, i) => i !== index));
  };

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskModuleId) {
      showToast("error", "Please select a target module");
      return;
    }
    if (!taskTitle.trim() || !taskSlug.trim()) {
      showToast("error", "Title and slug are required");
      return;
    }

    const { data, error } = await adminService.createTask(
      {
        module_id: taskModuleId,
        title: taskTitle.trim(),
        slug: taskSlug.trim().toLowerCase(),
        description: taskDescription.trim(),
        task_type: "algorithm",
        language: taskLanguage,
        difficulty: taskDifficulty,
        starter_code: taskStarterCode,
        solution_code: taskSolutionCode,
        points: taskPoints,
        order_index: taskOrderIndex,
      },
      taskTestCases
    );

    if (error) {
      showToast("error", error);
    } else {
      showToast("success", `Task "${taskTitle}" successfully created with ${taskTestCases.length} test cases!`);
      // Reset form
      setTaskTitle("");
      setTaskSlug("");
      setTaskDescription("");
      setTaskStarterCode("");
      setTaskSolutionCode("");
      setTaskOrderIndex(1);
    }
  };

  // Auth Guard Screen
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-500">
        <Loader2 size={32} className="animate-spin text-purple-600 mb-2" />
        <span className="ml-3 text-sm font-medium">Verifying admin credentials...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-950 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/10">
          <ShieldAlert size={36} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Admin Gatekeeper
        </h1>
        <p className="text-sm text-gray-500 max-w-sm">
          Access restricted. You must be signed in with an administrator role to manage courses, tasks, and judge settings.
        </p>
        <button
          onClick={() => navigate("courses")}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Return to Student Hub
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Header Bar */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-950 to-gray-950 text-white p-6 sm:p-8 border border-purple-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold">
              <ShieldAlert size={14} />
              <span>AarByte Control Tower</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Curriculum & Platform Administration
            </h1>
            <p className="text-xs sm:text-sm text-gray-300">
              Manage published tracks, curate programming tasks, and review system submissions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCourseModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-500/25 transition-all"
            >
              <Plus size={16} />
              <span>Create Course</span>
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
          <button
            onClick={() => setActiveTab("courses")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
              activeTab === "courses"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <BookOpen size={16} />
            <span>Courses & Modules</span>
          </button>

          <button
            onClick={() => setActiveTab("tasks")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
              activeTab === "tasks"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <Code2 size={16} />
            <span>Task Creator & Testcases</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("submissions");
              loadSubmissions();
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
              activeTab === "submissions"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <BarChart3 size={16} />
            <span>Submissions & Analytics</span>
          </button>
        </div>

        {/* Tab 1: Course & Module Manager */}
        {activeTab === "courses" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Courses list */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Courses Catalog ({courses.length})
                </h3>
              </div>

              <div className="space-y-2">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => selectCourse(c)}
                    className={cn(
                      "p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between",
                      selectedCourse?.id === c.id
                        ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 font-semibold"
                        : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <div>
                      <p className="font-bold">{c.title}</p>
                      <p className="text-[10px] text-gray-400 font-mono">/{c.slug}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                          c.is_published
                            ? "bg-green-500/10 text-green-500"
                            : "bg-gray-500/10 text-gray-400"
                        )}
                      >
                        {c.is_published ? "Published" : "Draft"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(c.id);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Modules for Selected Course */}
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-6">
              {selectedCourse ? (
                <>
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {selectedCourse.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Chapters & Modules for roadmap organization
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 font-semibold">
                      {modules.length} Modules
                    </span>
                  </div>

                  {/* Modules List */}
                  <div className="space-y-3">
                    {modules.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-950/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center">
                            {m.order_index}
                          </div>
                          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                            {m.title}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteModule(m.id)}
                          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}

                    {/* Add Module Inline Form */}
                    <form onSubmit={handleCreateModule} className="pt-2 flex gap-3">
                      <input
                        type="text"
                        value={moduleTitle}
                        onChange={(e) => setModuleTitle(e.target.value)}
                        placeholder="Add new module title (e.g. 'Binary Search & Sorting')..."
                        className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <input
                        type="number"
                        value={moduleOrder}
                        onChange={(e) => setModuleOrder(Number(e.target.value))}
                        className="w-16 px-2 py-2 text-xs text-center rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                        title="Order index"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                      >
                        Add Module
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-gray-400 text-sm">
                  Select a course on the left to manage modules.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Task Creator & Editor */}
        {activeTab === "tasks" && (
          <form
            onSubmit={handleCreateTask}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 space-y-6"
          >
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Create Problem Challenge
              </h3>
              <p className="text-xs text-gray-500">
                Craft a problem statement, define starter boilerplate, and configure both sample & evaluation testcases.
              </p>
            </div>

            {/* Course & Module Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Target Course
                </label>
                <select
                  value={taskCourseId}
                  onChange={(e) => setTaskCourseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                >
                  <option value="">Select course...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Module / Chapter
                </label>
                <select
                  value={taskModuleId}
                  onChange={(e) => setTaskModuleId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                >
                  <option value="">Select module...</option>
                  {availableModules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.order_index}. {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => {
                    setTaskTitle(e.target.value);
                    if (!taskSlug) {
                      setTaskSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-|-$/g, "")
                      );
                    }
                  }}
                  placeholder="e.g. Reverse Linked List"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={taskSlug}
                  onChange={(e) => setTaskSlug(e.target.value)}
                  placeholder="reverse-linked-list"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-mono"
                  required
                />
              </div>
            </div>

            {/* Language, Difficulty, Points, Order */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Language
                </label>
                <select
                  value={taskLanguage}
                  onChange={(e) => setTaskLanguage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Difficulty
                </label>
                <select
                  value={taskDifficulty}
                  onChange={(e) => setTaskDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Points
                </label>
                <input
                  type="number"
                  value={taskPoints}
                  onChange={(e) => setTaskPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Order Index
                </label>
                <input
                  type="number"
                  value={taskOrderIndex}
                  onChange={(e) => setTaskOrderIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>

            {/* Markdown Problem Description */}
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Problem Description (Markdown)
              </label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={5}
                placeholder="Describe the problem, input format, constraints, and output expectation..."
                className="w-full p-3 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-mono"
                required
              />
            </div>

            {/* Starter Code & Reference Solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Starter Code (Visible to Students)
                </label>
                <textarea
                  value={taskStarterCode}
                  onChange={(e) => setTaskStarterCode(e.target.value)}
                  rows={6}
                  placeholder="def solution():\n    pass\n"
                  className="w-full p-3 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Reference Solution (Admin Only)
                </label>
                <textarea
                  value={taskSolutionCode}
                  onChange={(e) => setTaskSolutionCode(e.target.value)}
                  rows={6}
                  placeholder="def solution():\n    return 42\n"
                  className="w-full p-3 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-mono"
                />
              </div>
            </div>

            {/* Dynamic Test Case Builder */}
            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Test Cases ({taskTestCases.length})
                  </h4>
                  <p className="text-xs text-gray-500">
                    Configure both public sample tests and hidden anti-cheat evaluation cases.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddTestCase}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <Plus size={14} />
                  <span>Add Test Case</span>
                </button>
              </div>

              <div className="space-y-3">
                {taskTestCases.map((tc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Testcase #{idx + 1}
                      </span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tc.is_hidden}
                            onChange={(e) =>
                              handleUpdateTestCase(idx, { is_hidden: e.target.checked })
                            }
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="flex items-center gap-1">
                            {tc.is_hidden ? <EyeOff size={13} className="text-purple-400" /> : <Eye size={13} />}
                            {tc.is_hidden ? "Hidden from students" : "Public sample"}
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveTestCase(idx)}
                          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] font-semibold text-gray-500 block mb-1">
                          Stdin Input:
                        </span>
                        <textarea
                          value={tc.input}
                          onChange={(e) => handleUpdateTestCase(idx, { input: e.target.value })}
                          rows={2}
                          placeholder="Input passed to stdin..."
                          className="w-full p-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-gray-500 block mb-1">
                          Expected Stdout:
                        </span>
                        <textarea
                          value={tc.expected_output}
                          onChange={(e) =>
                            handleUpdateTestCase(idx, { expected_output: e.target.value })
                          }
                          rows={2}
                          placeholder="Expected exact stdout output..."
                          className="w-full p-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-mono"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all"
              >
                Publish Task
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Submissions & Student Analytics */}
        {activeTab === "submissions" && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Student Submissions Log
                </h3>
                <p className="text-xs text-gray-500">
                  Real-time code submissions evaluated by the Wandbox judge engine
                </p>
              </div>
              <button
                onClick={loadSubmissions}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Refresh Log
              </button>
            </div>

            {loadingSubmissions ? (
              <div className="py-20 text-center text-gray-400 flex flex-col items-center gap-2">
                <Loader2 size={24} className="animate-spin text-purple-600" />
                <span className="text-xs">Loading submissions...</span>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-xs">
                No submissions recorded yet. Once students submit solutions in the Arena, they will appear here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-gray-200 dark:border-gray-800 text-gray-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Task</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Exec Time</th>
                      <th className="py-3 px-4">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-mono">
                    {submissions.map((sub) => {
                      const isPassed = sub.status === "passed";
                      const statusColor = isPassed
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-500 border-rose-500/20";

                      return (
                        <tr
                          key={sub.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="py-3 px-4 font-sans font-medium text-gray-800 dark:text-gray-200">
                            {sub.profiles?.full_name || sub.profiles?.email || sub.user_id.slice(0, 8)}
                          </td>
                          <td className="py-3 px-4 font-sans font-semibold text-gray-900 dark:text-gray-100">
                            {sub.tasks?.title || "Coding Task"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                                statusColor
                              )}
                            >
                              {sub.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {sub.passed_cases} / {sub.total_cases}
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {sub.execution_time_ms ? `${sub.execution_time_ms} ms` : "-"}
                          </td>
                          <td className="py-3 px-4 font-sans text-gray-400 text-[11px]">
                            {new Date(sub.created_at).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Create Course */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Create New Learning Track
              </h3>
              <button
                onClick={() => setShowCourseModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Track Title
                </label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={(e) => {
                    setCourseTitle(e.target.value);
                    if (!courseSlug) {
                      setCourseSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-|-$/g, "")
                      );
                    }
                  }}
                  placeholder="e.g. Advanced Rust System Programming"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={courseSlug}
                  onChange={(e) => setCourseSlug(e.target.value)}
                  placeholder="advanced-rust"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Description
                </label>
                <textarea
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  rows={3}
                  placeholder="Brief summary of what students will achieve in this course..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="published"
                  checked={courseIsPublished}
                  onChange={(e) => setCourseIsPublished(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="published" className="font-semibold text-gray-700 dark:text-gray-300">
                  Publish immediately (visible to students)
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md shadow-purple-500/20"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;
