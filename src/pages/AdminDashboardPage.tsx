import { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Code2,
  Eye,
  EyeOff,
  BarChart3,
  Loader2,
  ChevronRight,
  Search,
  Users,
  Server,
  Database,
  RefreshCw,
  Play,
  Terminal,
  ExternalLink,
  Filter,
  Check,
  Copy,
  Settings,
  HelpCircle,
  X,
  Lock,
  Edit3,
  Radio,
  FileText,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { adminService } from "@/services/adminService";
import { executeCode } from "@/services/execution/wandboxExecutor";
import { supabase } from "@/services/supabase";
import type { Course, Module, Task, TestCase, Profile } from "@/types";
import { planStorage } from "@/services/storage/planStorage";
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

type AdminSection = "overview" | "courses" | "tasks" | "submissions" | "users" | "system";

export function AdminDashboardPage({ navigate }: AdminDashboardPageProps) {
  const { user, profile, isAdmin, loading: authLoading } = useAdminAuth();
  const { showToast } = useToast();

  // Navigation state
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");

  // Platform metrics
  const [metrics, setMetrics] = useState({
    coursesCount: 0,
    tasksCount: 0,
    submissionsCount: 0,
    usersCount: 0,
    passedSubmissionsCount: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Courses & Modules state
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");

  // Course Form Modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseSlug, setCourseSlug] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseIsPublished, setCourseIsPublished] = useState(true);

  // Module Form & Tier Toggle
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleOrder, setModuleOrder] = useState(1);
  const [moduleIsProOnly, setModuleIsProOnly] = useState(false);

  // Module Study Guide & Video Modal
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editAboutContent, setEditAboutContent] = useState("");
  const [editYoutubeUrl, setEditYoutubeUrl] = useState("");
  const [editYoutubeTitle, setEditYoutubeTitle] = useState("");
  const [editReadingTime, setEditReadingTime] = useState(5);
  const [editKeyTakeaways, setEditKeyTakeaways] = useState("");
  const [editIsProOnly, setEditIsProOnly] = useState(false);
  const [savingModuleContent, setSavingModuleContent] = useState(false);

  // Tasks State & Creator
  const [tasksTab, setTasksTab] = useState<"catalog" | "create">("catalog");
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskSearch, setTaskSearch] = useState("");
  const [taskLanguageFilter, setTaskLanguageFilter] = useState("all");
  const [taskDifficultyFilter, setTaskDifficultyFilter] = useState("all");

  // Task Creator / Editor Form
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskType, setTaskType] = useState<"algorithm" | "mcq">("algorithm");
  const [taskCourseId, setTaskCourseId] = useState("");
  const [taskModuleId, setTaskModuleId] = useState("");
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskSlug, setTaskSlug] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [descTab, setDescTab] = useState<"write" | "preview">("write");
  const [taskLanguage, setTaskLanguage] = useState("python");
  const [taskDifficulty, setTaskDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [taskPoints, setTaskPoints] = useState(15);
  const [taskStarterCode, setTaskStarterCode] = useState("");
  const [taskSolutionCode, setTaskSolutionCode] = useState("");
  const [taskOrderIndex, setTaskOrderIndex] = useState(1);
  const [mcqOptions, setMcqOptions] = useState<string[]>([
    "Option A",
    "Option B",
    "Option C",
    "Option D",
  ]);
  const [mcqCorrectAnswer, setMcqCorrectAnswer] = useState<string>("Option A");
  const [taskTestCases, setTaskTestCases] = useState<NewTestCaseItem[]>([
    { input: "1 2\n", expected_output: "3", is_hidden: false, explanation: "Public sample case" },
    { input: "10 20\n", expected_output: "30", is_hidden: true, explanation: "Hidden evaluation benchmark" },
  ]);

  // Submissions State & Code Viewer
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [subStatusFilter, setSubStatusFilter] = useState("all");
  const [subSearch, setSubSearch] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Users State & Access Control
  const [users, setUsers] = useState<Profile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userPlanFilter, setUserPlanFilter] = useState<"all" | "starter" | "pro" | "admin">("all");
  const [planTick, setPlanTick] = useState(0);

  // System Diagnostics
  const [wandboxLatency, setWandboxLatency] = useState<number | null>(null);
  const [isPingingWandbox, setIsPingingWandbox] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Initial Data Fetching
  useEffect(() => {
    if (isAdmin) {
      loadOverviewMetrics();
      loadCourses();
      loadTasks();
      loadSubmissions();
      loadUsers();
    }
  }, [isAdmin]);

  // Keep available modules in sync when selected course changes in Task Creator
  useEffect(() => {
    if (taskCourseId) {
      adminService.getCourseModules(taskCourseId).then(({ data }) => {
        if (data) setAvailableModules(data);
      });
    } else {
      setAvailableModules([]);
    }
  }, [taskCourseId]);

  // Auto-slug generator for new course
  const handleCourseTitleChange = (val: string) => {
    setCourseTitle(val);
    if (!courseSlug || courseSlug === courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")) {
      setCourseSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  // Auto-slug generator for new task
  const handleTaskTitleChange = (val: string) => {
    setTaskTitle(val);
    if (!taskSlug || taskSlug === taskTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")) {
      setTaskSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  // 1. Data Loaders
  const loadOverviewMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const [cRes, tRes, sRes, uRes, pRes] = await Promise.all([
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("tasks").select("id", { count: "exact", head: true }),
        supabase.from("submissions").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "passed"),
      ]);

      setMetrics({
        coursesCount: cRes.count || 0,
        tasksCount: tRes.count || 0,
        submissionsCount: sRes.count || 0,
        usersCount: uRes.count || 0,
        passedSubmissionsCount: pRes.count || 0,
      });
    } catch {
      // Fallback
    } finally {
      setLoadingMetrics(false);
    }
  };

  const loadCourses = async () => {
    setLoadingCourses(true);
    const { data } = await adminService.getAllCourses();
    if (data) {
      setCourses(data);
      if (data.length > 0 && !selectedCourse) {
        selectCourse(data[0]);
      }
    }
    setLoadingCourses(false);
  };

  const selectCourse = async (course: Course) => {
    setSelectedCourse(course);
    const { data } = await adminService.getCourseModules(course.id);
    if (data) {
      setModules(data);
    }
  };

  const loadTasks = async () => {
    setLoadingTasks(true);
    const { data } = await adminService.getAllTasks();
    if (data) {
      setAllTasks(data);
    }
    setLoadingTasks(false);
  };

  const loadSubmissions = async () => {
    setLoadingSubmissions(true);
    const { data } = await adminService.getRecentSubmissions(100);
    if (data) {
      setSubmissions(data);
    }
    setLoadingSubmissions(false);
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    const { data } = await adminService.getAllUsers();
    if (data) {
      setUsers(data);
    }
    setLoadingUsers(false);
  };

  // Actions: Courses
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim() || !courseSlug.trim()) {
      showToast("error", "Course title and URL slug are required");
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
    } else {
      showToast("success", `Course "${courseTitle}" created successfully!`);
      setShowCourseModal(false);
      setCourseTitle("");
      setCourseSlug("");
      setCourseDescription("");
      loadCourses();
      loadOverviewMetrics();
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm("Are you sure? This will delete the course and all associated modules and tasks.")) {
      const { success, error } = await adminService.deleteCourse(courseId);
      if (success) {
        showToast("info", "Course deleted");
        if (selectedCourse?.id === courseId) {
          setSelectedCourse(null);
          setModules([]);
        }
        loadCourses();
        loadOverviewMetrics();
      } else {
        showToast("error", error || "Failed to delete course");
      }
    }
  };

  // Actions: Modules
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    if (!moduleTitle.trim()) {
      showToast("error", "Module title is required");
      return;
    }

    const { data, error } = await adminService.createModule({
      course_id: selectedCourse.id,
      title: moduleTitle.trim(),
      order_index: moduleOrder,
      is_pro_only: moduleIsProOnly,
    });

    if (error) {
      showToast("error", error);
    } else {
      showToast("success", `Module "${moduleTitle}" added to ${selectedCourse.title}!`);
      setModuleTitle("");
      setModuleOrder((prev) => prev + 1);
      setModuleIsProOnly(false);
      selectCourse(selectedCourse);
      loadOverviewMetrics();
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (confirm("Delete this module? Associated tasks will be detached.")) {
      const { success, error } = await adminService.deleteModule(moduleId);
      if (success) {
        showToast("info", "Module deleted");
        if (selectedCourse) selectCourse(selectedCourse);
        loadOverviewMetrics();
      } else {
        showToast("error", error || "Failed to delete module");
      }
    }
  };

  const handleOpenEditModule = (m: Module) => {
    setEditingModule(m);
    setEditAboutContent(m.about_content || "");
    setEditYoutubeUrl(m.youtube_url || "");
    setEditYoutubeTitle(m.youtube_title || "");
    setEditReadingTime(m.reading_time_minutes || 5);
    setEditKeyTakeaways(Array.isArray(m.key_takeaways) ? m.key_takeaways.join("\n") : "");
    setEditIsProOnly(Boolean(m.is_pro_only));
  };

  const handleSaveModuleContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule || !selectedCourse) return;

    setSavingModuleContent(true);
    const takeawaysArray = editKeyTakeaways
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const { error } = await adminService.updateModule(editingModule.id, {
      about_content: editAboutContent.trim(),
      youtube_url: editYoutubeUrl.trim(),
      youtube_title: editYoutubeTitle.trim(),
      reading_time_minutes: Number(editReadingTime) || 5,
      key_takeaways: takeawaysArray,
      is_pro_only: editIsProOnly,
    });

    setSavingModuleContent(false);
    if (error) {
      showToast("error", error);
    } else {
      showToast("success", `Study guide & video updated for "${editingModule.title}"`);
      setEditingModule(null);
      selectCourse(selectedCourse);
    }
  };

  // Actions: Test Cases in Creator Form
  const handleAddTestCase = () => {
    setTaskTestCases([
      ...taskTestCases,
      { input: "", expected_output: "", is_hidden: false, explanation: "" },
    ]);
  };

  const handleRemoveTestCase = (index: number) => {
    setTaskTestCases(taskTestCases.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (index: number, field: keyof NewTestCaseItem, val: any) => {
    const updated = [...taskTestCases];
    updated[index] = { ...updated[index], [field]: val };
    setTaskTestCases(updated);
  };

  // MCQ Options handler
  const handleAddMcqOption = () => {
    if (mcqOptions.length >= 6) {
      showToast("warning", "Maximum 6 options allowed");
      return;
    }
    const nextChar = String.fromCharCode(65 + mcqOptions.length);
    setMcqOptions([...mcqOptions, `Option ${nextChar}`]);
  };

  const handleRemoveMcqOption = (index: number) => {
    if (mcqOptions.length <= 2) {
      showToast("warning", "At least 2 options required");
      return;
    }
    const removedOption = mcqOptions[index];
    const updated = mcqOptions.filter((_, i) => i !== index);
    setMcqOptions(updated);
    if (mcqCorrectAnswer === removedOption) {
      setMcqCorrectAnswer(updated[0] || "");
    }
  };

  const handleMcqOptionChange = (index: number, value: string) => {
    const prevVal = mcqOptions[index];
    const updated = [...mcqOptions];
    updated[index] = value;
    setMcqOptions(updated);
    if (mcqCorrectAnswer === prevVal) {
      setMcqCorrectAnswer(value);
    }
  };

  // Actions: Challenge Edit Mode
  const handleStartEditTask = async (task: any) => {
    setEditingTaskId(task.id);
    setTaskType(task.task_type === "mcq" ? "mcq" : "algorithm");
    setTaskTitle(task.title || "");
    setTaskSlug(task.slug || "");
    setTaskDescription(task.description || "");
    setTaskLanguage(task.language || "python");
    setTaskDifficulty((task.difficulty as any) || "easy");
    setTaskPoints(task.points || 15);
    setTaskStarterCode(task.starter_code || "");
    setTaskSolutionCode(task.solution_code || "");
    setTaskOrderIndex(task.order_index || 1);
    if (task.options && Array.isArray(task.options) && task.options.length > 0) {
      setMcqOptions(task.options);
    }
    if (task.correct_answer) {
      setMcqCorrectAnswer(task.correct_answer);
    }

    if (task.module_id) {
      setTaskModuleId(task.module_id);
      const mod = modules.find((m) => m.id === task.module_id);
      if (mod) {
        setTaskCourseId(mod.course_id);
      }
    }

    try {
      const { data } = await adminService.getTaskWithAllTestCases(task.id);
      if (data && data.test_cases && data.test_cases.length > 0) {
        setTaskTestCases(
          data.test_cases.map((tc) => ({
            input: tc.input || "",
            expected_output: tc.expected_output || "",
            is_hidden: Boolean(tc.is_hidden),
            explanation: tc.explanation || "",
          }))
        );
      }
    } catch {
      // Keep existing default
    }

    setTasksTab("create");
    showToast("info", `Editing challenge: ${task.title}`);
  };

  const handleCancelEditTask = () => {
    setEditingTaskId(null);
    setTaskTitle("");
    setTaskSlug("");
    setTaskDescription("");
    setTaskStarterCode("");
    setTaskSolutionCode("");
    setTaskType("algorithm");
    setTaskOrderIndex(1);
    setTaskTestCases([
      { input: "1 2\n", expected_output: "3", is_hidden: false, explanation: "Public sample case" },
      { input: "10 20\n", expected_output: "30", is_hidden: true, explanation: "Hidden evaluation benchmark" },
    ]);
  };

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

    if (editingTaskId) {
      const { error } = await adminService.updateTask(editingTaskId, {
        module_id: taskModuleId,
        title: taskTitle.trim(),
        slug: taskSlug.trim().toLowerCase(),
        description: taskDescription.trim(),
        task_type: taskType,
        language: taskLanguage,
        difficulty: taskDifficulty,
        starter_code: taskType === "algorithm" ? taskStarterCode : null,
        solution_code: taskType === "algorithm" ? taskSolutionCode : null,
        options: taskType === "mcq" ? mcqOptions : [],
        correct_answer: taskType === "mcq" ? mcqCorrectAnswer : undefined,
        points: taskPoints,
        order_index: taskOrderIndex,
      });

      if (error) {
        showToast("error", error);
      } else {
        showToast("success", `Challenge "${taskTitle}" updated successfully!`);
        handleCancelEditTask();
        loadTasks();
        setTasksTab("catalog");
      }
      return;
    }

    const { error } = await adminService.createTask(
      {
        module_id: taskModuleId,
        title: taskTitle.trim(),
        slug: taskSlug.trim().toLowerCase(),
        description: taskDescription.trim(),
        task_type: taskType,
        language: taskLanguage,
        difficulty: taskDifficulty,
        starter_code: taskType === "algorithm" ? taskStarterCode : null,
        solution_code: taskType === "algorithm" ? taskSolutionCode : null,
        options: taskType === "mcq" ? mcqOptions : [],
        correct_answer: taskType === "mcq" ? mcqCorrectAnswer : undefined,
        points: taskPoints,
        order_index: taskOrderIndex,
      },
      taskType === "algorithm" ? taskTestCases : []
    );

    if (error) {
      showToast("error", error);
    } else {
      showToast("success", `Task "${taskTitle}" successfully created!`);
      handleCancelEditTask();
      loadTasks();
      loadOverviewMetrics();
      setTasksTab("catalog");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Delete this problem permanently?")) {
      const { success, error } = await adminService.deleteTask(taskId);
      if (success) {
        showToast("info", "Task deleted");
        loadTasks();
        loadOverviewMetrics();
      } else {
        showToast("error", error || "Failed to delete task");
      }
    }
  };

  // Actions: User Management & Subscriptions
  const handleToggleUserSubscription = (targetUser: Profile) => {
    const currentPlan = planStorage.getPlan(targetUser.id);
    const nextPlan = currentPlan === "pro" ? "starter" : "pro";
    planStorage.setPlan(nextPlan, targetUser.id);
    setPlanTick((prev) => prev + 1);
    showToast(
      "success",
      `${targetUser.full_name || targetUser.email} switched to ${
        nextPlan === "pro" ? "AarCode Pro Tier (₹49)" : "Free Starter Tier"
      }`
    );
  };

  const handleToggleUserRole = async (targetUser: Profile) => {
    const nextRole = targetUser.role === "admin" ? "student" : "admin";
    if (confirm(`Change ${targetUser.full_name || targetUser.email}'s role to ${nextRole.toUpperCase()}?`)) {
      const { success, error } = await adminService.updateUserRole(targetUser.id, nextRole);
      if (success) {
        showToast("success", `Role updated to ${nextRole}`);
        loadUsers();
      } else {
        showToast("error", error || "Failed to update role");
      }
    }
  };

  // Judge Ping Latency Check
  const handlePingWandbox = async () => {
    setIsPingingWandbox(true);
    const start = performance.now();
    try {
      const res = await executeCode({
        code: `print("AarCode judge engine healthy")`,
        language: "python",
        stdin: "",
      });
      const end = performance.now();
      const elapsed = Math.round(end - start);
      setWandboxLatency(elapsed);
      if (res.status === "success") {
        showToast("success", `Judge engine responded in ${elapsed}ms: ${res.stdout.trim()}`);
      } else {
        showToast("warning", `Judge responded with errors: ${res.stderr || "Unknown"}`);
      }
    } catch (e: any) {
      showToast("error", `Judge ping failed: ${e.message}`);
    } finally {
      setIsPingingWandbox(false);
    }
  };

  // Quick Seed Trigger
  const handleQuickSeed = async () => {
    if (confirm("Populate database with default courses, modules, and tasks?")) {
      setIsSeeding(true);
      try {
        const { data: c1 } = await adminService.createCourse({
          title: "Python Data Structures & Algorithms",
          slug: "python-dsa",
          description: "Master essential algorithms, arrays, two pointers, and stacks.",
          is_published: true,
        });

        if (c1) {
          const { data: m1 } = await adminService.createModule({
            course_id: c1.id,
            title: "Arrays & Hashing",
            order_index: 1,
          });

          if (m1) {
            await adminService.createTask(
              {
                module_id: m1.id,
                title: "Two Sum",
                slug: "two-sum",
                description: "Given an array of integers nums and an integer target, return indices of two numbers that add up to target.",
                language: "python",
                difficulty: "easy",
                points: 10,
                order_index: 1,
                starter_code: `def two_sum(nums, target):\n    return []\n`,
              },
              [
                { input: "[2, 7, 11, 15]\n9", expected_output: "[0, 1]", is_hidden: false, explanation: "nums[0]+nums[1]==9" },
                { input: "[3, 2, 4]\n6", expected_output: "[1, 2]", is_hidden: false, explanation: "nums[1]+nums[2]==6" },
              ]
            );
          }
        }

        showToast("success", "Database seeded successfully!");
        loadCourses();
        loadTasks();
        loadOverviewMetrics();
      } catch (err: any) {
        showToast("error", err.message || "Seeding failed");
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const copySubmissionCode = () => {
    if (!selectedSubmission) return;
    navigator.clipboard.writeText(selectedSubmission.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showToast("success", "Code copied to clipboard");
  };

  // Auth Guard
  if (authLoading) {
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0C0D0E] text-slate-500 font-urbanist">
        <Loader2 size={32} className="animate-spin text-emerald-500 mb-2" />
        <span className="ml-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Verifying administrator permissions...
        </span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] w-full flex flex-col items-center justify-center p-6 bg-[#F8FAFC] dark:bg-[#0C0D0E] text-center space-y-4 font-urbanist">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/10 border border-amber-500/20">
          <ShieldAlert size={36} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Admin Gatekeeper
        </h1>
        <p className="text-sm text-slate-500 max-w-sm">
          Access restricted. You must be signed in with an administrator role to manage courses, tasks, and system settings.
        </p>
        <button
          onClick={() => navigate("problems")}
          className="px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
        >
          Return to Problem Arena
        </button>
      </div>
    );
  }

  // Filtered lists
  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.slug.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const filteredTasks = allTasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.slug.toLowerCase().includes(taskSearch.toLowerCase());
    const matchesLang = taskLanguageFilter === "all" || t.language === taskLanguageFilter;
    const matchesDiff = taskDifficultyFilter === "all" || t.difficulty === taskDifficultyFilter;
    return matchesSearch && matchesLang && matchesDiff;
  });

  const filteredSubmissions = submissions.filter((s) => {
    const matchesStatus = subStatusFilter === "all" || s.status === subStatusFilter;
    const studentName = s.profiles?.full_name || s.profiles?.email || "";
    const taskTitle = s.tasks?.title || "";
    const matchesSearch =
      studentName.toLowerCase().includes(subSearch.toLowerCase()) ||
      taskTitle.toLowerCase().includes(subSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredUsers = users.filter((u) => {
    if (planTick < 0) return false;
    const name = u.full_name || "";
    const email = u.email || "";
    const matchesSearch =
      name.toLowerCase().includes(userSearch.toLowerCase()) ||
      email.toLowerCase().includes(userSearch.toLowerCase());

    const plan = planStorage.getPlan(u.id);
    const matchesPlan =
      userPlanFilter === "all" ||
      (userPlanFilter === "starter" && plan === "starter" && u.role !== "admin") ||
      (userPlanFilter === "pro" && plan === "pro") ||
      (userPlanFilter === "admin" && u.role === "admin");

    return matchesSearch && matchesPlan;
  });

  const passRate =
    metrics.submissionsCount > 0
      ? Math.round((metrics.passedSubmissionsCount / metrics.submissionsCount) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0C0D0E] text-slate-900 dark:text-white font-urbanist transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* =====================================================================
            1. COMMAND CENTER HERO BANNER (AarCode Standard)
        ===================================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#1F2327]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider uppercase bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border border-emerald-500/20">
              <ShieldCheck size={14} />
              <span>AarCode Admin Console • Logic First.</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-2.5">
              Curriculum &amp; System Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#8A9099] mt-1 max-w-2xl">
              An AarGa Hub Software Production. Dynamic CMS for curriculum tracks, problem challenges, test cases, and student access control.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Ping Wandbox Latency Pill */}
            <button
              onClick={handlePingWandbox}
              disabled={isPingingWandbox}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-[#00F076] text-xs font-bold font-mono hover:bg-emerald-500/20 transition-all cursor-pointer shadow-xs"
              title="Ping Wandbox Judge Execution Runtime"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Judge Engine</span>
              {wandboxLatency !== null && (
                <span className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-black/30 text-[10px] text-emerald-600 dark:text-emerald-400">
                  {wandboxLatency}ms
                </span>
              )}
            </button>

            {/* Quick Actions */}
            <button
              onClick={() => setShowCourseModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#131517] hover:bg-slate-200 dark:hover:bg-[#1F2327] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#1F2327] text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>New Track</span>
            </button>

            <button
              onClick={() => {
                setActiveSection("tasks");
                setTasksTab("create");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Plus size={14} />
              <span>New Problem</span>
            </button>
          </div>
        </div>

        {/* =====================================================================
            2. TELEMETRY KPI METRICS ROW
        ===================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#131517] border border-slate-200 dark:border-[#1F2327] shadow-xs space-y-3">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Active Students</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-[#00F076]">
                <Users size={18} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {metrics.usersCount || users.length}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                Telemetry Synced
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#131517] border border-slate-200 dark:border-[#1F2327] shadow-xs space-y-3">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Learning Tracks</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-[#00F076]">
                <BookOpen size={18} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {metrics.coursesCount || courses.length}
              </span>
              <span className="text-xs text-slate-400 font-mono">Curriculums</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#131517] border border-slate-200 dark:border-[#1F2327] shadow-xs space-y-3">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Problem Bank</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Code2 size={18} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {metrics.tasksCount || allTasks.length}
              </span>
              <span className="text-xs text-amber-500 font-semibold font-mono">Challenges</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#131517] border border-slate-200 dark:border-[#1F2327] shadow-xs space-y-3">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Submissions &amp; Pass Rate</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {metrics.submissionsCount || submissions.length}
              </span>
              <span className="text-xs font-semibold font-mono text-emerald-600 dark:text-[#00F076]">
                {passRate}% Pass Rate
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================================
            3. HORIZONTAL WORKSPACE NAVIGATION TABS (LeetCode / CodeChef Style)
        ===================================================================== */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar border-b border-slate-200 dark:border-[#1F2327]">
          <button
            onClick={() => setActiveSection("overview")}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer",
              activeSection === "overview"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#131517]"
            )}
          >
            <BarChart3 size={16} />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveSection("courses")}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer",
              activeSection === "courses"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#131517]"
            )}
          >
            <BookOpen size={16} />
            <span>Tracks &amp; Modules</span>
            {metrics.coursesCount > 0 && (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-mono",
                activeSection === "courses" ? "bg-black/20 text-black" : "bg-slate-100 dark:bg-[#1F2327] text-slate-500"
              )}>
                {metrics.coursesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection("tasks")}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer",
              activeSection === "tasks"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#131517]"
            )}
          >
            <Code2 size={16} />
            <span>Problem Bank</span>
            {metrics.tasksCount > 0 && (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-mono",
                activeSection === "tasks" ? "bg-black/20 text-black" : "bg-slate-100 dark:bg-[#1F2327] text-slate-500"
              )}>
                {metrics.tasksCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveSection("submissions");
              loadSubmissions();
            }}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer",
              activeSection === "submissions"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#131517]"
            )}
          >
            <Terminal size={16} />
            <span>Live Submissions</span>
            {submissions.length > 0 && (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-mono",
                activeSection === "submissions" ? "bg-black/20 text-black" : "bg-slate-100 dark:bg-[#1F2327] text-slate-500"
              )}>
                {submissions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection("users")}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer",
              activeSection === "users"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#131517]"
            )}
          >
            <Users size={16} />
            <span>Student Access &amp; Pro</span>
            {users.length > 0 && (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-mono",
                activeSection === "users" ? "bg-black/20 text-black" : "bg-slate-100 dark:bg-[#1F2327] text-slate-500"
              )}>
                {users.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection("system")}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer",
              activeSection === "system"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#131517]"
            )}
          >
            <Server size={16} />
            <span>Judge &amp; Engine</span>
          </button>
        </div>

        {/* =====================================================================
            VIEW 1: OVERVIEW DASHBOARD
        ===================================================================== */}
        {activeSection === "overview" && (
          <div className="space-y-6">
            {/* Quick Operation Control Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setShowCourseModal(true)}
                className="p-5 rounded-2xl bg-white dark:bg-[#131517] border border-slate-200 dark:border-[#1F2327] hover:border-emerald-500/40 cursor-pointer transition-all hover:scale-[1.01] group space-y-2 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] flex items-center justify-center border border-emerald-500/20">
                  <Plus size={20} />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  Add Learning Track
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#8A9099]">
                  Create a new curriculum track, define modules, and structure difficulty progressions.
                </p>
              </div>

              <div
                onClick={() => {
                  setActiveSection("tasks");
                  setTasksTab("create");
                }}
                className="p-5 rounded-2xl bg-white dark:bg-[#131517] border border-slate-200 dark:border-[#1F2327] hover:border-emerald-500/40 cursor-pointer transition-all hover:scale-[1.01] group space-y-2 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <Code2 size={20} />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  Create Problem Challenge
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#8A9099]">
                  Write problem descriptions, define starter templates, and set public and hidden test cases.
                </p>
              </div>

              <div
                onClick={handleQuickSeed}
                className="p-5 rounded-2xl bg-white dark:bg-[#131517] border border-slate-200 dark:border-[#1F2327] hover:border-amber-500/40 cursor-pointer transition-all hover:scale-[1.01] group space-y-2 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  {isSeeding ? <Loader2 size={20} className="animate-spin" /> : <Database size={20} />}
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                  Seed Starter Curriculum
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#8A9099]">
                  Instantly populate database with essential DSA modules, starter challenges, and test cases.
                </p>
              </div>
            </div>

            {/* Recent Activity: Submissions snapshot */}
            <div className="rounded-2xl border border-slate-200 dark:border-[#1F2327] bg-white dark:bg-[#131517] p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Recent Evaluations
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#8A9099]">Latest code evaluated by judge execution engine</p>
                </div>
                <button
                  onClick={() => setActiveSection("submissions")}
                  className="text-xs font-bold text-emerald-600 dark:text-[#00F076] hover:underline"
                >
                  View All Logs →
                </button>
              </div>

              {submissions.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No submissions recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 dark:border-[#1F2327] text-[10px] uppercase font-bold text-slate-400 bg-slate-50/50 dark:bg-[#0C0D0E]/50">
                      <tr>
                        <th className="py-2.5 px-3">Student</th>
                        <th className="py-2.5 px-3">Task</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Passed</th>
                        <th className="py-2.5 px-3">Time</th>
                        <th className="py-2.5 px-3 text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#1F2327]/60 font-mono">
                      {submissions.slice(0, 5).map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-[#181B1D]">
                          <td className="py-2.5 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                            {sub.profiles?.full_name || sub.profiles?.email || sub.user_id.slice(0, 8)}
                          </td>
                          <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">
                            {sub.tasks?.title || "Coding Challenge"}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                                sub.status === "passed"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                              )}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                            {sub.passed_cases} / {sub.total_cases}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {sub.execution_time_ms ? `${sub.execution_time_ms} ms` : "-"}
                          </td>
                          <td className="py-2.5 px-3 text-right font-sans">
                            <button
                              onClick={() => setSelectedSubmission(sub)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#1F2327] hover:bg-emerald-500 hover:text-black text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              View Code
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 2: COURSES & MODULES MANAGEMENT
        ===================================================================== */}
        {activeSection === "courses" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Track Catalog */}
            <div className="rounded-2xl border border-slate-200 dark:border-[#1F2327] bg-white dark:bg-[#131517] p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tracks Catalog ({courses.length})
                </h3>
                <button
                  onClick={() => setShowCourseModal(true)}
                  className="p-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 cursor-pointer shadow-xs"
                  title="Add Course"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="Search tracks..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Courses List */}
              <div className="space-y-2">
                {filteredCourses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => selectCourse(c)}
                    className={cn(
                      "p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between",
                      selectedCourse?.id === c.id
                        ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-700 dark:text-[#00F076] font-semibold shadow-xs"
                        : "border-slate-200 dark:border-[#1F2327] hover:bg-slate-50 dark:hover:bg-[#181B1D] text-slate-700 dark:text-slate-300"
                    )}
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{c.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">/{c.slug}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const currentStatus = (c as any).enrollment_status || "open";
                          const nextStatus = currentStatus === "open" ? "closed" : "open";
                          try {
                            await supabase.from("courses").update({ enrollment_status: nextStatus }).eq("id", c.id);
                            setCourses((prev) =>
                              prev.map((item) =>
                                item.id === c.id ? ({ ...item, enrollment_status: nextStatus } as any) : item
                              )
                            );
                            showToast("success", `Track enrollment set to ${nextStatus.toUpperCase()}`);
                          } catch {
                            showToast("error", "Failed to update enrollment status");
                          }
                        }}
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer",
                          ((c as any).enrollment_status || "open") === "open"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-[#00F076] border border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-rose-500/15 text-rose-500 border border-rose-500/30 hover:bg-rose-500/25"
                        )}
                        title="Click to toggle Enrollment: Open / Closed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{((c as any).enrollment_status || "open") === "open" ? "Open" : "Closed"}</span>
                      </button>

                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          c.is_published
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-500/10 text-slate-400"
                        )}
                      >
                        {c.is_published ? "Live" : "Draft"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(c.id);
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                        title="Delete track"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Modules for Selected Course */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-[#1F2327] bg-white dark:bg-[#131517] p-6 space-y-6 shadow-xs">
              {selectedCourse ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1F2327] pb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {selectedCourse.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-[#8A9099]">
                        Configure chapters and module breakdown for this track
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] font-bold">
                      {modules.length} Modules
                    </span>
                  </div>

                  {/* Modules List */}
                  <div className="space-y-3">
                    {modules.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-[#1F2327] flex items-center justify-between bg-slate-50/50 dark:bg-[#0C0D0E]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] font-bold text-xs flex items-center justify-center font-mono">
                            {m.order_index}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {m.title}
                            </span>
                            {m.about_content && (
                              <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-[#00F076]">
                                Study Guide Active
                              </span>
                            )}
                            {m.youtube_url && (
                              <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500">
                                Video Linked
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Module Tier Toggle */}
                          <button
                            type="button"
                            onClick={async () => {
                              const nextTier = !m.is_pro_only;
                              const { error } = await adminService.updateModule(m.id, { is_pro_only: nextTier });
                              if (!error) {
                                showToast("success", `Module set to ${nextTier ? "Pro Tier (₹49)" : "Free Starter"}`);
                                selectCourse(selectedCourse);
                              }
                            }}
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer",
                              m.is_pro_only
                                ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                                : "bg-emerald-500/15 text-emerald-600 dark:text-[#00F076] border border-emerald-500/30"
                            )}
                            title="Click to toggle Free Starter vs Pro Tier (₹49)"
                          >
                            <Lock size={10} />
                            <span>{m.is_pro_only ? "Pro (₹49)" : "Free"}</span>
                          </button>

                          <button
                            onClick={() => handleOpenEditModule(m)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] hover:bg-emerald-500 hover:text-black text-xs font-bold transition-all cursor-pointer"
                          >
                            <Edit3 size={12} />
                            <span>Study Material</span>
                          </button>
                          <button
                            onClick={() => handleDeleteModule(m.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                            title="Delete module"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Module Inline Form */}
                  <form onSubmit={handleCreateModule} className="pt-4 border-t border-slate-100 dark:border-[#1F2327] flex flex-wrap gap-2 items-center">
                    <input
                      type="text"
                      value={moduleTitle}
                      onChange={(e) => setModuleTitle(e.target.value)}
                      placeholder="Add module (e.g. Binary Search)"
                      className="flex-1 min-w-[200px] px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="number"
                      min={1}
                      value={moduleOrder}
                      onChange={(e) => setModuleOrder(Number(e.target.value))}
                      className="w-16 px-2.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 font-mono text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setModuleIsProOnly(!moduleIsProOnly)}
                      className={cn(
                        "px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1 cursor-pointer",
                        moduleIsProOnly
                          ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30"
                          : "bg-emerald-500/15 text-emerald-600 dark:text-[#00F076] border-emerald-500/30"
                      )}
                    >
                      <Lock size={12} />
                      <span>{moduleIsProOnly ? "Pro (₹49)" : "Free"}</span>
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black transition-colors shrink-0 cursor-pointer shadow-xs"
                    >
                      Add Module
                    </button>
                  </form>
                </>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <BookOpen size={36} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold">Select a course to view its curriculum modules</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 3: PROBLEM BANK & TASK CREATOR
        ===================================================================== */}
        {activeSection === "tasks" && (
          <div className="space-y-6">
            {/* Sub-Tabs: Catalog vs Create */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1F2327] pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTasksTab("catalog")}
                  className={cn(
                    "px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer",
                    tasksTab === "catalog"
                      ? "bg-emerald-500 text-black shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#131517]"
                  )}
                >
                  Problem Bank ({allTasks.length})
                </button>
                <button
                  onClick={() => setTasksTab("create")}
                  className={cn(
                    "px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5",
                    tasksTab === "create"
                      ? "bg-emerald-500 text-black shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#131517]"
                  )}
                >
                  <Plus size={13} />
                  <span>{editingTaskId ? "Edit Challenge" : "Create New Problem"}</span>
                </button>
              </div>

              {editingTaskId && (
                <button
                  onClick={handleCancelEditTask}
                  className="text-xs text-rose-500 hover:underline font-semibold cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* TAB: Catalog */}
            {tasksTab === "catalog" && (
              <div className="rounded-2xl border border-slate-200 dark:border-[#1F2327] bg-white dark:bg-[#131517] p-5 space-y-4 shadow-xs">
                {/* Search & Filters */}
                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <div className="relative flex-1 min-w-[240px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                      placeholder="Search problem title or slug..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={taskLanguageFilter}
                      onChange={(e) => setTaskLanguageFilter(e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-700 dark:text-slate-300"
                    >
                      <option value="all">All Languages</option>
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                      <option value="javascript">JavaScript</option>
                    </select>

                    <select
                      value={taskDifficultyFilter}
                      onChange={(e) => setTaskDifficultyFilter(e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-700 dark:text-slate-300"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Problems Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 dark:border-[#1F2327] text-[10px] uppercase font-bold text-slate-400 bg-slate-50/50 dark:bg-[#0C0D0E]/50">
                      <tr>
                        <th className="py-2.5 px-4">Title</th>
                        <th className="py-2.5 px-4">Type</th>
                        <th className="py-2.5 px-4">Slug</th>
                        <th className="py-2.5 px-4">Language</th>
                        <th className="py-2.5 px-4">Difficulty</th>
                        <th className="py-2.5 px-4">Points</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#1F2327]/60">
                      {filteredTasks.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-[#181B1D]">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {t.title}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px]">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                                t.task_type === "mcq"
                                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              )}
                            >
                              {t.task_type === "mcq" ? "Diagnostic MCQ" : "Coding"}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                            /{t.slug}
                          </td>
                          <td className="py-3 px-4 font-mono uppercase font-semibold text-[11px] text-emerald-600 dark:text-[#00F076]">
                            {t.language}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                t.difficulty === "easy" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                                t.difficulty === "medium" && "bg-amber-500/10 text-amber-500",
                                t.difficulty === "hard" && "bg-rose-500/10 text-rose-500"
                              )}
                            >
                              {t.difficulty}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-amber-500">
                            +{t.points || 15} XP
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleStartEditTask(t)}
                              className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer mr-1"
                              title="Edit Problem"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(t.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete Problem"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: Create / Edit Problem Form */}
            {tasksTab === "create" && (
              <form onSubmit={handleCreateTask} className="rounded-2xl border border-slate-200 dark:border-[#1F2327] bg-white dark:bg-[#131517] p-6 space-y-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1F2327] pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] flex items-center justify-center border border-emerald-500/20">
                      {editingTaskId ? <Edit3 size={16} /> : <Plus size={16} />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {editingTaskId ? "Edit Problem Challenge" : "Author New Algorithmic Challenge"}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-[#8A9099]">
                        Design problem statement, target track module, templates, and evaluation test cases.
                      </p>
                    </div>
                  </div>

                  {/* Problem Type Toggle: Algorithmic Challenge vs Diagnostic MCQ */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327]">
                    <button
                      type="button"
                      onClick={() => setTaskType("algorithm")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                        taskType === "algorithm"
                          ? "bg-white dark:bg-[#131517] text-emerald-600 dark:text-[#00F076] shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <Code2 size={13} />
                      <span>Coding Challenge</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskType("mcq")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                        taskType === "mcq"
                          ? "bg-white dark:bg-[#131517] text-purple-600 dark:text-purple-400 shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <Radio size={13} />
                      <span>Diagnostic MCQ</span>
                    </button>
                  </div>
                </div>

                {/* Target Course & Module Picker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Target Course Track *
                    </label>
                    <select
                      value={taskCourseId}
                      onChange={(e) => setTaskCourseId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#1F2327] bg-slate-50 dark:bg-[#0C0D0E] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Select Course Track...</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Target Module *
                    </label>
                    <select
                      value={taskModuleId}
                      onChange={(e) => setTaskModuleId(e.target.value)}
                      disabled={!taskCourseId || availableModules.length === 0}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#1F2327] bg-slate-50 dark:bg-[#0C0D0E] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                      required
                    >
                      <option value="">
                        {!taskCourseId
                          ? "Select a course first"
                          : availableModules.length === 0
                          ? "No modules available"
                          : "Select Module..."}
                      </option>
                      {availableModules.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.order_index}. {m.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Basic Meta: Title, Slug, Points */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Problem Title *
                    </label>
                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(e) => handleTaskTitleChange(e.target.value)}
                      placeholder="e.g. Valid Anagram"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      value={taskSlug}
                      onChange={(e) => setTaskSlug(e.target.value)}
                      placeholder="valid-anagram"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Points (XP)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={100}
                      value={taskPoints}
                      onChange={(e) => setTaskPoints(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 font-mono text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Difficulty & Language */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Difficulty Level
                    </label>
                    <select
                      value={taskDifficulty}
                      onChange={(e) => setTaskDifficulty(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#1F2327] bg-slate-50 dark:bg-[#0C0D0E] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="easy">Easy (Fundamentals)</option>
                      <option value="medium">Medium (Algorithmic)</option>
                      <option value="hard">Hard (Advanced / Complex)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Primary Language
                    </label>
                    <select
                      value={taskLanguage}
                      onChange={(e) => setTaskLanguage(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#1F2327] bg-slate-50 dark:bg-[#0C0D0E] text-slate-800 dark:text-slate-200 uppercase font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                      <option value="javascript">JavaScript</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Order Index
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={taskOrderIndex}
                      onChange={(e) => setTaskOrderIndex(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#1F2327] bg-slate-50 dark:bg-[#0C0D0E] text-slate-800 dark:text-slate-200 font-mono text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Problem Description with Write / Preview Tabs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Problem Statement &amp; Constraints (Markdown Supported)
                    </label>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0C0D0E] p-1 rounded-lg border border-slate-200 dark:border-[#1F2327]">
                      <button
                        type="button"
                        onClick={() => setDescTab("write")}
                        className={cn(
                          "px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer",
                          descTab === "write"
                            ? "bg-white dark:bg-[#131517] text-emerald-600 dark:text-[#00F076] shadow-xs"
                            : "text-slate-400"
                        )}
                      >
                        Write
                      </button>
                      <button
                        type="button"
                        onClick={() => setDescTab("preview")}
                        className={cn(
                          "px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer",
                          descTab === "preview"
                            ? "bg-white dark:bg-[#131517] text-emerald-600 dark:text-[#00F076] shadow-xs"
                            : "text-slate-400"
                        )}
                      >
                        Preview
                      </button>
                    </div>
                  </div>

                  {descTab === "write" ? (
                    <textarea
                      rows={6}
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      placeholder="### Problem Statement&#10;Given an array of integers nums...&#10;&#10;### Examples&#10;Input: nums = [2,7,11,15], target = 9&#10;Output: [0,1]&#10;&#10;### Constraints&#10;- 2 <= nums.length <= 10^4&#10;- -10^9 <= nums[i] <= 10^9"
                      className="w-full p-3.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-xs leading-relaxed text-slate-800 dark:text-slate-200 min-h-[140px] whitespace-pre-wrap font-mono">
                      {taskDescription || "(No description written yet)"}
                    </div>
                  )}
                </div>

                {/* If MCQ: Options & Correct Key */}
                {taskType === "mcq" && (
                  <div className="p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Radio size={14} className="text-purple-500" />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Diagnostic MCQ Options &amp; Answer Key
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddMcqOption}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors cursor-pointer"
                      >
                        + Add Option
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {mcqOptions.map((opt, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="mcq_answer_key"
                            checked={mcqCorrectAnswer === opt}
                            onChange={() => setMcqCorrectAnswer(opt)}
                            className="text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                            title="Select as correct answer key"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleMcqOptionChange(i, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                            className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveMcqOption(i)}
                            className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                            title="Remove option"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* If Coding: Starter & Solution Code */}
                {taskType === "algorithm" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Starter Code Template ({taskLanguage})
                      </label>
                      <textarea
                        rows={7}
                        value={taskStarterCode}
                        onChange={(e) => setTaskStarterCode(e.target.value)}
                        placeholder="def solution():&#10;    # Write your logic here&#10;    pass"
                        className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Official Solution Benchmark ({taskLanguage})
                      </label>
                      <textarea
                        rows={7}
                        value={taskSolutionCode}
                        onChange={(e) => setTaskSolutionCode(e.target.value)}
                        placeholder="def solution():&#10;    # Reference optimal implementation&#10;    return result"
                        className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* If Coding: Test Cases Manager */}
                {taskType === "algorithm" && (
                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#1F2327]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                          Evaluation Test Cases ({taskTestCases.length})
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Manage public samples (visible to students) and hidden edge cases.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddTestCase}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] hover:bg-emerald-500 hover:text-black transition-colors cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>Add Test Case</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {taskTestCases.map((tc, index) => (
                        <div
                          key={index}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-[#1F2327] bg-slate-50/50 dark:bg-[#0C0D0E] space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                              Case #{index + 1}
                            </span>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={tc.is_hidden}
                                  onChange={(e) =>
                                    handleTestCaseChange(index, "is_hidden", e.target.checked)
                                  }
                                  className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                                />
                                <span>Hidden Edge Case</span>
                              </label>
                              {taskTestCases.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTestCase(index)}
                                  className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                                  title="Remove test case"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                                Standard Input (stdin)
                              </span>
                              <textarea
                                rows={2}
                                value={tc.input}
                                onChange={(e) =>
                                  handleTestCaseChange(index, "input", e.target.value)
                                }
                                placeholder="[1, 2, 3]\n3"
                                className="w-full p-2 text-xs font-mono rounded-lg bg-white dark:bg-[#131517] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                                Expected Output (stdout)
                              </span>
                              <textarea
                                rows={2}
                                value={tc.expected_output}
                                onChange={(e) =>
                                  handleTestCaseChange(index, "expected_output", e.target.value)
                                }
                                placeholder="6"
                                className="w-full p-2 text-xs font-mono rounded-lg bg-white dark:bg-[#131517] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Submit Footer */}
                <div className="pt-4 border-t border-slate-100 dark:border-[#1F2327] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      handleCancelEditTask();
                      setTasksTab("catalog");
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1F2327] text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1F2327] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
                  >
                    {editingTaskId ? "Save Challenge Updates" : "Publish Challenge to Curriculum"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* =====================================================================
            VIEW 4: LIVE SUBMISSIONS LOG
        ===================================================================== */}
        {activeSection === "submissions" && (
          <div className="rounded-2xl border border-slate-200 dark:border-[#1F2327] bg-white dark:bg-[#131517] p-5 space-y-4 shadow-xs">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Real-Time Evaluation Log
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#8A9099]">
                  Live feed of student executions evaluated by the judge engine
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                    placeholder="Search student or problem..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <select
                  value={subStatusFilter}
                  onChange={(e) => setSubStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-700 dark:text-slate-300"
                >
                  <option value="all">All Statuses</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed / Wrong Answer</option>
                  <option value="running">Running / In-Progress</option>
                </select>

                <button
                  onClick={loadSubmissions}
                  className="p-2 rounded-xl border border-slate-200 dark:border-[#1F2327] hover:bg-slate-100 dark:hover:bg-[#181B1D] text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Refresh Log"
                >
                  <RefreshCw size={14} className={loadingSubmissions ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {loadingSubmissions ? (
              <div className="py-12 flex justify-center">
                <Loader2 size={24} className="animate-spin text-emerald-500" />
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">No matching evaluation logs found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 dark:border-[#1F2327] text-[10px] uppercase font-bold text-slate-400 bg-slate-50/50 dark:bg-[#0C0D0E]/50">
                    <tr>
                      <th className="py-2.5 px-4">Student</th>
                      <th className="py-2.5 px-4">Challenge</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Passed Cases</th>
                      <th className="py-2.5 px-4">Language</th>
                      <th className="py-2.5 px-4">Runtime</th>
                      <th className="py-2.5 px-4 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#1F2327]/60 font-mono">
                    {filteredSubmissions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-[#181B1D]">
                        <td className="py-3 px-4 font-sans font-medium text-slate-900 dark:text-white">
                          {s.profiles?.full_name || s.profiles?.email || s.user_id.slice(0, 8)}
                        </td>
                        <td className="py-3 px-4 font-sans font-semibold text-slate-800 dark:text-slate-200">
                          {s.tasks?.title || "Coding Challenge"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                              s.status === "passed"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            )}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {s.passed_cases} / {s.total_cases}
                        </td>
                        <td className="py-3 px-4 uppercase text-[11px] font-semibold text-emerald-600 dark:text-[#00F076]">
                          {s.language || "python"}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {s.execution_time_ms ? `${s.execution_time_ms} ms` : "-"}
                        </td>
                        <td className="py-3 px-4 text-right font-sans">
                          <button
                            onClick={() => setSelectedSubmission(s)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#1F2327] hover:bg-emerald-500 hover:text-black text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Inspect Code
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            VIEW 5: STUDENT ACCESS CONTROL & PRO SUBSCRIPTIONS
        ===================================================================== */}
        {activeSection === "users" && (
          <div className="rounded-2xl border border-slate-200 dark:border-[#1F2327] bg-white dark:bg-[#131517] p-5 space-y-4 shadow-xs">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Student Directory &amp; Subscription Control
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#8A9099]">
                  Inspect student activity telemetry and manage AarCode Pro tier subscriptions (₹49).
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search name or email..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327]">
                  <button
                    type="button"
                    onClick={() => setUserPlanFilter("all")}
                    className={cn(
                      "px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer",
                      userPlanFilter === "all" ? "bg-emerald-500 text-black shadow-xs" : "text-slate-500"
                    )}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserPlanFilter("pro")}
                    className={cn(
                      "px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer",
                      userPlanFilter === "pro" ? "bg-emerald-500 text-black shadow-xs" : "text-slate-500"
                    )}
                  >
                    Pro Tier
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserPlanFilter("starter")}
                    className={cn(
                      "px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer",
                      userPlanFilter === "starter" ? "bg-emerald-500 text-black shadow-xs" : "text-slate-500"
                    )}
                  >
                    Free
                  </button>
                </div>
              </div>
            </div>

            {loadingUsers ? (
              <div className="py-12 flex justify-center">
                <Loader2 size={24} className="animate-spin text-emerald-500" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">No students found matching your criteria.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 dark:border-[#1F2327] text-[10px] uppercase font-bold text-slate-400 bg-slate-50/50 dark:bg-[#0C0D0E]/50">
                    <tr>
                      <th className="py-2.5 px-4">Student</th>
                      <th className="py-2.5 px-4">Email</th>
                      <th className="py-2.5 px-4">Role</th>
                      <th className="py-2.5 px-4">Subscription Tier</th>
                      <th className="py-2.5 px-4">Activity Telemetry</th>
                      <th className="py-2.5 px-4 text-right">Access Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#1F2327]/60">
                    {filteredUsers.map((u) => {
                      const userPlan = planStorage.getPlan(u.id);
                      const isProUser = userPlan === "pro";
                      const studentSubs = submissions.filter((s) => s.user_id === u.id);
                      const passedCount = studentSubs.filter((s) => s.status === "passed").length;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-[#181B1D]">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] font-bold text-xs flex items-center justify-center border border-emerald-500/20">
                                {u.full_name ? u.full_name[0].toUpperCase() : "U"}
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {u.full_name || "Anonymous Solver"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500 dark:text-[#8A9099]">
                            {u.email}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                u.role === "admin"
                                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                  : "bg-slate-500/10 text-slate-500"
                              )}
                            >
                              {u.role || "student"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                                isProUser
                                  ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30"
                                  : "bg-emerald-500/15 text-emerald-600 dark:text-[#00F076] border-emerald-500/30"
                              )}
                            >
                              {isProUser ? "AarCode Pro (₹49)" : "Free Starter"}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                            {studentSubs.length} evals • {passedCount} passed
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleUserSubscription(u)}
                                className={cn(
                                  "px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer",
                                  isProUser
                                    ? "bg-slate-100 dark:bg-[#1F2327] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1F2327] hover:bg-slate-200"
                                    : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500 hover:text-white"
                                )}
                              >
                                {isProUser ? "Downgrade Free" : "Upgrade Pro (₹49)"}
                              </button>

                              <button
                                onClick={() => handleToggleUserRole(u)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#1F2327] hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                {u.role === "admin" ? "Demote" : "Make Admin"}
                              </button>
                            </div>
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

        {/* =====================================================================
            VIEW 6: SYSTEM HEALTH & JUDGE ENGINE
        ===================================================================== */}
        {activeSection === "system" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Wandbox Judge Engine Health */}
              <div className="rounded-2xl border border-slate-200 dark:border-[#1F2327] bg-white dark:bg-[#131517] p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] flex items-center justify-center border border-emerald-500/20">
                      <Server size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        Wandbox Judge Runtime
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-[#8A9099]">Multi-compiler algorithmic execution engine</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border border-emerald-500/20">
                    Online
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Evaluates Python, Java, C++, and JavaScript algorithmic test cases across public sample suites and hidden stress tests in an isolated compiler runtime.
                </p>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] flex items-center justify-between">
                  <span className="text-xs text-slate-500">Last Ping Latency</span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-[#00F076]">
                    {wandboxLatency !== null ? `${wandboxLatency} ms` : "Not checked yet"}
                  </span>
                </div>

                <button
                  onClick={handlePingWandbox}
                  disabled={isPingingWandbox}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isPingingWandbox && <Loader2 size={14} className="animate-spin" />}
                  <span>Test Judge Engine Connectivity</span>
                </button>
              </div>

              {/* Database Seeder */}
              <div className="rounded-2xl border border-slate-200 dark:border-[#1F2327] bg-white dark:bg-[#131517] p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                      <Database size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        Database Curriculum Seeder
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-[#8A9099]">Populate initial core DSA challenges</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Admin Tool
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Injects default curriculum tracks (Arrays, Two Pointers, Stacks, Trees) and pre-configured test cases into the database for immediate student practice.
                </p>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] flex items-center justify-between">
                  <span className="text-xs text-slate-500">Database Status</span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-[#00F076]">
                    Connected • Supabase PostgREST
                  </span>
                </div>

                <button
                  onClick={handleQuickSeed}
                  disabled={isSeeding}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSeeding && <Loader2 size={14} className="animate-spin" />}
                  <span>Seed Default Curriculum &amp; Problems</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          MODAL: CREATE NEW LEARNING TRACK
      ===================================================================== */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#131517] border border-slate-200 dark:border-[#1F2327] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1F2327] pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create Learning Track
              </h3>
              <button
                onClick={() => setShowCourseModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Track Title *
                </label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={(e) => handleCourseTitleChange(e.target.value)}
                  placeholder="e.g. Dynamic Programming & Recursion"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={courseSlug}
                  onChange={(e) => setCourseSlug(e.target.value)}
                  placeholder="dynamic-programming-recursion"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  placeholder="Comprehensive curriculum covering memoization, tabulation, and state transitions..."
                  className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={courseIsPublished}
                  onChange={(e) => setCourseIsPublished(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="published" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  Publish to Student Catalog immediately
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-[#1F2327] text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  Create Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: INSPECT SUBMISSION CODE
      ===================================================================== */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#131517] border border-slate-200 dark:border-[#1F2327] p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1F2327] pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Submission Code Viewer
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedSubmission.tasks?.title} • {selectedSubmission.profiles?.full_name || selectedSubmission.profiles?.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase">
                Language: <strong className="text-emerald-500">{selectedSubmission.language || "python"}</strong>
              </span>
              <button
                onClick={copySubmissionCode}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-[#1F2327] text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors cursor-pointer text-xs"
              >
                {copiedCode ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copiedCode ? "Copied" : "Copy Code"}</span>
              </button>
            </div>

            <pre className="flex-1 p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-y-auto custom-scrollbar border border-slate-800">
              <code>{selectedSubmission.code || "(No code submitted)"}</code>
            </pre>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-[#1F2327] text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: MODULE STUDY GUIDE & VIDEO LECTURE
      ===================================================================== */}
      {editingModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-[#131517] border border-slate-200 dark:border-[#1F2327] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1F2327] pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen size={16} className="text-emerald-500" />
                  <span>Configure Study Guide &amp; Video ({editingModule.title})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#8A9099]">
                  Provide book-style study material (&quot;What is it, where to use, examples&quot;) and YouTube tutorial for students.
                </p>
              </div>
              <button
                onClick={() => setEditingModule(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModuleContent} className="space-y-4">
              {/* About Topic Markdown Guide */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>About Topic / Study Material (Markdown Supported)</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    What is it, where to use, time/space complexity, etc.
                  </span>
                </label>
                <textarea
                  rows={8}
                  value={editAboutContent}
                  onChange={(e) => setEditAboutContent(e.target.value)}
                  placeholder="### What is this topic?&#10;&#10;Explain the core intuition...&#10;&#10;### Where Can We Use It?&#10;- Real-world application 1&#10;- Real-world application 2&#10;&#10;### Complexity Analysis&#10;Access: O(1), Search: O(N)..."
                  className="w-full p-3.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* YouTube Video URL & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    YouTube Video URL
                  </label>
                  <input
                    type="url"
                    value={editYoutubeUrl}
                    onChange={(e) => setEditYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Video Lecture Title
                  </label>
                  <input
                    type="text"
                    value={editYoutubeTitle}
                    onChange={(e) => setEditYoutubeTitle(e.target.value)}
                    placeholder="e.g. Data Structures Visualized in 15 Minutes"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Reading Duration & Key Takeaways */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Reading Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={editReadingTime}
                    onChange={(e) => setEditReadingTime(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Key Takeaways (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={editKeyTakeaways}
                    onChange={(e) => setEditKeyTakeaways(e.target.value)}
                    placeholder="Arrays provide O(1) random lookup&#10;Two pointers converge in linear O(N) time&#10;Use hash maps when order does not matter"
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Module Access Tier Selector */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1F2327] bg-slate-50/60 dark:bg-[#0C0D0E] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Curriculum Access Tier
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Set whether this module is open to Free Starter students or requires AarCode Pro (₹49).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsProOnly(!editIsProOnly)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5",
                    editIsProOnly
                      ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 shadow-xs"
                      : "bg-emerald-500/15 text-emerald-600 dark:text-[#00F076] border-emerald-500/30"
                  )}
                >
                  <Lock size={13} />
                  <span>{editIsProOnly ? "Pro Tier (₹49)" : "Free Starter"}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-[#1F2327] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingModule(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-[#1F2327] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingModuleContent}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {savingModuleContent && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Study Material &amp; Video</span>
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
