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
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/services/supabase";
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
    label: "C",
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
  const [sidebarLeaderboardMode, setSidebarLeaderboardMode] = useState<"overall" | "course">("overall");
  const [courseLeaderboard, setCourseLeaderboard] = useState<LeaderboardEntry[]>([]);
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

        // 2. If signed in, merge Supabase database progress for all completed tasks
        if (user?.id) {
          const { data: prog } = await courseService.getUserProgress(user.id);
          if (prog) {
            Object.assign(mergedProgress, prog);

            // If there are completed tasks in DB not yet in extractedTasks, fetch their task metadata
            const solvedIds = Object.keys(prog).filter((id) => prog[id]?.is_completed);
            const missingIds = solvedIds.filter((id) => !extractedTasks.some((t) => t.id === id));
            if (missingIds.length > 0) {
              try {
                const { data: extraTasks } = await supabase
                  .from("tasks")
                  .select(
                    "id, module_id, title, slug, description, task_type, language, difficulty, starter_code, hints, points, order_index, created_at, updated_at"
                  )
                  .in("id", missingIds);
                if (extraTasks && extraTasks.length > 0) {
                  extraTasks.forEach((et) => {
                    extractedTasks.push({
                      ...et,
                      courseTitle: "Practice Arena",
                      courseSlug: "problems",
                    } as EnrichedTask);
                  });
                  setAllTasks([...extractedTasks]);
                }
              } catch (e) {
                console.warn("[StudentDashboard] Could not fetch extra task metadata:", e);
              }
            }
          }
        }

        setProgressMap(mergedProgress);

        // 3. Sync all active database courses into enrollment so all curriculum tracks are immediately accessible
        activeCourses.forEach((c) => {
          enrollmentStorage.enroll(c.id);
          if (c.slug && c.slug !== "#") enrollmentStorage.enroll(c.slug);
        });
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
    return courses
      .filter((course) => {
        const taskIds = course.modules.flatMap((m) => (m.tasks || []).map((t) => t.id));
        const hasSolvedAny = taskIds.some((t) => progressMap[t]?.is_completed);
        return (
          hasSolvedAny ||
          enrolledIds.includes(course.id) ||
          (course.slug && enrolledIds.includes(course.slug)) ||
          enrollmentStorage.isEnrolled(course.id, course.slug, taskIds)
        );
      })
      .sort((a, b) => {
        const aTasks = a.modules.flatMap((m) => (m.tasks || []).map((t) => t.id));
        const bTasks = b.modules.flatMap((m) => (m.tasks || []).map((t) => t.id));
        const aSolved = aTasks.filter((t) => progressMap[t]?.is_completed).length;
        const bSolved = bTasks.filter((t) => progressMap[t]?.is_completed).length;
        if (bSolved !== aSolved) return bSolved - aSolved;
        return a.title.localeCompare(b.title);
      });
  }, [courses, enrolledIds, progressMap]);

  // Dynamic Featured Course from real database courses
  const featuredCourse = courses[0] || DEMO_COURSES[0];
  const featuredSlug =
    featuredCourse?.slug && featuredCourse.slug !== "#"
      ? featuredCourse.slug
      : featuredCourse?.id || "python-dsa";
  const featuredTasksCount =
    featuredCourse?.modules?.flatMap((m) => m.tasks || []).length || 0;

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
    const solvedCounts: Record<SupportedLanguage, number> = {
      python: 0,
      cpp: 0,
      java: 0,
      javascript: 0,
      c: 0,
    };

    const normalizeLang = (raw?: string | null): SupportedLanguage | null => {
      if (!raw) return null;
      const l = raw.toLowerCase().trim();
      if (l.includes("java") && !l.includes("script")) return "java";
      if (l.includes("cpp") || l.includes("c++")) return "cpp";
      if (l.includes("py")) return "python";
      if (l.includes("js") || l.includes("script") || l.includes("ts") || l.includes("node"))
        return "javascript";
      if (l === "c") return "c";
      return null;
    };

    // 1. Analyze languages from completed tasks
    const localCompleted = progressStorage.getCompletedTasks();

    allTasks.forEach((t) => {
      const isDone = progressMap[t.id]?.is_completed || localCompleted[t.id]?.is_completed;
      if (isDone) {
        const localLang = localCompleted[t.id]?.language;
        const langKey = normalizeLang(localLang || t.language);
        if (langKey) {
          scores[langKey] += 12;
          solvedCounts[langKey] += 1;
        }
      }
    });

    // Check local completed tasks not in allTasks
    Object.values(localCompleted).forEach((lc) => {
      if (lc.is_completed && lc.language) {
        const isAlreadyCounted = allTasks.some((t) => t.id === lc.task_id);
        if (!isAlreadyCounted) {
          const langKey = normalizeLang(lc.language);
          if (langKey) {
            scores[langKey] += 12;
            solvedCounts[langKey] += 1;
          }
        }
      }
    });

    // 2. Analyze languages from saved programs in IDE
    try {
      const programs = loadPrograms();
      programs.forEach((p) => {
        const langKey = normalizeLang(p.language);
        if (langKey) {
          scores[langKey] += 3;
        }
      });
    } catch {
      /* ignore */
    }

    // 3. Analyze compiler settings and recent platform language
    try {
      const lastLang = localStorage.getItem("aarcode_last_used_lang");
      const langKey = normalizeLang(lastLang);
      if (langKey) {
        scores[langKey] += 4;
      }
    } catch {
      /* ignore */
    }

    try {
      const settings = loadSettings();
      const langKey = normalizeLang((settings as any).language);
      if (langKey) {
        scores[langKey] += 2;
      }
    } catch {
      /* ignore */
    }

    // Determine top language:
    // If the student solved problems, the language with the MOST solved problems ALWAYS wins!
    let topLang: SupportedLanguage = "python";
    let maxSolved = 0;
    (Object.keys(solvedCounts) as SupportedLanguage[]).forEach((lang) => {
      if (solvedCounts[lang] > maxSolved) {
        maxSolved = solvedCounts[lang];
        topLang = lang;
      }
    });

    // If no solved problems yet, choose by activity score (saved programs, last language)
    let highestScore = -1;
    if (maxSolved === 0) {
      (Object.keys(scores) as SupportedLanguage[]).forEach((lang) => {
        if (scores[lang] > highestScore) {
          highestScore = scores[lang];
          topLang = lang;
        }
      });
    } else {
      highestScore = scores[topLang];
    }

    const matchConfidence =
      maxSolved > 0
        ? Math.min(99, 82 + maxSolved * 4)
        : highestScore > 0
        ? 86
        : 80;

    return {
      topLang,
      solvedCounts,
      totalSolvedInTop: solvedCounts[topLang],
      matchConfidence,
      score: highestScore,
      hasUserActivity: maxSolved > 0 || highestScore > 0,
    };
  }, [allTasks, progressMap]);

  // Active roadmap is either student's chosen language tab or the AI analyzed language
  const activeRoadmapLang: SupportedLanguage =
    selectedRoadmapLang ?? analyzedPreference.topLang;
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

  // Load course track leaderboard for the active roadmap
  useEffect(() => {
    async function loadTrackLeaderboard() {
      if (activeRoadmapConfig?.courseSlug) {
        const { data } = await courseService.getCourseLeaderboard(activeRoadmapConfig.courseSlug, 5);
        if (data && data.length > 0) {
          setCourseLeaderboard(data);
        }
      }
    }
    loadTrackLeaderboard();
  }, [activeRoadmapConfig?.courseSlug]);

  const getCourseMonogram = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("python")) return "PY";
    if (t.includes("c++") || t.includes("cpp")) return "C++";
    if (t.includes("java") && !t.includes("script")) return "JAVA";
    if (t.includes("javascript") || t.includes("frontend")) return "JS";
    if (t.includes("c ") || t.startsWith("c ")) return "C";
    return title.slice(0, 3).toUpperCase();
  };

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
            <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full sm:w-auto shrink-0">
              {/* Current Streak */}
              <div className="flex flex-col items-center justify-center h-22 sm:w-28 sm:h-28 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-2 text-center shadow-inner">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1">
                  <Flame size={16} strokeWidth={2} />
                </div>
                <div className="text-base sm:text-xl font-semibold text-white">{currentStreakDays}</div>
                <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Streak Days
                </div>
              </div>

              {/* Solved Problems */}
              <div className="flex flex-col items-center justify-center h-22 sm:w-28 sm:h-28 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-2 text-center shadow-inner">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                  <CheckCircle2 size={16} strokeWidth={2} />
                </div>
                <div className="text-base sm:text-xl font-semibold text-white">{solvedTasksCount}</div>
                <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Solved
                </div>
              </div>

              {/* XP Points */}
              <div className="flex flex-col items-center justify-center h-22 sm:w-28 sm:h-28 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-2 text-center shadow-inner">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-1">
                  <Zap size={16} strokeWidth={2} />
                </div>
                <div className="text-base sm:text-xl font-semibold text-white">{effectivePoints}</div>
                <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
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
          <div className="space-y-8">
            {/* ===============================================================
                MAIN 2-COLUMN GRID (8 Col Left Stream + 4 Col Right Sidebar)
                Placed directly after Welcome Banner so Continue Learning is NOT full width
            =============================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              {/* ===============================================================
                  LEFT MAIN STREAM (8 COLUMNS)
              =============================================================== */}
              <div className="lg:col-span-8 space-y-7">
                {/* -------------------------------------------------------------
                    CONTINUE LEARNING (LIST TYPE ONLY - NOT FULL WIDTH, 8-COL STREAM)
                ------------------------------------------------------------- */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen size={19} className="text-indigo-500" />
                        <span>Continue Learning</span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-[#6366F1] dark:text-indigo-300">
                          {enrolledCourses.length > 0 ? `${enrolledCourses.length} Registered Tracks` : "Available Tracks"}
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {enrolledCourses.length > 0
                          ? "Resume your enrolled curricula and practice modules right where you left off"
                          : "Explore core programming and algorithmic curricula to start your engineering journey"}
                      </p>
                    </div>

                    <button
                      onClick={() => navigate("courses")}
                      className="text-xs sm:text-sm font-semibold text-[#6366F1] dark:text-indigo-400 hover:underline inline-flex items-center gap-1 shrink-0 self-start sm:self-auto"
                    >
                      <span>Explore all curricula</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  {/* LIST TYPE PRESENTATION (flex-col rows, clean horizontal cards) */}
                  <div className="flex flex-col gap-3">
                    {(enrolledCourses.length > 0 ? enrolledCourses : courses.slice(0, 3)).map((course, idx) => {
                      const courseTasks = course.modules.flatMap((m) => m.tasks || []);
                      const courseSolved = courseTasks.filter(
                        (t) => progressMap[t.id]?.is_completed
                      ).length;
                      const courseTotal = courseTasks.length;
                      const coursePct =
                        courseTotal > 0 ? Math.round((courseSolved / courseTotal) * 100) : 0;
                      const courseSlugOrId =
                        course.slug && course.slug !== "#" ? course.slug : course.id;

                      const rowStyles = [
                        {
                          bg: "bg-indigo-500/10 text-[#6366F1] dark:text-indigo-400 border-indigo-500/25",
                          bar: "from-[#6366F1] to-[#7C3AED]",
                        },
                        {
                          bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25",
                          bar: "from-sky-500 to-indigo-500",
                        },
                        {
                          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
                          bar: "from-amber-500 to-orange-500",
                        },
                        {
                          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
                          bar: "from-emerald-500 to-teal-500",
                        },
                      ];
                      const style = rowStyles[idx % rowStyles.length];

                      return (
                        <div
                          key={course.id}
                          onClick={() => navigate("course", { slug: courseSlugOrId })}
                          className="group cursor-pointer rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] hover:border-indigo-500/50 dark:hover:border-indigo-500/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-md transition-all duration-200"
                        >
                          {/* Left: Monogram and Course Info */}
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div
                              className={cn(
                                "w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center font-mono font-bold text-xs sm:text-sm shrink-0 shadow-xs",
                                style.bg
                              )}
                            >
                              {getCourseMonogram(course.title)}
                            </div>

                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-[#6366F1] dark:group-hover:text-indigo-400 transition-colors truncate">
                                  {course.title}
                                </h3>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300">
                                  {course.modules.length} Modules
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                                {course.description ||
                                  "Master core algorithmic patterns, data structures, and technical interview problems."}
                              </p>
                            </div>
                          </div>

                          {/* Right: Progress Telemetry and Action Button */}
                          <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-[#1E293B]">
                            <div className="flex flex-col gap-1 min-w-[120px] sm:min-w-[150px]">
                              <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-slate-500 dark:text-slate-400">
                                  {courseSolved}/{courseTotal}
                                </span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                  {coursePct}%
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#090D16] overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                                    style.bar
                                  )}
                                  style={{ width: `${Math.max(coursePct, 5)}%` }}
                                />
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("course", { slug: courseSlugOrId });
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1E293B] group-hover:bg-gradient-to-r group-hover:from-[#6366F1] group-hover:to-[#7C3AED] text-slate-700 dark:text-slate-200 group-hover:text-white text-xs font-semibold inline-flex items-center gap-1 transition-all shadow-xs shrink-0"
                            >
                              <span>{courseSolved > 0 ? "Resume" : "Start"}</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    FEATURED TRACK OF THE MONTH (Dynamic from DB)
                ------------------------------------------------------------- */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Award size={19} className="text-indigo-500" />
                      <span>Featured Track of the Month</span>
                    </h2>
                    <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                      Spotlight
                    </span>
                  </div>

                  <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-5 sm:p-6 shadow-xs hover:border-indigo-500/40 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div className="flex items-start gap-4">
                      {/* Visual Track Badge / Thumbnail */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center shrink-0">
                        <div className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 tracking-wider font-mono">
                          {featuredCourse.title.slice(0, 3).toUpperCase()}
                        </div>
                        <Layers size={17} className="text-indigo-500 mt-1" />
                      </div>

                      <div className="space-y-1.5 max-w-xl">
                        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                          {featuredCourse.title}
                        </h3>
                        <p className="text-xs sm:text-sm font-normal text-slate-600 dark:text-slate-300 leading-relaxed">
                          {featuredCourse.description ||
                            "Master algorithmic problem solving, clean code patterns, and interview readiness with live sandbox evaluation."}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#090D16] border border-slate-200/80 dark:border-[#1E293B]">
                            {featuredCourse.modules.length} Modules
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#090D16] border border-slate-200/80 dark:border-[#1E293B]">
                            {featuredTasksCount} Practice Tasks
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Curated Curriculum
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex sm:flex-col items-center gap-2">
                      <button
                        onClick={() => navigate("course", { slug: featuredSlug })}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all"
                      >
                        <span>Start Track</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    RECOMMENDED NEXT CHALLENGE (Quick Action Card)
                ------------------------------------------------------------- */}
                {nextTask && (
                  <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 sm:p-6 shadow-sm border border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Next Coding Challenge
                        </span>
                        <span className="text-xs text-slate-300 font-medium">
                          {nextTask.difficulty || "Medium"}
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-semibold text-white">
                        {nextTask.title}
                      </h4>
                      <p className="text-xs text-slate-300 line-clamp-2">
                        {nextTask.description ||
                          "Solve this challenge to level up your engineering skills and increase your streak score."}
                      </p>
                    </div>

                    <button
                      onClick={() => navigate("task", { taskId: nextTask.id })}
                      className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-sm shrink-0 transition-all"
                    >
                      <Play size={13} className="fill-white" />
                      <span>Solve Now</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* ===============================================================
                  RIGHT SIDEBAR (4 COLUMNS - STREAK, GOALS & 2-MODE LEADERBOARD)
              =============================================================== */}
              <div className="lg:col-span-4 space-y-6">
                {/* -------------------------------------------------------------
                    STREAK TRACKER
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
                        <p className="text-xs text-slate-500 dark:text-slate-400">Consistency tracker</p>
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
                    <p className="text-xs font-normal text-slate-500 dark:text-slate-400 leading-snug">
                      Solve at least 1 coding problem today to extend your streak.
                    </p>
                  </div>

                  {/* Weekday Streak Days (S M T W T F S) */}
                  <div className="pt-3 border-t border-slate-100 dark:border-[#1E293B]/80">
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {weekDays.map((wd, wIdx) => {
                        const isCompleted = wd.status === "completed";
                        const isActive = wd.status === "active";
                        return (
                          <div key={wIdx} className="flex flex-col items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-400">{wd.label}</span>
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
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 pt-3 text-center">
                      3 Freeze Days Available
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    LEARNING ANALYTICS SUMMARY
                ------------------------------------------------------------- */}
                <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-[#6366F1]" />
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Learning Analytics
                      </h3>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#090D16] text-slate-500">
                      Weekly
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200/60 dark:border-[#1E293B]">
                      <div className="text-xs font-semibold uppercase text-slate-400">
                        Total XP Earned
                      </div>
                      <div className="text-lg font-bold text-[#6366F1] mt-0.5">
                        +{effectivePoints}
                      </div>
                      <div className="text-xs font-medium text-slate-400">All time</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200/60 dark:border-[#1E293B]">
                      <div className="text-xs font-semibold uppercase text-slate-400">
                        Solved Tasks
                      </div>
                      <div className="text-lg font-bold text-emerald-500 mt-0.5">
                        {solvedTasksCount} / {totalTasksCount}
                      </div>
                      <div className="text-xs font-medium text-slate-400">Verified</div>
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
                    LEADERBOARD PREVIEW (WITH 2-MODE SWITCHER)
                ------------------------------------------------------------- */}
                <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-5 space-y-4 shadow-xs">
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

                  {/* Dual Mode Switcher: Overall vs Within Track */}
                  <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#090D16] border border-slate-200/70 dark:border-[#1E293B]">
                    <button
                      onClick={() => setSidebarLeaderboardMode("overall")}
                      className={cn(
                        "flex-1 py-1 text-xs font-semibold rounded-lg transition-all",
                        sidebarLeaderboardMode === "overall"
                          ? "bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      )}
                    >
                      1st: Overall
                    </button>
                    <button
                      onClick={() => setSidebarLeaderboardMode("course")}
                      className={cn(
                        "flex-1 py-1 text-xs font-semibold rounded-lg transition-all",
                        sidebarLeaderboardMode === "course"
                          ? "bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      )}
                    >
                      2nd: In Track ({activeRoadmapConfig.label})
                    </button>
                  </div>

                  {/* Board List */}
                  {sidebarLeaderboardMode === "overall" ? (
                    leaderboard.length === 0 ? (
                      <p className="text-xs font-medium text-slate-400 py-3 text-center">
                        Solve challenges to appear on the leaderboard!
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {leaderboard.slice(0, 5).map((entry, idx) => {
                          const isCurrentUser = entry.user_id === user?.id;
                          return (
                            <div
                              key={entry.user_id}
                              className={cn(
                                "flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all",
                                isCurrentUser
                                  ? "bg-indigo-500/10 border-[#6366F1]/40 text-slate-900 dark:text-white font-semibold"
                                  : "bg-slate-50 dark:bg-[#090D16] border-slate-200/60 dark:border-[#1E293B] text-slate-700 dark:text-slate-300"
                              )}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <span
                                  className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
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
                    )
                  ) : courseLeaderboard.length === 0 ? (
                    <p className="text-xs font-medium text-slate-400 py-3 text-center">
                      No track records yet for {activeRoadmapConfig.label}.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {courseLeaderboard.slice(0, 5).map((entry, idx) => {
                        const isCurrentUser = entry.user_id === user?.id;
                        return (
                          <div
                            key={entry.user_id}
                            className={cn(
                              "flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all",
                              isCurrentUser
                                ? "bg-indigo-500/10 border-[#6366F1]/40 text-slate-900 dark:text-white font-semibold"
                                : "bg-slate-50 dark:bg-[#090D16] border-slate-200/60 dark:border-[#1E293B] text-slate-700 dark:text-slate-300"
                            )}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span
                                className={cn(
                                  "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
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
                              <div className="truncate flex flex-col">
                                <span className="truncate">
                                  {entry.full_name || "Developer"}
                                  {isCurrentUser && " (You)"}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {entry.solved_tasks_count} Solved in Track
                                </span>
                              </div>
                            </div>
                            <span className="text-indigo-500 font-semibold shrink-0">
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

            {/* -------------------------------------------------------------
                SECTION 2: CONTINUE YOUR ROADMAP (FULL WIDTH HERO TRACK BELOW)
            ------------------------------------------------------------- */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Compass size={19} className="text-indigo-500" />
                    <span>Continue Your Roadmap</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Personalized engineering curriculum analyzing your programming language &amp; problem submissions
                    {analyzedPreference.hasUserActivity && (
                      <span className="inline-flex items-center gap-1 ml-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        • Auto-selected {ROADMAP_PRESETS[analyzedPreference.topLang].label} (
                        {analyzedPreference.totalSolvedInTop > 0
                          ? `${analyzedPreference.totalSolvedInTop} solved`
                          : "most active"}
                        )
                      </span>
                    )}
                  </p>
                </div>

                {/* Modern Segmented Language Switcher Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl bg-slate-100 dark:bg-[#0B132B]/80 border border-slate-200/80 dark:border-slate-800 shadow-xs shrink-0 max-w-full scrollbar-none">
                  {(Object.keys(ROADMAP_PRESETS) as SupportedLanguage[]).map((langKey) => {
                    const isSelected = activeRoadmapLang === langKey;
                    const isTopUsed = analyzedPreference.topLang === langKey;
                    const solvedCount = analyzedPreference.solvedCounts[langKey] || 0;

                    return (
                      <button
                        key={langKey}
                        onClick={() => {
                          if (langKey === analyzedPreference.topLang) {
                            setSelectedRoadmapLang(null);
                          } else {
                            setSelectedRoadmapLang(langKey);
                          }
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 select-none",
                          isSelected
                            ? "bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700/80 font-semibold"
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50 border border-transparent"
                        )}
                      >
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            langKey === "python" && "bg-sky-500",
                            langKey === "cpp" && "bg-blue-600",
                            langKey === "java" && "bg-amber-500",
                            langKey === "javascript" && "bg-yellow-400",
                            langKey === "c" && "bg-slate-400"
                          )}
                        />
                        <span>{ROADMAP_PRESETS[langKey].label}</span>
                        {isTopUsed && (
                          <span
                            className={cn(
                              "text-xs font-mono tracking-tight px-1.5 py-0.5 rounded-md font-semibold uppercase shrink-0 transition-colors",
                              isSelected
                                ? "bg-indigo-500/10 dark:bg-indigo-500/20 text-[#4F46E5] dark:text-indigo-300 border border-indigo-500/20"
                                : "bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            )}
                          >
                            {solvedCount > 0 ? `${solvedCount} Solved` : "Top"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Recommended Roadmap Card (Full Width) */}
              <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-5 sm:p-6 space-y-5 shadow-xs">
                {/* Sub-badge: Roadmap Recommendation & Auto-Selected Details (Comfortable readability) */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/25 text-[#4F46E5] dark:text-indigo-300 text-xs font-semibold">
                    <Target size={14} className="text-indigo-500" />
                    <span>
                      {activeRoadmapLang === analyzedPreference.topLang
                        ? "Auto-Selected for You"
                        : "Previewing Track"}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-normal">
                      {activeRoadmapLang === analyzedPreference.topLang
                        ? `(${analyzedPreference.matchConfidence}% Match • ${
                            analyzedPreference.totalSolvedInTop > 0
                              ? `${analyzedPreference.totalSolvedInTop} solved problems`
                              : "Based on your activity"
                          })`
                        : `(Your top language is ${ROADMAP_PRESETS[analyzedPreference.topLang].label})`}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {selectedRoadmapLang !== null &&
                      selectedRoadmapLang !== analyzedPreference.topLang && (
                        <button
                          onClick={() => setSelectedRoadmapLang(null)}
                          className="text-xs font-medium text-[#6366F1] dark:text-indigo-400 hover:underline flex items-center gap-1 transition-all"
                        >
                          <RotateCcw size={13} />
                          <span>
                            Back to {ROADMAP_PRESETS[analyzedPreference.topLang].label} (Auto)
                          </span>
                        </button>
                      )}
                    <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {activeRoadmapConfig.durationEst} Est.
                    </span>
                  </div>
                </div>

                {/* Main Roadmap Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200/70 dark:border-[#1E293B]">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[#6366F1] flex items-center justify-center font-mono font-bold text-sm shrink-0">
                      {activeRoadmapConfig.iconLabel}
                    </div>
                    <div>
                      <h4 className="text-base sm:text-xl font-semibold text-slate-900 dark:text-white">
                        {activeRoadmapConfig.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1.5">
                          <BookOpen size={14} className="text-[#6366F1]" />
                          <span>{activeRoadmapConfig.modulesCount} Modules</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-slate-400" />
                          <span>{activeRoadmapConfig.durationEst}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Target size={14} className="text-emerald-500" />
                          <span>{activeRoadmapConfig.totalProblems} Problems</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("course", { slug: activeRoadmapConfig.courseSlug })}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white font-semibold text-xs sm:text-sm shadow-xs active:scale-[0.98] transition-all shrink-0 text-center"
                  >
                    <span>Resume Roadmap</span>
                  </button>
                </div>

                {/* Practice Areas Grid - Full Width 4-Column Layout with High Readability */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span className="tracking-wide">PRACTICE TRACKS &amp; CURATED TOPICS</span>
                    <button
                      onClick={() => navigate("problems")}
                      className="text-xs sm:text-sm font-semibold text-[#6366F1] dark:text-indigo-400 hover:underline"
                    >
                      All Practice Problems →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {activeRoadmapConfig.practiceAreas.map((area, pIdx) => (
                      <div
                        key={pIdx}
                        onClick={() => navigate("problems")}
                        className="group cursor-pointer p-4 sm:p-4.5 rounded-xl border border-slate-200/80 dark:border-[#1E293B] hover:border-[#6366F1] bg-slate-50 dark:bg-[#090D16] transition-all flex flex-col justify-between gap-3.5 shadow-xs"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-[#6366F1] dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                              {area.title}
                            </h5>
                            <span
                              className={cn(
                                "text-xs font-semibold uppercase px-2.5 py-0.5 rounded-md border shrink-0",
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
                          <p className="text-xs sm:text-sm font-normal text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                            {area.description}
                          </p>
                        </div>

                        <div className="pt-2.5 border-t border-slate-200/60 dark:border-[#1E293B] flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-[#6366F1] transition-colors">
                          <span>{area.problemCount} Problems</span>
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
      )}
      </div>
    </div>
  );
}

export default StudentDashboardPage;
