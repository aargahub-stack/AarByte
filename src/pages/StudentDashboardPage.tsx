import { useState, useEffect } from "react";
import {
  Sparkles,
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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { courseService } from "@/services/courseService";
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

// Fallback courses if database is empty so the dashboard is always rich and functional
const FALLBACK_COURSES: CourseWithModules[] = [
  {
    id: "demo-python",
    title: "Python Data Structures & Algorithms",
    slug: "python-dsa",
    description:
      "Master arrays, hash maps, two pointers, and recursion with automated judge test cases.",
    icon: "code",
    is_published: true,
    modules: [
      {
        id: "mod-py-1",
        course_id: "demo-python",
        title: "Module 1: Arrays & Two Pointers",
        order_index: 1,
        tasks: [
          {
            id: "task-py-twosum",
            module_id: "mod-py-1",
            title: "Two Sum",
            slug: "two-sum",
            description:
              "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            task_type: "algorithm",
            language: "python",
            difficulty: "easy",
            starter_code: null,
            solution_code: null,
            hints: [],
            points: 10,
            order_index: 1,
          },
          {
            id: "task-py-palindrome",
            module_id: "mod-py-1",
            title: "Valid Palindrome",
            slug: "valid-palindrome",
            description:
              "Determine whether a string reads the same forward and backward after removing non-alphanumeric characters.",
            task_type: "algorithm",
            language: "python",
            difficulty: "easy",
            starter_code: null,
            solution_code: null,
            hints: [],
            points: 10,
            order_index: 2,
          },
        ],
      },
      {
        id: "mod-py-2",
        course_id: "demo-python",
        title: "Module 2: Stacks & Sliding Window",
        order_index: 2,
        tasks: [
          {
            id: "task-py-valid-parentheses",
            module_id: "mod-py-2",
            title: "Valid Parentheses",
            slug: "valid-parentheses",
            description:
              "Determine if an input string of brackets '(', ')', '{', '}', '[' and ']' is properly balanced.",
            task_type: "algorithm",
            language: "python",
            difficulty: "medium",
            starter_code: null,
            solution_code: null,
            hints: [],
            points: 15,
            order_index: 1,
          },
        ],
      },
    ],
  },
  {
    id: "demo-cpp",
    title: "C++ Competitive Programming Core",
    slug: "cpp-competitive-core",
    description:
      "High-speed problem solving using modern C++20, STL containers, and algorithmic optimizations.",
    icon: "terminal",
    is_published: true,
    modules: [
      {
        id: "mod-cpp-1",
        course_id: "demo-cpp",
        title: "Module 1: Fast I/O & STL Vectors",
        order_index: 1,
        tasks: [
          {
            id: "task-cpp-reversal",
            module_id: "mod-cpp-1",
            title: "Array Reversal in Place",
            slug: "array-reversal",
            description:
              "Reverse an array of N integers in place without allocating auxiliary memory.",
            task_type: "algorithm",
            language: "cpp",
            difficulty: "easy",
            starter_code: null,
            solution_code: null,
            hints: [],
            points: 10,
            order_index: 1,
          },
        ],
      },
    ],
  },
];

export function StudentDashboardPage({ navigate }: StudentDashboardPageProps) {
  const { user, profile, points, isAdmin } = useAuth();
  const [courses, setCourses] = useState<CourseWithModules[]>([]);
  const [allTasks, setAllTasks] = useState<EnrichedTask[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, UserTaskProgress>>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [{ data: fetchedCourses }, { data: fetchedLeaderboard }] = await Promise.all([
          courseService.getCourses(),
          courseService.getLeaderboard(5),
        ]);

        const activeCourses =
          fetchedCourses && fetchedCourses.length > 0 ? fetchedCourses : FALLBACK_COURSES;
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

        if (user?.id && extractedTasks.length > 0) {
          const { data: prog } = await courseService.getUserProgress(
            user.id,
            extractedTasks.map((t) => t.id)
          );
          if (prog) {
            setProgressMap(prog);
          }
        }
      } catch (err) {
        console.error("[StudentDashboard] Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user?.id]);

  const studentName =
    profile?.full_name || user?.email?.split("@")[0] || "Developer";

  const solvedTasksCount = allTasks.filter((t) => progressMap[t.id]?.is_completed).length;
  const totalTasksCount = allTasks.length;
  const completionPct =
    totalTasksCount > 0 ? Math.round((solvedTasksCount / totalTasksCount) * 100) : 0;

  // Next recommended unsolved task (or first task if all solved)
  const nextTask =
    allTasks.find((t) => !progressMap[t.id]?.is_completed) || allTasks[0];

  // Determine student skill tier
  const getSkillTier = (xp: number) => {
    if (xp >= 250) return "Algorithm Architect";
    if (xp >= 100) return "Logic Specialist";
    if (xp >= 30) return "Problem Solver";
    return "Rising Developer";
  };

  const userRankIndex = leaderboard.findIndex((entry) => entry.user_id === user?.id);
  const rankDisplay = userRankIndex >= 0 ? `#${userRankIndex + 1}` : "Top 10%";

  return (
    <div className="min-h-screen font-urbanist bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ===================================================================
            1. TOP STUDENT WORKSPACE HERO BANNER
        =================================================================== */}
        <div className="relative rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] shadow-xl shadow-indigo-500/5 dark:shadow-none p-6 sm:p-8 lg:p-10 overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-gradient-to-br from-[#6366F1]/25 via-[#7C3AED]/15 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/25 text-[#4F46E5] dark:text-indigo-300 text-xs font-extrabold">
                  <Sparkles size={13} className="text-[#6366F1]" />
                  <span>Student Workspace</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-extrabold">
                  <Flame size={13} />
                  <span>{getSkillTier(points)}</span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-[#6366F1] via-[#4F46E5] to-[#7C3AED] dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {studentName}
                </span>
                !
              </h1>

              <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                Pick up right where you left off. Solve curated algorithm tasks, pass hidden judge test cases, and climb the AarCode leaderboard.
              </p>
            </div>

            {/* Primary Workspace Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {nextTask && (
                <button
                  onClick={() => navigate("task", { taskId: nextTask.id })}
                  className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#6366F1] via-[#4F46E5] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
                >
                  <Play size={16} className="fill-white" />
                  <span>Resume: {nextTask.title}</span>
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              )}

              <button
                onClick={() => navigate("compiler")}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full border border-slate-200 dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] hover:border-[#6366F1]/50 text-slate-800 dark:text-slate-200 font-bold text-sm sm:text-base transition-all"
              >
                <Terminal size={16} className="text-[#6366F1]" />
                <span>Open Compiler</span>
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================
            2. FOUR METRIC TELEMETRY CARDS
        =================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Total XP Score
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Zap size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {points} <span className="text-base font-bold text-amber-500">XP</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Earned from passing hidden test cases
            </p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Problems Solved
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {solvedTasksCount}{" "}
              <span className="text-base font-bold text-slate-400">
                / {totalTasksCount}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Verified across active tracks
            </p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Track Completion
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[#6366F1]">
                <Target size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {completionPct}%
            </div>
            <div className="mt-2.5 w-full h-2 rounded-full bg-slate-100 dark:bg-[#090D16] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#7C3AED] transition-all duration-500"
                style={{ width: `${Math.max(completionPct, 6)}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Arena Standing
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                <Trophy size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {rankDisplay}
            </div>
            <button
              onClick={() => navigate("leaderboard")}
              className="text-xs font-bold text-[#6366F1] dark:text-indigo-400 hover:underline mt-1 inline-flex items-center gap-1"
            >
              <span>View global rankings</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* ===================================================================
            3. MAIN SPLIT WORKSPACE: COURSES & RECOMMENDED TASKS + SIDEBAR
        =================================================================== */}
        {loading ? (
          <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-[#6366F1]" />
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Loading your developer workspace...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Columns: Structured Tracks + Up Next Challenges */}
            <div className="lg:col-span-8 space-y-8">
              {/* Structured Course Roadmaps */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      Your Learning Roadmaps
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                      Structured module-by-module tracks with real-time execution
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("courses")}
                    className="text-xs sm:text-sm font-extrabold text-[#6366F1] dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>All Courses</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {courses.map((course) => {
                    const courseTasks = course.modules.flatMap((m) => m.tasks || []);
                    const courseSolved = courseTasks.filter(
                      (t) => progressMap[t.id]?.is_completed
                    ).length;
                    const courseTotal = courseTasks.length;
                    const coursePct =
                      courseTotal > 0
                        ? Math.round((courseSolved / courseTotal) * 100)
                        : 0;

                    return (
                      <div
                        key={course.id}
                        onClick={() => navigate("course", { slug: course.slug })}
                        className="group cursor-pointer rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] hover:border-[#6366F1] dark:hover:border-[#6366F1] p-6 flex flex-col justify-between gap-5 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-200"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-[#6366F1] dark:text-indigo-400 group-hover:bg-[#6366F1] group-hover:text-white transition-colors">
                              <BookOpen size={20} />
                            </div>
                            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-100 dark:bg-[#090D16] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-[#1E293B]">
                              {course.modules.length}{" "}
                              {course.modules.length === 1 ? "Module" : "Modules"}
                            </span>
                          </div>

                          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-[#6366F1] dark:group-hover:text-indigo-400 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2">
                            {course.description}
                          </p>
                        </div>

                        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-[#1E293B]">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-500 dark:text-slate-400">
                              {courseSolved} of {courseTotal} tasks solved
                            </span>
                            <span className="text-[#6366F1] dark:text-indigo-400">
                              {coursePct}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#090D16] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#7C3AED]"
                              style={{ width: `${Math.max(coursePct, 5)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommended Practice Arena Tasks */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      Practice Arena Challenges
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                      Write code, run against hidden test cases, and collect XP
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("problems")}
                    className="text-xs sm:text-sm font-extrabold text-[#6366F1] dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>View All Problems</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] divide-y divide-slate-100 dark:divide-[#1E293B] overflow-hidden shadow-sm">
                  {allTasks.slice(0, 6).map((task) => {
                    const isSolved = Boolean(progressMap[task.id]?.is_completed);
                    return (
                      <div
                        key={task.id}
                        onClick={() => navigate("task", { taskId: task.id })}
                        className="group cursor-pointer p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-[#090D16]/60 transition-colors"
                      >
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div
                            className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border",
                              isSolved
                                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500"
                                : "bg-indigo-500/10 border-indigo-500/20 text-[#6366F1] dark:text-indigo-400"
                            )}
                          >
                            {isSolved ? <CheckCircle2 size={18} /> : <Code2 size={18} />}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-[#6366F1] dark:group-hover:text-indigo-400 transition-colors">
                                {task.title}
                              </h4>
                              <span
                                className={cn(
                                  "text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full",
                                  task.difficulty === "easy" &&
                                    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                                  task.difficulty === "medium" &&
                                    "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                                  task.difficulty === "hard" &&
                                    "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                )}
                              >
                                {task.difficulty}
                              </span>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#090D16] text-slate-500 dark:text-slate-400">
                                {task.language}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                              {task.courseTitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <span className="text-xs font-extrabold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
                            +{task.points} XP
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold transition-all",
                              isSolved
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-[#6366F1]/10 text-[#6366F1] dark:text-indigo-300 group-hover:bg-[#6366F1] group-hover:text-white"
                            )}
                          >
                            <span>{isSolved ? "Review" : "Solve"}</span>
                            <ArrowRight size={13} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right 4 Columns: Quick Tools & Top Coders Leaderboard */}
            <div className="lg:col-span-4 space-y-6">
              {/* Quick Developer Tools */}
              <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Layers size={18} className="text-[#6366F1]" />
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Quick Launchpad
                  </h3>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => navigate("compiler")}
                    className="w-full p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#090D16] border border-slate-200/80 dark:border-[#1E293B] hover:border-[#6366F1] flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-[#6366F1] flex items-center justify-center">
                        <Terminal size={17} />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                          Multi-Language IDE
                        </div>
                        <div className="text-xs font-medium text-slate-500">
                          Python, C++, Java, JS, TS
                        </div>
                      </div>
                    </div>
                    <ArrowRight
                      size={15}
                      className="text-slate-400 group-hover:text-[#6366F1] group-hover:translate-x-0.5 transition-all"
                    />
                  </button>

                  <button
                    onClick={() => navigate("problems")}
                    className="w-full p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#090D16] border border-slate-200/80 dark:border-[#1E293B] hover:border-[#6366F1] flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                        <Code2 size={17} />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                          Practice Arena
                        </div>
                        <div className="text-xs font-medium text-slate-500">
                          Automated test-case judge
                        </div>
                      </div>
                    </div>
                    <ArrowRight
                      size={15}
                      className="text-slate-400 group-hover:text-[#6366F1] group-hover:translate-x-0.5 transition-all"
                    />
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => navigate("admin")}
                      className="w-full p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/25 hover:border-purple-500 flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-500 flex items-center justify-center">
                          <ShieldAlert size={17} />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-extrabold text-purple-600 dark:text-purple-300">
                            Admin Control Center
                          </div>
                          <div className="text-xs font-medium text-purple-500/80">
                            Manage courses, tasks &amp; tests
                          </div>
                        </div>
                      </div>
                      <ArrowRight size={15} className="text-purple-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Top Coders Mini-Leaderboard */}
              <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy size={18} className="text-amber-500" />
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Top Coders
                    </h3>
                  </div>
                  <button
                    onClick={() => navigate("leaderboard")}
                    className="text-xs font-extrabold text-[#6366F1] dark:text-indigo-400 hover:underline"
                  >
                    Full Board
                  </button>
                </div>

                {leaderboard.length === 0 ? (
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 py-4 text-center">
                    Solve your first challenge to appear on the global leaderboard!
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {leaderboard.map((entry, idx) => {
                      const isCurrentUser = entry.user_id === user?.id;
                      return (
                        <div
                          key={entry.user_id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-2xl border text-xs font-bold",
                            isCurrentUser
                              ? "bg-indigo-500/10 border-[#6366F1]/40 text-slate-900 dark:text-white"
                              : "bg-[#F8FAFC] dark:bg-[#090D16] border-slate-200/70 dark:border-[#1E293B] text-slate-700 dark:text-slate-300"
                          )}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0",
                                idx === 0
                                  ? "bg-amber-500 text-white"
                                  : idx === 1
                                  ? "bg-slate-400 text-white"
                                  : idx === 2
                                  ? "bg-amber-700 text-white"
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              )}
                            >
                              {idx + 1}
                            </span>
                            <span className="truncate">
                              {entry.full_name || "Developer"}
                              {isCurrentUser && " (You)"}
                            </span>
                          </div>
                          <span className="text-amber-500 font-extrabold shrink-0">
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
