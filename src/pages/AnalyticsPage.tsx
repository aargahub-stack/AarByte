import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Code2,
  Clock,
  ArrowLeft,
  ArrowRight,
  Flame,
  Zap,
  Search,
  Filter,
  BarChart3,
  Layers,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { courseService } from "@/services/courseService";
import { progressStorage } from "@/services/storage/progressStorage";
import { DEMO_COURSES } from "@/data/demoCourses";
import { formatLocalDate } from "@/services/streakService";
import type { CourseWithModules, Task, UserTaskProgress } from "@/types/database.types";
import type { Route } from "@/types";
import { cn } from "@/utils/cn";

interface AnalyticsPageProps {
  navigate: (to: Route | string, params?: Record<string, string>) => void;
}

interface SolvedTaskRecord {
  taskId: string;
  title: string;
  slug?: string;
  difficulty: "easy" | "medium" | "hard" | string;
  language: string;
  completedAt: string;
  formattedDate: string;
  points: number;
  courseTitle?: string;
}

export function AnalyticsPage({ navigate }: AnalyticsPageProps) {
  const { user, profile, points } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, UserTaskProgress>>({});

  // Filters for solved problems list
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let activeCourses: CourseWithModules[] = [];
        const { data: dbCourses } = await courseService.getCourses();
        if (dbCourses && dbCourses.length > 0) {
          activeCourses = dbCourses;
        } else {
          activeCourses = DEMO_COURSES;
        }

        const tasks: Task[] = [];
        activeCourses.forEach((c) => {
          c.modules.forEach((m) => {
            (m.tasks || []).forEach((t) => {
              tasks.push({
                ...t,
                ...(c.title ? { courseTitle: c.title } : {}),
              } as any);
            });
          });
        });
        setAllTasks(tasks);

        const localCompleted = progressStorage.getCompletedTasks();
        const merged: Record<string, UserTaskProgress> = {};
        Object.keys(localCompleted).forEach((taskId) => {
          if (localCompleted[taskId]?.is_completed) {
            merged[taskId] = {
              user_id: user?.id || "local-user",
              task_id: taskId,
              is_completed: true,
              completed_at: localCompleted[taskId]?.completed_at || new Date().toISOString(),
            };
          }
        });

        if (user?.id) {
          const { data: dbProg } = await courseService.getUserProgress(user.id);
          if (dbProg) {
            Object.assign(merged, dbProg);
          }
        }

        setProgressMap(merged);
      } catch (err) {
        console.error("[AnalyticsPage] Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    const handleSync = () => loadData();
    window.addEventListener("aarcode_progress_updated", handleSync);
    return () => window.removeEventListener("aarcode_progress_updated", handleSync);
  }, [user?.id]);

  const localXP = progressStorage.getLocalXP();
  const totalXP = Math.max(points || profile?.points || 0, localXP);

  // Solved tasks mapping
  const solvedRecords: SolvedTaskRecord[] = useMemo(() => {
    const taskMap = new Map<string, Task>();
    allTasks.forEach((t) => taskMap.set(t.id, t));

    return Object.entries(progressMap)
      .filter(([_, p]) => p.is_completed)
      .map(([taskId, p]) => {
        const meta = taskMap.get(taskId);
        const rawTime = p.completed_at || new Date().toISOString();
        const d = new Date(rawTime);
        const formattedDate = !isNaN(d.getTime())
          ? d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Completed";

        let cleanTitle = meta?.title;
        if (!cleanTitle) {
          cleanTitle = taskId
            .replace(/^task-/, "")
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
        }

        return {
          taskId,
          title: cleanTitle,
          slug: meta?.slug || taskId,
          difficulty: (meta?.difficulty || "medium").toLowerCase(),
          language: (p as any).language || meta?.language || "general",
          completedAt: rawTime,
          formattedDate,
          points: (meta as any)?.points || 10,
          courseTitle: (meta as any)?.courseTitle,
        };
      })
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }, [progressMap, allTasks]);

  // Telemetry metrics
  const totalSolved = solvedRecords.length;
  const totalAvailable = allTasks.length || 1;
  const overallCompletionPct = Math.round((totalSolved / totalAvailable) * 100);

  // Difficulty counts
  const easyTasks = allTasks.filter((t) => t.difficulty?.toLowerCase() === "easy");
  const easySolved = solvedRecords.filter((t) => t.difficulty === "easy").length;

  const mediumTasks = allTasks.filter((t) => t.difficulty?.toLowerCase() === "medium");
  const mediumSolved = solvedRecords.filter((t) => t.difficulty === "medium").length;

  const hardTasks = allTasks.filter((t) => t.difficulty?.toLowerCase() === "hard");
  const hardSolved = solvedRecords.filter((t) => t.difficulty === "hard").length;

  // Language counts
  const languageStats = useMemo(() => {
    const counts: Record<string, number> = {};
    solvedRecords.forEach((r) => {
      const l = r.language.toLowerCase();
      counts[l] = (counts[l] || 0) + 1;
    });
    return counts;
  }, [solvedRecords]);

  // Filtered records for the history table
  const filteredRecords = useMemo(() => {
    return solvedRecords.filter((r) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.courseTitle && r.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDifficulty =
        difficultyFilter === "all" || r.difficulty === difficultyFilter;

      const matchesLanguage =
        languageFilter === "all" || r.language.toLowerCase() === languageFilter.toLowerCase();

      return matchesSearch && matchesDifficulty && matchesLanguage;
    });
  }, [solvedRecords, searchQuery, difficultyFilter, languageFilter]);

  return (
    <div className="min-h-screen font-urbanist bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-white py-6 sm:py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-7">
        {/* Header / Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("dashboard")}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-600 dark:text-slate-300 transition-all shadow-xs"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <TrendingUp size={15} />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Learning Analytics
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Detailed breakdowns of your coding velocity, difficulty levels, and solved challenge archives.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("streak")}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-xs"
            >
              <Flame size={15} className="text-amber-500" />
              <span>Daily Streak</span>
            </button>
            <button
              onClick={() => navigate("problems")}
              className="px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <Code2 size={16} />
              <span>Solve Challenges</span>
            </button>
          </div>
        </div>

        {/* ===================================================================
            OVERVIEW STATS
        =================================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Solved
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {totalSolved}
              </span>
              <span className="text-xs text-slate-400">/ {totalAvailable} total</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verified problem solutions
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Completion Rate
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <BarChart3 size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {overallCompletionPct}%
              </span>
              <span className="text-xs text-slate-400">curriculum covered</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Based on enrolled courses
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total XP Earned
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Zap size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                +{totalXP}
              </span>
              <span className="text-xs text-slate-400">experience points</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Accumulated all-time
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Languages
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Code2 size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {Object.keys(languageStats).length || 1}
              </span>
              <span className="text-xs text-slate-400">technologies</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Practiced across courses
            </p>
          </div>
        </div>

        {/* ===================================================================
            DIFFICULTY & LANGUAGE BREAKDOWN
        =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Difficulty Breakdown */}
          <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <Layers size={17} className="text-[#6366F1]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Difficulty Breakdown</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">LeetCode Style</span>
            </div>

            <div className="space-y-4 pt-1">
              {/* Easy */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-emerald-600 dark:text-emerald-400">Easy</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {easySolved} / {easyTasks.length || 0} solved
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#090D16] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{
                      width: `${easyTasks.length > 0 ? (easySolved / easyTasks.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Medium */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-amber-500">Medium</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {mediumSolved} / {mediumTasks.length || 0} solved
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#090D16] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{
                      width: `${mediumTasks.length > 0 ? (mediumSolved / mediumTasks.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Hard */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-rose-500">Hard</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {hardSolved} / {hardTasks.length || 0} solved
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#090D16] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rose-500 transition-all duration-500"
                    style={{
                      width: `${hardTasks.length > 0 ? (hardSolved / hardTasks.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Programming Languages Practiced */}
          <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <Code2 size={17} className="text-[#6366F1]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Language Breakdown</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Solves by language</span>
            </div>

            <div className="space-y-3 pt-1">
              {Object.keys(languageStats).length > 0 ? (
                Object.entries(languageStats).map(([lang, count]) => {
                  const pct = Math.round((count / (totalSolved || 1)) * 100);
                  return (
                    <div key={lang} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="capitalize text-slate-800 dark:text-slate-200">{lang}</span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {count} {count === 1 ? "problem" : "problems"} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#090D16] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  Solve your first challenge in the Problem Arena to populate language telemetry!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================================
            SECTION 3: SOLVED PROBLEMS ARCHIVE TABLE
        =================================================================== */}
        <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#1E293B] pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Solved Challenges Archive</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Every problem you have completed and verified</p>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search solved problems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1E293B] bg-slate-50/60 dark:bg-[#090D16] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Difficulty filter */}
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#1E293B] bg-slate-50/60 dark:bg-[#090D16] text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Problems List */}
          {filteredRecords.length > 0 ? (
            <div className="space-y-2.5">
              {filteredRecords.map((item, idx) => (
                <div
                  key={`${item.taskId}-${idx}`}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-[#1E293B] bg-slate-50/50 dark:bg-[#090D16]/50 hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={13} strokeWidth={2.5} />
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#6366F1] transition-colors truncate">
                        {item.title}
                      </h4>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          item.difficulty === "easy" &&
                            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
                          item.difficulty === "medium" &&
                            "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
                          item.difficulty === "hard" &&
                            "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        )}
                      >
                        {item.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 text-[10px] font-semibold uppercase">
                        {item.language}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {item.courseTitle && (
                        <span className="flex items-center gap-1">
                          <BookOpen size={12} />
                          <span className="truncate">{item.courseTitle}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{item.formattedDate}</span>
                      </span>
                      <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                        <Zap size={12} />
                        <span>+{item.points} XP</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("task", { taskId: item.taskId })}
                    className="px-3.5 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0 shadow-xs"
                  >
                    <span>Review Solution</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 px-4 rounded-xl border border-dashed border-slate-200 dark:border-[#1E293B] text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {searchQuery || difficultyFilter !== "all"
                  ? "No problems match your filters"
                  : "No solved problems recorded yet"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Solve coding tasks to build your verified portfolio, increase your XP, and power your analytics.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate("problems")}
                  className="px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-sm"
                >
                  <Code2 size={15} />
                  <span>Start Solving in Arena</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
