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
    <div className="min-h-screen font-urbanist bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#121314] dark:text-[#ECEDEE] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ===================================================================
            1. HERO BANNER
        =================================================================== */}
        <div className="relative rounded-3xl p-6 sm:p-8 xl:p-10 bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] shadow-xs overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#00F076]/5 dark:bg-[#00F076]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/5 dark:bg-emerald-500/5 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] text-xs font-semibold border border-emerald-500/20">
                <Compass size={13} />
                <span>Interactive Learning Roadmaps</span>
                <span>•</span>
                <span className="font-semibold text-slate-600 dark:text-zinc-400">Curated DSA Tracks</span>
              </div>

              <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE]">
                Master Computer Science &amp; Algorithms
              </h1>

              <p className="text-sm sm:text-base text-[#6B7280] dark:text-[#8A9099] font-normal leading-relaxed">
                Step-by-step interactive tracks designed to build core algorithmic patterns, data structures, and interview readiness with live sandbox evaluation.
              </p>

              {/* Search input */}
              <div className="pt-2 max-w-md">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tracks (e.g. Python, C++, Algorithms)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425] text-sm text-[#121314] dark:text-[#ECEDEE] placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#00F076] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Quick Metrics Badge */}
            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425]">
                <div className="text-xs font-semibold text-[#6B7280] dark:text-[#8A9099] mb-1">
                  Enrolled Tracks
                </div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-500">
                  {totalEnrolledCount}
                  <span className="text-zinc-400 text-xs font-normal"> / {courses.length}</span>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425]">
                <div className="text-xs font-semibold text-[#6B7280] dark:text-[#8A9099] mb-1">
                  Available Tracks
                </div>
                <div className="text-xl sm:text-2xl font-bold text-[#121314] dark:text-[#ECEDEE]">
                  {courses.length}
                  <span className="text-zinc-400 text-xs font-normal"> Tracks</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            2. TWO-VIEW SEGMENTED TAB SWITCHER (All Courses vs Enrolled Courses)
        =================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] dark:border-[#202425] pb-4">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] shadow-xs">
            {/* Tab 1: All Courses */}
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all",
                activeTab === "all"
                  ? "bg-[#00F076] text-[#0C0D0E] shadow-sm font-semibold"
                  : "text-[#6B7280] dark:text-[#8A9099] hover:text-[#121314] dark:hover:text-[#ECEDEE] hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <BookOpen size={16} />
              <span>All Courses</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-semibold transition-colors",
                  activeTab === "all"
                    ? "bg-black/15 text-[#0C0D0E]"
                    : "bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#6B7280] dark:text-[#8A9099]"
                )}
              >
                {courses.length}
              </span>
            </button>

            {/* Tab 2: Enrolled Courses */}
            <button
              onClick={() => setActiveTab("enrolled")}
              className={cn(
                "flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all",
                activeTab === "enrolled"
                  ? "bg-[#00F076] text-[#0C0D0E] shadow-sm font-semibold"
                  : "text-[#6B7280] dark:text-[#8A9099] hover:text-[#121314] dark:hover:text-[#ECEDEE] hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <GraduationCap size={16} />
              <span>Enrolled Courses</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-semibold transition-colors",
                  activeTab === "enrolled"
                    ? "bg-black/15 text-[#0C0D0E]"
                    : "bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#6B7280] dark:text-[#8A9099]"
                )}
              >
                {totalEnrolledCount}
              </span>
            </button>
          </div>

          <div className="text-xs font-medium text-[#6B7280] dark:text-[#8A9099]">
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
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
              <Loader2 size={32} className="animate-spin text-emerald-500" />
              <p className="text-sm">Loading course curriculum...</p>
            </div>
          ) : activeTab === "enrolled" && enrolledFiltered.length === 0 ? (
            /* Empty State for Enrolled Courses */
            <div className="text-center py-16 px-6 bg-white dark:bg-[#151718] rounded-3xl border border-[#E5E7EB] dark:border-[#202425] shadow-xs max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <GraduationCap size={32} />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE]">
                No Enrolled Courses Yet
              </h3>
              <p className="text-sm text-[#6B7280] dark:text-[#8A9099] leading-relaxed">
                You haven't enrolled in any tracks yet. Browse through our curated algorithm and web development roadmaps to start learning.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab("all")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] text-xs sm:text-sm font-semibold shadow-[0_0_20px_rgba(0,240,118,0.22)] active:scale-[0.98] transition-all"
                >
                  <Compass size={16} />
                  <span>Explore All Courses to Enroll</span>
                </button>
              </div>
            </div>
          ) : displayedCourses.length === 0 ? (
            /* Empty search results */
            <div className="text-center py-16 bg-white dark:bg-[#151718] rounded-3xl border border-[#E5E7EB] dark:border-[#202425] p-8 max-w-md mx-auto space-y-3">
              <p className="text-[#6B7280] dark:text-[#8A9099] text-sm">
                No tracks found matching "{searchQuery}".
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs font-semibold text-emerald-500 hover:underline"
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
                const radius = 18;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (percent / 100) * circumference;

                return (
                  <div
                    key={course.id}
                    onClick={() =>
                      navigate("course", {
                        slug: course.slug && course.slug !== "#" ? course.slug : course.id,
                      })
                    }
                    className="group cursor-pointer rounded-3xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] hover:border-emerald-500/40 dark:hover:border-emerald-500/40 shadow-xs hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(0,240,118,0.04)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    <div className="p-6 sm:p-7 space-y-4">
                      {/* Top Header: Progress Ring & Enrollment Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* SVG Progress Ring */}
                          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                              <circle
                                cx="22"
                                cy="22"
                                r={radius}
                                className="stroke-zinc-200 dark:stroke-[#202425]"
                                strokeWidth="3.5"
                                fill="transparent"
                              />
                              <circle
                                cx="22"
                                cy="22"
                                r={radius}
                                className="stroke-[#00F076] transition-all duration-700 ease-out"
                                strokeWidth="3.5"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                fill="transparent"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#121314] dark:text-[#ECEDEE]">
                              {percent > 0 ? `${percent}%` : <Code2 size={16} className="text-[#00F076]" />}
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div className="text-[11px] font-medium text-[#6B7280] dark:text-[#8A9099] uppercase tracking-wider">
                              Roadmap
                            </div>
                            <div className="text-xs font-semibold text-[#121314] dark:text-[#ECEDEE] truncate">
                              {solved}/{total} Solved
                            </div>
                          </div>
                        </div>

                        {enrolled ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border border-emerald-500/25">
                            <Check size={12} />
                            <span>Enrolled</span>
                          </span>
                        ) : (
                          <button
                            onClick={(e) => handleEnrollCourse(e, course)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] hover:bg-[#00F076] hover:text-[#0C0D0E] border border-emerald-500/25 transition-all"
                            title="Enroll in this track"
                          >
                            <Plus size={12} />
                            <span>Enroll</span>
                          </button>
                        )}
                      </div>

                      {/* Course Title & Description */}
                      <div className="space-y-1.5">
                        <h3 className="text-lg font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE] group-hover:text-emerald-500 dark:group-hover:text-[#00F076] transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#8A9099] line-clamp-2 leading-relaxed font-normal">
                          {course.description || "Interactive problem solving track for mastering programming concepts."}
                        </p>
                      </div>

                      {/* Module Count & Problems */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425] text-[#121314] dark:text-[#ECEDEE]">
                          {course.modules.length} {course.modules.length === 1 ? "Module" : "Modules"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border border-emerald-500/20">
                          {total} Problems
                        </span>
                      </div>

                      {/* Linear Progress Bar for Enrolled Tracks */}
                      {enrolled && (
                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between text-xs font-medium text-[#6B7280] dark:text-[#8A9099]">
                            <span>Track Progress</span>
                            <span className={cn(isCompleted ? "text-emerald-500 font-bold" : "text-[#121314] dark:text-[#ECEDEE] font-semibold")}>
                              {percent}% ({solved}/{total} Solved)
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425] overflow-hidden">
                            <div
                              className="h-full transition-all duration-500 rounded-full bg-[#00F076]"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom CTA Bar */}
                    <div className="px-6 py-3.5 bg-[#F7F8FA] dark:bg-[#0C0D0E] border-t border-[#E5E7EB] dark:border-[#202425] flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-[#00F076]">
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
