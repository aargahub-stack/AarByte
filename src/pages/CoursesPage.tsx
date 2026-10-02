import { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Code2,
  Terminal,
  Layers,
  Search,
  Loader2,
  Trophy,
  GraduationCap,
  Check,
  Plus,
  Compass,
  Play,
} from "lucide-react";
import { courseService } from "@/services/courseService";
import type { CourseWithModules, UserTaskProgress } from "@/types/database.types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { progressStorage } from "@/services/storage/progressStorage";
import { enrollmentStorage } from "@/services/storage/enrollmentStorage";
import { cn } from "@/utils/cn";

import { DEMO_COURSES } from "@/data/demoCourses";

interface CoursesPageProps {
  navigate: (to: string, params?: Record<string, string>) => void;
}

export function CoursesPage({ navigate }: CoursesPageProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [courses, setCourses] = useState<CourseWithModules[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, UserTaskProgress>>({});
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "enrolled">("all");
  const [hasInitializedTab, setHasInitializedTab] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data } = await courseService.getCourses();
        const courseList = data && data.length > 0 ? data : DEMO_COURSES;
        setCourses(courseList);

        // 1. Read local storage completed tasks
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

        // 2. Query Supabase progress if user is logged in
        if (user?.id) {
          const allTaskIds = courseList.flatMap((c) =>
            c.modules.flatMap((m) => m.tasks.map((t) => t.id))
          );
          const { data: prog } = await courseService.getUserProgress(user.id, allTaskIds);
          if (prog) {
            Object.assign(mergedProgress, prog);
          }
        }
        setProgressMap(mergedProgress);

        // 3. Sync all active database courses into enrollment so catalog is fully available
        courseList.forEach((c) => {
          enrollmentStorage.enroll(c.id);
          if (c.slug && c.slug !== "#") enrollmentStorage.enroll(c.slug);
        });
        const storedEnrolled = enrollmentStorage.getEnrolledCourseIdentifiers();
        setEnrolledIds(storedEnrolled);

        // Smart Initial Tab Selection:
        // If user has currently enrolled in any course, open "Enrolled Courses" first.
        // Otherwise, open "All Courses" first to browse and enroll.
        if (!hasInitializedTab) {
          const hasAnyEnrolled = courseList.some((c) => {
            const taskIds = c.modules.flatMap((m) => m.tasks.map((t) => t.id));
            return (
              storedEnrolled.includes(c.id) ||
              (c.slug && storedEnrolled.includes(c.slug)) ||
              taskIds.some((t) => mergedProgress[t]?.is_completed)
            );
          });
          setActiveTab(hasAnyEnrolled ? "enrolled" : "all");
          setHasInitializedTab(true);
        }
      } catch (e) {
        console.error("Failed to load courses:", e);
        setCourses(DEMO_COURSES);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Re-sync when progress or enrollment changes
    const handleSync = () => {
      setEnrolledIds(enrollmentStorage.getEnrolledCourseIdentifiers());
      loadData();
    };
    window.addEventListener("aarcode_progress_updated", handleSync);
    window.addEventListener("aarcode_enrollment_updated", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("aarcode_progress_updated", handleSync);
      window.removeEventListener("aarcode_enrollment_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [user?.id, hasInitializedTab]);

  // Check if course is enrolled
  const isCourseEnrolled = (course: CourseWithModules) => {
    const taskIds = course.modules.flatMap((m) => m.tasks.map((t) => t.id));
    return (
      enrolledIds.includes(course.id) ||
      (course.slug && enrolledIds.includes(course.slug)) ||
      taskIds.some((t) => progressMap[t]?.is_completed)
    );
  };

  // Instant 1-click enroll
  const handleEnrollCourse = (e: React.MouseEvent, course: CourseWithModules) => {
    e.stopPropagation();
    enrollmentStorage.enroll(course.id);
    if (course.slug) {
      enrollmentStorage.enroll(course.slug);
    }
    setEnrolledIds((prev) => [...prev, course.id, course.slug]);
    showToast("success", `Successfully enrolled in "${course.title}"!`);
  };

  // Calculate task completion progress for each course
  const calculateProgress = (course: CourseWithModules) => {
    const tasks = course.modules.flatMap((m) => m.tasks);
    if (tasks.length === 0) return { solved: 0, total: 0, percent: 0 };
    const solved = tasks.filter((t) => progressMap[t.id]?.is_completed).length;
    const percent = Math.round((solved / tasks.length) * 100);
    return { solved, total: tasks.length, percent };
  };

  // Filter courses by search query
  const allFiltered = useMemo(() => {
    return courses.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
      );
    });
  }, [courses, searchQuery]);

  // Enrolled courses subset
  const enrolledFiltered = useMemo(() => {
    return allFiltered.filter(isCourseEnrolled);
  }, [allFiltered, enrolledIds, progressMap]);

  const displayedCourses = activeTab === "enrolled" ? enrolledFiltered : allFiltered;
  const totalEnrolledCount = courses.filter(isCourseEnrolled).length;

  return (
    <div className="min-h-screen font-urbanist bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ===================================================================
            1. HERO BANNER
        =================================================================== */}
        <div className="relative rounded-3xl p-6 sm:p-8 xl:p-10 bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#6366F1]/10 dark:bg-[#6366F1]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-purple-500/10 dark:bg-purple-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-[#6366F1] dark:text-[#818CF8] text-xs font-semibold border border-indigo-200/70 dark:border-indigo-500/25">
                <Compass size={13} />
                <span>Interactive Learning Roadmaps</span>
                <span>•</span>
                <span className="font-semibold text-slate-600 dark:text-slate-300">Curated DSA Tracks</span>
              </div>

              <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Master Computer Science &amp; Algorithms
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
                Step-by-step interactive tracks designed to build core algorithmic patterns, data structures, and interview readiness with live sandbox evaluation.
              </p>

              {/* Search input */}
              <div className="pt-2 max-w-md">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tracks (e.g. Python, C++, Algorithms)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Quick Metrics Badge */}
            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200/80 dark:border-[#1E293B]">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Enrolled Tracks
                </div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-500">
                  {totalEnrolledCount}
                  <span className="text-slate-400 text-xs font-normal"> / {courses.length}</span>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200/80 dark:border-[#1E293B]">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Available Tracks
                </div>
                <div className="text-xl sm:text-2xl font-bold text-[#6366F1]">
                  {courses.length}
                  <span className="text-slate-400 text-xs font-normal"> Tracks</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            2. TWO-VIEW SEGMENTED TAB SWITCHER (All Courses vs Enrolled Courses)
        =================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-[#1E293B] pb-4">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
            {/* Tab 1: All Courses */}
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
                activeTab === "all"
                  ? "bg-[#6366F1] text-white shadow-md shadow-indigo-500/25"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
              )}
            >
              <BookOpen size={16} />
              <span>All Courses</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-semibold transition-colors",
                  activeTab === "all"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                )}
              >
                {courses.length}
              </span>
            </button>

            {/* Tab 2: Enrolled Courses */}
            <button
              onClick={() => setActiveTab("enrolled")}
              className={cn(
                "flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
                activeTab === "enrolled"
                  ? "bg-[#6366F1] text-white shadow-md shadow-indigo-500/25"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
              )}
            >
              <GraduationCap size={16} />
              <span>Enrolled Courses</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-semibold transition-colors",
                  activeTab === "enrolled"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                )}
              >
                {totalEnrolledCount}
              </span>
            </button>
          </div>

          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {activeTab === "enrolled"
              ? `You are currently enrolled in ${totalEnrolledCount} track${totalEnrolledCount === 1 ? "" : "s"}`
              : `Showing ${displayedCourses.length} learning track${displayedCourses.length === 1 ? "" : "s"}`}
          </div>
        </div>

        {/* ===================================================================
            3. COURSES GRID OR EMPTY STATE
        =================================================================== */}
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
              <Loader2 size={32} className="animate-spin text-[#6366F1]" />
              <p className="text-sm">Loading course curriculum...</p>
            </div>
          ) : activeTab === "enrolled" && enrolledFiltered.length === 0 ? (
            /* Empty State for Enrolled Courses */
            <div className="text-center py-16 px-6 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-[#1E293B] shadow-xs max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/25 flex items-center justify-center text-[#6366F1] dark:text-[#818CF8]">
                <GraduationCap size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No Enrolled Courses Yet
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                You haven't enrolled in any tracks yet. Browse through our curated algorithm and web development roadmaps to start learning.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab("all")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Compass size={16} />
                  <span>Explore All Courses to Enroll</span>
                </button>
              </div>
            </div>
          ) : displayedCourses.length === 0 ? (
            /* Empty search results */
            <div className="text-center py-16 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-[#1E293B] p-8 max-w-md mx-auto space-y-3">
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                No tracks found matching "{searchQuery}".
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs font-bold text-[#6366F1] hover:underline"
              >
                Clear Search Query
              </button>
            </div>
          ) : (
            /* Course Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedCourses.map((course) => {
                const { solved, total, percent } = calculateProgress(course);
                const isCompleted = total > 0 && solved === total;
                const enrolled = isCourseEnrolled(course);

                return (
                  <div
                    key={course.id}
                    onClick={() =>
                      navigate("course", {
                        slug: course.slug && course.slug !== "#" ? course.slug : course.id,
                      })
                    }
                    className="group cursor-pointer rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    <div className="p-6 sm:p-7 space-y-4">
                      {/* Top icon and Enrollment badge */}
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#7C3AED] text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                          <Code2 size={24} />
                        </div>

                        {enrolled ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                            <Check size={12} />
                            <span>Enrolled</span>
                          </span>
                        ) : (
                          <button
                            onClick={(e) => handleEnrollCourse(e, course)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-[#6366F1] dark:text-[#818CF8] hover:bg-[#6366F1] hover:text-white border border-indigo-200 dark:border-indigo-500/25 transition-all"
                            title="Enroll in this track"
                          >
                            <Plus size={12} />
                            <span>Enroll</span>
                          </button>
                        )}
                      </div>

                      {/* Course Title & Description */}
                      <div className="space-y-1.5">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#6366F1] dark:group-hover:text-[#818CF8] transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {course.description || "Interactive problem solving track for mastering programming concepts."}
                        </p>
                      </div>

                      {/* Module Count & Points */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {course.modules.length} {course.modules.length === 1 ? "Module" : "Modules"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-500/10 text-[#6366F1] dark:text-[#818CF8]">
                          {total} Problems
                        </span>
                      </div>

                      {/* Progress Bar (Always shows progress if enrolled or has solved tasks) */}
                      {enrolled && (
                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                            <span>Track Progress</span>
                            <span className={cn(isCompleted && "text-emerald-500 font-bold")}>
                              {percent}% ({solved}/{total})
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-all duration-500 rounded-full",
                                isCompleted
                                  ? "bg-emerald-500"
                                  : "bg-gradient-to-r from-[#6366F1] to-[#7C3AED]"
                              )}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom CTA Bar */}
                    <div className="px-6 py-4 bg-slate-50 dark:bg-[#0B1120] border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between text-xs font-bold text-[#6366F1] dark:text-[#818CF8]">
                      <span>
                        {enrolled
                          ? isCompleted
                            ? "Review Track"
                            : solved > 0
                            ? "Continue Journey"
                            : "Start Track"
                          : "Explore Curriculum & Enroll"}
                      </span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CoursesPage;
