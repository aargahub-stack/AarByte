import { useState, useEffect, useMemo } from "react";
import {
  Trophy,
  Code2,
  BookOpen,
  Terminal,
  ArrowRight,
  CheckCircle2,
  XCircle,
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
  Cpu,
  Award,
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Users,
  Lock,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/services/supabase";
import { courseService } from "@/services/courseService";
import { progressStorage } from "@/services/storage/progressStorage";
import { calculateStreak } from "@/services/streakService";
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
    totalProblems: 84,
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
    totalProblems: 103,
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
    courseSlug: "java-core-oop",
    modulesCount: 5,
    durationEst: "4 Months",
    totalProblems: 86,
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
    totalProblems: 69,
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
    totalProblems: 71,
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

        const rawCourses =
          fetchedCourses && fetchedCourses.length > 0 ? fetchedCourses : DEMO_COURSES;
        // Filter out dummy test courses like "Entry Course (Study well)"
        const activeCourses = rawCourses.filter((c) => {
          const t = (c.title || "").toLowerCase();
          const d = (c.description || "").toLowerCase();
          return !t.includes("entry course") && !d.includes("study well");
        });
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

        // 3. User enrolled tracks (scoped to user.id)
        if (user?.id) {
          const storedEnrolled = enrollmentStorage.getEnrolledCourseIdentifiers(user.id);
          setEnrolledIds(storedEnrolled);
        } else {
          setEnrolledIds([]);
        }
      } catch (err) {
        console.error("[StudentDashboard] Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();

    const handleSync = () => {
      if (user?.id) {
        setEnrolledIds(enrollmentStorage.getEnrolledCourseIdentifiers(user.id));
      } else {
        setEnrolledIds([]);
      }
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

  // Filter ONLY enrolled courses for the "Continue Learning" section (excluding dummy tracks)
  const enrolledCourses = useMemo(() => {
    return courses
      .filter((course) => {
        const t = (course.title || "").toLowerCase();
        const d = (course.description || "").toLowerCase();
        if (t.includes("entry course") || d.includes("study well")) {
          return false;
        }

        const taskIds = course.modules.flatMap((m) => (m.tasks || []).map((t) => t.id));
        const hasSolvedAny = taskIds.some((t) => progressMap[t]?.is_completed);
        return (
          hasSolvedAny ||
          enrolledIds.includes(course.id) ||
          (course.slug && enrolledIds.includes(course.slug)) ||
          enrollmentStorage.isEnrolled(course.id, course.slug, taskIds, user?.id)
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
  }, [courses, enrolledIds, progressMap, user?.id]);

  // =========================================================================
  // DYNAMIC HERO CTA SMART RESOLVER (4 Priorities - Requirement 2)
  // =========================================================================
  const heroCta = useMemo(() => {
    const activeTrack =
      enrolledCourses[0] ||
      courses.find((c) => c.slug === "basics-to-advanced-dsa") ||
      courses[0] ||
      DEMO_COURSES[0];

    if (!activeTrack) {
      return {
        label: "Start Basics: Variables & I/O →",
        action: () => navigate("courses"),
      };
    }

    // Priority 4 (Part A): Brand new user (0 solved tasks)
    if (solvedTasksCount === 0) {
      const firstMod = activeTrack.modules[0];
      const firstTask = firstMod?.tasks?.[0];
      return {
        label: firstTask
          ? `Start Basics: ${firstTask.title} (${firstMod.title.split(":")[0]}) →`
          : "Start Learning Basics →",
        action: () => {
          if (firstTask) {
            navigate("task", { taskId: firstTask.id });
          } else {
            navigate("course", { slug: activeTrack.slug || activeTrack.id });
          }
        },
      };
    }

    // Priority 1 & 2: Check current track modules
    let currentModuleIndex = -1;
    let inProgressModule: any = null;
    let firstUnsolvedInModule: any = null;

    for (let i = 0; i < activeTrack.modules.length; i++) {
      const mod = activeTrack.modules[i];
      const modTasks = mod.tasks || [];
      const solvedInMod = modTasks.filter((t) => progressMap[t.id]?.is_completed).length;

      if (solvedInMod < modTasks.length) {
        currentModuleIndex = i;
        inProgressModule = mod;
        firstUnsolvedInModule = modTasks.find((t) => !progressMap[t.id]?.is_completed);
        break;
      }
    }

    // Priority 1: User left unsolved questions in current module
    if (inProgressModule && firstUnsolvedInModule) {
      const modShortName = inProgressModule.title.includes(":")
        ? inProgressModule.title.split(":")[0].trim()
        : inProgressModule.title;
      return {
        label: `Resume: ${firstUnsolvedInModule.title} (${modShortName}) →`,
        action: () => navigate("task", { taskId: firstUnsolvedInModule.id }),
      };
    }

    // Priority 2: Current module 100% finished but next module exists
    if (currentModuleIndex >= 0 && currentModuleIndex + 1 < activeTrack.modules.length) {
      const nextMod = activeTrack.modules[currentModuleIndex + 1];
      const nextTask = nextMod.tasks?.[0];
      const nextModTitle = nextMod.title.replace(/^Module \d+:\s*/, "");
      return {
        label: `Start Next: Module ${nextMod.order_index} - ${nextModTitle} →`,
        action: () => {
          if (nextTask) {
            navigate("task", { taskId: nextTask.id });
          } else {
            navigate("course", { slug: activeTrack.slug || activeTrack.id });
          }
        },
      };
    }

    // Priority 3: Current course is fully finished -> Check other enrolled tracks
    const otherPendingCourse = enrolledCourses.find((c) => {
      if (c.id === activeTrack.id) return false;
      const cTasks = c.modules.flatMap((m) => m.tasks || []);
      const cSolved = cTasks.filter((t) => progressMap[t.id]?.is_completed).length;
      return cSolved < cTasks.length;
    });

    if (otherPendingCourse) {
      let targetTask: any = null;
      let targetMod: any = null;
      for (const mod of otherPendingCourse.modules) {
        const unsolved = (mod.tasks || []).find((t) => !progressMap[t.id]?.is_completed);
        if (unsolved) {
          targetTask = unsolved;
          targetMod = mod;
          break;
        }
      }

      if (targetTask && targetMod) {
        const modShortName = targetMod.title.includes(":")
          ? targetMod.title.split(":")[0].trim()
          : targetMod.title;
        return {
          label: `Resume: ${targetTask.title} (${otherPendingCourse.title.split(" ")[0]} - ${modShortName}) →`,
          action: () => navigate("task", { taskId: targetTask.id }),
        };
      }

      return {
        label: `Start Track: ${otherPendingCourse.title} →`,
        action: () => navigate("course", { slug: otherPendingCourse.slug || otherPendingCourse.id }),
      };
    }

    // Priority 4 (Part B): All courses finished -> Daily Challenge
    const dailyChallengeTask =
      allTasks.find(
        (t) =>
          t.slug === "two-sum-hashmap" ||
          t.slug === "climbing-stairs-dp" ||
          t.slug === "valid-palindrome-string"
      ) || allTasks[0];

    return {
      label: dailyChallengeTask
        ? `Daily Challenge: ${dailyChallengeTask.title} (Mastery) →`
        : "Solve Daily Challenge →",
      action: () => {
        if (dailyChallengeTask) {
          navigate("task", { taskId: dailyChallengeTask.id });
        } else {
          navigate("problems");
        }
      },
    };
  }, [enrolledCourses, courses, allTasks, progressMap, solvedTasksCount, navigate]);

  // =========================================================================
  // ANALYTICS-DRIVEN RECOMMENDATION ENGINE (Requirement 3)
  // =========================================================================
  const recommendation = useMemo(() => {
    const langCounts: Record<string, number> = { java: 0, python: 0, cpp: 0, javascript: 0 };
    const catCounts: Record<string, number> = {
      Arrays: 0,
      Strings: 0,
      Loops: 0,
      Recursion: 0,
      Trees: 0,
      DP: 0,
      Basics: 0,
    };

    allTasks.forEach((t) => {
      if (progressMap[t.id]?.is_completed) {
        const lang = (t.language || "").toLowerCase();
        if (lang.includes("java") && !lang.includes("script")) langCounts.java++;
        else if (lang.includes("py")) langCounts.python++;
        else if (lang.includes("c++") || lang.includes("cpp")) langCounts.cpp++;
        else if (lang.includes("js") || lang.includes("script")) langCounts.javascript++;

        const text = (t.title + " " + t.description).toLowerCase();
        if (text.includes("array") || text.includes("matrix")) catCounts.Arrays++;
        else if (text.includes("string") || text.includes("anagram") || text.includes("palindrome")) catCounts.Strings++;
        else if (text.includes("tree") || text.includes("bst")) catCounts.Trees++;
        else if (text.includes("recursion") || text.includes("backtrack")) catCounts.Recursion++;
        else if (text.includes("dynamic") || text.includes("climb") || text.includes("coin")) catCounts.DP++;
        else if (text.includes("loop") || text.includes("for") || text.includes("while")) catCounts.Loops++;
        else catCounts.Basics++;
      }
    });

    let topLanguage = "Python";
    let maxLang = 0;
    Object.entries(langCounts).forEach(([l, cnt]) => {
      if (cnt > maxLang) {
        maxLang = cnt;
        topLanguage = l.toUpperCase();
      }
    });

    let topCategory = "Arrays";
    let maxCat = 0;
    Object.entries(catCounts).forEach(([c, cnt]) => {
      if (cnt > maxCat) {
        maxCat = cnt;
        topCategory = c;
      }
    });

    const allCoursesFinished =
      enrolledCourses.length > 0 &&
      enrolledCourses.every((c) => {
        const cTasks = c.modules.flatMap((m) => m.tasks || []);
        return cTasks.length > 0 && cTasks.every((t) => progressMap[t.id]?.is_completed);
      });

    if (allCoursesFinished || solvedTasksCount >= 40) {
      const interviewCourse =
        courses.find((c) => c.slug === "zoho-tcs-assessment") ||
        DEMO_COURSES.find((c) => c.slug === "zoho-tcs-assessment");
      return {
        badge: "Curated Interview Track",
        title: "Algorithmic Interview & Machine Coding Track",
        reason: `Based on your high problem solving benchmark (${solvedTasksCount} challenges solved)`,
        description:
          "High-frequency machine coding, spiral matrices, pattern challenges, and core algorithmic assessment problems.",
        courseSlug: interviewCourse?.slug || "zoho-tcs-assessment",
      };
    }

    if (topLanguage.toLowerCase() === "java" || (maxLang === 0 && topCategory === "Arrays")) {
      const javaCourse =
        courses.find((c) => c.slug === "java-core-oop") ||
        DEMO_COURSES.find((c) => c.slug === "java-core-oop");
      return {
        badge: "Recommended Next Step",
        title: "Java Core & Advanced OOP",
        reason: `Tailored from your ${topLanguage} practice & ${topCategory} focus`,
        description:
          "Master JVM memory model (Stack vs Heap), multi-threading, clean design patterns, and enterprise object-oriented algorithmic architectures.",
        courseSlug: javaCourse?.slug || "java-core-oop",
      };
    }

    const nextStepCourse =
      courses.find((c) => c.slug === "basics-to-advanced-dsa") ||
      courses[0] ||
      DEMO_COURSES[0];
    return {
      badge: "Next Logical Step Track",
      title: nextStepCourse?.title || "Basics of Programming to Advanced DSA",
      reason: `Recommended from your ${topLanguage} problem solving history`,
      description:
        nextStepCourse?.description ||
        "Advance through essential data structures, two-pointers, hash tables, and dynamic programming.",
      courseSlug: nextStepCourse?.slug || "basics-to-advanced-dsa",
    };
  }, [allTasks, progressMap, enrolledCourses, courses, solvedTasksCount]);

  // Problem of the Day (POTD) Dynamic Resolver
  const potdTask = useMemo(() => {
    return (
      allTasks.find((t) => t.slug === "valid-palindrome-string" || t.slug?.includes("palindrome")) ||
      allTasks.find((t) => t.difficulty === "easy") ||
      allTasks[0] ||
      null
    );
  }, [allTasks]);

  // Recent Submissions & Execution Log (matches user requested real & fallback items)
  const recentSubmissions = useMemo(() => {
    const twoSumTask = allTasks.find((t) => t.slug?.includes("two-sum")) || allTasks[0];
    const reverseArrayTask = allTasks.find((t) => t.slug?.includes("reverse-array") || t.title?.toLowerCase().includes("reverse array"));
    const palindromeTask = allTasks.find((t) => t.slug?.includes("palindrome"));
    const anagramTask = allTasks.find((t) => t.slug?.includes("anagram") || t.title?.toLowerCase().includes("anagram"));

    return [
      {
        id: "sub-1",
        taskId: twoSumTask?.id,
        title: "Two Sum",
        status: "passed" as const,
        statusText: "Passed",
        language: "Python",
        langExt: ".py",
        metrics: "32ms • 16.2MB",
        timestamp: "2 hours ago",
      },
      {
        id: "sub-2",
        taskId: reverseArrayTask?.id,
        title: "Reverse Array",
        status: "passed" as const,
        statusText: "Passed",
        language: "Java",
        langExt: ".java",
        metrics: "1ms • 41.8MB",
        timestamp: "Yesterday",
      },
      {
        id: "sub-3",
        taskId: palindromeTask?.id,
        title: "Palindrome Number",
        status: "wrong_answer" as const,
        statusText: "Wrong Answer",
        language: "C++",
        langExt: ".cpp",
        error: "Failed on Case #4",
        timestamp: "2 days ago",
      },
      {
        id: "sub-4",
        taskId: anagramTask?.id,
        title: "Valid Anagram",
        status: "passed" as const,
        statusText: "Passed",
        language: "Python",
        langExt: ".py",
        metrics: "45ms • 17.1MB",
        timestamp: "3 days ago",
      },
    ];
  }, [allTasks]);

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

  // Streak calculation based on real completion timestamps and dynamic calendar
  const completionTimestamps = useMemo(() => {
    return Object.values(progressMap)
      .filter((p) => p.is_completed && p.completed_at)
      .map((p) => p.completed_at as string);
  }, [progressMap]);

  const streakData = useMemo(() => {
    return calculateStreak(completionTimestamps);
  }, [completionTimestamps]);

  // Filter out current user from top peers to prevent duplicate display in top podium
  const topPeers = useMemo(() => {
    const isCurrent = (name?: string | null, uid?: string | null) => {
      if (uid && user?.id && uid === user.id) return true;
      const n = (name || "").toLowerCase();
      return n.includes("aravindh") || (studentName && n === studentName.toLowerCase());
    };

    const peerCandidates = leaderboard.filter(
      (e) => !isCurrent(e.full_name, e.user_id)
    );

    return {
      rank1: {
        full_name: peerCandidates[0]?.full_name || "Karthik S",
        points: peerCandidates[0]?.points || 1420,
      },
      rank2: {
        full_name: peerCandidates[1]?.full_name || "Alan Turing",
        points: peerCandidates[1]?.points || 1180,
      },
    };
  }, [leaderboard, user?.id, studentName]);

  // Primary active curriculum ("Basics of Programming to Advanced DSA")
  const primaryTrack =
    courses.find((c) => c.slug === "basics-to-advanced-dsa") ||
    enrolledCourses[0] ||
    courses[0] ||
    DEMO_COURSES[0];

  const primaryTrackSlug =
    primaryTrack?.slug && primaryTrack.slug !== "#"
      ? primaryTrack.slug
      : "basics-to-advanced-dsa";

  const primaryTrackTasks =
    primaryTrack?.modules?.flatMap((m) => m.tasks || []) || [];
  const realSolvedInPrimary = primaryTrackTasks.filter(
    (t) => progressMap[t.id]?.is_completed
  ).length;

  // Show 13/105 Solved • 14% benchmark (or dynamic user progress)
  const primaryTrackSolved = realSolvedInPrimary > 0 ? realSolvedInPrimary : 13;
  const primaryTrackTotal =
    primaryTrackTasks.length > 0 ? primaryTrackTasks.length : 105;
  const primaryTrackPct = Math.round(
    (primaryTrackSolved / primaryTrackTotal) * 100
  );

  // Dynamic header action label
  const heroActionLabel =
    heroCta?.label && heroCta.label.includes("Resume:")
      ? heroCta.label
      : "Resume: Module 2 - Nested If-Else Checks →";

  return (
    <div className="min-h-screen font-urbanist bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#121314] dark:text-[#ECEDEE] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-7">
        {/* ===================================================================
            SECTION 1: MINIMAL HERO HEADER ROW
        =================================================================== */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Greeting + Dynamic Action Button placed near the name */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE]">
              {timeGreeting}, <span className="text-emerald-500 font-bold">{studentName}</span>
            </h1>

            <button
              onClick={heroCta.action}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(0,240,118,0.22)] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Play size={12} className="fill-[#0C0D0E]" />
              <span>{heroActionLabel}</span>
            </button>
          </div>

          {/* Right End: Telemetry Strip ("1 Day Streak | 3 Solved | 195 XP") */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-[#6B7280] dark:text-[#8A9099] shrink-0">
            <button
              onClick={() => navigate("streak")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425] hover:border-amber-500/40 text-[#121314] dark:text-[#ECEDEE] transition-colors cursor-pointer"
              title="View Streak Calendar"
            >
              <Flame size={14} className="text-amber-500 fill-amber-500" />
              <span className="font-semibold">{streakData.currentStreak || 1} Day Streak</span>
            </button>

            <span className="text-[#D1D5DB] dark:text-[#2A2E30]">|</span>

            <button
              onClick={() => navigate("analytics")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425] hover:border-emerald-500/40 text-[#121314] dark:text-[#ECEDEE] transition-colors cursor-pointer"
              title="View Solved Problems"
            >
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="font-semibold">{solvedTasksCount > 0 ? solvedTasksCount : 3} Solved</span>
            </button>

            <span className="text-[#D1D5DB] dark:text-[#2A2E30]">|</span>

            <button
              onClick={() => navigate("analytics")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425] hover:border-indigo-500/40 text-[#121314] dark:text-[#ECEDEE] transition-colors cursor-pointer"
              title="View Experience Points"
            >
              <Zap size={14} className="text-indigo-500 fill-indigo-500" />
              <span className="font-semibold">{effectivePoints > 0 ? effectivePoints : 195} XP</span>
            </button>
          </div>
        </div>

        {/* ===================================================================
            MAIN 2-COLUMN GRID (8 Col Left Main Stream + 4 Col Right Sidebar)
        =================================================================== */}
        {loading ? (
          <div className="rounded-3xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-emerald-500" />
            <p className="text-sm font-semibold text-[#6B7280] dark:text-[#8A9099]">
              Synchronizing student roadmap &amp; learning metrics...
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              {/* ===============================================================
                  LEFT MAIN STREAM (8 COLUMNS)
              =============================================================== */}
              <div className="lg:col-span-8 space-y-6">
                {/* -------------------------------------------------------------
                    SECTION 1: ACTIVE CURRICULUM
                ------------------------------------------------------------- */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#8A9099] flex items-center gap-1.5">
                      <BookOpen size={14} className="text-emerald-500" />
                      <span>Active Curriculum</span>
                    </span>
                    <button
                      onClick={() => navigate("courses")}
                      className="text-xs font-semibold text-emerald-600 dark:text-[#00F076] hover:underline cursor-pointer"
                    >
                      All Tracks →
                    </button>
                  </div>

                  {/* Enrolled Track Card: "Basics of Programming to Advanced DSA" */}
                  <div
                    onClick={() => navigate("course", { slug: primaryTrackSlug })}
                    className="group cursor-pointer rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] hover:border-emerald-500/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-md transition-all duration-200"
                  >
                    {/* Left: Monogram and Course Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-mono font-bold text-xs sm:text-sm shrink-0 shadow-xs">
                        DSA
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-[#121314] dark:text-[#ECEDEE] group-hover:text-emerald-500 transition-colors truncate">
                            Basics of Programming to Advanced DSA
                          </h3>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425] text-[#6B7280] dark:text-[#8A9099]">
                            {primaryTrack.modules.length || 9} Modules
                          </span>
                        </div>
                        <p className="text-xs text-[#6B7280] dark:text-[#8A9099] truncate max-w-md">
                          {primaryTrack.description ||
                            "Comprehensive roadmap from variables & control flow to advanced graphs and dynamic programming."}
                        </p>
                      </div>
                    </div>

                    {/* Right: Progress Telemetry and Action Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-[#E5E7EB] dark:border-[#202425]">
                      <div className="flex flex-col gap-1 min-w-[130px] sm:min-w-[150px]">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-[#6B7280] dark:text-[#8A9099]">
                            {primaryTrackSolved}/{primaryTrackTotal} Solved
                          </span>
                          <span className="text-emerald-600 dark:text-[#00F076] font-bold">
                            {primaryTrackPct}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#E5E7EB] dark:bg-[#202425] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#00F076] transition-all duration-500"
                            style={{ width: `${Math.max(primaryTrackPct, 8)}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("course", { slug: primaryTrackSlug });
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer bg-[#F7F8FA] dark:bg-[#202425] group-hover:bg-[#00F076] text-[#121314] dark:text-[#ECEDEE] group-hover:text-[#0C0D0E]"
                      >
                        <span>Resume Track</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    SECTION 2: CURRICULUM CHECKLIST & NEXT UNLOCKS
                ------------------------------------------------------------- */}
                <div className="rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] p-5 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#202425]">
                    <div className="flex items-center gap-2">
                      <Layers size={16} className="text-emerald-500" />
                      <div>
                        <h3 className="text-sm font-bold text-[#121314] dark:text-[#ECEDEE]">
                          Curriculum Checklist &amp; Next Unlocks
                        </h3>
                        <p className="text-[11px] text-[#6B7280] dark:text-[#8A9099]">
                          Step-by-step module syllabus progression
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate("course", { slug: primaryTrackSlug })}
                      className="text-xs font-semibold text-emerald-600 dark:text-[#00F076] hover:underline inline-flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>View All Modules</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  {/* Checklist Items */}
                  <div className="divide-y divide-[#E5E7EB]/70 dark:divide-[#202425]">
                    {/* Module 1 */}
                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] flex items-center justify-center shrink-0">
                          <CheckCircle2 size={15} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-[#121314] dark:text-[#ECEDEE] truncate">
                            Module 1: Variables, Data Types &amp; Basic I/O
                          </h4>
                          <p className="text-[11px] text-[#6B7280] dark:text-[#8A9099]">
                            5 Concept MCQs • 10 Practice Coding Questions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border border-emerald-500/20 inline-flex items-center gap-1">
                          <Check size={11} strokeWidth={2.5} />
                          <span>Completed</span>
                        </span>
                      </div>
                    </div>

                    {/* Module 2 */}
                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                          <Play size={13} className="fill-amber-500" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-[#121314] dark:text-[#ECEDEE] truncate">
                            Module 2: Conditionals &amp; Control Flow
                          </h4>
                          <p className="text-[11px] text-[#6B7280] dark:text-[#8A9099]">
                            If-else logic, leap year, triangle validity, nested checks
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          ▶ In Progress - 3 of 10 Solved
                        </span>
                        <button
                          onClick={heroCta.action}
                          className="px-3 py-1 rounded-lg bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] font-bold text-xs inline-flex items-center gap-1 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                        >
                          <span>Solve Sum #4</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Module 3 */}
                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 opacity-80">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#8A9099] border border-[#E5E7EB] dark:border-[#202425] flex items-center justify-center shrink-0">
                          <Lock size={13} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-[#121314] dark:text-[#ECEDEE] truncate">
                            Module 3: Loops &amp; Iterations
                          </h4>
                          <p className="text-[11px] text-[#6B7280] dark:text-[#8A9099]">
                            For/While loops, factorials, Fibonacci series, prime checks
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#6B7280] dark:text-[#8A9099] border border-[#E5E7EB] dark:border-[#202425]">
                          Locked - Up Next
                        </span>
                      </div>
                    </div>

                    {/* Module 5 */}
                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                          <Zap size={14} className="fill-indigo-500" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-[#121314] dark:text-[#ECEDEE] truncate">
                            Module 5: Strings, Hashing &amp; HashMaps
                          </h4>
                          <p className="text-[11px] text-[#6B7280] dark:text-[#8A9099]">
                            Frequency maps, anagram lookups, sliding window substrings
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          Locked - Pro Tier (₹49)
                        </span>
                        <button
                          onClick={() => navigate("pricing")}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs inline-flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <span>Upgrade</span>
                          <Sparkles size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    SECTION 3: LIVE ARENA & CONTESTS
                ------------------------------------------------------------- */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-[#00F076] flex items-center gap-1.5">
                        <Flame size={13} className="text-emerald-500 fill-emerald-500" />
                        <span>LIVE ARENA &amp; CONTESTS</span>
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-[#121314] dark:text-[#ECEDEE]">
                        Algorithmic Sprints &amp; Contests
                      </h3>
                    </div>

                    <button
                      onClick={() => navigate("leaderboard")}
                      className="text-xs font-semibold text-emerald-600 dark:text-[#00F076] hover:underline inline-flex items-center gap-1 cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                      <span>Explore Arena</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Card 1: Weekly Code Sprint */}
                    <div
                      onClick={() => navigate("problems")}
                      className="group cursor-pointer p-4 rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-3 shadow-xs hover:shadow-md"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border border-emerald-500/20">
                            UPCOMING • SUN 7:00 PM
                          </span>
                          <span className="text-[10px] font-semibold text-[#8A9099]">
                            Weekly Sprint
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#121314] dark:text-[#ECEDEE] group-hover:text-emerald-500 transition-colors">
                            Weekly Code Sprint #12
                          </h4>
                          <p className="text-xs text-[#6B7280] dark:text-[#8A9099] mt-1 line-clamp-2">
                            3 algorithmic problems designed to test speed and edge-case handling. Rated for Global Leaderboard.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-[#E5E7EB] dark:border-[#202425] flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-[#00F076]">
                        <span>Register Free</span>
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                    {/* Card 2: 1v1 Speed Battle */}
                    <div
                      onClick={() => navigate("compiler")}
                      className="group cursor-pointer p-4 rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-3 shadow-xs hover:shadow-md"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>LIVE NOW</span>
                          </span>
                          <span className="text-[10px] font-semibold text-[#8A9099]">
                            Speed Duel
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#121314] dark:text-[#ECEDEE] group-hover:text-emerald-500 transition-colors">
                            1v1 Speed Coding Battle
                          </h4>
                          <p className="text-xs text-[#6B7280] dark:text-[#8A9099] mt-1 line-clamp-2">
                            Go head-to-head in real time against another developer to solve a logic challenge in under 10 minutes.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-[#E5E7EB] dark:border-[#202425] flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-[#00F076]">
                        <span>Enter Arena</span>
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                    {/* Card 3: College League */}
                    <div
                      onClick={() => navigate("leaderboard")}
                      className="group cursor-pointer p-4 rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-3 shadow-xs hover:shadow-md"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                            INTER-COLLEGE
                          </span>
                          <span className="text-[10px] font-semibold text-[#8A9099]">
                            Campus Cup
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#121314] dark:text-[#ECEDEE] group-hover:text-emerald-500 transition-colors">
                            AarCode College League
                          </h4>
                          <p className="text-xs text-[#6B7280] dark:text-[#8A9099] mt-1 line-clamp-2">
                            Represent your college campus, solve problem sets collaboratively, and climb the institution standings.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-[#E5E7EB] dark:border-[#202425] flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-[#00F076]">
                        <span>View League</span>
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===============================================================
                  RIGHT SIDEBAR (4 COLUMNS - STREAK, POTD & PODIUM LEADERBOARD)
              =============================================================== */}
              <div className="lg:col-span-4 space-y-6">
                {/* -------------------------------------------------------------
                    WIDGET 1: DAILY CODING STREAK
                ------------------------------------------------------------- */}
                <div className="rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] p-5 space-y-4 shadow-xs">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => navigate("streak")}
                      className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
                    >
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all group-hover:scale-105",
                          streakData.currentStreak > 0
                            ? "bg-amber-500/10 border-amber-500/25 text-amber-500"
                            : "bg-[#F7F8FA] dark:bg-[#0C0D0E] border-[#E5E7EB] dark:border-[#202425] text-[#8A9099]"
                        )}
                      >
                        <Flame size={18} strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#121314] dark:text-[#ECEDEE] group-hover:text-emerald-500 transition-colors flex items-center gap-1.5">
                          <span>Daily Coding Streak</span>
                          <ChevronRight size={14} className="text-[#8A9099] group-hover:translate-x-0.5 transition-transform" />
                        </h3>
                        <p className="text-xs text-[#6B7280] dark:text-[#8A9099]">Consistency tracker</p>
                      </div>
                    </button>
                    <button
                      onClick={() => navigate("streak")}
                      className="text-right group cursor-pointer"
                    >
                      <span className="text-lg font-bold text-[#121314] dark:text-[#ECEDEE] group-hover:text-emerald-500 transition-colors">{streakData.currentStreak}</span>
                      <span className="text-xs text-[#8A9099] font-normal"> / {streakData.nextMilestone} days</span>
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full h-2 rounded-full bg-[#E5E7EB] dark:bg-[#202425] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(8, streakData.milestoneProgressPct))}%` }}
                      />
                    </div>
                    <p className="text-xs font-normal text-[#6B7280] dark:text-[#8A9099] leading-snug">
                      {streakData.statusMessage}
                    </p>
                  </div>

                  {/* Dynamic Weekday Streak Days (S M T W T F S) */}
                  <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#202425]">
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {streakData.weekDays.map((wd, wIdx) => {
                        const isCompleted = wd.status === "completed";
                        const isActive = wd.status === "active";
                        const isMissed = wd.status === "missed";
                        return (
                          <button
                            key={wIdx}
                            onClick={() => navigate("streak")}
                            className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
                            title={`${wd.fullDayName}, ${wd.monthName} ${wd.dayNum} - ${isCompleted ? "Solved" : wd.isToday ? "Today (Pending)" : isMissed ? "No activity" : "Upcoming"} (Click to view)`}
                          >
                            <span
                              className={cn(
                                "text-xs font-semibold group-hover:text-emerald-500 transition-colors",
                                wd.isToday
                                  ? "text-emerald-600 dark:text-[#00F076] font-bold"
                                  : "text-[#8A9099]"
                              )}
                            >
                              {wd.label}
                            </span>
                            <div
                              className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold transition-all relative select-none group-hover:scale-105",
                                isCompleted &&
                                  "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xs font-bold",
                                isActive &&
                                  "bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border border-emerald-500 ring-2 ring-emerald-400/30 ring-offset-1 dark:ring-offset-[#151718]",
                                isMissed &&
                                  "bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#8A9099] border border-[#E5E7EB] dark:border-[#202425]",
                                wd.status === "upcoming" &&
                                  "bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#8A9099] border border-dashed border-[#E5E7EB] dark:border-[#202425]"
                              )}
                            >
                              {isCompleted ? <Check size={13} strokeWidth={2.5} /> : wd.dayNum}
                              {wd.isToday && !isCompleted && (
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#151718] animate-pulse" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => navigate("streak")}
                      className="w-full flex items-center justify-between text-xs font-medium text-[#6B7280] dark:text-[#8A9099] pt-3 border-t border-[#E5E7EB] dark:border-[#202425] mt-3 hover:text-[#121314] dark:hover:text-[#ECEDEE] transition-colors cursor-pointer"
                    >
                      <span>Best Streak: <strong className="text-[#121314] dark:text-[#ECEDEE] font-semibold">{streakData.longestStreak} {streakData.longestStreak === 1 ? "day" : "days"}</strong></span>
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-[#00F076] font-semibold">
                        <Flame size={12} />
                        <span>View History →</span>
                      </span>
                    </button>
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    WIDGET 2: PROBLEM OF THE DAY (POTD)
                ------------------------------------------------------------- */}
                <div className="rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] p-5 space-y-3.5 shadow-xs hover:border-emerald-500/40 transition-all">
                  {/* Header: "⚡ Daily Challenge" + "+30 XP" */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                      <Zap size={14} className="fill-amber-500 text-amber-500" />
                      <span className="tracking-wide uppercase text-[11px]">Daily Challenge</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-[#00F076] text-xs font-bold font-mono">
                      +30 XP
                    </span>
                  </div>

                  {/* Body: Problem title & difficulty badge */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-[#121314] dark:text-[#ECEDEE] truncate">
                        {potdTask?.title || "Valid Palindrome II"}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 border bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border-emerald-500/20">
                        {potdTask?.difficulty || "Easy"}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280] dark:text-[#8A9099] line-clamp-2 leading-relaxed">
                      {potdTask?.description?.replace(/###.*/g, "").trim() ||
                        "Check whether a string can become a palindrome by removing at most one character."}
                    </p>
                  </div>

                  {/* CTA Action: "Solve Challenge Now →" button */}
                  <button
                    onClick={() => {
                      if (potdTask?.id) {
                        navigate("task", { taskId: potdTask.id });
                      } else {
                        navigate("problems");
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,240,118,0.2)] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>Solve Challenge Now</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {/* -------------------------------------------------------------
                    WIDGET 3: TOP PERFORMERS / LEADERBOARD PODIUM
                ------------------------------------------------------------- */}
                <div className="rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] p-5 space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy size={16} className="text-amber-500" />
                      <h3 className="text-sm font-bold text-[#121314] dark:text-[#ECEDEE]">
                        Top Performers
                      </h3>
                    </div>
                    <button
                      onClick={() => navigate("leaderboard")}
                      className="text-xs font-semibold text-emerald-600 dark:text-[#00F076] hover:underline cursor-pointer"
                    >
                      Full board →
                    </button>
                  </div>

                  {/* Podium: Top 2 users + #4 Aravindh standing */}
                  <div className="space-y-2">
                    {/* Rank 1 */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl border bg-[#F7F8FA] dark:bg-[#0C0D0E] border-[#E5E7EB] dark:border-[#202425] text-xs font-medium">
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-amber-500 text-white shadow-xs">
                          #1
                        </span>
                        <span className="truncate text-[#121314] dark:text-[#ECEDEE] font-semibold">
                          {topPeers.rank1.full_name}
                        </span>
                      </div>
                      <span className="text-amber-500 font-bold shrink-0">
                        {topPeers.rank1.points.toLocaleString()} XP
                      </span>
                    </div>

                    {/* Rank 2 */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl border bg-[#F7F8FA] dark:bg-[#0C0D0E] border-[#E5E7EB] dark:border-[#202425] text-xs font-medium">
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-slate-400 text-white shadow-xs">
                          #2
                        </span>
                        <span className="truncate text-[#121314] dark:text-[#ECEDEE] font-semibold">
                          {topPeers.rank2.full_name}
                        </span>
                      </div>
                      <span className="text-amber-500 font-bold shrink-0">
                        {topPeers.rank2.points.toLocaleString()} XP
                      </span>
                    </div>

                    {/* Standing Divider */}
                    <div className="flex items-center gap-2 py-0.5">
                      <div className="flex-1 h-px bg-[#E5E7EB] dark:bg-[#202425]" />
                      <span className="text-[10px] font-mono uppercase text-[#8A9099]">Your Standing</span>
                      <div className="flex-1 h-px bg-[#E5E7EB] dark:bg-[#202425]" />
                    </div>

                    {/* Rank 4: Current User (Aravindh standing) */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-xs font-semibold">
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-[#00F076] text-[#0C0D0E]">
                          #4
                        </span>
                        <div className="truncate flex items-center gap-1.5">
                          <span className="text-[#121314] dark:text-[#ECEDEE] font-bold truncate">
                            {studentName} (You)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-[#8A9099]">
                          {solvedTasksCount > 0 ? solvedTasksCount : 3} Solved
                        </span>
                        <span className="text-emerald-600 dark:text-[#00F076] font-bold">
                          {effectivePoints > 0 ? effectivePoints : 195} XP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------
                SECTION 2: EXPLORE LANGUAGE ROADMAPS (MUTED SECONDARY)
            ------------------------------------------------------------- */}
            <div className="space-y-4 pt-2 border-t border-[#E5E7EB] dark:border-[#202425]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h2 className="text-base sm:text-lg font-bold text-[#121314] dark:text-[#ECEDEE] flex items-center gap-2">
                    <Compass size={18} className="text-emerald-500" />
                    <span>Explore Language Roadmaps</span>
                  </h2>
                  <p className="text-xs text-[#6B7280] dark:text-[#8A9099]">
                    Secondary tracks for deep specialization in Java, C++, Python, and Web Systems
                  </p>
                </div>

                {/* Modern Segmented Language Switcher Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425] shadow-xs shrink-0 max-w-full scrollbar-none">
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
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 select-none cursor-pointer",
                          isSelected
                            ? "bg-white dark:bg-[#151718] text-[#121314] dark:text-[#ECEDEE] shadow-xs border border-[#E5E7EB] dark:border-[#202425] font-semibold"
                            : "text-[#6B7280] hover:text-[#121314] dark:text-[#8A9099] dark:hover:text-[#ECEDEE] hover:bg-[#E5E7EB]/50 dark:hover:bg-[#1A1D1E] border border-transparent"
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
                                ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-[#00F076] border border-emerald-500/20"
                                : "bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-[#00F076] border border-emerald-500/20"
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
              <div className="rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] p-5 sm:p-6 space-y-5 shadow-xs">
                {/* Sub-badge: Roadmap Recommendation & Auto-Selected Details */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425] text-xs font-medium text-[#6B7280] dark:text-[#8A9099]">
                    <Target size={13} className="text-emerald-500" />
                    <span>{activeRoadmapConfig.label} Specialization</span>
                    <span className="text-[#8A9099]">
                      ({activeRoadmapConfig.practiceAreas.reduce((acc, a) => acc + a.problemCount, 0)} Problems)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {selectedRoadmapLang !== null &&
                      selectedRoadmapLang !== analyzedPreference.topLang && (
                        <button
                          onClick={() => setSelectedRoadmapLang(null)}
                          className="text-xs font-semibold text-emerald-600 dark:text-[#00F076] hover:underline flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <RotateCcw size={13} />
                          <span>
                            Back to {ROADMAP_PRESETS[analyzedPreference.topLang].label} (Auto)
                          </span>
                        </button>
                      )}
                    <span className="text-xs sm:text-sm font-semibold text-[#6B7280] dark:text-[#8A9099]">
                      {activeRoadmapConfig.durationEst} Est.
                    </span>
                  </div>
                </div>

                {/* Main Roadmap Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425]">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-mono font-bold text-sm shrink-0">
                      {activeRoadmapConfig.iconLabel}
                    </div>
                    <div>
                      <h4 className="text-base sm:text-xl font-semibold text-[#121314] dark:text-[#ECEDEE]">
                        {activeRoadmapConfig.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-medium text-[#6B7280] dark:text-[#8A9099] mt-1">
                        <span className="flex items-center gap-1.5">
                          <BookOpen size={14} className="text-emerald-500" />
                          <span>{activeRoadmapConfig.modulesCount} Modules</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-[#8A9099]" />
                          <span>{activeRoadmapConfig.durationEst}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Target size={14} className="text-emerald-500" />
                          <span>
                            {activeRoadmapConfig.practiceAreas.reduce((acc, a) => acc + a.problemCount, 0)} Problems
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("course", { slug: activeRoadmapConfig.courseSlug })}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-[#151718] hover:bg-[#00F076] hover:text-[#0C0D0E] text-[#121314] dark:text-[#ECEDEE] border border-[#E5E7EB] dark:border-[#202425] font-semibold text-xs sm:text-sm transition-all shrink-0 text-center cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <span>View Roadmap</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {/* Practice Areas Grid - Full Width 4-Column Layout */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-[#121314] dark:text-[#ECEDEE]">
                    <span className="tracking-wide uppercase text-xs">PRACTICE TRACKS &amp; CURATED TOPICS</span>
                    <button
                      onClick={() => navigate("problems")}
                      className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-[#00F076] hover:underline cursor-pointer"
                    >
                      All Practice Problems →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {activeRoadmapConfig.practiceAreas.map((area, pIdx) => (
                      <div
                        key={pIdx}
                        onClick={() => navigate("problems")}
                        className="group cursor-pointer p-4 sm:p-4.5 rounded-xl border border-[#E5E7EB] dark:border-[#202425] hover:border-emerald-500/50 bg-[#F7F8FA] dark:bg-[#0C0D0E] transition-all flex flex-col justify-between gap-3.5 shadow-xs"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="text-sm sm:text-base font-semibold text-[#121314] dark:text-[#ECEDEE] group-hover:text-emerald-500 transition-colors line-clamp-1">
                              {area.title}
                            </h5>
                            <span
                              className={cn(
                                "text-xs font-semibold uppercase px-2.5 py-0.5 rounded-md border shrink-0",
                                area.difficulty === "Easy" &&
                                  "bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border-emerald-500/20",
                                area.difficulty === "Medium" &&
                                  "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                                area.difficulty === "Hard" &&
                                  "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                              )}
                            >
                              {area.difficulty}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-normal text-[#6B7280] dark:text-[#8A9099] line-clamp-2 leading-relaxed">
                            {area.description}
                          </p>
                        </div>

                        <div className="pt-2.5 border-t border-[#E5E7EB] dark:border-[#202425] flex items-center justify-between text-xs sm:text-sm font-semibold text-[#121314] dark:text-[#ECEDEE] group-hover:text-emerald-500 transition-colors">
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
