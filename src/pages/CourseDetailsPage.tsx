import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Lock,
  PlayCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Code2,
  BookOpen,
  Trophy,
  Loader2,
  Plus,
  Check,
  GraduationCap,
} from "lucide-react";
import { courseService } from "@/services/courseService";
import type { CourseWithModules, Task, UserTaskProgress } from "@/types/database.types";
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

export function CourseDetailsPage({ slug, navigate }: CourseDetailsPageProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [course, setCourse] = useState<CourseWithModules | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, UserTaskProgress>>({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
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
      c.modules.forEach((mod, idx) => {
        initial[mod.id] = idx < 2;
      });
      setExpandedModules(initial);
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
      showToast("success", `🎉 Successfully enrolled in "${course.title}"!`);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 bg-gray-50/50 dark:bg-gray-950 text-gray-500">
        <Loader2 size={32} className="animate-spin text-blue-600 mb-2" />
        <span className="ml-3 text-sm font-medium">Loading course curriculum...</span>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4 bg-gray-50/50 dark:bg-gray-950 text-center">
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
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back Button */}
        <div>
          <button
            onClick={() => navigate("courses")}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Back to All Courses</span>
          </button>
        </div>

        {/* Course Header Banner */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                <Code2 size={13} />
                <span>Interactive Learning Roadmap</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                {course.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
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
            <div className="bg-gray-50 dark:bg-gray-950/70 border border-gray-200 dark:border-gray-800/80 rounded-xl p-5 min-w-[240px] space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                <span>Progress Overview</span>
                <span className={cn(progressPercent === 100 ? "text-green-500 font-bold" : "text-blue-600 dark:text-blue-400")}>
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 pt-1">
                <span>{solvedCount} of {allTasks.length} Solved</span>
                <span className="flex items-center gap-1 text-amber-500 font-medium">
                  <Sparkles size={12} />
                  {allTasks.reduce((acc, t) => acc + (t.points || 10), 0)} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modules & Tasks Accordion */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>Curriculum Roadmap</span>
            <span className="text-xs text-gray-500">
              ({course.modules.length} {course.modules.length === 1 ? "Module" : "Modules"})
            </span>
          </h2>

          {course.modules.map((mod, modIdx) => {
            const isExpanded = !!expandedModules[mod.id];
            const modTasks = mod.tasks || [];
            const modSolved = modTasks.filter((t) => progressMap[t.id]?.is_completed).length;

            return (
              <div
                key={mod.id}
                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/90 overflow-hidden shadow-sm"
              >
                {/* Module Header Bar */}
                <button
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                      {modIdx + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {modSolved}/{modTasks.length} Completed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-xs font-medium text-gray-500">
                      {modSolved === modTasks.length && modTasks.length > 0 ? (
                        <span className="text-green-500 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      ) : null}
                    </div>
                    <div className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </button>

                {/* Module Task List */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800/60 bg-gray-50/30 dark:bg-gray-950/30">
                    {modTasks.length === 0 ? (
                      <p className="px-6 py-4 text-xs text-gray-400 italic">
                        No tasks added in this module yet.
                      </p>
                    ) : (
                      modTasks.map((task, taskIdx) => {
                        const isSolved = !!progressMap[task.id]?.is_completed;
                        const difficultyColor =
                          task.difficulty === "easy"
                            ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border-green-500/20"
                            : task.difficulty === "medium"
                            ? "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 border-yellow-500/20"
                            : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-500/20";

                        return (
                          <div
                            key={task.id}
                            className="px-6 py-3.5 flex items-center justify-between hover:bg-white dark:hover:bg-gray-900 transition-colors group"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              {/* Status Indicator */}
                              <div>
                                {isSolved ? (
                                  <div className="w-6 h-6 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                                    <CheckCircle2 size={16} />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-400 flex items-center justify-center text-xs font-semibold">
                                    {taskIdx + 1}
                                  </div>
                                )}
                              </div>

                              <div className="truncate">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                  {task.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span
                                    className={cn(
                                      "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border",
                                      difficultyColor
                                    )}
                                  >
                                    {task.difficulty}
                                  </span>
                                  <span className="text-[11px] text-gray-500 uppercase font-mono">
                                    {task.language}
                                  </span>
                                  <span className="text-[11px] text-amber-500 font-medium">
                                    +{task.points} XP
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            <button
                              type="button"
                              onClick={() => navigate("task", { taskId: task.id })}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0",
                                isSolved
                                  ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20"
                              )}
                            >
                              <span>{isSolved ? "Practice Again" : "Solve Challenge"}</span>
                              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          </div>
                        );
                      })
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
