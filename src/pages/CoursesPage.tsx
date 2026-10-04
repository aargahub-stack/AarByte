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
  GraduationCap,
  Check,
  Plus,
  Compass,
  Lock,
  Bell,
  Sparkles,
  Filter,
} from "lucide-react";
import { courseService } from "@/services/courseService";
import type { CourseWithModules, UserTaskProgress } from "@/types/database.types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { progressStorage } from "@/services/storage/progressStorage";
import { enrollmentStorage } from "@/services/storage/enrollmentStorage";
import { cn } from "@/utils/cn";
import { DEMO_COURSES } from "@/data/demoCourses";

/* ============================================================================
   1. DATA SCHEMA & TYPES FOR DYNAMIC COURSES
============================================================================ */
export type CourseDifficulty = "Beginner" | "Intermediate" | "Advanced";
export type CourseEnrollmentStatus = "open" | "closed" | "coming_soon";

export interface CourseItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: CourseDifficulty;
  modulesCount: number;
  problemsCount: number;
  enrollmentStatus: CourseEnrollmentStatus;
  isEnrolled: boolean;
  progressPercentage: number;
  rawCourse?: CourseWithModules;
}

export type AvailabilityFilter = "all" | "open" | "enrolled";

interface CoursesPageProps {
  navigate: (to: string, params?: Record<string, string>) => void;
}

/* ============================================================================
   2. DATA NORMALIZATION (SUPABASE / API TO DYNAMIC COURSE ITEM)
============================================================================ */
function mapToCourseItem(
  c: CourseWithModules,
  isEnrolled: boolean,
  progressPercentage: number
): CourseItem {
  // 1. Difficulty normalization ('Beginner' | 'Intermediate' | 'Advanced')
  let difficulty: CourseDifficulty = "Beginner";
  const rawDiff = (c.difficulty || "").toLowerCase();
  if (rawDiff === "intermediate" || rawDiff === "medium") {
    difficulty = "Intermediate";
  } else if (rawDiff === "advanced" || rawDiff === "hard") {
    difficulty = "Advanced";
  } else if (rawDiff === "beginner" || rawDiff === "easy") {
    difficulty = "Beginner";
  } else {
    // Derive from tasks if available
    const allTasks = c.modules?.flatMap((m) => m.tasks || []) || [];
    const hasHard = allTasks.some((t) => t.difficulty === "hard");
    const hasMed = allTasks.some((t) => t.difficulty === "medium");
    difficulty = hasHard ? "Advanced" : hasMed ? "Intermediate" : "Beginner";
  }

  // 2. Enrollment status normalization ('open' | 'closed' | 'coming_soon')
  let enrollmentStatus: CourseEnrollmentStatus = "open";
  const rawStatus = (
    c.enrollment_status ||
    (c as any).enrollmentStatus ||
    ""
  ).toLowerCase();

  if (rawStatus === "closed") {
    enrollmentStatus = "closed";
  } else if (
    rawStatus === "coming_soon" ||
    rawStatus === "comingsoon" ||
    rawStatus === "waitlist"
  ) {
    enrollmentStatus = "coming_soon";
  } else {
    enrollmentStatus = "open";
  }

  // 3. Category normalization
  let category = c.category || (c as any).category;
  if (!category) {
    const slug = (c.slug || "").toLowerCase();
    if (slug.includes("lld") || slug.includes("design") || slug.includes("architecture")) {
      category = "System Design";
    } else if (slug.includes("web") || slug.includes("js") || slug.includes("frontend")) {
      category = "Web Development";
    } else if (slug.includes("cpp") || slug.includes("competitive")) {
      category = "Competitive Programming";
    } else if (slug.includes("python") || slug.includes("dsa") || slug.includes("algo")) {
      category = "Algorithms & DSA";
    } else {
      category = "Computer Science";
    }
  }

  const modulesCount = c.modules ? c.modules.length : 0;
  const problemsCount = c.modules
    ? c.modules.reduce((acc, m) => acc + (m.tasks ? m.tasks.length : 0), 0)
    : 0;

  return {
    id: c.id,
    title: c.title,
    slug: c.slug || c.id,
    description: c.description || "Interactive problem solving track for mastering programming concepts.",
    category,
    difficulty,
    modulesCount,
    problemsCount,
    enrollmentStatus,
    isEnrolled,
    progressPercentage,
    rawCourse: c,
  };
}

export function CoursesPage({ navigate }: CoursesPageProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [rawCourses, setRawCourses] = useState<CourseWithModules[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, UserTaskProgress>>({});
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("all");

  // Track waitlist state locally for instant user feedback
  const [waitlistedSlugs, setWaitlistedSlugs] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("aarcode_waitlist");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  /* =========================================================================
     3. ASYNC DATA FETCHING (SUPABASE BACKEND WITH FALLBACK TO DEMO DATA)
  ========================================================================= */
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Clean up legacy unscoped guest enrollment key if present
        if (localStorage.getItem("aarcode_enrolled_courses")) {
          localStorage.removeItem("aarcode_enrolled_courses");
        }

        // Fetch from Supabase courses collection
        const { data, error } = await courseService.getCourses();
        const courseList = data && data.length > 0 ? data : DEMO_COURSES;
        setRawCourses(courseList);

        // ONLY authenticated logged-in students have personal progress & enrolled tracks!
        if (user?.id) {
          const mergedProgress: Record<string, UserTaskProgress> = {};

          // Fetch authenticated Supabase task progress for this user
          const allTaskIds = courseList.flatMap((c) =>
            c.modules.flatMap((m) => m.tasks.map((t) => t.id))
          );
          const { data: prog } = await courseService.getUserProgress(user.id, allTaskIds);
          if (prog) {
            Object.assign(mergedProgress, prog);
          }

          setProgressMap(mergedProgress);

          // Read enrolled courses scoped strictly to this user's ID
          const storedEnrolled = enrollmentStorage.getEnrolledCourseIdentifiers(user.id);
          setEnrolledIds(storedEnrolled);
        } else {
          // Unauthenticated visitor / guest: 0 enrolled tracks, 0 personal progress
          setProgressMap({});
          setEnrolledIds([]);
        }
      } catch (e) {
        console.error("Failed to load courses from backend/Supabase:", e);
        setRawCourses(DEMO_COURSES);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Listen for real-time progress or enrollment updates
    const handleSync = () => {
      if (user?.id) {
        setEnrolledIds(enrollmentStorage.getEnrolledCourseIdentifiers(user.id));
      } else {
        setEnrolledIds([]);
      }
    };
    window.addEventListener("aarcode_progress_updated", handleSync);
    window.addEventListener("aarcode_enrollment_updated", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("aarcode_progress_updated", handleSync);
      window.removeEventListener("aarcode_enrollment_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [user?.id]);

  /* =========================================================================
     4. DERIVE DYNAMIC COURSE ITEMS STATE FROM RAW COURSES & REAL-TIME PROGRESS
  ========================================================================= */
  const dynamicCourses: CourseItem[] = useMemo(() => {
    return rawCourses.map((c) => {
      const taskIds = c.modules.flatMap((m) => m.tasks.map((t) => t.id));
      const total = taskIds.length;

      // Unauthenticated visitors are never enrolled and have 0% personal progress
      if (!user) {
        return mapToCourseItem(c, false, 0);
      }

      // For authenticated logged-in students
      const isEnrolled =
        enrolledIds.includes(c.id) ||
        (c.slug && enrolledIds.includes(c.slug));

      const solved = taskIds.filter((t) => progressMap[t]?.is_completed).length;
      const progressPercentage = total > 0 ? Math.round((solved / total) * 100) : 0;

      return mapToCourseItem(c, isEnrolled, progressPercentage);
    });
  }, [rawCourses, enrolledIds, progressMap, user]);

  /* =========================================================================
     5. ACTIONS: ENROLLMENT & WAITLIST
  ========================================================================= */
  const handleEnrollCourse = (e: React.MouseEvent, course: CourseItem) => {
    e.stopPropagation();

    // If visitor is not logged in, prompt authentication to save progress
    if (!user) {
      showToast("info", "Please log in or sign up to enroll in tracks and save your progress!");
      navigate("login");
      return;
    }

    enrollmentStorage.enroll(course.id, user.id);
    if (course.slug) {
      enrollmentStorage.enroll(course.slug, user.id);
    }
    setEnrolledIds((prev) => [...prev, course.id, course.slug]);
    showToast("success", `Successfully enrolled in "${course.title}"! Loading curriculum...`);
    navigate("course", { slug: course.slug });
  };

  const handleJoinWaitlist = (e: React.MouseEvent, course: CourseItem) => {
    e.stopPropagation();
    if (waitlistedSlugs.includes(course.slug)) {
      showToast("info", `You are already on the priority waitlist for "${course.title}".`);
      return;
    }
    const updated = [...waitlistedSlugs, course.slug];
    setWaitlistedSlugs(updated);
    try {
      localStorage.setItem("aarcode_waitlist", JSON.stringify(updated));
    } catch (err) {
      console.warn("Failed to persist waitlist in local storage", err);
    }
    showToast("success", `You're on the priority waitlist for "${course.title}"! We'll notify you when enrollment opens.`);
  };

  const handleCardClick = (course: CourseItem) => {
    if (course.enrollmentStatus === "closed") {
      showToast("info", `Enrollment for "${course.title}" is currently closed.`);
      return;
    }
    if (course.enrollmentStatus === "coming_soon") {
      if (!waitlistedSlugs.includes(course.slug)) {
        handleJoinWaitlist({ stopPropagation: () => {} } as React.MouseEvent, course);
      } else {
        showToast("info", `You're on the waitlist for "${course.title}". Stay tuned!`);
      }
      return;
    }
    navigate("course", { slug: course.slug });
  };

  /* =========================================================================
     6. FILTERING LOGIC (SEARCH & AVAILABILITY CHIPS)
  ========================================================================= */
  const filteredCourses = useMemo(() => {
    return dynamicCourses.filter((course) => {
      // 1. Availability Filter
      if (availabilityFilter === "open" && course.enrollmentStatus !== "open") {
        return false;
      }
      if (availabilityFilter === "enrolled" && !course.isEnrolled) {
        return false;
      }

      // 2. Search Query Filter
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        course.title.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q) ||
        course.difficulty.toLowerCase().includes(q)
      );
    });
  }, [dynamicCourses, availabilityFilter, searchQuery]);

  // Aggregate stats for metrics and filter chips
  const totalCount = dynamicCourses.length;
  const openCount = dynamicCourses.filter((c) => c.enrollmentStatus === "open").length;
  const enrolledCount = dynamicCourses.filter((c) => c.isEnrolled).length;

  return (
    <div className="min-h-screen font-urbanist bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#121314] dark:text-[#ECEDEE] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ===================================================================
            1. HERO BANNER & SEARCH
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
                <span className="font-semibold text-slate-600 dark:text-zinc-400">Curated DSA &amp; Architecture Tracks</span>
              </div>

              <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE]">
                Master Computer Science &amp; Algorithms
              </h1>

              <p className="text-sm sm:text-base text-[#6B7280] dark:text-[#8A9099] font-normal leading-relaxed">
                Step-by-step interactive tracks designed to build core algorithmic patterns, data structures, and production-grade architectures with live sandbox evaluation.
              </p>

              {/* Search input */}
              <div className="pt-2 max-w-md">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tracks by name, category, or difficulty..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425] text-sm text-[#121314] dark:text-[#ECEDEE] placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#00F076] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Quick Metrics Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425]">
                <div className="text-xs font-semibold text-[#6B7280] dark:text-[#8A9099] mb-1">
                  Enrolled Tracks
                </div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-500">
                  {enrolledCount}
                  <span className="text-zinc-400 text-xs font-normal"> / {totalCount}</span>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425]">
                <div className="text-xs font-semibold text-[#6B7280] dark:text-[#8A9099] mb-1">
                  Open Tracks
                </div>
                <div className="text-xl sm:text-2xl font-bold text-[#00F076]">
                  {openCount}
                  <span className="text-zinc-400 text-xs font-normal"> Active</span>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425] col-span-2 sm:col-span-1">
                <div className="text-xs font-semibold text-[#6B7280] dark:text-[#8A9099] mb-1">
                  Total Catalog
                </div>
                <div className="text-xl sm:text-2xl font-bold text-[#121314] dark:text-[#ECEDEE]">
                  {totalCount}
                  <span className="text-zinc-400 text-xs font-normal"> Tracks</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            2. AVAILABILITY FILTER CHIPS [All Tracks] [Open Only] [Enrolled Tracks]
        =================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] dark:border-[#202425] pb-4">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] shadow-xs">
            {/* Chip 1: All Tracks */}
            <button
              type="button"
              onClick={() => setAvailabilityFilter("all")}
              className={cn(
                "flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                availabilityFilter === "all"
                  ? "bg-[#00F076] text-[#0C0D0E] shadow-sm font-bold"
                  : "text-[#6B7280] dark:text-[#8A9099] hover:text-[#121314] dark:hover:text-[#ECEDEE] hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <Compass size={15} />
              <span>All Tracks</span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[11px] font-bold transition-colors",
                  availabilityFilter === "all"
                    ? "bg-black/15 text-[#0C0D0E]"
                    : "bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#6B7280] dark:text-[#8A9099]"
                )}
              >
                {totalCount}
              </span>
            </button>

            {/* Chip 2: Open Only */}
            <button
              type="button"
              onClick={() => setAvailabilityFilter("open")}
              className={cn(
                "flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                availabilityFilter === "open"
                  ? "bg-[#00F076] text-[#0C0D0E] shadow-sm font-bold"
                  : "text-[#6B7280] dark:text-[#8A9099] hover:text-[#121314] dark:hover:text-[#ECEDEE] hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              <span>Open Only</span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[11px] font-bold transition-colors",
                  availabilityFilter === "open"
                    ? "bg-black/15 text-[#0C0D0E]"
                    : "bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#6B7280] dark:text-[#8A9099]"
                )}
              >
                {openCount}
              </span>
            </button>

            {/* Chip 3: Enrolled Tracks */}
            <button
              type="button"
              onClick={() => setAvailabilityFilter("enrolled")}
              className={cn(
                "flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                availabilityFilter === "enrolled"
                  ? "bg-[#00F076] text-[#0C0D0E] shadow-sm font-bold"
                  : "text-[#6B7280] dark:text-[#8A9099] hover:text-[#121314] dark:hover:text-[#ECEDEE] hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <GraduationCap size={15} />
              <span>Enrolled Tracks</span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[11px] font-bold transition-colors",
                  availabilityFilter === "enrolled"
                    ? "bg-black/15 text-[#0C0D0E]"
                    : "bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#6B7280] dark:text-[#8A9099]"
                )}
              >
                {enrolledCount}
              </span>
            </button>
          </div>

          <div className="text-xs font-medium text-[#6B7280] dark:text-[#8A9099]">
            {availabilityFilter === "enrolled"
              ? `You are currently enrolled in ${enrolledCount} track${enrolledCount === 1 ? "" : "s"}`
              : availabilityFilter === "open"
              ? `${openCount} track${openCount === 1 ? "" : "s"} currently accepting new enrollments`
              : `Showing ${filteredCourses.length} of ${totalCount} tracks`}
          </div>
        </div>

        {/* ===================================================================
            3. DYNAMIC COURSES GRID OR EMPTY STATE
        =================================================================== */}
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
              <Loader2 size={32} className="animate-spin text-emerald-500" />
              <p className="text-sm">Loading dynamic course curriculum...</p>
            </div>
          ) : availabilityFilter === "enrolled" && filteredCourses.length === 0 ? (
            /* Empty State for Enrolled Tracks */
            <div className="text-center py-16 px-6 bg-white dark:bg-[#151718] rounded-3xl border border-[#E5E7EB] dark:border-[#202425] shadow-xs max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <GraduationCap size={32} />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE]">
                {!user ? "Sign In to View Your Enrolled Tracks" : "No Enrolled Tracks Yet"}
              </h3>
              <p className="text-sm text-[#6B7280] dark:text-[#8A9099] leading-relaxed">
                {!user
                  ? "Create a free account or log in to enroll in curated tracks, track your roadmap progress, and earn XP."
                  : "You haven't enrolled in any tracks yet. Browse through our open tracks to start learning and solving problems."}
              </p>
              <div className="pt-2">
                {!user ? (
                  <button
                    type="button"
                    onClick={() => navigate("login")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] text-xs sm:text-sm font-semibold shadow-[0_0_20px_rgba(0,240,118,0.22)] active:scale-[0.98] transition-all cursor-pointer font-bold"
                  >
                    <span>Log In / Sign Up</span>
                    <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAvailabilityFilter("open")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] text-xs sm:text-sm font-semibold shadow-[0_0_20px_rgba(0,240,118,0.22)] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Compass size={16} />
                    <span>Explore Open Tracks</span>
                  </button>
                )}
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            /* Empty Search / Filter Results */
            <div className="text-center py-16 bg-white dark:bg-[#151718] rounded-3xl border border-[#E5E7EB] dark:border-[#202425] p-8 max-w-md mx-auto space-y-3">
              <p className="text-[#6B7280] dark:text-[#8A9099] text-sm">
                No tracks found matching "{searchQuery}" under {availabilityFilter} filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setAvailabilityFilter("all");
                }}
                className="text-xs font-semibold text-emerald-500 hover:underline cursor-pointer"
              >
                Reset Search &amp; Filters
              </button>
            </div>
          ) : (
            /* Course Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const isOpen = course.enrollmentStatus === "open";
                const isClosed = course.enrollmentStatus === "closed";
                const isComingSoon = course.enrollmentStatus === "coming_soon";
                const isWaitlisted = waitlistedSlugs.includes(course.slug);

                // Circular Progress calculation
                const radius = 17;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (course.progressPercentage / 100) * circumference;

                return (
                  <div
                    key={course.id}
                    onClick={() => handleCardClick(course)}
                    className={cn(
                      "group rounded-3xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] shadow-xs flex flex-col justify-between overflow-hidden transition-all duration-300",
                      isClosed
                        ? "opacity-60 hover:opacity-75 cursor-not-allowed"
                        : isComingSoon
                        ? "hover:border-amber-500/40 dark:hover:border-amber-500/40 hover:shadow-[0_8px_30px_rgba(245,158,11,0.06)] cursor-pointer"
                        : "hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(0,240,118,0.04)] cursor-pointer"
                    )}
                  >
                    <div className="p-6 sm:p-7 space-y-4">
                      {/* Top Header: Category & Availability State Badge */}
                      <div className="flex items-center justify-between gap-2">
                        {/* Category + Difficulty tags */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425] text-[#121314] dark:text-[#ECEDEE]">
                            {course.category}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                              course.difficulty === "Beginner" &&
                                "bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border-emerald-500/20",
                              course.difficulty === "Intermediate" &&
                                "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                              course.difficulty === "Advanced" &&
                                "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                            )}
                          >
                            {course.difficulty}
                          </span>
                        </div>

                        {/* Real-Time Availability Status Badges */}
                        {isOpen && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border border-emerald-500/25 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#00F076] animate-pulse" />
                            <span>● Open</span>
                          </span>
                        )}

                        {isClosed && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-500/10 dark:bg-rose-500/10 text-zinc-600 dark:text-rose-400 border border-zinc-500/25 dark:border-rose-500/25 shrink-0">
                            <Lock size={11} />
                            <span>Closed</span>
                          </span>
                        )}

                        {isComingSoon && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0">
                            <Clock size={11} />
                            <span>Coming Soon</span>
                          </span>
                        )}
                      </div>

                      {/* Course Title & Description */}
                      <div className="space-y-1.5">
                        <h3
                          className={cn(
                            "text-lg font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE] transition-colors",
                            isOpen && "group-hover:text-emerald-500 dark:group-hover:text-[#00F076]",
                            isComingSoon && "group-hover:text-amber-500 dark:group-hover:text-amber-400"
                          )}
                        >
                          {course.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#8A9099] line-clamp-2 leading-relaxed font-normal">
                          {course.description}
                        </p>
                      </div>

                      {/* Module & Problem Counts */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425] text-[#6B7280] dark:text-[#8A9099]">
                          {course.modulesCount} {course.modulesCount === 1 ? "Module" : "Modules"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border border-emerald-500/20">
                          {course.problemsCount} Problems
                        </span>

                        {course.isEnrolled && (
                          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-[#00F076]">
                            <Check size={12} strokeWidth={2.5} />
                            <span>Enrolled</span>
                          </span>
                        )}
                      </div>

                      {/* Linear Track Progress Bar if Enrolled or in progress */}
                      {course.isEnrolled && (
                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between text-xs font-medium text-[#6B7280] dark:text-[#8A9099]">
                            <span>Track Progress</span>
                            <span
                              className={cn(
                                course.progressPercentage === 100
                                  ? "text-emerald-500 font-bold"
                                  : "text-[#121314] dark:text-[#ECEDEE] font-semibold"
                              )}
                            >
                              {course.progressPercentage}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425] overflow-hidden">
                            <div
                              className="h-full transition-all duration-500 rounded-full bg-[#00F076]"
                              style={{ width: `${course.progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* =========================================================
                        BOTTOM CTA BAR (CONDITIONED ON ENROLLMENT STATUS)
                    ========================================================= */}
                    <div className="p-4 sm:p-5 bg-[#F7F8FA] dark:bg-[#0C0D0E] border-t border-[#E5E7EB] dark:border-[#202425]">
                      {/* State A: OPEN */}
                      {isOpen && (
                        <button
                          type="button"
                          onClick={(e) =>
                            course.isEnrolled
                              ? navigate("course", { slug: course.slug })
                              : handleEnrollCourse(e, course)
                          }
                          className={cn(
                            "w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]",
                            course.isEnrolled
                              ? "bg-white dark:bg-[#151718] hover:bg-emerald-500 hover:text-[#0C0D0E] dark:hover:bg-[#00F076] dark:hover:text-[#0C0D0E] text-emerald-600 dark:text-[#00F076] border border-[#E5E7EB] dark:border-[#202425] shadow-xs group-hover:border-emerald-500/40"
                              : "bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] shadow-sm font-bold"
                          )}
                        >
                          <span>
                            {course.isEnrolled ? "Continue Journey" : "Enroll Track"}
                          </span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      )}

                      {/* State B: CLOSED */}
                      {isClosed && (
                        <button
                          type="button"
                          disabled
                          className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-200/70 dark:bg-[#1E2022] text-zinc-500 dark:text-zinc-500 border border-[#E5E7EB] dark:border-[#202425] flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <Lock size={14} />
                          <span>Enrollment Closed</span>
                        </button>
                      )}

                      {/* State C: COMING SOON */}
                      {isComingSoon && (
                        <button
                          type="button"
                          onClick={(e) => handleJoinWaitlist(e, course)}
                          className={cn(
                            "w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]",
                            isWaitlisted
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                              : "bg-amber-500 hover:bg-amber-600 text-[#0C0D0E] font-bold shadow-sm"
                          )}
                        >
                          {isWaitlisted ? (
                            <>
                              <Check size={14} />
                              <span>Waitlist Joined ✓</span>
                            </>
                          ) : (
                            <>
                              <Bell size={14} />
                              <span>Join Waitlist</span>
                            </>
                          )}
                        </button>
                      )}
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
