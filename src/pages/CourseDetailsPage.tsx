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
            (allCourses || []).find((c) => c.slug === slug) ||
            DEMO_COURSES.find((c) => c.slug === slug);
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
      <div className="min-h-screen flex items-center justify-center py-20 bg-gray-50/50 dark:bg-gray-950 text-gray-500 font-urbanist">
        <Loader2 size={32} className="animate-spin text-blue-600 mb-2" />
        <span className="ml-3 text-sm font-medium">Loading course curriculum...</span>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4 bg-gray-50/50 dark:bg-gray-950 text-center font-urbanist">
        <BookOpen size={48} className="text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Track Not Found</h2>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          The requested course track was not found or is currently unavailable.
        </p>
        <button
          onClick={() => navigate("courses")}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
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
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#070A12] text-slate-900 dark:text-white py-8 px-4 sm:px-6 lg:px-8 font-urbanist transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back Button */}
        <div>
          <button
            onClick={() => navigate("courses")}
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Back to All Courses</span>
          </button>
        </div>

        {/* Course Header Banner */}
        <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E293B] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[#6366F1] dark:text-indigo-400 text-xs font-bold">
                <Code2 size={13} />
                <span>Interactive Learning Roadmap</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {course.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                {course.description || "Master these concepts sequentially by solving real coding tasks."}
              </p>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleEnroll}
                  className={cn(
                    "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm",
                    isEnrolled
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 cursor-default"
                      : "bg-gradient-to-r from-[#6366F1] to-[#7C3AED] text-white hover:opacity-95 shadow-indigo-500/25 active:scale-95"
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
            <div className="bg-gray-50 dark:bg-[#070A12] border border-gray-200 dark:border-[#1E293B] rounded-2xl p-5 min-w-[240px] space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400">
                <span>Progress Overview</span>
                <span className={cn(progressPercent === 100 ? "text-emerald-500 font-bold" : "text-[#6366F1] dark:text-indigo-400")}>
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#6366F1] to-[#7C3AED] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 pt-1 font-semibold">
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Curriculum Roadmap</span>
              <span className="text-xs text-gray-500 font-semibold">
                ({course.modules.length} {course.modules.length === 1 ? "Module" : "Modules"})
              </span>
            </h2>
          </div>

          {course.modules.map((mod, modIdx) => {
            const isExpanded = !!expandedModules[mod.id];
            const activeTab = moduleTabs[mod.id] || "tasks";
            const modTasks = mod.tasks || [];
            const modSolved = modTasks.filter((t) => progressMap[t.id]?.is_completed).length;

            const embedUrl = getYouTubeEmbedUrl(mod.youtube_url);

            return (
              <div
                key={mod.id}
                className="rounded-3xl border border-gray-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] overflow-hidden shadow-sm transition-all"
              >
                {/* Module Header Bar */}
                <button
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[#6366F1] dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                      {modIdx + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
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
                    <div className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </button>

                {/* Expanded Module Content: 3 Learning Modes */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-[#1E293B] bg-gray-50/30 dark:bg-[#070A12]/50 p-4 sm:p-6 space-y-5">
                    {/* =========================================================
                        3 MODE TABS SELECTOR (About Topic | YouTube | Practice / Solve)
                    ========================================================= */}
                    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-100 dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E293B] rounded-2xl w-fit">
                      {/* Tab 1: About Topic (Read & Gain) */}
                      <button
                        type="button"
                        onClick={() => setModuleTab(mod.id, "about")}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                          activeTab === "about"
                            ? "bg-white dark:bg-[#1E293B] text-[#6366F1] dark:text-indigo-300 shadow-sm border border-gray-200/80 dark:border-indigo-500/30"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        )}
                      >
                        <BookOpen size={14} className="text-[#6366F1]" />
                        <span>About Topic</span>
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-[#6366F1] dark:text-indigo-300">
                          Read &amp; Gain
                        </span>
                      </button>

                      {/* Tab 2: YouTube Video Tutorial */}
                      <button
                        type="button"
                        onClick={() => setModuleTab(mod.id, "youtube")}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                          activeTab === "youtube"
                            ? "bg-white dark:bg-[#1E293B] text-rose-600 dark:text-rose-400 shadow-sm border border-gray-200/80 dark:border-rose-500/30"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        )}
                      >
                        <Play size={14} className="fill-rose-500 text-rose-500" />
                        <span>Video Tutorial</span>
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          YouTube
                        </span>
                      </button>

                      {/* Tab 3: Practice & Solve (Hands-on Coding) */}
                      <button
                        type="button"
                        onClick={() => setModuleTab(mod.id, "tasks")}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                          activeTab === "tasks"
                            ? "bg-white dark:bg-[#1E293B] text-emerald-600 dark:text-emerald-400 shadow-sm border border-gray-200/80 dark:border-emerald-500/30"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        )}
                      >
                        <Code2 size={14} className="text-emerald-500" />
                        <span>Practice / Solve</span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {modSolved}/{modTasks.length} Solved
                        </span>
                      </button>
                    </div>

                    {/* =========================================================
                        MODE 1 VIEW: ABOUT TOPIC (READ & GAIN BOOK MODE)
                    ========================================================= */}
                    {activeTab === "about" && (
                      <div className="space-y-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200/90 dark:border-[#1E293B] p-6 shadow-xs">
                        {/* Reading Header Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-[#1E293B] pb-4">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-[#6366F1] dark:text-indigo-300 text-xs font-extrabold flex items-center gap-1.5">
                              <BookOpen size={13} />
                              <span>Study Guide &amp; Technical Reference</span>
                            </span>
                            <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                              <Clock size={12} />
                              <span>{mod.reading_time_mins || 6} min read</span>
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setModuleTab(mod.id, "tasks")}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#6366F1] hover:underline"
                          >
                            <span>Ready to code? Jump to practice</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>

                        {/* Study Guide Content (Book Style) */}
                        <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-gray-700 dark:text-gray-300 space-y-4 leading-relaxed font-sans">
                          {mod.about_content ? (
                            <div className="whitespace-pre-line space-y-3">
                              {mod.about_content}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <h4 className="text-base font-extrabold text-gray-900 dark:text-white">
                                Understanding {mod.title}
                              </h4>
                              <p>
                                <strong>What is this topic?</strong> A foundational concept in software
                                engineering and computer science designed to organize data in memory efficiently,
                                allowing fast lookups, low latency searches, and predictable memory footprint.
                              </p>

                              <h5 className="text-sm font-bold text-gray-900 dark:text-white pt-2">
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
                          <div className="pt-4 border-t border-gray-100 dark:border-[#1E293B] space-y-3">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <Lightbulb size={14} className="text-amber-500" />
                              <span>Key Takeaways &amp; Executive Summary</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {mod.key_takeaways.map((point, kIdx) => (
                                <div
                                  key={kIdx}
                                  className="p-3 rounded-xl bg-slate-50 dark:bg-[#070A12] border border-slate-200/70 dark:border-[#1E293B] text-xs font-medium text-slate-700 dark:text-slate-300 flex items-start gap-2.5"
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
                          <div className="pt-4 border-t border-gray-100 dark:border-[#1E293B] space-y-3">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <Terminal size={14} className="text-[#6366F1]" />
                              <span>Implementation Code Examples</span>
                            </h4>
                            <div className="space-y-3">
                              {mod.code_examples.map((example, exIdx) => {
                                const codeId = `${mod.id}-ex-${exIdx}`;
                                const isCopied = copiedCodeId === codeId;
                                return (
                                  <div
                                    key={exIdx}
                                    className="rounded-2xl border border-slate-200 dark:border-[#1E293B] overflow-hidden bg-slate-900 text-slate-100 font-mono text-xs"
                                  >
                                    <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                                        <span className="text-[11px] font-bold text-slate-400 pl-2">
                                          {example.title}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyCode(codeId, example.code)}
                                        className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] font-sans font-bold"
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
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all"
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
                      <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200/90 dark:border-[#1E293B] p-5 sm:p-6 space-y-5 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-[#1E293B] pb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-extrabold flex items-center gap-1">
                                <Play size={12} className="fill-rose-500 text-rose-500" />
                                <span>Curated Video Lecture</span>
                              </span>
                              <span className="text-xs font-bold text-gray-400">1080p Full HD</span>
                            </div>
                            <h4 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white mt-1">
                              {mod.youtube_title || `${mod.title} - Video Tutorial`}
                            </h4>
                          </div>

                          {mod.youtube_url && (
                            <a
                              href={mod.youtube_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#070A12] border border-slate-200/80 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 hover:text-rose-500 text-xs font-bold transition-colors"
                            >
                              <span>Open on YouTube</span>
                              <ExternalLink size={13} />
                            </a>
                          )}
                        </div>

                        {/* Responsive Video Embed Player */}
                        {embedUrl ? (
                          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-xl">
                            <iframe
                              src={embedUrl}
                              title={mod.youtube_title || mod.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full border-0"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video rounded-2xl bg-slate-100 dark:bg-[#070A12] border border-dashed border-slate-200 dark:border-[#1E293B] flex flex-col items-center justify-center p-6 text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                              <Video size={24} />
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                              No video tutorial linked for this module yet.
                            </p>
                            <p className="text-xs text-slate-400 max-w-sm">
                              Admins can paste any YouTube URL from the Admin Control Center to embed
                              video lectures directly here.
                            </p>
                          </div>
                        )}

                        {/* Video Timestamps & Lecture Notes */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070A12] border border-slate-200/70 dark:border-[#1E293B] space-y-2">
                          <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                            Suggested Lecture Timestamps
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[#6366F1] font-bold">00:00</span>
                              <span>Core Intuition &amp; Concept</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[#6366F1] font-bold">04:15</span>
                              <span>Memory Layout &amp; Addresses</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[#6366F1] font-bold">09:30</span>
                              <span>Algorithmic Optimization</span>
                            </div>
                          </div>
                        </div>

                        {/* Jump to tasks CTA */}
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setModuleTab(mod.id, "tasks")}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all"
                          >
                            <span>Ready to Code? Start Practice</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* =========================================================
                        MODE 3 VIEW: PRACTICE / SOLVE (CODING TASKS LIST)
                    ========================================================= */}
                    {activeTab === "tasks" && (
                      <div className="rounded-2xl border border-gray-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] divide-y divide-gray-100 dark:divide-[#1E293B] overflow-hidden shadow-xs">
                        {modTasks.length === 0 ? (
                          <p className="px-6 py-8 text-xs text-gray-400 italic text-center">
                            No coding tasks added in this module yet.
                          </p>
                        ) : (
                          modTasks.map((task, taskIdx) => {
                            const isSolved = !!progressMap[task.id]?.is_completed;
                            const difficultyColor =
                              task.difficulty === "easy"
                                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/20"
                                : task.difficulty === "medium"
                                ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-500/20"
                                : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-500/20";

                            return (
                              <div
                                key={task.id}
                                className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-[#070A12]/60 transition-colors group"
                              >
                                <div className="flex items-center gap-3.5 min-w-0">
                                  {/* Solved Status Indicator (Green circle checkmark as in image) */}
                                  <div>
                                    {isSolved ? (
                                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center ring-2 ring-emerald-500/20">
                                        <CheckCircle2 size={16} />
                                      </div>
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center text-xs font-extrabold border border-gray-200 dark:border-gray-700">
                                        {taskIdx + 1}
                                      </div>
                                    )}
                                  </div>

                                  <div className="truncate">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#6366F1] dark:group-hover:text-indigo-400 transition-colors truncate">
                                      {task.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span
                                        className={cn(
                                          "text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border",
                                          difficultyColor
                                        )}
                                      >
                                        {task.difficulty}
                                      </span>
                                      <span className="text-[10px] text-gray-500 uppercase font-mono font-bold">
                                        {task.language}
                                      </span>
                                      <span className="text-[11px] text-amber-500 font-extrabold">
                                        +{task.points} XP
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Action Button (Practice Again / Solve Challenge as in image) */}
                                <div className="flex items-center justify-end">
                                  <button
                                    type="button"
                                    onClick={() => navigate("task", { taskId: task.id })}
                                    className={cn(
                                      "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0",
                                      isSolved
                                        ? "bg-slate-100 dark:bg-[#070A12] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 hover:border-[#6366F1] hover:text-[#6366F1]"
                                        : "bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white shadow-md shadow-indigo-500/25 active:scale-95"
                                    )}
                                  >
                                    <span>{isSolved ? "Practice Again" : "Solve Challenge"}</span>
                                    <ArrowRight
                                      size={13}
                                      className="group-hover:translate-x-0.5 transition-transform"
                                    />
                                  </button>
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
    </div>
  );
}

export default CourseDetailsPage;
