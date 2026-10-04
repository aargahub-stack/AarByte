import { useState, useEffect } from "react";
import {
  ChevronLeft,
  CheckCircle2,
  Lock,
  Clock,
  ArrowRight,
  Code2,
  BookOpen,
  Loader2,
  Plus,
  Check,
  Play,
  ExternalLink,
  Copy,
  CheckCheck,
  Video,
  Terminal,
} from "lucide-react";
import { courseService } from "@/services/courseService";
import type { CourseWithModules, Task, UserTaskProgress } from "@/types/database.types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { enrollmentStorage } from "@/services/storage/enrollmentStorage";
import { progressStorage } from "@/services/storage/progressStorage";
import { DEMO_COURSES } from "@/data/demoCourses";
import { planStorage } from "@/services/storage/planStorage";
import { ProUpgradeModal } from "@/components/modals/ProUpgradeModal";
import { cn } from "@/utils/cn";

interface CourseDetailsPageProps {
  slug: string;
  navigate: (to: string, params?: Record<string, string>) => void;
}

type ModuleTabMode = "tasks" | "about" | "youtube";

export function CourseDetailsPage({ slug, navigate }: CourseDetailsPageProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [course, setCourse] = useState<CourseWithModules | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, UserTaskProgress>>({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<ModuleTabMode>("tasks");
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProModal, setShowProModal] = useState(false);

  useEffect(() => {
    async function loadCourse() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: courseErr } = await courseService.getCourseBySlug(slug);

        if (courseErr || !data) {
          const { data: allCourses } = await courseService.getCourses();
          const found =
            (allCourses || []).find((c) => c.slug === slug || c.id === slug) ||
            DEMO_COURSES.find((c) => c.slug === slug || c.id === slug);
          if (found) {
            setCourse(found);
            loadProgress(found);
            initActiveModule(found);
          } else {
            setError("Course not found");
          }
        } else {
          setCourse(data);
          loadProgress(data);
          initActiveModule(data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    }

    async function loadProgress(c: CourseWithModules) {
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
        const allTaskIds = c.modules.flatMap((m) => m.tasks.map((t) => t.id));
        const { data: prog } = await courseService.getUserProgress(user.id, allTaskIds);
        if (prog) {
          Object.assign(merged, prog);
        }
      }
      setProgressMap(merged);

      const allTaskIds = c.modules.flatMap((m) => m.tasks.map((t) => t.id));
      const enrolled =
        enrollmentStorage.isEnrolled(c.id, c.slug, allTaskIds) ||
        allTaskIds.some((t) => merged[t]?.is_completed);
      setIsEnrolled(enrolled);
    }

    function initActiveModule(c: CourseWithModules) {
      if (c.modules.length > 0) {
        setActiveModuleId((prev) => {
          if (prev && c.modules.some((m) => m.id === prev)) return prev;
          return c.modules[0].id;
        });
      }
    }

    loadCourse();
  }, [slug, user?.id]);

  const handleToggleEnroll = () => {
    if (!course) return;
    if (isEnrolled) {
      showToast("info", `You are already enrolled in "${course.title}".`);
    } else {
      enrollmentStorage.enroll(course.id);
      if (course.slug) enrollmentStorage.enroll(course.slug);
      setIsEnrolled(true);
      showToast("success", `Successfully enrolled in "${course.title}"!`);
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
    showToast("success", "Code snippet copied to clipboard");
  };

  const getYouTubeEmbedUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    try {
      if (url.includes("embed/")) return url;
      if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1]?.split("?")[0];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (url.includes("watch?v=")) {
        const id = url.split("watch?v=")[1]?.split("&")[0];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      return `https://www.youtube.com/embed/${url}`;
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 bg-[#F7F8FA] dark:bg-[#0C0D0E] text-slate-700 dark:text-zinc-400 font-urbanist">
        <Loader2 size={28} className="animate-spin text-emerald-500 mb-2" />
        <span className="ml-3 text-xs sm:text-sm font-semibold">Loading curriculum workspace...</span>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4 bg-[#F7F8FA] dark:bg-[#0C0D0E] text-center font-urbanist">
        <BookOpen size={40} className="text-zinc-500 mb-4" />
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-[#ECEDEE] mb-2">Track Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-sm mb-6 font-medium">
          The requested curriculum track was not found or is currently unavailable.
        </p>
        <button
          onClick={() => navigate("courses")}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-[#00F076] dark:hover:bg-[#00D96A] dark:text-[#0C0D0E] shadow-sm cursor-pointer transition-all"
        >
          <ChevronLeft size={16} />
          Back to Courses
        </button>
      </div>
    );
  }

  const allTasks = course.modules.flatMap((m) => m.tasks || []);
  const solvedCount = allTasks.filter((t) => progressMap[t.id]?.is_completed).length;
  const progressPercent = allTasks.length > 0 ? Math.round((solvedCount / allTasks.length) * 100) : 0;
  const totalCoursePoints = allTasks.reduce((acc, t) => acc + (t.points || 10), 0);

  const activeModuleIndex = course.modules.findIndex((m) => m.id === activeModuleId);
  const activeModule = course.modules[activeModuleIndex >= 0 ? activeModuleIndex : 0] || course.modules[0];
  const activeModTasks = activeModule?.tasks || [];
  const activeModPoints = activeModTasks.reduce((acc, t) => acc + (t.points || 10), 0);
  const embedUrl = getYouTubeEmbedUrl(activeModule?.youtube_url);

  const isCurrentModulePro =
    activeModule?.is_pro_only ??
    (activeModule?.order_index >= 5 ||
      activeModule?.key_takeaways?.some(
        (k) =>
          k.toLowerCase().includes("pro tier") ||
          k.toLowerCase().includes("pro: true")
      ));

  const activeMcqTasks = activeModTasks.filter(
    (t) =>
      t.task_type === "mcq" ||
      t.title.toLowerCase().startsWith("[mcq]") ||
      t.title.toLowerCase().includes("mcq")
  );

  const activeCodingTasks = activeModTasks.filter(
    (t) =>
      t.task_type !== "mcq" &&
      !t.title.toLowerCase().startsWith("[mcq]") &&
      !t.title.toLowerCase().includes("mcq")
  );

  const renderTaskRow = (task: Task, idx: number, isMcq: boolean) => {
    const isSolved = !!progressMap[task.id]?.is_completed;
    const cleanTitle = task.title.replace(/^\[MCQ\]\s*/i, "");

    return (
      <div
        key={task.id}
        className={cn(
          "flex items-center justify-between py-3 px-4 rounded-xl border transition-all group select-none",
          isSolved
            ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-500/[0.03]"
            : "border-slate-200 dark:border-[#1F2327] bg-white dark:bg-[#131517] hover:border-slate-300 dark:hover:border-zinc-700/80"
        )}
      >
        <div className="flex items-center gap-3.5 min-w-0 pr-3">
          {/* Status Indicator */}
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            {isSolved ? (
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-500">
                {String(idx + 1).padStart(2, "0")}
              </span>
            )}
          </div>

          {/* Title & Language Tag */}
          <div className="min-w-0 flex items-center gap-2.5">
            <span
              onClick={() => navigate("task", { taskId: task.id })}
              className={cn(
                "text-xs sm:text-sm font-semibold transition-colors truncate cursor-pointer",
                isSolved
                  ? "text-slate-800 dark:text-[#ECEDEE] group-hover:text-emerald-600 dark:group-hover:text-[#00F076]"
                  : "text-slate-900 dark:text-[#ECEDEE] group-hover:text-emerald-600 dark:group-hover:text-[#00F076]"
              )}
              title={cleanTitle}
            >
              {cleanTitle}
            </span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/50 shrink-0">
              {task.language}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Difficulty Badge */}
          <span
            className={cn(
              "text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-md border",
              task.difficulty === "easy"
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                : task.difficulty === "medium"
                ? "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                : "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
            )}
          >
            {task.difficulty}
          </span>

          {/* XP Reward */}
          <span className="text-xs font-bold text-slate-700 dark:text-zinc-400 hidden sm:inline-block w-16 text-right">
            +{task.points || 10} XP
          </span>

          {/* Subtle Compact Action Trigger */}
          {isCurrentModulePro && !planStorage.isProUser() ? (
            <button
              type="button"
              onClick={() => setShowProModal(true)}
              className="px-3 py-1 rounded-lg text-xs font-bold border border-amber-400 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Lock size={11} />
              <span>Unlock</span>
            </button>
          ) : isMcq ? (
            <button
              type="button"
              onClick={() => navigate("task", { taskId: task.id })}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer shrink-0",
                isSolved
                  ? "border-slate-300 bg-white dark:bg-transparent dark:border-[#1F2327] text-slate-700 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-600"
                  : "border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-transparent dark:text-[#00F076] dark:hover:bg-emerald-500/10"
              )}
            >
              <span>{isSolved ? "Review" : "Solve"}</span>
              <ArrowRight size={11} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("task", { taskId: task.id })}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shrink-0",
                isSolved
                  ? "border-slate-300 bg-white dark:bg-transparent dark:border-[#1F2327] text-slate-700 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-600"
                  : "border-slate-300 bg-white hover:bg-emerald-50 hover:border-emerald-500 text-slate-800 hover:text-emerald-700 dark:border-emerald-500/40 dark:bg-transparent dark:text-[#00F076] dark:hover:bg-emerald-500/10"
              )}
            >
              <span>Code</span>
              <Play size={10} className="fill-current" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0C0D0E] text-slate-900 dark:text-[#ECEDEE] py-6 px-4 sm:px-6 lg:px-8 font-urbanist transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Breadcrumb & Quick Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1F2327]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate("courses")}
              className="p-2 rounded-xl border border-slate-300 dark:border-[#1F2327] bg-white dark:bg-[#131517] text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shrink-0 shadow-xs"
              title="Back to All Courses"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-zinc-400">
                <span>Curriculum Roadmap</span>
                <span>/</span>
                <span className="text-slate-800 dark:text-zinc-300 font-bold">{course.category || "DSA"}</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-[#ECEDEE] truncate mt-0.5">
                {course.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Progress pill */}
            <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-[#1F2327] bg-white dark:bg-[#131517] shadow-xs">
              <div className="w-20 sm:w-24 h-2 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 dark:bg-[#00F076] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-[#00F076]">
                {solvedCount}/{allTasks.length} Solved ({progressPercent}%)
              </span>
            </div>

            {/* Enroll action */}
            <button
              type="button"
              onClick={handleToggleEnroll}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer",
                isEnrolled
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-[#00F076] dark:border-emerald-500/25"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-[#00F076] dark:hover:bg-[#00D96A] dark:text-[#0C0D0E]"
              )}
            >
              {isEnrolled ? (
                <>
                  <Check size={14} />
                  <span>Enrolled</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Enroll</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2-Column Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (Full-Length Continuous Sticky Sidebar) */}
          <div className="lg:col-span-4 xl:col-span-4 h-full">
            <div className="lg:sticky lg:top-20 rounded-2xl border border-slate-200 dark:border-[#1F2327] bg-white dark:bg-[#131517] p-4 flex flex-col justify-between min-h-[calc(100vh-6.5rem)] shadow-xs">
              {/* Modules Header & Scrollable List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1F2327]">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-300">
                      Curriculum Modules
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5 font-medium">
                      {course.modules.length} Modules Total
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:text-[#00F076] dark:border-emerald-500/25">
                    {totalCoursePoints} XP
                  </span>
                </div>

                {/* Modules Rail */}
                <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1 scrollbar-thin">
                  {course.modules.map((mod, modIdx) => {
                    const isActive = mod.id === activeModuleId;
                    const modTasks = mod.tasks || [];
                    const modSolved = modTasks.filter((t) => progressMap[t.id]?.is_completed).length;
                    const isCompleted = modSolved === modTasks.length && modTasks.length > 0;
                    const isModulePro =
                      mod.is_pro_only ??
                      (mod.order_index >= 5 ||
                        mod.key_takeaways?.some(
                          (k) =>
                            k.toLowerCase().includes("pro tier") ||
                            k.toLowerCase().includes("pro: true")
                        ));

                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => {
                          setActiveModuleId(mod.id);
                          setActiveTab("tasks");
                        }}
                        className={cn(
                          "w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none",
                          isActive
                            ? "border-emerald-600 bg-emerald-50 text-emerald-950 dark:border-[#00F076] dark:bg-[#10B981]/10 dark:text-[#00F076] shadow-xs"
                            : "border-slate-200 dark:border-[#1F2327] bg-slate-50/70 hover:bg-slate-100 dark:bg-[#131517] dark:hover:bg-zinc-900/40 text-slate-900 dark:text-[#ECEDEE]"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Module Index */}
                          <span
                            className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border",
                              isActive
                                ? "bg-emerald-600 text-white dark:bg-[#00F076] dark:text-[#0C0D0E] border-transparent"
                                : isCompleted
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:text-[#00F076] dark:border-emerald-500/20"
                                : "bg-white text-slate-700 border-slate-300 dark:bg-[#1F2327] dark:text-zinc-400 dark:border-zinc-800"
                            )}
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={15} />
                            ) : (
                              String(modIdx + 1).padStart(2, "0")
                            )}
                          </span>

                          {/* Title & Task counts */}
                          <div className="min-w-0">
                            <p
                              className={cn(
                                "text-xs sm:text-sm font-bold truncate leading-tight",
                                isActive
                                  ? "text-emerald-900 dark:text-[#00F076]"
                                  : "text-slate-900 dark:text-[#ECEDEE]"
                              )}
                              title={mod.title}
                            >
                              {mod.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-semibold">
                                {modSolved}/{modTasks.length} Tasks
                              </span>
                              {isModulePro && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-500 dark:border-amber-500/25">
                                  Pro (₹49)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right indicator */}
                        <div className="shrink-0 flex items-center">
                          {isCompleted ? (
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-[#00F076]">
                              Done
                            </span>
                          ) : isModulePro && !planStorage.isProUser() ? (
                            <Lock size={13} className="text-slate-400 dark:text-zinc-600" />
                          ) : (
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                isActive ? "bg-emerald-600 dark:bg-[#00F076]" : "bg-transparent"
                              )}
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Sidebar Footer (Full-Length Anchor) */}
              <div className="pt-4 border-t border-slate-200 dark:border-[#1F2327] mt-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-300">
                  <span>Track Progress</span>
                  <span className="text-emerald-700 dark:text-[#00F076]">
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 dark:bg-[#00F076] rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-zinc-400 font-semibold">
                  <span>{solvedCount} of {allTasks.length} Solved</span>
                  <span className="text-emerald-700 dark:text-[#00F076]">
                    {isEnrolled ? "Enrolled" : "Open Access"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Main Active Workspace) */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-5">
            {/* Active Module Header & Tab Switcher */}
            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#1F2327] bg-white dark:bg-[#131517] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#1F2327]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-[#00F076]">
                    MODULE {String(activeModuleIndex + 1).padStart(2, "0")} • {activeModTasks.length} CHALLENGES • {activeModPoints} XP
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-[#ECEDEE] mt-0.5">
                    {activeModule.title}
                  </h2>
                </div>

                {/* Compact Pill Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] rounded-xl self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab("tasks")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      activeTab === "tasks"
                        ? "bg-white text-emerald-800 shadow-xs border border-slate-200/80 dark:bg-[#1F2327] dark:text-[#00F076] dark:border-transparent"
                        : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <Code2 size={13} />
                    <span>Tasks</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-zinc-300 font-bold">
                      {activeModTasks.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("about")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      activeTab === "about"
                        ? "bg-white text-emerald-800 shadow-xs border border-slate-200/80 dark:bg-[#1F2327] dark:text-[#00F076] dark:border-transparent"
                        : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <BookOpen size={13} />
                    <span>Reading Notes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("youtube")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      activeTab === "youtube"
                        ? "bg-white text-rose-600 shadow-xs border border-slate-200/80 dark:bg-[#1F2327] dark:text-rose-400 dark:border-transparent"
                        : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <Play size={12} className="fill-current" />
                    <span>Video Tutorial</span>
                  </button>
                </div>
              </div>

              {/* Technical description */}
              <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                {activeModule.key_takeaways?.[0] ||
                  activeModule.about_content?.slice(0, 180) ||
                  "Complete all technical challenges in this module to build progressive mastery."}
              </p>
            </div>

            {/* TAB 1: Tasks (MCQs + Coding) */}
            {activeTab === "tasks" && (
              <div className="space-y-6">
                {/* Sub-section 1: Diagnostic MCQs */}
                {activeMcqTasks.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#1F2327]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                          Diagnostic MCQs
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1F2327] text-slate-700 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700/40">
                          {activeMcqTasks.length} Questions
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-semibold">
                        Concept Diagnostics
                      </span>
                    </div>

                    <div className="space-y-2">
                      {activeMcqTasks.map((task, idx) => renderTaskRow(task, idx, true))}
                    </div>
                  </div>
                )}

                {/* Sub-section 2: Hands-on Coding Problems */}
                {activeCodingTasks.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#1F2327]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                          Hands-on Coding Problems
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-[#00F076] dark:border-emerald-500/20">
                          {activeCodingTasks.length} Problems
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-semibold">
                        Algorithmic Execution
                      </span>
                    </div>

                    <div className="space-y-2">
                      {activeCodingTasks.map((task, idx) => renderTaskRow(task, idx, false))}
                    </div>
                  </div>
                )}

                {activeModTasks.length === 0 && (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-[#1F2327] text-slate-600 dark:text-zinc-400 text-xs font-semibold">
                    No technical tasks assigned to this module yet.
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Reading Notes */}
            {activeTab === "about" && (
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#1F2327] bg-white dark:bg-[#131517] space-y-6 shadow-xs">
                {/* Reading Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1F2327] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-[#00F076] dark:border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                      <BookOpen size={13} />
                      <span>Study Guide &amp; Technical Notes</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                      <Clock size={12} />
                      <span>{activeModule.reading_time_mins || 6} min read</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("tasks")}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-[#00F076] hover:underline cursor-pointer"
                  >
                    <span>Jump to Practice Tasks</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {/* Content */}
                <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-800 dark:text-[#ECEDEE] space-y-4 leading-relaxed font-urbanist font-medium">
                  {activeModule.about_content ? (
                    <div className="whitespace-pre-line space-y-3">
                      {activeModule.about_content}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h4 className="text-base font-bold text-slate-900 dark:text-[#ECEDEE]">
                        Understanding {activeModule.title}
                      </h4>
                      <p>
                        A foundational engineering pattern designed to organize data in memory efficiently,
                        ensuring deterministic execution times and minimal memory footprint.
                      </p>
                    </div>
                  )}
                </div>

                {/* Key Takeaways */}
                {activeModule.key_takeaways && activeModule.key_takeaways.length > 0 && (
                  <div className="pt-4 border-t border-slate-200 dark:border-[#1F2327] space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-400 flex items-center gap-1.5">
                      <Terminal size={14} className="text-emerald-600 dark:text-emerald-400" />
                      <span>Key Takeaways &amp; Summary</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeModule.key_takeaways.map((point, kIdx) => (
                        <div
                          key={kIdx}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-xs font-semibold text-slate-800 dark:text-[#ECEDEE] flex items-start gap-2.5"
                        >
                          <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Code Examples */}
                {activeModule.code_examples && activeModule.code_examples.length > 0 && (
                  <div className="pt-4 border-t border-slate-200 dark:border-[#1F2327] space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-400 flex items-center gap-1.5">
                      <Terminal size={14} className="text-emerald-600 dark:text-emerald-400" />
                      <span>Implementation Patterns</span>
                    </h4>
                    <div className="space-y-3">
                      {activeModule.code_examples.map((example, exIdx) => {
                        const codeId = `${activeModule.id}-ex-${exIdx}`;
                        const isCopied = copiedCodeId === codeId;
                        return (
                          <div
                            key={exIdx}
                            className="rounded-2xl border border-slate-300 dark:border-[#1F2327] overflow-hidden bg-[#0C0D0E] text-[#ECEDEE] text-xs"
                          >
                            <div className="px-4 py-2 bg-[#151718] border-b border-[#202425] flex items-center justify-between">
                              <span className="text-[11px] font-bold text-zinc-300">
                                {example.title}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(codeId, example.code)}
                                className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                              >
                                {isCopied ? (
                                  <>
                                    <CheckCheck size={13} className="text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={13} />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-4 overflow-x-auto whitespace-pre leading-relaxed text-[11px] sm:text-xs">
                              <code>{example.code}</code>
                            </pre>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bottom CTA to jump to Tasks */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab("tasks")}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold border border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-transparent dark:text-[#00F076] dark:hover:bg-emerald-500/10 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <span>Start Solving Tasks</span>
                    <Play size={11} className="fill-current" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Video Tutorial */}
            {activeTab === "youtube" && (
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#1F2327] bg-white dark:bg-[#131517] space-y-5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1F2327] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 text-xs font-bold flex items-center gap-1">
                        <Play size={12} className="fill-rose-500 text-rose-500" />
                        <span>Curated Video Lecture</span>
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">1080p HD</span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-[#ECEDEE] mt-1">
                      {activeModule.youtube_title || `${activeModule.title} - Video Tutorial`}
                    </h4>
                  </div>

                  {activeModule.youtube_url && (
                    <a
                      href={activeModule.youtube_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] text-slate-800 dark:text-[#ECEDEE] hover:text-rose-600 text-xs font-bold transition-colors"
                    >
                      <span>Open on YouTube</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                {embedUrl ? (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-300 dark:border-[#1F2327] shadow-lg">
                    <iframe
                      src={embedUrl}
                      title={activeModule.youtube_title || activeModule.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-2xl bg-slate-50 dark:bg-[#0C0D0E] border border-dashed border-slate-300 dark:border-[#1F2327] flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-500 flex items-center justify-center">
                      <Video size={20} />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#ECEDEE]">
                      No video tutorial attached to this module yet.
                    </p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#1F2327] space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-400">
                    Suggested Lecture Timestamps
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">00:00</span>
                      <span>Concept Overview</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">04:15</span>
                      <span>Memory Layout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">09:30</span>
                      <span>Optimizations</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab("tasks")}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold border border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-transparent dark:text-[#00F076] dark:hover:bg-emerald-500/10 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <span>Ready to Code? Start Tasks</span>
                    <Play size={11} className="fill-current" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProUpgradeModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
      />
    </div>
  );
}

export default CourseDetailsPage;
