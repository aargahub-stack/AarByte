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
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
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
    <div className="min-h-screen font-urbanist bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#121314] dark:text-[#ECEDEE] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-7">
        {/* Top Header / Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("dashboard")}
              className="p-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#202425] bg-white dark:bg-[#151718] hover:bg-black/5 dark:hover:bg-white/5 text-[#6B7280] dark:text-[#8A9099] transition-all shadow-xs"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <Flame size={15} />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE]">
                  Daily Coding Streak
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#8A9099] mt-0.5 font-normal">
                Inspect your daily problem solving history, streak momentum, and activity logs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("problems")}
              className="px-4 py-2 rounded-xl bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,240,118,0.2)]"
            >
              <Code2 size={16} />
              <span>Practice Today</span>
            </button>
            <button
              onClick={() => navigate("analytics")}
              className="px-4 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#202425] bg-white dark:bg-[#151718] hover:bg-black/5 dark:hover:bg-white/5 text-[#121314] dark:text-[#ECEDEE] text-xs sm:text-sm font-semibold transition-all shadow-xs"
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
          <div className="rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] dark:text-[#8A9099] uppercase tracking-wider">
                Current Streak
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Flame size={18} strokeWidth={2.2} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#121314] dark:text-[#ECEDEE]">
                {streakData.currentStreak}
              </span>
              <span className="text-xs text-[#6B7280] dark:text-[#8A9099] font-medium">consecutive days</span>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#8A9099] mt-1 truncate">
              {streakData.isSolvedToday ? "Active & verified today" : "Pending challenge today"}
            </p>
          </div>

          {/* Longest Streak */}
          <div className="rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] dark:text-[#8A9099] uppercase tracking-wider">
                Longest Streak
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Trophy size={18} strokeWidth={2.2} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#121314] dark:text-[#ECEDEE]">
                {streakData.longestStreak}
              </span>
              <span className="text-xs text-[#6B7280] dark:text-[#8A9099] font-medium">personal best</span>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#8A9099] mt-1">
              All-time record
            </p>
          </div>

          {/* Active Days */}
          <div className="rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] dark:text-[#8A9099] uppercase tracking-wider">
                Total Active Days
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CalendarIcon size={18} strokeWidth={2.2} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#121314] dark:text-[#ECEDEE]">
                {streakData.activeDatesSet.size}
              </span>
              <span className="text-xs text-[#6B7280] dark:text-[#8A9099] font-medium">practice days</span>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#8A9099] mt-1">
              Days with completed tasks
            </p>
          </div>

          {/* Freeze Days Protection */}
          <div className="rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] dark:text-[#8A9099] uppercase tracking-wider">
                Freeze Protection
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <ShieldCheck size={18} strokeWidth={2.2} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#121314] dark:text-[#ECEDEE]">
                {streakData.freezeDaysAvailable}
              </span>
              <span className="text-xs text-[#6B7280] dark:text-[#8A9099] font-medium">available</span>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#8A9099] mt-1">
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
        {/* ===================================================================
            SECTION 2: CURRENT WEEK CALENDAR STRIP
        =================================================================== */}
        <div className="rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE]">Current Week Calendar</h2>
              <p className="text-xs text-[#6B7280] dark:text-[#8A9099]">Click any day to see the exact problems solved</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#6B7280] dark:text-[#8A9099] border border-[#E5E7EB] dark:border-[#202425]">
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
                      ? "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/10"
                      : "border-[#E5E7EB] dark:border-[#202425] bg-[#F7F8FA] dark:bg-[#0C0D0E] hover:border-emerald-500/40"
                  )}
                >
                  <span className={cn("text-xs font-semibold", wd.isToday ? "text-emerald-600 dark:text-[#00F076] font-bold" : "text-zinc-400")}>
                    {wd.label}
                  </span>
                  <div
                    className={cn(
                      "w-8 h-8 sm:w-9 sm:h-9 my-1.5 rounded-lg flex items-center justify-center text-xs font-bold transition-all relative",
                      isCompleted
                        ? "bg-gradient-to-br from-emerald-500 to-[#00F076] text-[#0C0D0E] shadow-xs"
                        : wd.isToday
                        ? "bg-[#00F076] text-[#0C0D0E] shadow-xs ring-2 ring-emerald-400/40"
                        : wd.status === "missed"
                        ? "bg-[#E5E7EB] dark:bg-[#202425] text-zinc-400"
                        : "bg-white dark:bg-[#151718] text-zinc-400 border border-dashed border-[#E5E7EB] dark:border-[#202425]"
                    )}
                  >
                    {isCompleted ? <CheckCircle2 size={16} /> : wd.dayNum}
                  </div>
                  <span className="text-[10px] font-semibold text-[#6B7280] dark:text-[#8A9099] truncate max-w-full">
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
          <div className="lg:col-span-1 rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#202425] pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} className="text-emerald-500" />
                <h3 className="text-sm font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE]">Active History</h3>
              </div>
              <span className="text-xs text-[#6B7280] dark:text-[#8A9099] font-medium">
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
                        ? "border-[#00F076] bg-emerald-500/10 ring-1 ring-[#00F076]/30"
                        : "border-[#E5E7EB] dark:border-[#202425] hover:bg-[#F7F8FA] dark:hover:bg-[#0C0D0E]"
                    )}
                  >
                    <div>
                      <div className="text-xs font-bold text-[#121314] dark:text-[#ECEDEE] flex items-center gap-1.5">
                        <span>{dateStr}</span>
                        {isToday && (
                          <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] text-[10px] font-semibold border border-emerald-500/20">
                            Today
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6B7280] dark:text-[#8A9099] mt-0.5">
                        {count === 1 ? "1 challenge solved" : `${count} challenges solved`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {count > 0 ? (
                        <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-[#00F076] flex items-center justify-center text-xs font-bold">
                          {count}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400">0</span>
                      )}
                      <ChevronRight size={14} className="text-zinc-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Problems List for the Selected Date */}
          <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] p-5 sm:p-6 space-y-5 shadow-xs">
            {/* Header for Day Detail */}
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#E5E7EB] dark:border-[#202425] pb-4">
              <div>
                <span className="text-xs font-semibold uppercase text-emerald-600 dark:text-[#00F076] tracking-wider">
                  Day Activity Details
                </span>
                <h2 className="text-lg font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE] mt-0.5">
                  {formatFriendlyDate(selectedDate)}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#00F076]">
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
                    className="p-4 rounded-xl border border-[#E5E7EB] dark:border-[#202425] bg-[#F7F8FA] dark:bg-[#0C0D0E] hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-[#00F076] flex items-center justify-center shrink-0">
                          <CheckCircle2 size={13} strokeWidth={2.5} />
                        </span>
                        <h4 className="text-sm font-bold text-[#121314] dark:text-[#ECEDEE] group-hover:text-emerald-500 dark:group-hover:text-[#00F076] transition-colors truncate">
                          {prob.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border-emerald-500/20">
                          {prob.difficulty}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">
                          {prob.language}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#6B7280] dark:text-[#8A9099]">
                        <span>Track: {prob.courseTitle}</span>
                        <span>•</span>
                        <span className="text-amber-500 font-semibold">+{prob.points} XP Earned</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate("task", { taskId: prob.taskId })}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] text-[#121314] dark:text-[#ECEDEE] hover:border-emerald-500/50 hover:text-emerald-500 transition-all shrink-0"
                    >
                      <span>Practice Again</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4 space-y-3">
                <p className="text-sm text-[#6B7280] dark:text-[#8A9099]">
                  No problems recorded on this date.
                </p>
                <button
                  onClick={() => navigate("problems")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] font-semibold text-xs transition-all shadow-[0_0_15px_rgba(0,240,118,0.2)]"
                >
                  <Code2 size={14} />
                  <span>Solve a Challenge Today</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StreakPage;
