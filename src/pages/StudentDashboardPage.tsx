import { useState, useEffect, useMemo } from "react";
import {
  Trophy,
  Code2,
  BookOpen,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Flame,
  Zap,
  Target,
  Play,
  Layers,
  ShieldAlert,
  Loader2,
  Compass,
  Star,
  Clock,
  TrendingUp,
  Cpu,
  Award,
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { courseService } from "@/services/courseService";
import { progressStorage } from "@/services/storage/progressStorage";
import { enrollmentStorage } from "@/services/storage/enrollmentStorage";
import { loadPrograms } from "@/services/storage/programStorage";
import { loadSettings } from "@/services/storage/settingsStorage";
import { DEMO_COURSES } from "@/data/demoCourses";
import type {
  CourseWithModules,
  Task,
  UserTaskProgress,
  LeaderboardEntry,
} from "@/types/database.types";
import type { Route } from "@/types";
import { cn } from "@/utils/cn";

interface StudentDashboardPageProps {
  navigate: (to: Route | string, params?: Record<string, string>) => void;
}

interface EnrichedTask extends Task {
  courseTitle: string;
  courseSlug: string;
}

export type SupportedLanguage = "python" | "cpp" | "java" | "javascript" | "c";

interface PracticeArea {
  title: string;
  topic: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  problemCount: number;
}

interface RoadmapConfig {
  languageKey: SupportedLanguage;
  label: string;
  iconLabel: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  courseSlug: string;
  modulesCount: number;
  durationEst: string;
  totalProblems: number;
  practiceAreas: PracticeArea[];
}

const ROADMAP_PRESETS: Record<SupportedLanguage, RoadmapConfig> = {
  python: {
    languageKey: "python",
    label: "Python",
    iconLabel: "PY",
    badge: "Industry Standard DSA",
    title: "Python DSA & LeetCode Problem Solving",
    subtitle: "Arrays, Two Pointers, Hash Maps, Sliding Window & Recursion",
    description:
      "Master algorithmic problem solving with clean, idiomatic Python 3. Build fast intuition for space-time complexity and ace technical coding rounds.",
    courseSlug: "python-dsa",
    modulesCount: 3,
    durationEst: "3 Months",
    totalProblems: 180,
    practiceAreas: [
      {
        title: "Arrays & Two Pointers",
        topic: "arrays",
        description: "Optimal lookups, prefix sums, and in-place manipulations",
        difficulty: "Easy",
        problemCount: 24,
      },
      {
        title: "Hash Maps & Sets",
        topic: "hash-maps",
        description: "O(1) lookups, frequency counting, and anagram detections",
        difficulty: "Easy",
        problemCount: 18,
      },
      {
        title: "Sliding Window & Stacks",
        topic: "sliding-window",
        description: "Subarray maximums, parentheses validation, and monostacks",
        difficulty: "Medium",
        problemCount: 22,
      },
      {
        title: "Recursion & Trees",
        topic: "trees",
        description: "Depth-first traversal, BST validations, and memoization",
        difficulty: "Medium",
        problemCount: 20,
      },
    ],
  },
  cpp: {
    languageKey: "cpp",
    label: "C++",
    iconLabel: "C++",
    badge: "High Performance Core",
    title: "C++ Competitive Programming & Algorithms",
    subtitle: "Modern C++20, STL Containers, Graph Theory & Bitmasking",
    description:
      "Engineered for sub-millisecond execution. Master STL vectors, unordered maps, binary search, and graph traversal under strict time limits.",
    courseSlug: "cpp-competitive-core",
    modulesCount: 4,
    durationEst: "4 Months",
    totalProblems: 220,
    practiceAreas: [
      {
        title: "Fast I/O & STL Vectors",
        topic: "stl-vectors",
        description: "Iterators, vectors, and memory contiguous lookups",
        difficulty: "Easy",
        problemCount: 20,
      },
      {
        title: "Binary Search & Bounds",
        topic: "binary-search",
        description: "lower_bound, upper_bound, and search on sorted matrices",
        difficulty: "Easy",
        problemCount: 25,
      },
      {
        title: "Graph Traversal (BFS & DFS)",
        topic: "graphs",
        description: "Adjacency lists, shortest paths, and topological sort",
        difficulty: "Medium",
        problemCount: 30,
      },
      {
        title: "Dynamic Programming",
        topic: "dp",
        description: "Substructure optimal choices, knapsack, and memoized DP",
        difficulty: "Hard",
        problemCount: 28,
      },
    ],
  },
  java: {
    languageKey: "java",
    label: "Java",
    iconLabel: "Java",
    badge: "Enterprise OOP Track",
    title: "Java Core, OOP & Enterprise Algorithms",
    subtitle: "Object-Oriented Design, Collections Framework & Multithreading",
    description:
      "Prepare for enterprise engineering interviews. Master Java Collections, memory management, OOP paradigms, and clean architectural design patterns.",
    courseSlug: "java-core-algorithms",
    modulesCount: 5,
    durationEst: "4 Months",
    totalProblems: 195,
    practiceAreas: [
      {
        title: "Strings & Frequency Arrays",
        topic: "strings",
        description: "String immutability, StringBuilder, and char encodings",
        difficulty: "Easy",
        problemCount: 22,
      },
      {
        title: "Collections & Generics",
        topic: "collections",
        description: "ArrayList, LinkedList, HashMap, and PriorityQueue",
        difficulty: "Medium",
        problemCount: 26,
      },
      {
        title: "Object-Oriented Architecture",
        topic: "oop-design",
        description: "Polymorphism, abstraction, interfaces, and Clean Code",
        difficulty: "Medium",
        problemCount: 18,
      },
      {
        title: "Binary Trees & BSTs",
        topic: "trees",
        description: "Tree node traversals, lowest common ancestor, and levels",
        difficulty: "Hard",
        problemCount: 20,
      },
    ],
  },
  javascript: {
    languageKey: "javascript",
    label: "JavaScript",
    iconLabel: "JS",
    badge: "Modern Web Engineering",
    title: "JavaScript & Frontend Engineering Systems",
    subtitle: "Async Event Loop, Closures, Prototype Chains & Array Transforms",
    description:
      "Deep dive into asynchronous JavaScript, Promises, DOM manipulation algorithms, and data transform patterns used in high-scale web products.",
    courseSlug: "javascript-mastery",
    modulesCount: 4,
    durationEst: "3 Months",
    totalProblems: 160,
    practiceAreas: [
      {
        title: "Array Transforms & Closures",
        topic: "functional-js",
        description: "map, filter, reduce, currying, and higher-order functions",
        difficulty: "Easy",
        problemCount: 20,
      },
      {
        title: "Sliding Window & Substrings",
        topic: "sliding-window",
        description: "Set manipulation, longest substrings, and character counts",
        difficulty: "Medium",
        problemCount: 18,
      },
      {
        title: "Async Queues & Promises",
        topic: "async",
        description: "Promise concurrency, debounce, throttle, and microtasks",
        difficulty: "Medium",
        problemCount: 16,
      },
      {
        title: "Tree & Graph Traversals in JS",
        topic: "dom-trees",
        description: "Nested JSON objects, DOM tree search, and deep clone",
        difficulty: "Hard",
        problemCount: 15,
      },
    ],
  },
  c: {
    languageKey: "c",
    label: "C Language",
    iconLabel: "C",
    badge: "Low-Level Computing",
    title: "C Language with Systems & Beginner DSA",
    subtitle: "Pointers, Manual Memory Allocation & Fundamental Data Structures",
    description:
      "Understand software engineering from hardware fundamentals. Learn raw memory management, pointers, dynamic memory allocation, and basic algorithms.",
    courseSlug: "cpp-competitive-core",
    modulesCount: 3,
    durationEst: "3 Months",
    totalProblems: 130,
    practiceAreas: [
      {
        title: "Pointers & Memory Allocation",
        topic: "pointers",
        description: "malloc, free, pointer arithmetic, and reference passing",
        difficulty: "Easy",
        problemCount: 18,
      },
      {
        title: "Linked Lists & Arrays",
        topic: "linked-lists",
        description: "Singly and doubly linked lists implemented in raw C",
        difficulty: "Medium",
        problemCount: 20,
      },
      {
        title: "Bitwise Operations & Masks",
        topic: "bitwise",
        description: "Bit manipulation, shifts, masks, and binary flags",
        difficulty: "Medium",
        problemCount: 15,
      },
      {
        title: "Sorting & Search Algorithms",
        topic: "sorting",
        description: "Quick sort, merge sort, and binary search implementation",
        difficulty: "Medium",
        problemCount: 18,
      },
    ],
  },
};

export function StudentDashboardPage({ navigate }: StudentDashboardPageProps) {
  const { user, profile, points, isAdmin } = useAuth();
  const [courses, setCourses] = useState<CourseWithModules[]>([]);
  const [allTasks, setAllTasks] = useState<EnrichedTask[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, UserTaskProgress>>({});
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual roadmap tab override if student wants to explore other language roadmaps
  const [selectedRoadmapLang, setSelectedRoadmapLang] = useState<SupportedLanguage | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [{ data: fetchedCourses }, { data: fetchedLeaderboard }] = await Promise.all([
          courseService.getCourses(),
          courseService.getLeaderboard(5),
        ]);

        const activeCourses =
          fetchedCourses && fetchedCourses.length > 0 ? fetchedCourses : DEMO_COURSES;
        setCourses(activeCourses);

        if (fetchedLeaderboard) {
          setLeaderboard(fetchedLeaderboard);
        }

        const extractedTasks: EnrichedTask[] = [];
        activeCourses.forEach((course) => {
          course.modules.forEach((mod) => {
            (mod.tasks || []).forEach((task) => {
              extractedTasks.push({
                ...task,
                courseTitle: course.title,
                courseSlug: course.slug,
              });
            });
          });
        });
        setAllTasks(extractedTasks);

        // 1. Read local completed tasks
        const localCompleted = progressStorage.getCompletedTasks();
        const mergedProgress: Record<string, UserTaskProgress> = {};
        Object.keys(localCompleted).forEach((taskId) => {
          if (localCompleted[taskId]?.is_completed) {
            mergedProgress[taskId] = {
              user_id: user?.id || "local-user",
              task_id: taskId,
              is_completed: true,
              completed_at: localCompleted[taskId]?.completed_at || new Date().toISOString(),
            };
          }
        });

        // 2. If signed in, merge Supabase database progress
        if (user?.id && extractedTasks.length > 0) {
          const { data: prog } = await courseService.getUserProgress(
            user.id,
            extractedTasks.map((t) => t.id)
          );
          if (prog) {
            Object.assign(mergedProgress, prog);
          }
        }

        setProgressMap(mergedProgress);

        // 3. Read current enrolled courses
        const storedEnrolled = enrollmentStorage.getEnrolledCourseIdentifiers();
        setEnrolledIds(storedEnrolled);
      } catch (err) {
        console.error("[StudentDashboard] Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();

    const handleSync = () => {
      setEnrolledIds(enrollmentStorage.getEnrolledCourseIdentifiers());
      loadDashboardData();
    };
    window.addEventListener("aarcode_progress_updated", handleSync);
    window.addEventListener("aarcode_enrollment_updated", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("aarcode_progress_updated", handleSync);
      window.removeEventListener("aarcode_enrollment_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [user?.id]);

  const studentName =
    profile?.full_name || user?.email?.split("@")[0] || "Developer";

  const localXP = progressStorage.getLocalXP();
  const effectivePoints = Math.max(points || profile?.points || 0, localXP);

  const solvedTasksCount = allTasks.filter((t) => progressMap[t.id]?.is_completed).length;
  const totalTasksCount = allTasks.length;

  // Next recommended unsolved task
  const nextTask =
    allTasks.find((t) => !progressMap[t.id]?.is_completed) || allTasks[0];

  // Dynamic Time Greeting
  const currentHour = new Date().getHours();
  const timeGreeting =
    currentHour < 12
      ? "Good Morning"
      : currentHour < 17
      ? "Good Afternoon"
      : "Good Evening";

  // Filter ONLY enrolled courses for the "Continue Learning" section
  const enrolledCourses = useMemo(() => {
    return courses.filter((course) => {
      const taskIds = course.modules.flatMap((m) => (m.tasks || []).map((t) => t.id));
      return (
        enrolledIds.includes(course.id) ||
        (course.slug && enrolledIds.includes(course.slug)) ||
        enrollmentStorage.isEnrolled(course.id, course.slug, taskIds)
      );
    });
  }, [courses, enrolledIds, progressMap]);

  // =========================================================================
  // SMART LANGUAGE & ROADMAP ANALYZER:
  // Analyzes student's solved tasks, saved programs, and settings preferences
  // =========================================================================
  const analyzedPreference = useMemo(() => {
    const scores: Record<SupportedLanguage, number> = {
      python: 0,
      cpp: 0,
      java: 0,
      javascript: 0,
      c: 0,
    };

    // 1. Analyze languages from completed tasks
    allTasks.forEach((t) => {
      if (progressMap[t.id]?.is_completed) {
        const lang = (t.language || "").toLowerCase();
        if (lang.includes("py")) scores.python += 6;
        else if (lang.includes("cpp") || lang.includes("c++")) scores.cpp += 6;
        else if (lang.includes("java") && !lang.includes("script")) scores.java += 6;
        else if (lang.includes("js") || lang.includes("script") || lang.includes("ts"))
          scores.javascript += 6;
        else if (lang === "c") scores.c += 6;
      }
    });

    // 2. Analyze languages from saved programs in IDE
    try {
      const programs = loadPrograms();
      programs.forEach((p) => {
        const lang = (p.language || "").toLowerCase();
        if (lang.includes("py")) scores.python += 3;
        else if (lang.includes("cpp") || lang.includes("c++")) scores.cpp += 3;
        else if (lang.includes("java") && !lang.includes("script")) scores.java += 3;
        else if (lang.includes("js") || lang.includes("ts")) scores.javascript += 3;
        else if (lang === "c") scores.c += 3;
      });
    } catch {
      /* ignore */
    }

    // 3. Analyze compiler settings default language
    try {
      const settings = loadSettings();
      const lang = (settings.language || "").toLowerCase();
      if (lang.includes("py")) scores.python += 2;
      else if (lang.includes("cpp") || lang.includes("c++")) scores.cpp += 2;
      else if (lang.includes("java") && !lang.includes("script")) scores.java += 2;
      else if (lang.includes("js") || lang.includes("ts")) scores.javascript += 2;
      else if (lang === "c") scores.c += 2;
    } catch {
      /* ignore */
    }

    let topLang: SupportedLanguage = "python";
    let highestScore = -1;
    (Object.keys(scores) as SupportedLanguage[]).forEach((langKey) => {
      if (scores[langKey] > highestScore) {
        highestScore = scores[langKey];
        topLang = langKey;
      }
    });

    const matchConfidence =
      highestScore > 0 ? Math.min(98, 72 + highestScore * 3) : 85;

    return {
      topLang,
      matchConfidence,
      score: highestScore,
    };
  }, [allTasks, progressMap]);

  // Active roadmap is either student's chosen language tab or the AI analyzed language
  const activeRoadmapLang: SupportedLanguage =
    selectedRoadmapLang || analyzedPreference.topLang;
  const activeRoadmapConfig = ROADMAP_PRESETS[activeRoadmapLang];

  // Progress for the active roadmap's corresponding course
  const roadmapCourse = courses.find((c) => c.slug === activeRoadmapConfig.courseSlug);
  const roadmapTasks = roadmapCourse?.modules.flatMap((m) => m.tasks || []) || [];
  const roadmapSolvedCount = roadmapTasks.filter(
    (t) => progressMap[t.id]?.is_completed
  ).length;
  const roadmapTotalCount = roadmapTasks.length || activeRoadmapConfig.totalProblems;
  const roadmapPct =
    roadmapTotalCount > 0
      ? Math.round((roadmapSolvedCount / roadmapTotalCount) * 100)
      : 0;

  // Streak status and weekly streak days
  const currentStreakDays = solvedTasksCount > 0 ? Math.max(1, solvedTasksCount) : 1;
  const weekDays = [
    { label: "S", dayNum: 27, status: "completed" },
    { label: "M", dayNum: 28, status: "completed" },
    { label: "T", dayNum: 29, status: "completed" },
    { label: "W", dayNum: 30, status: "completed" },
    { label: "T", dayNum: 1, status: "completed" },
    { label: "F", dayNum: 2, status: "active" },
    { label: "S", dayNum: 3, status: "upcoming" },
  ];

  return (
    <div className="min-h-screen font-urbanist bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-white py-6 sm:py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-7">
        {/* ===================================================================
            SECTION 1: WELCOME BACK MESSAGE & LIVE TELEMETRY BANNER
        =================================================================== */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E1B4B] dark:from-[#0F172A] dark:via-[#111827] dark:to-[#1E1B4B] text-white p-6 sm:p-8 lg:p-9 shadow-xl border border-slate-700/50 dark:border-indigo-900/30 overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#6366F1]/30 via-[#7C3AED]/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Welcome Text */}
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/25 text-indigo-300 text-xs font-semibold">
                <Terminal size={13} className="text-indigo-400" />
                <span>Student Engineering Portal</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white">
                {timeGreeting}, <span className="text-indigo-300 font-semibold">{studentName}</span>
              </h1>

              <p className="text-xs sm:text-sm font-normal text-slate-300 leading-relaxed">
                Welcome back to AarCode. You've completed{" "}
                <span className="text-emerald-400 font-semibold">
                  {solvedTasksCount > 0 ? "35%" : "0%"}
                </span>{" "}
                of your weekly goal. Keep practicing to level up your engineering skills and climb the leaderboard.
              </p>

              {/* Quick Action Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {nextTask && (
                  <button
                    onClick={() => navigate("task", { taskId: nextTask.id })}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
                  >
                    <Play size={14} className="fill-white" />
                    <span>Resume: {nextTask.title}</span>
                    <ArrowRight size={14} />
                  </button>
                )}

                <button
                  onClick={() => navigate("compiler")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-xs sm:text-sm transition-all"
                >
                  <Terminal size={14} className="text-indigo-300" />
                  <span>Open IDE Compiler</span>
                </button>
              </div>
            </div>

            {/* Right Telemetry Stat Badges (Clean LeetCode-style stat boxes) */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-wrap sm:flex-nowrap">
              {/* Current Streak */}
              <div className="flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-2 text-center shadow-inner">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1">
                  <Flame size={17} strokeWidth={2} />
                </div>
                <div className="text-lg sm:text-xl font-semibold text-white">{currentStreakDays}</div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Streak Days
                </div>
              </div>

              {/* Solved Problems */}
              <div className="flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-2 text-center shadow-inner">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                  <CheckCircle2 size={17} strokeWidth={2} />
                </div>
                <div className="text-lg sm:text-xl font-semibold text-white">{solvedTasksCount}</div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Solved
                </div>
              </div>

              {/* XP Points */}
              <div className="flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-2 text-center shadow-inner">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-1">
                  <Zap size={17} strokeWidth={2} />
                </div>
                <div className="text-lg sm:text-xl font-semibold text-white">{effectivePoints}</div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  XP Points
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            MAIN 2-COLUMN GRID (8 Col Main Workspaces + 4 Col Sidebar Tracker)
        =================================================================== */}
        {loading ? (
          <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-[#6366F1]" />
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Synchronizing student roadmap &amp; learning metrics...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            {/* ===============================================================
                LEFT MAIN STREAM (8 COLUMNS)
            =============================================================== */}
            <div className="lg:col-span-8 space-y-7">
              {/* -------------------------------------------------------------
                  SECTION 2: CONTINUE LEARNING (ONLY THE REGISTERED COURSES)
              ------------------------------------------------------------- */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-[#6366F1] flex items-center justify-center font-bold">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Continue Learning</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-[#6366F1] dark:text-indigo-300">
                          {enrolledCourses.length} Registered
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Courses you have currently enrolled and are making progress in
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("courses")}
                    className="text-xs sm:text-sm font-semibold text-[#6366F1] dark:text-indigo-400 hover:underline inline-flex items-center gap-1 shrink-0"
                  >
                    <span>View all</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                {enrolledCourses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {enrolledCourses.map((course, idx) => {
                      const courseTasks = course.modules.flatMap((m) => m.tasks || []);
                      const courseSolved = courseTasks.filter(
                        (t) => progressMap[t.id]?.is_completed
                      ).length;
                      const courseTotal = courseTasks.length;
                      const coursePct =
                        courseTotal > 0 ? Math.round((courseSolved / courseTotal) * 100) : 0;

                      // Distinct pastel accents inspired by Image 1
                      const cardStyles = [
                        {
                          border: "border-pink-200/80 dark:border-pink-900/30",
                          badge: "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300",
                          bar: "from-pink-500 to-rose-500",
                        },
                        {
                          border: "border-sky-200/80 dark:border-sky-900/30",
                          badge: "bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300",
                          bar: "from-sky-500 to-indigo-500",
                        },
                        {
                          border: "border-amber-200/80 dark:border-amber-900/30",
                          badge: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300",
                          bar: "from-amber-500 to-orange-500",
                        },
                        {
                          border: "border-emerald-200/80 dark:border-emerald-900/30",
                          badge: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300",
                          bar: "from-emerald-500 to-teal-500",
                        },
                      ];
                      const style = cardStyles[idx % cardStyles.length];

                      return (
                        <div
                          key={course.id}
                          onClick={() => navigate("course", { slug: course.slug })}
                          className={cn(
                            "group cursor-pointer rounded-2xl bg-white dark:bg-[#0F172A] border p-5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200",
                            style.border
                          )}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span
                                className={cn(
                                  "text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full inline-flex items-center gap-1",
                                  style.badge
                                )}
                              >
                                <BookOpen size={10} />
                                <span>Course</span>
                              </span>

                              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                {course.modules.length} Modules
                              </span>
                            </div>

                            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-[#6366F1] dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                              {course.title}
                            </h3>

                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              {courseSolved} / {courseTotal} activities
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-[#1E293B]">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-slate-500 dark:text-slate-400">Progress</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {coursePct}%
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#090D16] overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                                  style.bar
                                )}
                                style={{ width: `${Math.max(coursePct, 6)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 dark:border-[#1E293B] bg-white/50 dark:bg-[#0F172A]/50 p-6 text-center space-y-3">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      You are not currently enrolled in any courses.
                    </p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Enroll in any of our industry-ready tracks in Python, C++, Java, or JavaScript
                      to see your learning activities here.
                    </p>
                    <button
                      onClick={() => navigate("courses")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold shadow-md transition-all"
                    >
                      <Compass size={14} />
                      <span>Explore &amp; Enroll in Courses</span>
                    </button>
                  </div>
                )}
              </div>

              {/* -------------------------------------------------------------
                  SECTION 3: FEATURED COURSE OF THE MONTH (Practice LLD)
              ------------------------------------------------------------- */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Award size={19} className="text-indigo-500" />
                    <span>Featured Course of the Month</span>
                  </h2>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                    Spotlight
                  </span>
                </div>

                <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-5 sm:p-6 shadow-xs hover:border-indigo-500/40 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex items-start gap-4">
                    {/* Visual LLD Badge / Thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center shrink-0">
                      <div className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 tracking-wider font-mono">
                        LLD
                      </div>
                      <Layers size={17} className="text-indigo-500 mt-1" />
                    </div>

                    <div className="space-y-1.5 max-w-xl">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                        Practice LLD
                      </h3>
                      <p className="text-xs sm:text-sm font-normal text-slate-600 dark:text-slate-300 leading-relaxed">
                        Strengthen your Low-Level Design (LLD) skills through interactive MCQs,
                        short-answer questions, and hands-on Java, Python, and C++ coding projects.
                        Practice object-oriented design, UML, Clean Code, SOLID principles, and
                        Design Patterns with real-world scenarios.
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#090D16] border border-slate-200/80 dark:border-[#1E293B]">
                          SOLID Principles
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#090D16] border border-slate-200/80 dark:border-[#1E293B]">
                          Design Patterns
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Free for Students
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex sm:flex-col items-center gap-2">
                    <button
                      onClick={() => navigate("course", { slug: "practice-lld" })}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all"
                    >
                      <span>Start Course</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------------------
                  SECTION 4: CONTINUE YOUR ROADMAP (AI LANGUAGE ANALYZED)
              ------------------------------------------------------------- */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Compass size={19} className="text-indigo-500" />
                      <span>Continue Your Roadmap</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Personalized engineering curriculum analyzing your programming language &amp;
                      problem submissions
                    </p>
                  </div>

                  {/* Language Switcher Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {(Object.keys(ROADMAP_PRESETS) as SupportedLanguage[]).map((langKey) => {
                      const isSelected = activeRoadmapLang === langKey;
                      const isRecommended = analyzedPreference.topLang === langKey;
                      return (
                        <button
                          key={langKey}
                          onClick={() => setSelectedRoadmapLang(langKey)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0",
                            isSelected
                              ? "bg-[#6366F1] text-white shadow-xs"
                              : "bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          )}
                        >
                          <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-black/10 dark:bg-white/10 font-bold">
                            {ROADMAP_PRESETS[langKey].iconLabel}
                          </span>
                          <span>{ROADMAP_PRESETS[langKey].label}</span>
                          {isRecommended && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Recommended Roadmap Card */}
                <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-5 sm:p-6 space-y-5 shadow-xs">
                  {/* Sub-badge: Roadmap Recommended for you */}
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/25 text-[#4F46E5] dark:text-indigo-300 text-xs font-semibold">
                      <Target size={13} className="text-indigo-500" />
                      <span>Recommended for You</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({analyzedPreference.matchConfidence}% Match based on your{" "}
                        {ROADMAP_PRESETS[analyzedPreference.topLang].label} submissions)
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {activeRoadmapConfig.durationEst} Est.
                    </span>
                  </div>

                  {/* Main Roadmap Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200/70 dark:border-[#1E293B]">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[#6366F1] flex items-center justify-center font-mono font-bold text-sm shrink-0">
                        {activeRoadmapConfig.iconLabel}
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                          {activeRoadmapConfig.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <BookOpen size={13} className="text-[#6366F1]" />
                            <span>{activeRoadmapConfig.modulesCount} Modules</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={13} className="text-slate-400" />
                            <span>{activeRoadmapConfig.durationEst}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Target size={13} className="text-emerald-500" />
                            <span>{activeRoadmapConfig.totalProblems} Problems</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate("course", { slug: activeRoadmapConfig.courseSlug })}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white font-semibold text-xs shadow-xs active:scale-[0.98] transition-all shrink-0"
                    >
                      <span>Resume Roadmap</span>
                    </button>
                  </div>

                  {/* Practice Areas Grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span>PRACTICE TRACKS &amp; CURATED TOPICS</span>
                      <button
                        onClick={() => navigate("problems")}
                        className="text-xs font-semibold text-[#6366F1] dark:text-indigo-400 hover:underline"
                      >
                        All Practice Problems →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeRoadmapConfig.practiceAreas.map((area, pIdx) => (
                        <div
                          key={pIdx}
                          onClick={() => navigate("problems")}
                          className="group cursor-pointer p-3.5 rounded-xl border border-slate-200/80 dark:border-[#1E293B] hover:border-[#6366F1] bg-slate-50 dark:bg-[#090D16] transition-all flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#6366F1] dark:group-hover:text-indigo-400 transition-colors">
                                {area.title}
                              </h5>
                              <span
                                className={cn(
                                  "text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded border",
                                  area.difficulty === "Easy" &&
                                    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                                  area.difficulty === "Medium" &&
                                    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                                  area.difficulty === "Hard" &&
                                    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                )}
                              >
                                {area.difficulty}
                              </span>
                            </div>
                            <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400 line-clamp-1">
                              {area.description}
                            </p>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-slate-400 group-hover:text-[#6366F1] transition-colors">
                            <span>{area.problemCount} Qs</span>
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===============================================================
                RIGHT SIDEBAR (4 COLUMNS - STREAK, GOALS & LEADERBOARD)
            =============================================================== */}
            <div className="lg:col-span-4 space-y-6">
              {/* -------------------------------------------------------------
                  STREAK TRACKER (LeetCode-Style Activity & Streak Tracker)
              ------------------------------------------------------------- */}
              <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-5 space-y-4 shadow-xs">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-500 flex items-center justify-center shrink-0">
                      <Flame size={18} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Daily Coding Streak</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Consistency tracker</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">{currentStreakDays}</span>
                    <span className="text-xs text-slate-400 font-normal"> / 50 days</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#090D16] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(8, (currentStreakDays / 50) * 100))}%` }}
                    />
                  </div>
                  <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400 leading-snug">
                    Solve at least 1 coding problem today to extend your streak.
                  </p>
                </div>

                {/* Weekday Streak Days (S M T W T F S) - Clean LeetCode style */}
                <div className="pt-3 border-t border-slate-100 dark:border-[#1E293B]/80">
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {weekDays.map((wd, wIdx) => {
                      const isCompleted = wd.status === "completed";
                      const isActive = wd.status === "active";
                      return (
                        <div key={wIdx} className="flex flex-col items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-slate-400">{wd.label}</span>
                          <div
                            className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold transition-all",
                              isCompleted &&
                                "bg-amber-500 text-white shadow-xs",
                              isActive &&
                                "bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-[#0F172A]",
                              wd.status === "upcoming" &&
                                "bg-slate-100 dark:bg-[#090D16] text-slate-400 border border-slate-200/60 dark:border-[#1E293B]"
                            )}
                          >
                            {isCompleted ? <Check size={13} strokeWidth={2.5} /> : wd.dayNum}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 pt-3 text-center">
                    3 Freeze Days Available
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------------------
                  LEARNING ANALYTICS SUMMARY (Inspired by Image 1)
              ------------------------------------------------------------- */}
              <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#6366F1]" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Learning Analytics
                    </h3>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#090D16] text-slate-500">
                    Weekly
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200/60 dark:border-[#1E293B]">
                    <div className="text-[10px] font-semibold uppercase text-slate-400">
                      Total XP Earned
                    </div>
                    <div className="text-lg font-bold text-[#6366F1] mt-0.5">
                      +{effectivePoints}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400">All time</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200/60 dark:border-[#1E293B]">
                    <div className="text-[10px] font-semibold uppercase text-slate-400">
                      Solved Tasks
                    </div>
                    <div className="text-lg font-bold text-emerald-500 mt-0.5">
                      {solvedTasksCount} / {totalTasksCount}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400">Verified</div>
                  </div>
                </div>

                <button
                  onClick={() => navigate("compiler")}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-[#090D16] hover:bg-slate-200 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Terminal size={14} className="text-[#6366F1]" />
                    <span>Launch Compiler Playground</span>
                  </span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* -------------------------------------------------------------
                  LEADERBOARD PREVIEW (Inspired by Image 1)
              ------------------------------------------------------------- */}
              <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-amber-500" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Top Performers
                    </h3>
                  </div>
                  <button
                    onClick={() => navigate("leaderboard")}
                    className="text-xs font-semibold text-[#6366F1] dark:text-indigo-400 hover:underline"
                  >
                    Full board
                  </button>
                </div>

                {leaderboard.length === 0 ? (
                  <p className="text-xs font-medium text-slate-400 py-3 text-center">
                    Solve challenges to appear on the leaderboard!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry, idx) => {
                      const isCurrentUser = entry.user_id === user?.id;
                      return (
                        <div
                          key={entry.user_id}
                          className={cn(
                            "flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all",
                            isCurrentUser
                              ? "bg-indigo-500/10 border-[#6366F1]/40 text-slate-900 dark:text-white"
                              : "bg-slate-50 dark:bg-[#090D16] border-slate-200/60 dark:border-[#1E293B] text-slate-700 dark:text-slate-300"
                          )}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span
                              className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                                idx === 0
                                  ? "bg-amber-500 text-white"
                                  : idx === 1
                                  ? "bg-slate-400 text-white"
                                  : idx === 2
                                  ? "bg-amber-700 text-white"
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              )}
                            >
                              #{idx + 1}
                            </span>
                            <span className="truncate">
                              {entry.full_name || "Developer"}
                              {isCurrentUser && " (You)"}
                            </span>
                          </div>
                          <span className="text-amber-500 font-semibold shrink-0">
                            {entry.points} XP
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboardPage;
