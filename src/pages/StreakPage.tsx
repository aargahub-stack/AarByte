import { useState, useEffect, useMemo } from "react";
import {
  Flame,
  Trophy,
  Calendar as CalendarIcon,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  Code2,
  ChevronRight,
  BookOpen,
  Filter,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { courseService } from "@/services/courseService";
import { progressStorage } from "@/services/storage/progressStorage";
import { DEMO_COURSES } from "@/data/demoCourses";
import {
  calculateStreak,
  groupCompletedProblemsByDate,
  formatFriendlyDate,
  formatLocalDate,
  DailyCompletedProblem,
  WeekDayItem,
} from "@/services/streakService";
import type { CourseWithModules, Task, UserTaskProgress } from "@/types/database.types";
import type { Route } from "@/types";
import { cn } from "@/utils/cn";

interface StreakPageProps {
  navigate: (to: Route | string, params?: Record<string, string>) => void;
}

export function StreakPage({ navigate }: StreakPageProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, UserTaskProgress>>({});

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => formatLocalDate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

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
                // Attach course title for reference
                ...(c.title ? { courseTitle: c.title } : {}),
              } as any);
            });
          });
        });
        setAllTasks(tasks);

        // Merge local & DB progress
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
        console.error("[StreakPage] Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    const handleSync = () => loadData();
    window.addEventListener("aarcode_progress_updated", handleSync);
    return () => window.removeEventListener("aarcode_progress_updated", handleSync);
  }, [user?.id]);

  // Timestamps for streak calculation
  const completionTimestamps = useMemo(() => {
    return Object.values(progressMap)
      .filter((p) => p.is_completed && p.completed_at)
      .map((p) => p.completed_at as string);
  }, [progressMap]);

  // Telemetry data
  const streakData = useMemo(() => {
    return calculateStreak(completionTimestamps);
  }, [completionTimestamps]);

  // Grouped problems by date: { "2026-10-03": [ ...problems ] }
  const groupedProblems = useMemo(() => {
    return groupCompletedProblemsByDate(progressMap, allTasks as any);
  }, [progressMap, allTasks]);

  // All active dates sorted descending
  const allActiveDates = useMemo(() => {
    const dates = Object.keys(groupedProblems);
    if (!dates.includes(todayStr)) {
      dates.push(todayStr);
    }
    return dates.sort((a, b) => b.localeCompare(a));
  }, [groupedProblems, todayStr]);

  // Problems for the currently selected date
  const selectedDayProblems: DailyCompletedProblem[] = useMemo(() => {
    return groupedProblems[selectedDate] || [];
  }, [groupedProblems, selectedDate]);

  return (
    <div className="min-h-screen font-urbanist bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-white py-6 sm:py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-7">
        {/* Top Header / Breadcrumb */}
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
                <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <Flame size={15} />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Daily Coding Streak
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Inspect your daily problem solving history, streak momentum, and activity logs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("problems")}
              className="px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <Code2 size={16} />
              <span>Practice Today</span>
            </button>
            <button
              onClick={() => navigate("analytics")}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition-all shadow-xs"
            >
              <span>Learning Analytics</span>
            </button>
          </div>
        </div>

        {/* ===================================================================
            OVERVIEW STATS BANNER
        =================================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Current Streak */}
          <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Current Streak
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Flame size={18} strokeWidth={2.2} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {streakData.currentStreak}
              </span>
              <span className="text-xs text-slate-400 font-medium">consecutive days</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              {streakData.isSolvedToday ? "Active & verified today" : "Pending challenge today"}
            </p>
          </div>

          {/* Longest Streak */}
          <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Longest Streak
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Trophy size={18} strokeWidth={2.2} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {streakData.longestStreak}
              </span>
              <span className="text-xs text-slate-400 font-medium">personal best</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              All-time record
            </p>
          </div>

          {/* Active Days */}
          <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Active Days
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CalendarIcon size={18} strokeWidth={2.2} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {streakData.activeDatesSet.size}
              </span>
              <span className="text-xs text-slate-400 font-medium">practice days</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Days with completed tasks
            </p>
          </div>

          {/* Freeze Days Protection */}
          <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Freeze Protection
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <ShieldCheck size={18} strokeWidth={2.2} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {streakData.freezeDaysAvailable}
              </span>
              <span className="text-xs text-slate-400 font-medium">available</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Protects streak if a day is missed
            </p>
          </div>
        </div>

        {/* Milestone Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border border-amber-500/20 dark:border-amber-500/30 p-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <Sparkles className="text-amber-500" size={18} />
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Next Milestone Goal: {streakData.nextMilestone} Days
              </span>
            </div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {streakData.currentStreak} of {streakData.nextMilestone} days ({streakData.milestoneProgressPct}%)
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-[#090D16] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, streakData.milestoneProgressPct))}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {streakData.statusMessage}
          </p>
        </div>

        {/* ===================================================================
            SECTION 2: CURRENT WEEK CALENDAR STRIP
        =================================================================== */}
        <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Current Week Calendar</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Click any day to see the exact problems solved</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#090D16] text-slate-600 dark:text-slate-400">
              Sunday – Saturday
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {streakData.weekDays.map((wd, wIdx) => {
              const isSelected = selectedDate === wd.dateStr;
              const isCompleted = wd.status === "completed";
              const count = groupedProblems[wd.dateStr]?.length || 0;

              return (
                <button
                  key={wIdx}
                  onClick={() => setSelectedDate(wd.dateStr)}
                  className={cn(
                    "flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer select-none",
                    isSelected
                      ? "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/15"
                      : "border-slate-200/80 dark:border-[#1E293B] bg-slate-50/60 dark:bg-[#090D16]/60 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <span className={cn("text-xs font-semibold", wd.isToday ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-400")}>
                    {wd.label}
                  </span>
                  <div
                    className={cn(
                      "w-8 h-8 sm:w-9 sm:h-9 my-1.5 rounded-lg flex items-center justify-center text-xs font-bold transition-all relative",
                      isCompleted
                        ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xs"
                        : wd.isToday
                        ? "bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-400/40"
                        : wd.status === "missed"
                        ? "bg-slate-200/60 dark:bg-slate-800/60 text-slate-400"
                        : "bg-white dark:bg-[#0F172A] text-slate-400 border border-dashed border-slate-300 dark:border-slate-700"
                    )}
                  >
                    {isCompleted ? <CheckCircle2 size={16} /> : wd.dayNum}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-full">
                    {count > 0 ? `${count} solved` : wd.isToday ? "Today" : "0"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===================================================================
            SECTION 3: DAILY PROBLEM BREAKDOWN FOR SELECTED DAY
        =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Quick Date Selector List */}
          <div className="lg:col-span-1 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} className="text-[#6366F1]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active History</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {allActiveDates.length} recorded
              </span>
            </div>

            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {allActiveDates.map((dateStr) => {
                const count = groupedProblems[dateStr]?.length || 0;
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === todayStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between",
                      isSelected
                        ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-500/15 ring-1 ring-indigo-500/30"
                        : "border-slate-100 dark:border-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#1E293B]/60"
                    )}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{dateStr}</span>
                        {isToday && (
                          <span className="px-1.5 py-0.2 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold">
                            Today
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {count === 1 ? "1 challenge solved" : `${count} challenges solved`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {count > 0 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold">
                          {count}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">0</span>
                      )}
                      <ChevronRight size={14} className="text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Problems List for the Selected Date */}
          <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-5 sm:p-6 space-y-5 shadow-xs">
            {/* Header for Day Detail */}
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 dark:border-[#1E293B] pb-4">
              <div>
                <span className="text-xs font-semibold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                  Day Activity Details
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatFriendlyDate(selectedDate)}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                  {selectedDayProblems.length} {selectedDayProblems.length === 1 ? "Problem Solved" : "Problems Solved"}
                </span>
              </div>
            </div>

            {/* List of Problems Solved on This Day */}
            {selectedDayProblems.length > 0 ? (
              <div className="space-y-3">
                {selectedDayProblems.map((prob, idx) => (
                  <div
                    key={`${prob.taskId}-${idx}`}
                    className="p-4 rounded-xl border border-slate-200/80 dark:border-[#1E293B] bg-slate-50/50 dark:bg-[#090D16]/50 hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={13} strokeWidth={2.5} />
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#6366F1] transition-colors truncate">
                          {prob.title}
                        </h4>

                        {/* Difficulty badge */}
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                            prob.difficulty.toLowerCase() === "easy" &&
                              "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
                            prob.difficulty.toLowerCase() === "medium" &&
                              "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
                            prob.difficulty.toLowerCase() === "hard" &&
                              "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          )}
                        >
                          {prob.difficulty}
                        </span>

                        {/* Language pill */}
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 text-[10px] font-semibold uppercase">
                          {prob.language}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        {prob.courseTitle && (
                          <span className="flex items-center gap-1">
                            <BookOpen size={12} />
                            <span className="truncate">{prob.courseTitle}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{prob.formattedTime}</span>
                        </span>
                        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                          <Zap size={12} />
                          <span>+{prob.points} XP</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Button: Solve Again / Review In Arena */}
                    <button
                      onClick={() => navigate("task", { taskId: prob.taskId })}
                      className="px-3.5 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0 shadow-xs"
                    >
                      <span>Review Code</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty state for the selected day */
              <div className="py-12 px-4 rounded-xl border border-dashed border-slate-200 dark:border-[#1E293B] text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                  <Flame size={24} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No problems recorded on this day
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Consistency creates elite engineers. Solve at least one challenge every day to extend your coding streak!
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => navigate("problems")}
                    className="px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Code2 size={15} />
                    <span>Go to Problem Arena</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
