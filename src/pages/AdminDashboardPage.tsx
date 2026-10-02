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
  Sparkles,
  BarChart3,
  Loader2,
  ChevronRight,
  ChevronLeft,
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
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { adminService } from "@/services/adminService";
import { executeCode } from "@/services/execution/wandboxExecutor";
import { supabase } from "@/services/supabase";
import type { Course, Module, Task, TestCase, Profile } from "@/types";
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

  // Navigation & layout state
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  // Module Form
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleOrder, setModuleOrder] = useState(1);

  // Module Study Guide & Video Modal
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editAboutContent, setEditAboutContent] = useState("");
  const [editYoutubeUrl, setEditYoutubeUrl] = useState("");
  const [editYoutubeTitle, setEditYoutubeTitle] = useState("");
  const [editReadingTime, setEditReadingTime] = useState(5);
  const [editKeyTakeaways, setEditKeyTakeaways] = useState("");
  const [savingModuleContent, setSavingModuleContent] = useState(false);

  // Tasks State & Creator
  const [tasksTab, setTasksTab] = useState<"catalog" | "create">("catalog");
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskSearch, setTaskSearch] = useState("");
  const [taskLanguageFilter, setTaskLanguageFilter] = useState("all");
  const [taskDifficultyFilter, setTaskDifficultyFilter] = useState("all");

  // Task Creator Form
  const [taskCourseId, setTaskCourseId] = useState("");
  const [taskModuleId, setTaskModuleId] = useState("");
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskSlug, setTaskSlug] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskLanguage, setTaskLanguage] = useState("python");
  const [taskDifficulty, setTaskDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [taskPoints, setTaskPoints] = useState(15);
  const [taskStarterCode, setTaskStarterCode] = useState("");
  const [taskSolutionCode, setTaskSolutionCode] = useState("");
  const [taskOrderIndex, setTaskOrderIndex] = useState(1);
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

  // Users State
  const [users, setUsers] = useState<Profile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  // System & Health state
  const [isPingingWandbox, setIsPingingWandbox] = useState(false);
  const [wandboxLatency, setWandboxLatency] = useState<number | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Initial load
  useEffect(() => {
    if (isAdmin) {
      loadOverviewMetrics();
      loadCourses();
      loadSubmissions();
      loadTasks();
      loadUsers();
    }
  }, [isAdmin]);

  const loadOverviewMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const data = await adminService.getPlatformMetrics();
      setMetrics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const loadCourses = async () => {
    setLoadingCourses(true);
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
      setLoadingCourses(false);
    }
  };

  const selectCourse = async (course: Course) => {
    setSelectedCourse(course);
    try {
      const { data } = await adminService.getModulesByCourse(course.id);
      setModules(data || []);
      setModuleOrder((data?.length || 0) + 1);
    } catch (e: any) {
      console.error(e);
    }
  };

  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const { data } = await adminService.getAllTasks();
      if (data) setAllTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTasks(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await adminService.getAllUsers();
      if (data) setUsers(data as Profile[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
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
      const { data } = await supabase
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
        .limit(100);

      if (data) setSubmissions(data);
    } catch (e) {
      console.error("Submissions load error:", e);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Actions: Courses & Modules
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
      loadOverviewMetrics();
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) {
      showToast("error", "Please select a course first");
      return;
    }
    if (!moduleTitle.trim()) {
      showToast("error", "Module title is required");
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
      selectCourse(selectedCourse);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm("Are you sure? This will delete all modules and tasks under this course.")) {
      const { success, error } = await adminService.deleteCourse(courseId);
      if (success) {
        showToast("info", "Course deleted");
        setSelectedCourse(null);
        setModules([]);
        loadCourses();
        loadOverviewMetrics();
      } else {
        showToast("error", error || "Failed to delete course");
      }
    }
  };

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

  const handleOpenEditModule = (mod: Module) => {
    setEditingModule(mod);
    setEditAboutContent(mod.about_content || "");
    setEditYoutubeUrl(mod.youtube_url || "");
    setEditYoutubeTitle(mod.youtube_title || "");
    setEditReadingTime(mod.reading_time_mins || 5);
    setEditKeyTakeaways(
      Array.isArray(mod.key_takeaways) ? mod.key_takeaways.join("\n") : ""
    );
  };

  const handleSaveModuleContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule || !selectedCourse) return;
    setSavingModuleContent(true);
    try {
      const takeawaysList = editKeyTakeaways
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const { error } = await adminService.updateModule(editingModule.id, {
        about_content: editAboutContent,
        youtube_url: editYoutubeUrl,
        youtube_title: editYoutubeTitle,
        reading_time_mins: Number(editReadingTime) || 5,
        key_takeaways: takeawaysList,
      });

      if (error) {
        showToast("error", error);
      } else {
        showToast("success", `Study guide & video updated for "${editingModule.title}"!`);
        setEditingModule(null);
        selectCourse(selectedCourse);
      }
    } finally {
      setSavingModuleContent(false);
    }
  };

  // Actions: Task Creator
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

    const { error } = await adminService.createTask(
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
      showToast("success", `Task "${taskTitle}" successfully created!`);
      setTaskTitle("");
      setTaskSlug("");
      setTaskDescription("");
      setTaskStarterCode("");
      setTaskSolutionCode("");
      setTaskOrderIndex(1);
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

  // Actions: User Management
  const handleToggleUserRole = async (targetUser: Profile) => {
    const nextRole = targetUser.role === "admin" ? "student" : "admin";
    if (confirm(`Change ${targetUser.full_name || targetUser.email}'s role to ${nextRole.toUpperCase()}?`)) {
      const { success, error } = await adminService.updateUserRole(targetUser.id, nextRole);
      if (success) {
        showToast("success", `Role updated to ${nextRole}`);
        loadUsers();
      } else {
        showToast("error", error || "Failed to update user role");
      }
    }
  };

  // Actions: System Diagnostics
  const handleTestWandbox = async () => {
    setIsPingingWandbox(true);
    setWandboxLatency(null);
    const start = performance.now();
    try {
      const res = await executeCode({
        language: "python",
        sourceCode: "print('AarCode System Online')",
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
      showToast("error", `Wandbox ping failed: ${e.message}`);
    } finally {
      setIsPingingWandbox(false);
    }
  };

  // Quick Seed Trigger
  const handleQuickSeed = async () => {
    if (confirm("Populate database with default courses, modules, and tasks?")) {
      setIsSeeding(true);
      try {
        // Seed python course
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
      <div className="h-full w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-[#070A12] text-slate-500 font-urbanist">
        <Loader2 size={32} className="animate-spin text-[#6366F1] mb-2" />
        <span className="ml-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Verifying administrator permissions...
        </span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-[#F8FAFC] dark:bg-[#070A12] text-center space-y-4 font-urbanist">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-[#6366F1] flex items-center justify-center shadow-lg shadow-indigo-500/10">
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
          className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] text-white hover:opacity-95 shadow-md shadow-indigo-500/20 transition-all"
        >
          Return to Student Hub
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
    const name = u.full_name || "";
    const email = u.email || "";
    return (
      name.toLowerCase().includes(userSearch.toLowerCase()) ||
      email.toLowerCase().includes(userSearch.toLowerCase())
    );
  });

  const passRate =
    metrics.submissionsCount > 0
      ? Math.round((metrics.passedSubmissionsCount / metrics.submissionsCount) * 100)
      : 0;

  return (
    <div className="h-full w-full flex bg-[#F8FAFC] dark:bg-[#070A12] text-slate-900 dark:text-white font-urbanist overflow-hidden">
      {/* =====================================================================
          1. SLEEK ADMIN SIDEBAR
      ===================================================================== */}
      <aside
        className={cn(
          "h-full border-r border-slate-200/80 dark:border-[#1E293B] bg-white dark:bg-[#0B101D] flex flex-col shrink-0 transition-all duration-300 z-30 select-none",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand & Collapse Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-[#1E293B] shrink-0">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200/70 dark:border-indigo-500/20 p-1 flex items-center justify-center">
                <img src="/AarCode.png" alt="AarCode" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white block leading-none">
                  AarCode
                </span>
                <span className="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
            </div>
          )}

          {isSidebarCollapsed && (
            <div className="w-8 h-8 mx-auto rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200/70 dark:border-indigo-500/20 p-1 flex items-center justify-center">
              <img src="/AarCode.png" alt="AarCode" className="w-full h-full object-contain" />
            </div>
          )}

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className={cn("px-3 pb-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider", isSidebarCollapsed && "text-center")}>
            {isSidebarCollapsed ? "•••" : "Site Operations"}
          </div>

          {/* Nav Item: Overview */}
          <button
            onClick={() => setActiveSection("overview")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
              activeSection === "overview"
                ? "bg-[#6366F1] text-white shadow-md shadow-indigo-500/25"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            )}
            title="Overview"
          >
            <BarChart3 size={17} className="shrink-0" />
            {!isSidebarCollapsed && <span>Overview</span>}
          </button>

          {/* Nav Item: Courses */}
          <button
            onClick={() => setActiveSection("courses")}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
              activeSection === "courses"
                ? "bg-[#6366F1] text-white shadow-md shadow-indigo-500/25"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            )}
            title="Courses & Tracks"
          >
            <div className="flex items-center gap-3">
              <BookOpen size={17} className="shrink-0" />
              {!isSidebarCollapsed && <span>Tracks & Modules</span>}
            </div>
            {!isSidebarCollapsed && metrics.coursesCount > 0 && (
              <span className={cn(
                "px-2 py-0.5 rounded-md text-[10px] font-mono",
                activeSection === "courses" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              )}>
                {metrics.coursesCount}
              </span>
            )}
          </button>

          {/* Nav Item: Tasks */}
          <button
            onClick={() => setActiveSection("tasks")}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
              activeSection === "tasks"
                ? "bg-[#6366F1] text-white shadow-md shadow-indigo-500/25"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            )}
            title="Problems & Tasks"
          >
            <div className="flex items-center gap-3">
              <Code2 size={17} className="shrink-0" />
              {!isSidebarCollapsed && <span>Problem Bank</span>}
            </div>
            {!isSidebarCollapsed && metrics.tasksCount > 0 && (
              <span className={cn(
                "px-2 py-0.5 rounded-md text-[10px] font-mono",
                activeSection === "tasks" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              )}>
                {metrics.tasksCount}
              </span>
            )}
          </button>

          {/* Nav Item: Submissions */}
          <button
            onClick={() => {
              setActiveSection("submissions");
              loadSubmissions();
            }}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
              activeSection === "submissions"
                ? "bg-[#6366F1] text-white shadow-md shadow-indigo-500/25"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            )}
            title="Live Submissions"
          >
            <div className="flex items-center gap-3">
              <Terminal size={17} className="shrink-0" />
              {!isSidebarCollapsed && <span>Live Submissions</span>}
            </div>
            {!isSidebarCollapsed && (
              <span className={cn(
                "px-2 py-0.5 rounded-md text-[10px] font-mono",
                activeSection === "submissions" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              )}>
                {submissions.length}
              </span>
            )}
          </button>

          {/* Nav Item: Users */}
          <button
            onClick={() => setActiveSection("users")}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
              activeSection === "users"
                ? "bg-[#6366F1] text-white shadow-md shadow-indigo-500/25"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            )}
            title="Students & Roles"
          >
            <div className="flex items-center gap-3">
              <Users size={17} className="shrink-0" />
              {!isSidebarCollapsed && <span>Students & Roles</span>}
            </div>
            {!isSidebarCollapsed && metrics.usersCount > 0 && (
              <span className={cn(
                "px-2 py-0.5 rounded-md text-[10px] font-mono",
                activeSection === "users" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              )}>
                {metrics.usersCount}
              </span>
            )}
          </button>

          {/* Nav Item: System */}
          <button
            onClick={() => setActiveSection("system")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
              activeSection === "system"
                ? "bg-[#6366F1] text-white shadow-md shadow-indigo-500/25"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            )}
            title="System & Tools"
          >
            <Server size={17} className="shrink-0" />
            {!isSidebarCollapsed && <span>System & Health</span>}
          </button>

          {/* Student Hub Quick-Jump Section */}
          <div className="pt-4 mt-4 border-t border-slate-200/80 dark:border-[#1E293B]">
            <div className={cn("px-3 pb-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider", isSidebarCollapsed && "text-center")}>
              {isSidebarCollapsed ? "•••" : "Live Site Jump"}
            </div>
            <button
              onClick={() => navigate("problems")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Practice Arena"
            >
              <ExternalLink size={15} className="shrink-0 text-[#6366F1]" />
              {!isSidebarCollapsed && <span>Practice Arena</span>}
            </button>
            <button
              onClick={() => navigate("compiler")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Online Compiler"
            >
              <ExternalLink size={15} className="shrink-0 text-emerald-500" />
              {!isSidebarCollapsed && <span>Web Compiler</span>}
            </button>
            <button
              onClick={() => navigate("landing")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Landing Page"
            >
              <ExternalLink size={15} className="shrink-0 text-amber-500" />
              {!isSidebarCollapsed && <span>Main Home</span>}
            </button>
          </div>
        </div>

        {/* Admin User Chip Footer */}
        <div className="p-3 border-t border-slate-200/80 dark:border-[#1E293B] shrink-0 bg-slate-50 dark:bg-[#070A12]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#7C3AED] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {profile?.full_name ? profile.full_name[0].toUpperCase() : "A"}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {profile?.full_name || "Aravindh (Superadmin)"}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-semibold">
                  <ShieldCheck size={11} />
                  <span>Platform Admin</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* =====================================================================
          2. MAIN ADMIN WORKSPACE
      ===================================================================== */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top Control Bar */}
        <header className="h-16 px-6 border-b border-slate-200/80 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
              {activeSection === "overview" && "Dashboard Overview"}
              {activeSection === "courses" && "Course & Module Management"}
              {activeSection === "tasks" && "Problem Bank & Task Creator"}
              {activeSection === "submissions" && "Real-Time Submissions Log"}
              {activeSection === "users" && "Student Directory & Permissions"}
              {activeSection === "system" && "System Health & Database Tools"}
            </h1>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Wandbox Judge Online</span>
            </div>

            <button
              onClick={() => setShowCourseModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
            >
              <Plus size={14} />
              <span>New Track</span>
            </button>

            <button
              onClick={() => {
                setActiveSection("tasks");
                setTasksTab("create");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all"
            >
              <Plus size={14} />
              <span>New Problem</span>
            </button>
          </div>
        </header>

        {/* Dynamic View Scrollable Body */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {/* =================================================================
              VIEW 1: OVERVIEW DASHBOARD
          ================================================================= */}
          {activeSection === "overview" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* 4 Metric KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold">Active Students</span>
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-[#6366F1]">
                      <Users size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {metrics.usersCount || users.length}
                    </span>
                    <span className="text-xs text-emerald-500 font-bold">Profiles Synced</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold">Learning Tracks</span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                      <BookOpen size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {metrics.coursesCount || courses.length}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Curriculums</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold">Problem Bank</span>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                      <Code2 size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {metrics.tasksCount || allTasks.length}
                    </span>
                    <span className="text-xs text-amber-500 font-bold">Algorithms</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold">Submissions & Pass Rate</span>
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                      <CheckCircle2 size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {metrics.submissionsCount || submissions.length}
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-500">
                      {passRate}% Pass Rate
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Operation Control Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setShowCourseModal(true)}
                  className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer transition-all hover:scale-[1.01] group space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#6366F1] text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                    <Plus size={20} />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#6366F1] transition-colors">
                    Add Learning Track
                  </h3>
                  <p className="text-xs text-slate-500">
                    Create a new curriculum track, define modules, and structure difficulty progressions.
                  </p>
                </div>

                <div
                  onClick={() => {
                    setActiveSection("tasks");
                    setTasksTab("create");
                  }}
                  className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 hover:border-emerald-500/40 cursor-pointer transition-all hover:scale-[1.01] group space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                    <Code2 size={20} />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    Create Problem Challenge
                  </h3>
                  <p className="text-xs text-slate-500">
                    Write problem descriptions, define starter templates, and set public and hidden test cases.
                  </p>
                </div>

                <div
                  onClick={handleQuickSeed}
                  className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-all hover:scale-[1.01] group space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                    {isSeeding ? <Loader2 size={20} className="animate-spin" /> : <Database size={20} />}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    Seed Starter Curriculum
                  </h3>
                  <p className="text-xs text-slate-500">
                    Instantly populate database with essential DSA modules, starter challenges, and test cases.
                  </p>
                </div>
              </div>

              {/* Recent Activity: Submissions snapshot */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Recent Evaluations
                    </h3>
                    <p className="text-xs text-slate-500">Latest code evaluated by judge service</p>
                  </div>
                  <button
                    onClick={() => setActiveSection("submissions")}
                    className="text-xs font-bold text-[#6366F1] hover:underline"
                  >
                    View All Logs →
                  </button>
                </div>

                {submissions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">No submissions recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-100 dark:border-[#1E293B] text-[10px] uppercase font-bold text-slate-400">
                        <tr>
                          <th className="py-2.5 px-3">Student</th>
                          <th className="py-2.5 px-3">Task</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Passed</th>
                          <th className="py-2.5 px-3">Time</th>
                          <th className="py-2.5 px-3 text-right">Inspect</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]/60 font-mono">
                        {submissions.slice(0, 5).map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
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
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#6366F1] hover:text-white text-[11px] font-bold transition-colors"
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

          {/* =================================================================
              VIEW 2: COURSES & MODULES MANAGEMENT
          ================================================================= */}
          {activeSection === "courses" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {/* Left Column: Track Catalog */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Tracks Catalog ({courses.length})
                  </h3>
                  <button
                    onClick={() => setShowCourseModal(true)}
                    className="p-1.5 rounded-lg bg-[#6366F1] text-white hover:opacity-95"
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
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#070A12] border border-slate-200/80 dark:border-[#1E293B] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
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
                          ? "border-[#6366F1] bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs"
                          : "border-slate-200/80 dark:border-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                      )}
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{c.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">/{c.slug}</p>
                      </div>

                      <div className="flex items-center gap-2">
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
                          className="text-slate-400 hover:text-rose-500 p-1"
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
              <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] p-6 space-y-6">
                {selectedCourse ? (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {selectedCourse.title}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Configure chapters and module breakdown for this track
                        </p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 font-bold">
                        {modules.length} Modules
                      </span>
                    </div>

                    {/* Modules List */}
                    <div className="space-y-3">
                      {modules.map((m) => (
                        <div
                          key={m.id}
                          className="p-3.5 rounded-xl border border-slate-200/80 dark:border-[#1E293B] flex items-center justify-between bg-slate-50/50 dark:bg-[#070A12]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-md bg-[#6366F1]/10 text-[#6366F1] font-bold text-xs flex items-center justify-center">
                              {m.order_index}
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                {m.title}
                              </span>
                              {m.about_content && (
                                <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-[#6366F1]">
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
                            <button
                              onClick={() => handleOpenEditModule(m)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-[#6366F1] dark:text-indigo-300 hover:bg-[#6366F1] hover:text-white text-xs font-bold transition-all"
                            >
                              <BookOpen size={13} />
                              <span>Study Guide &amp; Video</span>
                            </button>
                            <button
                              onClick={() => handleDeleteModule(m.id)}
                              className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors"
                              title="Delete module"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add Module Inline Form */}
                      <form onSubmit={handleCreateModule} className="pt-2 flex gap-3">
                        <input
                          type="text"
                          value={moduleTitle}
                          onChange={(e) => setModuleTitle(e.target.value)}
                          placeholder="Add new module title (e.g. 'Binary Search & Tree Traversal')..."
                          className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#070A12] border border-slate-200/80 dark:border-[#1E293B] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
                        />
                        <input
                          type="number"
                          value={moduleOrder}
                          onChange={(e) => setModuleOrder(Number(e.target.value))}
                          className="w-16 px-2 py-2 text-xs text-center rounded-xl bg-slate-50 dark:bg-[#070A12] border border-slate-200/80 dark:border-[#1E293B]"
                          title="Order index"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 text-xs font-bold rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white transition-colors"
                        >
                          Add Module
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 text-slate-400 text-xs">
                    Select a learning track from the left to manage modules.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================
              VIEW 3: PROBLEM BANK & TASK CREATOR
          ================================================================= */}
          {activeSection === "tasks" && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Task Sub Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-[#1E293B] pb-3">
                <button
                  onClick={() => setTasksTab("catalog")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                    tasksTab === "catalog"
                      ? "bg-[#6366F1] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  Browse Challenges ({allTasks.length})
                </button>
                <button
                  onClick={() => setTasksTab("create")}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                    tasksTab === "create"
                      ? "bg-[#6366F1] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <Plus size={14} />
                  <span>Create Problem</span>
                </button>
              </div>

              {/* Tab 3A: Catalog */}
              {tasksTab === "catalog" && (
                <div className="space-y-4">
                  {/* Filters Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={taskSearch}
                        onChange={(e) => setTaskSearch(e.target.value)}
                        placeholder="Search problems by title or slug..."
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
                      />
                    </div>

                    <select
                      value={taskLanguageFilter}
                      onChange={(e) => setTaskLanguageFilter(e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="all">All Languages</option>
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                    </select>

                    <select
                      value={taskDifficultyFilter}
                      onChange={(e) => setTaskDifficultyFilter(e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  {/* Tasks Table */}
                  <div className="rounded-2xl border border-slate-200/80 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-100 dark:border-[#1E293B] text-[10px] uppercase font-bold text-slate-400 bg-slate-50 dark:bg-[#070A12]">
                        <tr>
                          <th className="py-3 px-4">Title & Slug</th>
                          <th className="py-3 px-4">Track / Module</th>
                          <th className="py-3 px-4">Language</th>
                          <th className="py-3 px-4">Difficulty</th>
                          <th className="py-3 px-4">Points</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]/60">
                        {filteredTasks.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900 dark:text-white">{t.title}</p>
                              <p className="text-[10px] text-slate-400 font-mono">/{t.slug}</p>
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                              {t.modules?.title || "Independent Challenge"}
                            </td>
                            <td className="py-3 px-4 font-mono uppercase font-semibold text-[11px] text-[#6366F1]">
                              {t.language}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                  t.difficulty === "easy"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : t.difficulty === "medium"
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                )}
                              >
                                {t.difficulty}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-amber-500">
                              +{t.points || 10} XP
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleDeleteTask(t.id)}
                                className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                                title="Delete task"
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

              {/* Tab 3B: Task Creator */}
              {tasksTab === "create" && (
                <form
                  onSubmit={handleCreateTask}
                  className="rounded-2xl border border-slate-200/80 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] p-6 sm:p-8 space-y-6"
                >
                  <div className="border-b border-slate-100 dark:border-[#1E293B] pb-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Create Programming Challenge
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure problem statement, boilerplates, and both public & hidden evaluation benchmarks.
                    </p>
                  </div>

                  {/* Course & Module Selectors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Target Track
                      </label>
                      <select
                        value={taskCourseId}
                        onChange={(e) => setTaskCourseId(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-[#1E293B] bg-slate-50 dark:bg-[#070A12] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
                        required
                      >
                        <option value="">Select track...</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Module / Chapter
                      </label>
                      <select
                        value={taskModuleId}
                        onChange={(e) => setTaskModuleId(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-[#1E293B] bg-slate-50 dark:bg-[#070A12] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
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
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
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
                        placeholder="e.g. Valid Palindrome"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-[#1E293B] bg-slate-50 dark:bg-[#070A12] text-slate-800 dark:text-slate-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={taskSlug}
                        onChange={(e) => setTaskSlug(e.target.value)}
                        placeholder="valid-palindrome"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-[#1E293B] bg-slate-50 dark:bg-[#070A12] text-slate-800 dark:text-slate-200 font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Language, Difficulty, Points, Order */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Language
                      </label>
                      <select
                        value={taskLanguage}
                        onChange={(e) => setTaskLanguage(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-[#1E293B] bg-slate-50 dark:bg-[#070A12] text-slate-800 dark:text-slate-200"
                      >
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Difficulty
                      </label>
                      <select
                        value={taskDifficulty}
                        onChange={(e) => setTaskDifficulty(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-[#1E293B] bg-slate-50 dark:bg-[#070A12] text-slate-800 dark:text-slate-200"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Points (XP)
                      </label>
                      <input
                        type="number"
                        value={taskPoints}
                        onChange={(e) => setTaskPoints(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-[#1E293B] bg-slate-50 dark:bg-[#070A12] text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Order Index
                      </label>
                      <input
                        type="number"
                        value={taskOrderIndex}
                        onChange={(e) => setTaskOrderIndex(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-[#1E293B] bg-slate-50 dark:bg-[#070A12] text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  {/* Problem Description Markdown */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Problem Description (Markdown)
                    </label>
                    <textarea
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      rows={5}
                      placeholder="Describe problem statement, input constraints, and return formats..."
                      className="w-full p-3 text-xs rounded-xl border border-slate-200/80 dark:border-[#1E293B] bg-slate-50 dark:bg-[#070A12] text-slate-800 dark:text-slate-200 font-mono"
                      required
                    />
                  </div>

                  {/* Starter & Reference Solution */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Starter Code (Student Template)
                      </label>
                      <textarea
                        value={taskStarterCode}
                        onChange={(e) => setTaskStarterCode(e.target.value)}
                        rows={6}
                        placeholder="def solution():\n    pass\n"
                        className="w-full p-3 text-xs rounded-xl border border-slate-200/80 dark:border-[#1E293B] bg-slate-50 dark:bg-[#070A12] text-slate-800 dark:text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Reference Solution (Admin Only)
                      </label>
                      <textarea
                        value={taskSolutionCode}
                        onChange={(e) => setTaskSolutionCode(e.target.value)}
                        rows={6}
                        placeholder="def solution():\n    return 42\n"
                        className="w-full p-3 text-xs rounded-xl border border-slate-200/80 dark:border-[#1E293B] bg-slate-50 dark:bg-[#070A12] text-slate-800 dark:text-slate-200 font-mono"
                      />
                    </div>
                  </div>

                  {/* Test Cases Builder */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-[#1E293B]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Evaluation Test Cases ({taskTestCases.length})
                        </h4>
                        <p className="text-xs text-slate-500">
                          Add public samples for students and hidden benchmarks to prevent hardcoding.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddTestCase}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
                      >
                        <Plus size={14} />
                        <span>Add Case</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {taskTestCases.map((tc, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-slate-200/80 dark:border-[#1E293B] bg-slate-50/50 dark:bg-[#070A12] space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              Test Case #{idx + 1}
                            </span>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={tc.is_hidden}
                                  onChange={(e) =>
                                    handleUpdateTestCase(idx, { is_hidden: e.target.checked })
                                  }
                                  className="rounded border-slate-300 text-[#6366F1] focus:ring-[#6366F1]"
                                />
                                <span>{tc.is_hidden ? "Hidden Benchmark" : "Public Sample"}</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => handleRemoveTestCase(idx)}
                                className="text-slate-400 hover:text-rose-500 p-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                                Stdin:
                              </span>
                              <textarea
                                value={tc.input}
                                onChange={(e) => handleUpdateTestCase(idx, { input: e.target.value })}
                                rows={2}
                                className="w-full p-2 text-xs rounded-lg border border-slate-200/80 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] text-slate-800 dark:text-slate-200 font-mono"
                              />
                            </div>
                            <div>
                              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                                Expected Stdout:
                              </span>
                              <textarea
                                value={tc.expected_output}
                                onChange={(e) =>
                                  handleUpdateTestCase(idx, { expected_output: e.target.value })
                                }
                                rows={2}
                                className="w-full p-2 text-xs rounded-lg border border-slate-200/80 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] text-slate-800 dark:text-slate-200 font-mono"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all"
                    >
                      Publish Challenge
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* =================================================================
              VIEW 4: LIVE SUBMISSIONS LOG
          ================================================================= */}
          {activeSection === "submissions" && (
            <div className="max-w-7xl mx-auto space-y-4">
              {/* Filter bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                    placeholder="Search by student or task..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={subStatusFilter}
                    onChange={(e) => setSubStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="passed">Passed (Accepted)</option>
                    <option value="failed">Failed (Wrong Answer)</option>
                    <option value="compile_error">Compile Error</option>
                    <option value="runtime_error">Runtime Error</option>
                  </select>

                  <button
                    onClick={loadSubmissions}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <RefreshCw size={13} className={loadingSubmissions ? "animate-spin" : ""} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Submissions Table */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] overflow-hidden shadow-xs">
                {loadingSubmissions ? (
                  <div className="py-20 text-center flex flex-col items-center gap-2 text-slate-400">
                    <Loader2 size={24} className="animate-spin text-[#6366F1]" />
                    <span className="text-xs">Fetching real-time logs...</span>
                  </div>
                ) : filteredSubmissions.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    No matching submissions recorded yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-100 dark:border-[#1E293B] text-[10px] uppercase font-bold text-slate-400 bg-slate-50 dark:bg-[#070A12]">
                        <tr>
                          <th className="py-3 px-4">Student</th>
                          <th className="py-3 px-4">Problem</th>
                          <th className="py-3 px-4">Language</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Test Cases</th>
                          <th className="py-3 px-4">Runtime</th>
                          <th className="py-3 px-4">Submitted</th>
                          <th className="py-3 px-4 text-right">Inspect</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]/60 font-mono">
                        {filteredSubmissions.map((sub) => {
                          const isPassed = sub.status === "passed";
                          return (
                            <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="py-3 px-4 font-sans font-medium text-slate-800 dark:text-slate-200">
                                {sub.profiles?.full_name || sub.profiles?.email || sub.user_id.slice(0, 8)}
                              </td>
                              <td className="py-3 px-4 font-sans font-bold text-slate-900 dark:text-white">
                                {sub.tasks?.title || "Coding Challenge"}
                              </td>
                              <td className="py-3 px-4 uppercase text-[11px] font-semibold text-[#6366F1]">
                                {sub.tasks?.language || "python"}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                                    isPassed
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                  )}
                                >
                                  {sub.status.replace("_", " ")}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                                {sub.passed_cases} / {sub.total_cases}
                              </td>
                              <td className="py-3 px-4 text-slate-500">
                                {sub.execution_time_ms ? `${sub.execution_time_ms} ms` : "-"}
                              </td>
                              <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                                {new Date(sub.created_at).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-right font-sans">
                                <button
                                  onClick={() => setSelectedSubmission(sub)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#6366F1] hover:text-white text-[11px] font-bold transition-colors"
                                >
                                  Inspect Code
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================
              VIEW 5: STUDENTS & USER MANAGEMENT
          ================================================================= */}
          {activeSection === "users" && (
            <div className="max-w-7xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative w-72">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search students by name or email..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
                  />
                </div>

                <div className="text-xs text-slate-500 font-semibold">
                  Total Users: <span className="font-bold text-slate-900 dark:text-white">{users.length}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 dark:border-[#1E293B] text-[10px] uppercase font-bold text-slate-400 bg-slate-50 dark:bg-[#070A12]">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Score (AarBytes)</th>
                      <th className="py-3 px-4">System Role</th>
                      <th className="py-3 px-4 text-right">Role Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-[#6366F1] font-bold text-xs flex items-center justify-center">
                            {u.full_name ? u.full_name[0].toUpperCase() : "U"}
                          </div>
                          <span>{u.full_name || "Anonymous Developer"}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                          {u.email}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-500">
                          {u.points || 0} XP
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                              u.role === "admin"
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                            )}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleUserRole(u)}
                            className="px-3 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-[#6366F1] hover:text-white transition-colors"
                          >
                            {u.role === "admin" ? "Demote to Student" : "Promote to Admin"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================
              VIEW 6: SYSTEM HEALTH & SITE TOOLS
          ================================================================= */}
          {activeSection === "system" && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Wandbox Judge Engine Health */}
              <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-3">
                  <div className="flex items-center gap-2.5">
                    <Server size={18} className="text-[#6366F1]" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Judge Engine (Wandbox API)
                    </h3>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
                    Connected
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  The Wandbox sandbox container is used to securely compile and execute Java, Python, C++, and JavaScript in a restricted sandbox for real-time challenge grading.
                </p>

                <div className="flex items-center gap-4 pt-2">
                  <button
                    onClick={handleTestWandbox}
                    disabled={isPingingWandbox}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {isPingingWandbox ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} className="text-[#6366F1]" />}
                    <span>Run Ping & Execution Benchmark</span>
                  </button>

                  {wandboxLatency !== null && (
                    <span className="text-xs font-mono text-emerald-500 font-bold">
                      Roundtrip Latency: {wandboxLatency} ms
                    </span>
                  )}
                </div>
              </div>

              {/* Database & Seed Automation */}
              <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-3">
                  <div className="flex items-center gap-2.5">
                    <Database size={18} className="text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Database Seeder & Curriculum Sync
                    </h3>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold">
                    Supabase PostgreSQL
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  If the database lacks seeded courses or problems, click below to populate the standard catalog with Python DSA, Two Sum, Trapping Rain Water, and core benchmarks.
                </p>

                <button
                  onClick={handleQuickSeed}
                  disabled={isSeeding}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {isSeeding ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  <span>Seed Default Curriculum</span>
                </button>
              </div>

              {/* Platform Spec Summary */}
              <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] space-y-3 text-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  System Architecture Details
                </h3>
                <div className="grid grid-cols-2 gap-2 text-slate-500 font-mono">
                  <div>Platform: AarCode Enterprise</div>
                  <div>Build: Vite + React 19 + TypeScript</div>
                  <div>Editor: Monaco Editor (JetBrains Mono)</div>
                  <div>Styling: Tailwind CSS (Urbanist Font)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          MODAL 1: CREATE NEW COURSE
      ===================================================================== */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create New Learning Track
              </h3>
              <button
                onClick={() => setShowCourseModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/80 dark:border-[#1E293B] bg-slate-50 dark:bg-[#070A12] text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={courseSlug}
                  onChange={(e) => setCourseSlug(e.target.value)}
                  placeholder="advanced-rust"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/80 dark:border-[#1E293B] bg-slate-50 dark:bg-[#070A12] text-slate-800 dark:text-slate-200 font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Description
                </label>
                <textarea
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  rows={3}
                  placeholder="Summary of student takeaways..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/80 dark:border-[#1E293B] bg-slate-50 dark:bg-[#070A12] text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="published"
                  checked={courseIsPublished}
                  onChange={(e) => setCourseIsPublished(e.target.checked)}
                  className="rounded border-slate-300 text-[#6366F1] focus:ring-[#6366F1]"
                />
                <label htmlFor="published" className="font-semibold text-slate-700 dark:text-slate-300">
                  Publish immediately (visible to students)
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white font-bold shadow-md shadow-indigo-500/20"
                >
                  Create Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: INSPECT SUBMITTED CODE
      ===================================================================== */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Submission Code Inspection
                </h3>
                <p className="text-xs text-slate-500">
                  Student: {selectedSubmission.profiles?.full_name || selectedSubmission.user_id} • Task: {selectedSubmission.tasks?.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full font-bold uppercase",
                    selectedSubmission.status === "passed"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  )}
                >
                  {selectedSubmission.status}
                </span>
                <span className="text-slate-500 font-mono">
                  {selectedSubmission.passed_cases} / {selectedSubmission.total_cases} Passed
                </span>
              </div>

              <button
                onClick={copySubmissionCode}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {copiedCode ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copiedCode ? "Copied" : "Copy Code"}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-auto max-h-96 custom-scrollbar whitespace-pre">
              {selectedSubmission.code}
            </pre>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module Study Guide & Video Modal */}
      {editingModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen size={16} className="text-[#6366F1]" />
                  <span>Configure Study Guide &amp; Video ({editingModule.title})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Provide rich book-style study material (&quot;What is it, where to use, examples&quot;) and YouTube tutorial for students.
                </p>
              </div>
              <button
                onClick={() => setEditingModule(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModuleContent} className="space-y-4">
              {/* About Topic Markdown Guide */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>📖 About Topic / Study Material (Markdown Supported)</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    What is it, where to use, time/space complexity, etc.
                  </span>
                </label>
                <textarea
                  rows={8}
                  value={editAboutContent}
                  onChange={(e) => setEditAboutContent(e.target.value)}
                  placeholder="### What is this topic?&#10;&#10;Explain the core intuition...&#10;&#10;### Where Can We Use It?&#10;- Real-world application 1&#10;- Real-world application 2&#10;&#10;### Complexity Analysis&#10;Access: O(1), Search: O(N)..."
                  className="w-full p-3.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-[#070A12] border border-slate-200/80 dark:border-[#1E293B] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
                />
              </div>

              {/* YouTube Video URL & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    🎥 YouTube Video URL
                  </label>
                  <input
                    type="url"
                    value={editYoutubeUrl}
                    onChange={(e) => setEditYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#070A12] border border-slate-200/80 dark:border-[#1E293B] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Video Lecture Title
                  </label>
                  <input
                    type="text"
                    value={editYoutubeTitle}
                    onChange={(e) => setEditYoutubeTitle(e.target.value)}
                    placeholder="e.g. Data Structures Visualized in 15 Minutes"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#070A12] border border-slate-200/80 dark:border-[#1E293B] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
                  />
                </div>
              </div>

              {/* Reading Duration & Key Takeaways */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    ⏱️ Reading Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={editReadingTime}
                    onChange={(e) => setEditReadingTime(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#070A12] border border-slate-200/80 dark:border-[#1E293B] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    💡 Key Takeaways (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={editKeyTakeaways}
                    onChange={(e) => setEditKeyTakeaways(e.target.value)}
                    placeholder="Arrays provide O(1) random lookup&#10;Two pointers converge in linear O(N) time&#10;Use hash maps when order does not matter"
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#070A12] border border-slate-200/80 dark:border-[#1E293B] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingModule(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingModuleContent}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white flex items-center gap-1.5 shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all"
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
