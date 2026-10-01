import { useState, useEffect, useMemo } from "react";
import {
  Code2,
  CheckCircle2,
  Search,
  Sparkles,
  ArrowRight,
  Filter,
  Loader2,
  Shuffle,
  Trophy,
  Flame,
  LayoutGrid,
  List,
  Check,
  X,
  Target,
  Zap,
} from "lucide-react";
import { courseService } from "@/services/courseService";
import type { Task, UserTaskProgress } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { progressStorage } from "@/services/storage/progressStorage";
import { cn } from "@/utils/cn";

interface ProblemsPageProps {
  navigate: (to: string, params?: Record<string, string>) => void;
}

interface TaskWithCourse extends Task {
  courseTitle?: string;
  courseSlug?: string;
  acceptanceRate?: string;
  category?: string;
}

// Curated high-yield practice challenges across tracks & categories
const DEFAULT_PRACTICE_PROBLEMS: TaskWithCourse[] = [
  {
    id: "task-py-twosum",
    module_id: "mod-1",
    title: "Two Sum",
    slug: "two-sum",
    description: "Given an array of integers and a target, return indices of the two numbers that add up to target.",
    task_type: "algorithm",
    language: "python",
    difficulty: "easy",
    starter_code: "",
    solution_code: null,
    hints: ["Use a hash map to look up complements in O(1) time."],
    points: 10,
    order_index: 1,
    courseTitle: "Arrays & Hashing",
    courseSlug: "python-dsa",
    category: "Arrays & Hashing",
    acceptanceRate: "52.4%",
  },
  {
    id: "task-py-palindrome",
    module_id: "mod-1",
    title: "Valid Palindrome",
    slug: "valid-palindrome",
    description: "Check if a string reads the same forward and backward after filtering non-alphanumeric characters.",
    task_type: "algorithm",
    language: "python",
    difficulty: "easy",
    starter_code: "",
    solution_code: null,
    hints: ["Use two pointers moving inward from start and end."],
    points: 10,
    order_index: 2,
    courseTitle: "Two Pointers",
    courseSlug: "python-dsa",
    category: "Two Pointers",
    acceptanceRate: "48.1%",
  },
  {
    id: "task-java-anagram",
    module_id: "mod-2",
    title: "Valid Anagram",
    slug: "valid-anagram",
    description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    task_type: "algorithm",
    language: "java",
    difficulty: "easy",
    starter_code: "",
    solution_code: null,
    hints: ["Count character frequencies or compare sorted arrays."],
    points: 15,
    order_index: 3,
    courseTitle: "Arrays & Hashing",
    courseSlug: "java-dsa",
    category: "Arrays & Hashing",
    acceptanceRate: "64.2%",
  },
  {
    id: "task-cpp-binarysearch",
    module_id: "mod-3",
    title: "Binary Search",
    slug: "binary-search",
    description: "Search target in an array of sorted integers with logarithmic O(log n) time complexity.",
    task_type: "algorithm",
    language: "cpp",
    difficulty: "easy",
    starter_code: "",
    solution_code: null,
    hints: ["Divide search boundary in half each step: mid = left + (right - left) / 2."],
    points: 15,
    order_index: 4,
    courseTitle: "Binary Search",
    courseSlug: "cpp-algorithms",
    category: "Binary Search",
    acceptanceRate: "57.8%",
  },
  {
    id: "task-py-maxsubarray",
    module_id: "mod-4",
    title: "Maximum Subarray (Kadane's Algorithm)",
    slug: "maximum-subarray",
    description: "Find the contiguous subarray with the largest sum and return its maximum total sum.",
    task_type: "algorithm",
    language: "python",
    difficulty: "medium",
    starter_code: "",
    solution_code: null,
    hints: ["Maintain current_sum and max_so_far in a single linear pass."],
    points: 25,
    order_index: 5,
    courseTitle: "Dynamic Programming",
    courseSlug: "python-dsa",
    category: "Dynamic Programming",
    acceptanceRate: "50.9%",
  },
  {
    id: "task-js-longestsubstring",
    module_id: "mod-5",
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring",
    description: "Find the length of the longest contiguous substring that contains no repeating characters.",
    task_type: "algorithm",
    language: "javascript",
    difficulty: "medium",
    starter_code: "",
    solution_code: null,
    hints: ["Use a sliding window with a Set to track seen characters."],
    points: 30,
    order_index: 6,
    courseTitle: "Sliding Window",
    courseSlug: "javascript-dsa",
    category: "Sliding Window",
    acceptanceRate: "34.6%",
  },
  {
    id: "task-py-containerwater",
    module_id: "mod-6",
    title: "Container With Most Water",
    slug: "container-with-most-water",
    description: "Find two vertical lines that together with the x-axis form a container holding the maximum water.",
    task_type: "algorithm",
    language: "python",
    difficulty: "medium",
    starter_code: "",
    solution_code: null,
    hints: ["Use two pointers and advance whichever boundary is shorter."],
    points: 25,
    order_index: 7,
    courseTitle: "Two Pointers",
    courseSlug: "python-dsa",
    category: "Two Pointers",
    acceptanceRate: "54.7%",
  },
  {
    id: "task-cpp-mergelists",
    module_id: "mod-7",
    title: "Merge Two Sorted Lists",
    slug: "merge-two-sorted-lists",
    description: "Merge two sorted singly linked lists into a single consolidated sorted linked list.",
    task_type: "algorithm",
    language: "cpp",
    difficulty: "easy",
    starter_code: "",
    solution_code: null,
    hints: ["Create a dummy head node and iteratively attach the smaller node."],
    points: 15,
    order_index: 8,
    courseTitle: "Linked Lists",
    courseSlug: "cpp-algorithms",
    category: "Linked Lists",
    acceptanceRate: "63.5%",
  },
  {
    id: "task-py-trappingrainwater",
    module_id: "mod-8",
    title: "Trapping Rain Water",
    slug: "trapping-rain-water",
    description: "Given n non-negative integers representing an elevation map, compute how much water it can trap.",
    task_type: "algorithm",
    language: "python",
    difficulty: "hard",
    starter_code: "",
    solution_code: null,
    hints: ["Track left_max and right_max at each bar or use two pointers."],
    points: 40,
    order_index: 9,
    courseTitle: "Two Pointers & Stack",
    courseSlug: "python-dsa",
    category: "Two Pointers",
    acceptanceRate: "60.1%",
  },
  {
    id: "task-java-mediansortedarrays",
    module_id: "mod-9",
    title: "Median of Two Sorted Arrays",
    slug: "median-of-two-sorted-arrays",
    description: "Find the median of two sorted arrays with a strict logarithmic O(log(m+n)) runtime.",
    task_type: "algorithm",
    language: "java",
    difficulty: "hard",
    starter_code: "",
    solution_code: null,
    hints: ["Perform binary search on the partition cut of the smaller array."],
    points: 50,
    order_index: 10,
    courseTitle: "Binary Search",
    courseSlug: "java-dsa",
    category: "Binary Search",
    acceptanceRate: "39.4%",
  },
  {
    id: "task-py-reverselinkedlist",
    module_id: "mod-10",
    title: "Reverse Linked List",
    slug: "reverse-linked-list",
    description: "Given the head of a singly linked list, reverse the list and return its new head.",
    task_type: "algorithm",
    language: "python",
    difficulty: "easy",
    starter_code: "",
    solution_code: null,
    hints: ["Iteratively swap pointers using prev, curr, and next_node."],
    points: 10,
    order_index: 11,
    courseTitle: "Linked Lists",
    courseSlug: "python-dsa",
    category: "Linked Lists",
    acceptanceRate: "75.2%",
  },
  {
    id: "task-js-fizzbuzz",
    module_id: "mod-11",
    title: "FizzBuzz Multiples",
    slug: "fizz-buzz",
    description: "Generate the classic FizzBuzz string representation up to integer n.",
    task_type: "algorithm",
    language: "javascript",
    difficulty: "easy",
    starter_code: "",
    solution_code: null,
    hints: ["Check divisibility by 15 first, then 3, then 5."],
    points: 10,
    order_index: 12,
    courseTitle: "Basic Syntax",
    courseSlug: "javascript-dsa",
    category: "Math & Logic",
    acceptanceRate: "82.0%",
  },
];

const TOPIC_CATEGORIES = [
  "All Topics",
  "Arrays & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Binary Search",
  "Linked Lists",
  "Dynamic Programming",
  "Math & Logic",
];

const LANGUAGE_OPTIONS = [
  { id: "all", label: "All Languages" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "javascript", label: "JavaScript" },
];

export function ProblemsPage({ navigate }: ProblemsPageProps) {
  const { user, profile, points } = useAuth();
  const [tasks, setTasks] = useState<TaskWithCourse[]>(DEFAULT_PRACTICE_PROBLEMS);
  const [progressMap, setProgressMap] = useState<Record<string, UserTaskProgress>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("All Topics");
  const [statusFilter, setStatusFilter] = useState<"all" | "solved" | "unsolved">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  useEffect(() => {
    async function loadTasks() {
      setLoading(true);
      try {
        let loadedTasks: TaskWithCourse[] = [];
        const { data: courses } = await courseService.getCourses();
        if (courses && courses.length > 0) {
          courses.forEach((c) => {
            c.modules.forEach((m) => {
              (m.tasks || []).forEach((t) => {
                loadedTasks.push({
                  ...t,
                  courseTitle: c.title,
                  courseSlug: c.slug,
                  category: m.title.replace(/Module \d+:\s*/, ""),
                  acceptanceRate: "62.0%",
                });
              });
            });
          });
        }

        // Merge loaded tasks with defaults (avoiding duplicates)
        const existingIds = new Set(loadedTasks.map((t) => t.id));
        const combined = [
          ...loadedTasks,
          ...DEFAULT_PRACTICE_PROBLEMS.filter((t) => !existingIds.has(t.id)),
        ];
        setTasks(combined);

        // 1. Read local storage progress (guest / offline / immediate solves)
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

        // 2. If signed in, merge Supabase database user_task_progress
        if (user?.id) {
          const taskIds = combined.map((t) => t.id);
          const { data: prog } = await courseService.getUserProgress(user.id, taskIds);
          if (prog) {
            Object.assign(mergedProgress, prog);
          }
        }

        setProgressMap(mergedProgress);
      } catch (err) {
        console.error("Failed to fetch practice tasks:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();

    // Re-sync whenever a problem is submitted or progress changes
    const handleSync = () => {
      loadTasks();
    };
    window.addEventListener("aarcode_progress_updated", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("aarcode_progress_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [user?.id]);

  // Filter tasks based on search, difficulty, language, category, status
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        (t.courseTitle && t.courseTitle.toLowerCase().includes(q));

      const matchesDiff =
        difficultyFilter === "all" || t.difficulty === difficultyFilter;

      const matchesLang =
        languageFilter === "all" || t.language.toLowerCase() === languageFilter.toLowerCase();

      const matchesCategory =
        categoryFilter === "All Topics" ||
        (t.category && t.category.toLowerCase() === categoryFilter.toLowerCase()) ||
        (t.courseTitle && t.courseTitle.toLowerCase().includes(categoryFilter.toLowerCase()));

      const isSolved = Boolean(progressMap[t.id]?.is_completed);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "solved" && isSolved) ||
        (statusFilter === "unsolved" && !isSolved);

      return matchesSearch && matchesDiff && matchesLang && matchesCategory && matchesStatus;
    });
  }, [tasks, searchQuery, difficultyFilter, languageFilter, categoryFilter, statusFilter, progressMap]);

  // Telemetry Calculations
  const totalTasks = tasks.length;
  const solvedCount = tasks.filter((t) => progressMap[t.id]?.is_completed).length;

  // Calculate points earned from all solved problems
  const pointsFromSolvedTasks = tasks
    .filter((t) => progressMap[t.id]?.is_completed)
    .reduce((acc, curr) => acc + (curr.points || 10), 0);

  const localXP = progressStorage.getLocalXP();
  const userAuthPoints = points || profile?.points || 0;
  // Total XP reflects whichever is highest to ensure no earned points are lost
  const totalPoints = Math.max(userAuthPoints, pointsFromSolvedTasks, localXP);

  const completionPercentage = totalTasks > 0 ? Math.round((solvedCount / totalTasks) * 100) : 0;

  // Handle Pick Random Problem
  const handlePickRandom = () => {
    const candidateTasks = filteredTasks.length > 0 ? filteredTasks : tasks;
    const unsolved = candidateTasks.filter((t) => !progressMap[t.id]?.is_completed);
    const targetPool = unsolved.length > 0 ? unsolved : candidateTasks;
    const randomIndex = Math.floor(Math.random() * targetPool.length);
    const chosen = targetPool[randomIndex];
    if (chosen) {
      navigate("task", { taskId: chosen.id });
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setDifficultyFilter("all");
    setLanguageFilter("all");
    setCategoryFilter("All Topics");
    setStatusFilter("all");
  };

  return (
    <div className="min-h-screen font-urbanist bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* =====================================================================
            1. HERO & TELEMETRY PROGRESS BANNER
        ===================================================================== */}
        <div className="relative rounded-3xl p-6 sm:p-8 xl:p-10 bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#6366F1]/10 dark:bg-[#6366F1]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-purple-500/10 dark:bg-purple-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Content */}
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-[#6366F1] dark:text-[#818CF8] text-xs font-bold border border-indigo-200/70 dark:border-indigo-500/25">
                <Code2 size={13} />
                <span>Practice Arena</span>
                <span>•</span>
                <span className="font-semibold text-slate-600 dark:text-slate-300">Curated DSA Bank</span>
              </div>

              <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Practice &amp; Master Algorithms
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
                Sharpen your problem-solving skills across real-world Data Structures, algorithmic benchmarks, and multi-language challenges with instant sandbox execution.
              </p>

              {/* Action shortcuts */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={handlePickRandom}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Shuffle size={14} />
                  <span>Pick Random Challenge</span>
                </button>

                <button
                  onClick={() => navigate("task", { taskId: "task-py-twosum" })}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold border border-slate-200/80 dark:border-slate-700/60 transition-colors"
                >
                  <Flame size={14} className="text-amber-500" />
                  <span>Daily Pick: Two Sum</span>
                </button>
              </div>
            </div>

            {/* Right Telemetry Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 shrink-0 lg:w-80 xl:w-96">
              {/* Card 1: Solved */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200/80 dark:border-[#1E293B]">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  <span>Solved</span>
                  <CheckCircle2 size={14} className="text-emerald-500" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  <span className="text-emerald-500">{solvedCount}</span>
                  <span className="text-slate-400 text-xs sm:text-sm font-normal"> / {totalTasks}</span>
                </div>
                <div className="mt-2 w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Card 2: XP Earned */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200/80 dark:border-[#1E293B]">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  <span>Earned XP</span>
                  <Trophy size={14} className="text-amber-500" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  <span className="text-amber-500">+{totalPoints}</span>
                  <span className="text-slate-400 text-xs sm:text-sm font-normal"> XP</span>
                </div>
                <div className="mt-2 text-[11px] font-medium text-slate-400">
                  {completionPercentage}% completed
                </div>
              </div>

              {/* Card 3: Easy / Medium / Hard distribution */}
              <div className="col-span-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200/80 dark:border-[#1E293B] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Target size={14} className="text-[#6366F1]" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Tracks</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    {tasks.filter((t) => t.difficulty === "easy").length} Easy
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                    {tasks.filter((t) => t.difficulty === "medium").length} Med
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold">
                    {tasks.filter((t) => t.difficulty === "hard").length} Hard
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            2. TOPIC CATEGORY PILLS (Quick Horizontal Scroll)
        ===================================================================== */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {TOPIC_CATEGORIES.map((cat) => {
            const isActive = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0",
                  isActive
                    ? "bg-[#6366F1] text-white shadow-sm shadow-indigo-500/25"
                    : "bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* =====================================================================
            3. SEARCH & ADVANCED FILTER CONTROLS BAR
        ===================================================================== */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search challenges by title, topic, or keyword..."
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200/80 dark:border-[#1E293B] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Controls Row */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Difficulty Segmented Filter */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#090D16] border border-slate-200/60 dark:border-[#1E293B]/60">
                {["all", "easy", "medium", "hard"].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all",
                      difficultyFilter === diff
                        ? "bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    )}
                  >
                    {diff === "all" ? (
                      "All Diff"
                    ) : (
                      <span className="flex items-center gap-1">
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            diff === "easy"
                              ? "bg-emerald-500"
                              : diff === "medium"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          )}
                        />
                        <span>{diff}</span>
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Language Selector */}
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-[#090D16] border border-slate-200/80 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
              >
                {LANGUAGE_OPTIONS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>

              {/* Status Selector */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-[#090D16] border border-slate-200/80 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
              >
                <option value="all">All Status</option>
                <option value="unsolved">Unsolved Only</option>
                <option value="solved">Solved Only</option>
              </select>

              {/* View Mode Toggle: Table / Grid */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#090D16] border border-slate-200/60 dark:border-[#1E293B]/60">
                <button
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    viewMode === "table"
                      ? "bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  )}
                  title="Table View"
                >
                  <List size={15} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    viewMode === "grid"
                      ? "bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  )}
                  title="Grid View"
                >
                  <LayoutGrid size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Summary & Reset */}
          {(searchQuery ||
            difficultyFilter !== "all" ||
            languageFilter !== "all" ||
            categoryFilter !== "All Topics" ||
            statusFilter !== "all") && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#1E293B]/60 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Filter size={13} className="text-[#6366F1]" />
                <span>
                  Showing <strong>{filteredTasks.length}</strong> of {tasks.length} challenges
                </span>
              </span>

              <button
                onClick={handleClearFilters}
                className="text-[#6366F1] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Reset all filters</span>
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* =====================================================================
            4. CHALLENGES VIEW (Table or Grid)
        ===================================================================== */}
        {loading ? (
          <div className="py-24 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 size={32} className="animate-spin text-[#6366F1]" />
            <span className="text-xs font-semibold">Loading practice challenge arena...</span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-20 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] text-center space-y-3 p-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-[#6366F1] flex items-center justify-center mx-auto">
              <Search size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No matching challenges found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, difficulty, or track filters to explore more problems.
            </p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <span>Reset Filters</span>
            </button>
          </div>
        ) : viewMode === "table" ? (
          /* ===================================================================
              TABLE VIEW
          =================================================================== */
          <div className="rounded-2xl border border-slate-200/80 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-slate-200/80 dark:border-[#1E293B] text-slate-400 font-semibold uppercase tracking-wider text-[11px] bg-slate-50/70 dark:bg-[#0B1120]/70">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">Status</th>
                    <th className="py-3.5 px-4">Challenge</th>
                    <th className="py-3.5 px-4">Topic / Category</th>
                    <th className="py-3.5 px-4">Difficulty</th>
                    <th className="py-3.5 px-4">Track</th>
                    <th className="py-3.5 px-4 text-center">Acceptance</th>
                    <th className="py-3.5 px-4 text-right">Points</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]/60 font-sans">
                  {filteredTasks.map((t) => {
                    const isSolved = Boolean(progressMap[t.id]?.is_completed);
                    const diffBadge =
                      t.difficulty === "easy"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : t.difficulty === "medium"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";

                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => navigate("task", { taskId: t.id })}
                      >
                        {/* Status Checkmark */}
                        <td className="py-4 px-4 text-center">
                          {isSolved ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto" />
                          )}
                        </td>

                        {/* Title & Short Preview */}
                        <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white group-hover:text-[#6366F1] dark:group-hover:text-[#818CF8] transition-colors">
                          <div className="font-bold text-sm">{t.title}</div>
                          <div className="text-[11px] text-slate-400 font-normal line-clamp-1 max-w-sm mt-0.5">
                            {t.description}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4 text-slate-600 dark:text-slate-300 text-xs font-medium">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0B1120] text-slate-600 dark:text-slate-400 text-[11px] font-semibold">
                            {t.category || t.courseTitle || "General Practice"}
                          </span>
                        </td>

                        {/* Difficulty */}
                        <td className="py-4 px-4">
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                              diffBadge
                            )}
                          >
                            {t.difficulty}
                          </span>
                        </td>

                        {/* Language Track */}
                        <td className="py-4 px-4 font-mono uppercase text-xs text-slate-500 dark:text-slate-400 font-semibold">
                          {t.language}
                        </td>

                        {/* Acceptance Rate */}
                        <td className="py-4 px-4 text-center font-mono text-xs text-slate-500 dark:text-slate-400">
                          {t.acceptanceRate || "60.4%"}
                        </td>

                        {/* XP Points */}
                        <td className="py-4 px-4 text-right font-bold text-amber-500 text-xs sm:text-sm font-mono">
                          +{t.points || 10} XP
                        </td>

                        {/* Action CTA */}
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("task", { taskId: t.id });
                            }}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs",
                              isSolved
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                                : "bg-gradient-to-r from-[#6366F1] to-[#7C3AED] text-white shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-[1.02]"
                            )}
                          >
                            <span>{isSolved ? "Practice Again" : "Solve Challenge"}</span>
                            <ArrowRight size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ===================================================================
              GRID CARD VIEW
          =================================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((t) => {
              const isSolved = Boolean(progressMap[t.id]?.is_completed);
              const diffBadge =
                t.difficulty === "easy"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : t.difficulty === "medium"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";

              return (
                <div
                  key={t.id}
                  onClick={() => navigate("task", { taskId: t.id })}
                  className="group relative p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs hover:border-[#6366F1]/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                            diffBadge
                          )}
                        >
                          {t.difficulty}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0B1120] text-slate-500 dark:text-slate-400 text-[10px] font-mono uppercase font-semibold">
                          {t.language}
                        </span>
                      </div>

                      {isSolved && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <Check size={12} strokeWidth={3} />
                          <span>Solved</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-[#6366F1] dark:group-hover:text-[#818CF8] transition-colors">
                      {t.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-500 font-mono">
                      +{t.points || 10} XP
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("task", { taskId: t.id });
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#6366F1] group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>{isSolved ? "Practice Again" : "Solve Challenge"}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProblemsPage;
