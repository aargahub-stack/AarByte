import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Lock,
  PlayCircle,
  Clock,
  Zap,
  ArrowRight,
  Code2,
  BookOpen,
  Trophy,
  Loader2,
  Plus,
  Check,
  GraduationCap,
  Play,
  ExternalLink,
  Copy,
  CheckCheck,
  Video,
  FileText,
  Lightbulb,
  Terminal,
  Layers,
} from "lucide-react";
import { courseService } from "@/services/courseService";
import type { CourseWithModules, Task, UserTaskProgress, Module } from "@/types/database.types";
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

type ModuleTabMode = "about" | "youtube" | "tasks";

export function CourseDetailsPage({ slug, navigate }: CourseDetailsPageProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [course, setCourse] = useState<CourseWithModules | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, UserTaskProgress>>({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [moduleTabs, setModuleTabs] = useState<Record<string, ModuleTabMode>>({});
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
          // Fallback if not found in db yet
          const { data: allCourses } = await courseService.getCourses();
          const found =
            (allCourses || []).find((c) => c.slug === slug || c.id === slug) ||
            DEMO_COURSES.find((c) => c.slug === slug || c.id === slug);
          if (found) {
            setCourse(found);
            initAccordion(found);
            loadProgress(found);
          } else {
            setError("Course not found");
          }
        } else {
          setCourse(data);
          initAccordion(data);
          loadProgress(data);
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

    function initAccordion(c: CourseWithModules) {
      // By default open the first 2 modules
      const initial: Record<string, boolean> = {};
      const initialTabs: Record<string, ModuleTabMode> = {};
      c.modules.forEach((mod, idx) => {
        initial[mod.id] = idx < 2;
        // Default to "tasks" or "about"
        initialTabs[mod.id] = "tasks";
      });
      setExpandedModules(initial);
      setModuleTabs(initialTabs);
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

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const setModuleTab = (moduleId: string, tab: ModuleTabMode) => {
    setModuleTabs((prev) => ({
      ...prev,
      [moduleId]: tab,
    }));
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
    showToast("success", "Code snippet copied to clipboard");
  };

  // Convert standard YouTube URLs to Embed URLs
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
      <div className="min-h-screen flex items-center justify-center py-20 bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#6B7280] dark:text-[#8A9099] font-urbanist">
        <Loader2 size={32} className="animate-spin text-emerald-500 mb-2" />
        <span className="ml-3 text-sm font-medium">Loading course curriculum...</span>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4 bg-[#F7F8FA] dark:bg-[#0C0D0E] text-center font-urbanist">
        <BookOpen size={48} className="text-zinc-400 mb-4" />
        <h2 className="text-xl font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE] mb-2">Track Not Found</h2>
        <p className="text-sm text-[#6B7280] dark:text-[#8A9099] max-w-sm mb-6">
          The requested course track was not found or is currently unavailable.
        </p>
        <button
          onClick={() => navigate("courses")}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] shadow-sm"
        >
          <ChevronLeft size={16} />
          Back to Courses Catalog
        </button>
      </div>
    );
  }

  const allTasks = course.modules.flatMap((m) => m.tasks);
  const solvedCount = allTasks.filter((t) => progressMap[t.id]?.is_completed).length;
  const progressPercent = allTasks.length > 0 ? Math.round((solvedCount / allTasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#121314] dark:text-[#ECEDEE] py-8 px-4 sm:px-6 lg:px-8 font-urbanist transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back Button */}
        <div>
          <button
            onClick={() => navigate("courses")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B7280] dark:text-[#8A9099] hover:text-[#121314] dark:hover:text-[#ECEDEE] transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Back to All Courses</span>
          </button>
        </div>

        {/* Course Header Banner */}
        <div className="rounded-3xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#00F076] text-xs font-semibold">
                <Code2 size={13} />
                <span>Interactive Learning Roadmap</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#121314] dark:text-[#ECEDEE] tracking-tight">
                {course.title}
              </h1>
              <p className="text-sm text-[#6B7280] dark:text-[#8A9099] leading-relaxed font-normal">
                {course.description || "Master these concepts sequentially by solving real coding tasks."}
              </p>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleEnroll}
                  className={cn(
                    "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm",
                    isEnrolled
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border border-emerald-500/25 cursor-default"
                      : "bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] shadow-[0_0_20px_rgba(0,240,118,0.22)] active:scale-95"
                  )}
                >
                  {isEnrolled ? (
                    <>
                      <Check size={16} />
                      <span>Enrolled Track</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Enroll in Track</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Stats Box */}
            <div className="bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425] rounded-2xl p-5 min-w-[240px] space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-[#6B7280] dark:text-[#8A9099]">
                <span>Progress Overview</span>
                <span className={cn(progressPercent === 100 ? "text-emerald-500 font-bold" : "text-[#121314] dark:text-[#ECEDEE]")}>
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E5E7EB] dark:bg-[#202425] overflow-hidden">
                <div
                  className="h-full bg-[#00F076] transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-[#6B7280] dark:text-[#8A9099] pt-1 font-medium">
                <span>{solvedCount} of {allTasks.length} Solved</span>
                <span className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Zap size={12} className="fill-amber-500/20" />
                  {allTasks.reduce((acc, t) => acc + (t.points || 10), 0)} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modules & Tasks Accordion with 3 Learning Modes */}
        {/* Modules & Tasks Accordion with 3 Learning Modes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE] flex items-center gap-2">
              <span>Curriculum Roadmap</span>
              <span className="text-xs text-[#6B7280] dark:text-[#8A9099] font-medium">
                ({course.modules.length} {course.modules.length === 1 ? "Module" : "Modules"})
              </span>
            </h2>
          </div>

          {course.modules.map((mod, modIdx) => {
            const isExpanded = !!expandedModules[mod.id];
            const activeTab = moduleTabs[mod.id] || "tasks";
            const modTasks = mod.tasks || [];
            const modSolved = modTasks.filter((t) => progressMap[t.id]?.is_completed).length;
            const isModulePro =
              mod.is_pro_only ??
              (mod.order_index >= 5 ||
                mod.key_takeaways?.some(
                  (k) =>
                    k.toLowerCase().includes("pro tier") ||
                    k.toLowerCase().includes("pro: true")
                ));

            const embedUrl = getYouTubeEmbedUrl(mod.youtube_url);

            return (
              <div
                key={mod.id}
                className="rounded-3xl border border-[#E5E7EB] dark:border-[#202425] bg-white dark:bg-[#151718] overflow-hidden shadow-xs transition-all"
              >
                {/* Module Header Bar */}
                <button
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#00F076] flex items-center justify-center font-bold text-sm">
                      {modIdx + 1}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE]">
                          {mod.title}
                        </h3>
                        {isModulePro ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                            <Lock size={10} /> Pro (₹49)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#00F076] text-[10px] font-bold uppercase tracking-wider">
                            Free Starter
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B7280] dark:text-[#8A9099] font-medium">
                        {modSolved}/{modTasks.length} Completed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-xs font-semibold">
                      {modSolved === modTasks.length && modTasks.length > 0 ? (
                        <span className="text-emerald-500 flex items-center gap-1 font-bold">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      ) : null}
                    </div>
                    <div className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </button>

                {/* Expanded Module Content: 3 Learning Modes */}
                {isExpanded && (
                  <div className="border-t border-[#E5E7EB] dark:border-[#202425] bg-[#F7F8FA] dark:bg-[#0C0D0E]/60 p-4 sm:p-6 space-y-5">
                    {/* =========================================================
                        3 MODE TABS SELECTOR (About Topic | YouTube | Practice / Solve)
                    ========================================================= */}
                    <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] rounded-2xl w-full sm:w-fit overflow-x-auto scrollbar-none max-w-full shadow-xs">
                      {/* Tab 1: About Topic (Read & Gain) */}
                      <button
                        type="button"
                        onClick={() => setModuleTab(mod.id, "about")}
                        className={cn(
                          "flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 whitespace-nowrap",
                          activeTab === "about"
                            ? "bg-[#00F076] text-[#0C0D0E] shadow-sm font-semibold"
                            : "text-[#6B7280] dark:text-[#8A9099] hover:text-[#121314] dark:hover:text-[#ECEDEE]"
                        )}
                      >
                        <BookOpen size={14} className={cn(activeTab === "about" ? "text-[#0C0D0E]" : "text-emerald-500")} />
                        <span>About Topic</span>
                        <span className={cn(
                          "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full",
                          activeTab === "about" ? "bg-black/15 text-[#0C0D0E]" : "bg-emerald-500/10 text-emerald-600 dark:text-[#00F076]"
                        )}>
                          Read &amp; Gain
                        </span>
                      </button>

                      {/* Tab 2: YouTube Video Tutorial */}
                      <button
                        type="button"
                        onClick={() => setModuleTab(mod.id, "youtube")}
                        className={cn(
                          "flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 whitespace-nowrap",
                          activeTab === "youtube"
                            ? "bg-rose-500 text-white shadow-sm font-semibold"
                            : "text-[#6B7280] dark:text-[#8A9099] hover:text-[#121314] dark:hover:text-[#ECEDEE]"
                        )}
                      >
                        <Play size={14} className={cn("fill-current", activeTab === "youtube" ? "text-white" : "text-rose-500")} />
                        <span>Video Tutorial</span>
                        <span className={cn(
                          "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full",
                          activeTab === "youtube" ? "bg-white/20 text-white" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        )}>
                          YouTube
                        </span>
                      </button>

                      {/* Tab 3: Practice & Solve (Hands-on Coding) */}
                      <button
                        type="button"
                        onClick={() => setModuleTab(mod.id, "tasks")}
                        className={cn(
                          "flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 whitespace-nowrap",
                          activeTab === "tasks"
                            ? "bg-[#00F076] text-[#0C0D0E] shadow-sm font-semibold"
                            : "text-[#6B7280] dark:text-[#8A9099] hover:text-[#121314] dark:hover:text-[#ECEDEE]"
                        )}
                      >
                        <Code2 size={14} className={cn(activeTab === "tasks" ? "text-[#0C0D0E]" : "text-emerald-500")} />
                        <span>Practice / Solve</span>
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                          activeTab === "tasks" ? "bg-black/15 text-[#0C0D0E]" : "bg-emerald-500/10 text-emerald-600 dark:text-[#00F076]"
                        )}>
                          {modSolved}/{modTasks.length} Solved
                        </span>
                      </button>
                    </div>

                    {/* =========================================================
                        MODE 1 VIEW: ABOUT TOPIC (READ & GAIN BOOK MODE)
                    ========================================================= */}
                    {activeTab === "about" && (
                      <div className="space-y-6 rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] p-6 shadow-xs">
                        {/* Reading Header Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] dark:border-[#202425] pb-4">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/20">
                              <BookOpen size={13} />
                              <span>Study Guide &amp; Technical Reference</span>
                            </span>
                            <span className="text-xs font-medium text-[#6B7280] dark:text-[#8A9099] flex items-center gap-1">
                              <Clock size={12} />
                              <span>{mod.reading_time_mins || 6} min read</span>
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setModuleTab(mod.id, "tasks")}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-[#00F076] hover:underline"
                          >
                            <span>Ready to code? Jump to practice</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>

                        {/* Study Guide Content (Book Style) */}
                        <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-[#121314] dark:text-[#ECEDEE] space-y-4 leading-relaxed font-sans">
                          {mod.about_content ? (
                            <div className="whitespace-pre-line space-y-3">
                              {mod.about_content}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <h4 className="text-base font-bold text-[#121314] dark:text-[#ECEDEE]">
                                Understanding {mod.title}
                              </h4>
                              <p>
                                <strong>What is this topic?</strong> A foundational concept in software
                                engineering and computer science designed to organize data in memory efficiently,
                                allowing fast lookups, low latency searches, and predictable memory footprint.
                              </p>

                              <h5 className="text-sm font-semibold text-[#121314] dark:text-[#ECEDEE] pt-2">
                                Where and why do we use it?
                              </h5>
                              <ul className="list-disc pl-5 space-y-1">
                                <li>
                                  <strong>High Scale Backends:</strong> Optimizes cache hits and database query
                                  lookups.
                                </li>
                                <li>
                                  <strong>Low Latency Processing:</strong> Eliminates nested quadratic loops ($O(N^2)$)
                                  to achieve instant $O(N)$ linear or $O(\log N)$ logarithmic runtimes.
                                </li>
                                <li>
                                  <strong>Technical Coding Rounds:</strong> Core pattern tested by FAANG and tier-1
                                  engineering teams globally.
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Key Takeaways Section */}
                        {mod.key_takeaways && mod.key_takeaways.length > 0 && (
                          <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#202425] space-y-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#8A9099] flex items-center gap-1.5">
                              <Lightbulb size={14} className="text-amber-500" />
                              <span>Key Takeaways &amp; Executive Summary</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {mod.key_takeaways.map((point, kIdx) => (
                                <div
                                  key={kIdx}
                                  className="p-3 rounded-xl bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425] text-xs font-medium text-[#121314] dark:text-[#ECEDEE] flex items-start gap-2.5"
                                >
                                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                                  <span>{point}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Interactive Code Examples */}
                        {mod.code_examples && mod.code_examples.length > 0 && (
                          <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#202425] space-y-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#8A9099] flex items-center gap-1.5">
                              <Terminal size={14} className="text-emerald-500" />
                              <span>Implementation Code Examples</span>
                            </h4>
                            <div className="space-y-3">
                              {mod.code_examples.map((example, exIdx) => {
                                const codeId = `${mod.id}-ex-${exIdx}`;
                                const isCopied = copiedCodeId === codeId;
                                return (
                                  <div
                                    key={exIdx}
                                    className="rounded-2xl border border-[#E5E7EB] dark:border-[#202425] overflow-hidden bg-[#0C0D0E] text-[#ECEDEE] font-mono text-xs"
                                  >
                                    <div className="px-4 py-2.5 bg-[#151718] border-b border-[#202425] flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                                        <span className="text-[11px] font-semibold text-zinc-400 pl-2">
                                          {example.title}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyCode(codeId, example.code)}
                                        className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] font-sans font-semibold"
                                      >
                                        {isCopied ? (
                                          <>
                                            <CheckCheck size={13} className="text-emerald-400" />
                                            <span className="text-emerald-400">Copied!</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy size={13} />
                                            <span>Copy Snippet</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <pre className="p-4 overflow-x-auto whitespace-pre leading-relaxed text-[11px] sm:text-xs">
                                      {example.code}
                                    </pre>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Bottom Jump CTA */}
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setModuleTab(mod.id, "tasks")}
                            className="px-5 py-2.5 rounded-xl bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] text-xs font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,118,0.22)] transition-all"
                          >
                            <span>Start Solving Challenges in {mod.title}</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* =========================================================
                        MODE 2 VIEW: YOUTUBE VIDEO TUTORIAL MODE
                    ========================================================= */}
                    {activeTab === "youtube" && (
                      <div className="rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] p-5 sm:p-6 space-y-5 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] dark:border-[#202425] pb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1 border border-rose-500/20">
                                <Play size={12} className="fill-rose-500 text-rose-500" />
                                <span>Curated Video Lecture</span>
                              </span>
                              <span className="text-xs font-medium text-zinc-400">1080p Full HD</span>
                            </div>
                            <h4 className="text-sm sm:text-base font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE] mt-1">
                              {mod.youtube_title || `${mod.title} - Video Tutorial`}
                            </h4>
                          </div>

                          {mod.youtube_url && (
                            <a
                              href={mod.youtube_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425] text-[#121314] dark:text-[#ECEDEE] hover:text-rose-500 text-xs font-semibold transition-colors"
                            >
                              <span>Open on YouTube</span>
                              <ExternalLink size={13} />
                            </a>
                          )}
                        </div>

                        {/* Responsive Video Embed Player */}
                        {embedUrl ? (
                          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-[#202425] shadow-xl">
                            <iframe
                              src={embedUrl}
                              title={mod.youtube_title || mod.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full border-0"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video rounded-2xl bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-dashed border-[#E5E7EB] dark:border-[#202425] flex flex-col items-center justify-center p-6 text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                              <Video size={24} />
                            </div>
                            <p className="text-sm font-semibold text-[#121314] dark:text-[#ECEDEE]">
                              No video tutorial linked for this module yet.
                            </p>
                            <p className="text-xs text-[#6B7280] dark:text-[#8A9099] max-w-sm">
                              Admins can paste any YouTube URL from the Admin Control Center to embed
                              video lectures directly here.
                            </p>
                          </div>
                        )}

                        {/* Video Timestamps & Lecture Notes */}
                        <div className="p-4 rounded-xl bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425] space-y-2">
                          <h5 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#8A9099]">
                            Suggested Lecture Timestamps
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-medium text-[#6B7280] dark:text-[#8A9099]">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-emerald-500 font-bold">00:00</span>
                              <span>Core Intuition &amp; Concept</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-emerald-500 font-bold">04:15</span>
                              <span>Memory Layout &amp; Addresses</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-emerald-500 font-bold">09:30</span>
                              <span>Algorithmic Optimization</span>
                            </div>
                          </div>
                        </div>

                        {/* Jump to tasks CTA */}
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setModuleTab(mod.id, "tasks")}
                            className="px-5 py-2.5 rounded-xl bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] text-xs font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,118,0.22)] transition-all"
                          >
                            <span>Ready to Code? Start Practice</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* =========================================================
                        MODE 3 VIEW: PRACTICE / SOLVE (CODING TASKS LIST / CHECKPOINTS)
                    ========================================================= */}
                    {activeTab === "tasks" && (
                      <div className="rounded-2xl border border-[#E5E7EB] dark:border-[#202425] bg-white dark:bg-[#151718] divide-y divide-[#E5E7EB] dark:divide-[#202425] overflow-hidden shadow-xs">
                        {modTasks.length === 0 ? (
                          <p className="px-6 py-8 text-xs text-zinc-400 italic text-center">
                            No coding tasks added in this module yet.
                          </p>
                        ) : (
                          modTasks.map((task, taskIdx) => {
                            const isSolved = !!progressMap[task.id]?.is_completed;
                            const difficultyColor =
                              task.difficulty === "easy"
                                ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                                : task.difficulty === "medium"
                                ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                                : "text-rose-500 bg-rose-500/10 border-rose-500/20";

                            return (
                              <div
                                key={task.id}
                                className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F7F8FA] dark:hover:bg-[#0C0D0E]/60 transition-colors group"
                              >
                                <div className="flex items-center gap-3.5 min-w-0">
                                  {/* Solved Status Indicator (Green circle checkmark) */}
                                  <div>
                                    {isSolved ? (
                                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center ring-2 ring-emerald-500/20">
                                        <CheckCircle2 size={16} />
                                      </div>
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-[#F7F8FA] dark:bg-[#0C0D0E] text-zinc-400 flex items-center justify-center text-xs font-semibold border border-[#E5E7EB] dark:border-[#202425]">
                                        {taskIdx + 1}
                                      </div>
                                    )}
                                  </div>

                                  <div className="truncate">
                                    <h4 className="text-sm font-semibold text-[#121314] dark:text-[#ECEDEE] group-hover:text-emerald-500 dark:group-hover:text-[#00F076] transition-colors truncate">
                                      {task.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span
                                        className={cn(
                                          "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border",
                                          difficultyColor
                                        )}
                                      >
                                        {task.difficulty}
                                      </span>
                                      <span className="text-[10px] text-zinc-400 uppercase font-mono font-medium">
                                        {task.language}
                                      </span>
                                      <span className="text-[11px] text-amber-500 font-semibold">
                                        +{task.points} XP
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Action Button */}
                                <div className="flex items-center justify-end w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-[#E5E7EB] dark:border-[#202425]">
                                  {isModulePro && !planStorage.isProUser() ? (
                                    <button
                                      type="button"
                                      onClick={() => setShowProModal(true)}
                                      className="w-full sm:w-auto justify-center flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 min-h-[38px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                                    >
                                      <Lock size={13} />
                                      <span>Unlock with Pro</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => navigate("task", { taskId: task.id })}
                                      className={cn(
                                        "w-full sm:w-auto justify-center flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 min-h-[38px]",
                                        isSolved
                                          ? "bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425] text-[#121314] dark:text-[#ECEDEE] hover:border-emerald-500/50 hover:text-emerald-500"
                                          : "bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] shadow-[0_0_15px_rgba(0,240,118,0.2)] active:scale-95"
                                      )}
                                    >
                                      <span>{isSolved ? "Practice Again" : "Solve Challenge"}</span>
                                      <ArrowRight
                                        size={13}
                                        className="group-hover:translate-x-0.5 transition-transform"
                                      />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
