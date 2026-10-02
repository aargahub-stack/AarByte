import { useState, useEffect } from "react";
import {
  Trophy,
  Medal,
  Award,
  CheckCircle2,
  TrendingUp,
  Loader2,
  Crown,
  Search,
  BookOpen,
  Layers,
  Sparkles,
  ArrowRight,
  Target,
  UserCheck,
} from "lucide-react";
import { courseService } from "@/services/courseService";
import { progressStorage } from "@/services/storage/progressStorage";
import type { LeaderboardEntry } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";

// Fallback demo leaderboard entries if table/view is freshly initialized
const DEMO_OVERALL_LEADERBOARD: LeaderboardEntry[] = [
  {
    user_id: "demo-1",
    full_name: "Ada Lovelace",
    avatar_url: null,
    points: 2450,
    solved_tasks_count: 54,
  },
  {
    user_id: "demo-2",
    full_name: "Alan Turing",
    avatar_url: null,
    points: 2180,
    solved_tasks_count: 48,
  },
  {
    user_id: "demo-3",
    full_name: "Grace Hopper",
    avatar_url: null,
    points: 1950,
    solved_tasks_count: 42,
  },
  {
    user_id: "demo-4",
    full_name: "Margaret Hamilton",
    avatar_url: null,
    points: 1720,
    solved_tasks_count: 36,
  },
  {
    user_id: "demo-5",
    full_name: "Linus Torvalds",
    avatar_url: null,
    points: 1540,
    solved_tasks_count: 31,
  },
  {
    user_id: "demo-6",
    full_name: "Ken Thompson",
    avatar_url: null,
    points: 1300,
    solved_tasks_count: 27,
  },
  {
    user_id: "demo-7",
    full_name: "Dennis Ritchie",
    avatar_url: null,
    points: 1120,
    solved_tasks_count: 24,
  },
  {
    user_id: "demo-8",
    full_name: "Donald Knuth",
    avatar_url: null,
    points: 980,
    solved_tasks_count: 20,
  },
];

interface CourseTrackTab {
  slug: string;
  title: string;
  shortName: string;
  langKey: string;
  totalProblems: number;
}

const AVAILABLE_COURSE_TRACKS: CourseTrackTab[] = [
  {
    slug: "python-dsa",
    title: "Python DSA & LeetCode Problem Solving",
    shortName: "Python DSA",
    langKey: "PY",
    totalProblems: 24,
  },
  {
    slug: "cpp-competitive-core",
    title: "C++ Competitive Programming & Algorithms",
    shortName: "C++ Competitive",
    langKey: "C++",
    totalProblems: 26,
  },
  {
    slug: "java-core-oop",
    title: "Java Core & OOP Masterclass",
    shortName: "Java Core",
    langKey: "JAVA",
    totalProblems: 25,
  },
  {
    slug: "javascript-frontend",
    title: "JavaScript & Frontend Engineering",
    shortName: "JavaScript",
    langKey: "JS",
    totalProblems: 24,
  },
  {
    slug: "c-systems",
    title: "C Systems Programming & Memory",
    shortName: "C Systems",
    langKey: "C",
    totalProblems: 25,
  },
];

export function LeaderboardPage() {
  const { user, profile } = useAuth();
  const [activeMode, setActiveMode] = useState<"overall" | "course">("overall");
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string>("python-dsa");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userCourseStats, setUserCourseStats] = useState<{ solved: number; points: number }>({
    solved: 0,
    points: 0,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeMode === "overall") {
        const { data, error } = await courseService.getLeaderboard(50);
        if (data && data.length > 0) {
          setLeaderboard(data);
        } else {
          setLeaderboard(DEMO_OVERALL_LEADERBOARD);
        }
      } else {
        // Mode 2: Within the course
        const { data } = await courseService.getCourseLeaderboard(selectedCourseSlug, 50);
        let entries = data && data.length > 0 ? [...data] : [];

        // Calculate current user's local and DB progress in this specific course
        let userSolvedInCourse = 0;
        try {
          const { data: courseData } = await courseService.getCourseBySlug(selectedCourseSlug);
          if (courseData) {
            const courseTaskIds = courseData.modules.flatMap((m) => (m.tasks || []).map((t) => t.id));
            const localCompleted = progressStorage.getCompletedTasks();
            userSolvedInCourse = courseTaskIds.filter(
              (id) => localCompleted[id]?.is_completed
            ).length;

            if (user?.id) {
              const { data: dbProg } = await courseService.getUserProgress(user.id);
              if (dbProg) {
                const dbSolved = courseTaskIds.filter((id) => dbProg[id]?.is_completed).length;
                userSolvedInCourse = Math.max(userSolvedInCourse, dbSolved);
              }
            }
          }
        } catch {
          // ignore
        }

        const userPts = userSolvedInCourse * 15;
        setUserCourseStats({ solved: userSolvedInCourse, points: userPts });

        // If current user is logged in, ensure they are represented in the course leaderboard
        if (user) {
          const existingIdx = entries.findIndex((e) => e.user_id === user.id);
          const currentUserName = profile?.full_name || user.email?.split("@")[0] || "You";

          if (existingIdx >= 0) {
            entries[existingIdx] = {
              ...entries[existingIdx],
              full_name: currentUserName,
              solved_tasks_count: Math.max(entries[existingIdx].solved_tasks_count, userSolvedInCourse),
              points: Math.max(entries[existingIdx].points, userPts),
            };
          } else if (userSolvedInCourse > 0) {
            entries.push({
              user_id: user.id,
              full_name: currentUserName,
              avatar_url: profile?.avatar_url || null,
              points: userPts,
              solved_tasks_count: userSolvedInCourse,
            });
          }
        }

        // Re-sort entries by solved tasks then points
        entries.sort((a, b) => {
          if (b.solved_tasks_count !== a.solved_tasks_count) {
            return b.solved_tasks_count - a.solved_tasks_count;
          }
          return b.points - a.points;
        });

        setLeaderboard(entries);
      }
    } catch (e) {
      console.error("[LeaderboardPage] Error loading standings:", e);
      setLeaderboard(DEMO_OVERALL_LEADERBOARD);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeMode, selectedCourseSlug]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filtered = leaderboard.filter((entry) =>
    (entry.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topThree = leaderboard.slice(0, 3);
  const selectedTrackInfo =
    AVAILABLE_COURSE_TRACKS.find((t) => t.slug === selectedCourseSlug) || AVAILABLE_COURSE_TRACKS[0];

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-[#090D16] py-8 sm:py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto space-y-8 sm:space-y-9">
        {/* ===================================================================
            HEADER: TITLE & DUAL-MODE TOGGLE SWITCHER
        =================================================================== */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[#6366F1] dark:text-indigo-400 text-xs font-semibold">
            <Trophy size={14} className="text-amber-500" />
            <span>AarCode Hall of Fame &amp; Leaderboard</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Engineering Leaderboard
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Compete with top developers, benchmark your problem-solving velocity, and track your ranking across the platform and within specific curriculum tracks.
          </p>

          {/* Dual-Mode Selector Tabs */}
          <div className="pt-3 flex justify-center">
            <div className="w-full sm:w-auto flex flex-col xs:flex-row items-stretch p-1.5 rounded-2xl bg-slate-200/70 dark:bg-[#0F172A] border border-slate-300/80 dark:border-[#1E293B] shadow-inner gap-1">
              <button
                onClick={() => setActiveMode("overall")}
                className={cn(
                  "flex-1 justify-center px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
                  activeMode === "overall"
                    ? "bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <Trophy size={15} className={cn(activeMode === "overall" ? "text-amber-500" : "text-slate-400")} />
                <span>1st Mode: Overall Users</span>
              </button>

              <button
                onClick={() => setActiveMode("course")}
                className={cn(
                  "flex-1 justify-center px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
                  activeMode === "course"
                    ? "bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <BookOpen size={15} className={cn(activeMode === "course" ? "text-indigo-500" : "text-slate-400")} />
                <span>2nd Mode: Within Course</span>
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================
            COURSE SELECTOR PILLS & COURSE TELEMETRY (When Course Mode is Active)
        =================================================================== */}
        {activeMode === "course" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Horizontal Track Selector */}
            <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
              {AVAILABLE_COURSE_TRACKS.map((track) => {
                const isSelected = selectedCourseSlug === track.slug;
                return (
                  <button
                    key={track.slug}
                    onClick={() => setSelectedCourseSlug(track.slug)}
                    className={cn(
                      "px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border",
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/25"
                        : "bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#1E293B] text-slate-600 dark:text-slate-300 hover:border-indigo-400"
                    )}
                  >
                    <span
                      className={cn(
                        "text-[10px] font-mono px-1.5 py-0.5 rounded font-bold",
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      )}
                    >
                      {track.langKey}
                    </span>
                    <span>{track.shortName}</span>
                  </button>
                );
              })}
            </div>

            {/* Course Summary Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-bold text-sm shrink-0">
                  {selectedTrackInfo.langKey}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                    {selectedTrackInfo.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Leaderboard ranked by completed problems &amp; verified unit test runs in this course.
                  </p>
                </div>
              </div>

              {/* Current user performance in this course */}
              <div className="flex items-center gap-3 shrink-0 bg-slate-50 dark:bg-[#090D16] p-2.5 rounded-xl border border-slate-200/60 dark:border-[#1E293B]">
                <UserCheck size={16} className="text-emerald-500" />
                <div className="text-xs">
                  <div className="text-slate-400 font-medium">Your Track Standing</div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    <span className="text-emerald-600 dark:text-emerald-400">{userCourseStats.solved}</span> /{" "}
                    {selectedTrackInfo.totalProblems} Solved •{" "}
                    <span className="text-indigo-600 dark:text-indigo-400">{userCourseStats.points} Track XP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            PODIUM FOR TOP 3 CHAMPIONS
        =================================================================== */}
        {topThree.length >= 3 && !loading && (
          <div className="grid grid-cols-3 gap-2.5 sm:gap-6 max-w-3xl mx-auto items-end pt-4 sm:pt-6">
            {/* #2 Rank: Silver */}
            <div className="flex flex-col items-center space-y-2 sm:space-y-3">
              <div className="relative">
                <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-800 font-bold flex items-center justify-center text-sm sm:text-xl shadow-md border-2 border-slate-300">
                  {getInitials(topThree[1].full_name)}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-300 text-slate-900 text-[10px] sm:text-xs font-semibold flex items-center justify-center shadow">
                  2
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[75px] sm:max-w-[140px]">
                  {topThree[1].full_name}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-amber-500 font-semibold">
                  {topThree[1].points} {activeMode === "course" ? "Track XP" : "XP"}
                </p>
                <p className="text-[9px] sm:text-[10px] text-slate-400">
                  {topThree[1].solved_tasks_count} Solved
                </p>
              </div>
              <div className="w-full h-16 sm:h-28 rounded-t-2xl bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-900 dark:to-slate-800/80 border border-slate-300 dark:border-slate-700/60 flex items-center justify-center font-bold text-slate-400 text-base sm:text-xl shadow-inner" />
            </div>

            {/* #1 Rank: Gold */}
            <div className="flex flex-col items-center space-y-2 sm:space-y-3 -mt-4 sm:-mt-6">
              <div className="relative">
                <div className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 text-yellow-500 drop-shadow-sm">
                  <Crown size={22} className="sm:w-6 sm:h-6" />
                </div>
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 text-amber-950 font-bold flex items-center justify-center text-base sm:text-2xl shadow-lg shadow-yellow-500/20 border-3 sm:border-4 border-yellow-300">
                  {getInitials(topThree[0].full_name)}
                </div>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5.5 h-5.5 sm:w-7 sm:h-7 rounded-full bg-yellow-400 text-yellow-950 text-[11px] sm:text-xs font-bold flex items-center justify-center shadow-md">
                  1
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xs sm:text-base font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[85px] sm:max-w-[160px]">
                  {topThree[0].full_name}
                </h3>
                <p className="text-[10px] sm:text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
                  {topThree[0].points} {activeMode === "course" ? "Track XP" : "XP"}
                </p>
                <p className="text-[9px] sm:text-[10px] text-slate-400">
                  {topThree[0].solved_tasks_count} Solved
                </p>
              </div>
              <div className="w-full h-24 sm:h-36 rounded-t-2xl bg-gradient-to-t from-amber-200 to-yellow-100 dark:from-amber-950/80 dark:to-yellow-900/40 border border-amber-300 dark:border-amber-700/50 flex items-center justify-center font-bold text-amber-500 text-lg sm:text-2xl shadow-inner" />
            </div>

            {/* #3 Rank: Bronze */}
            <div className="flex flex-col items-center space-y-2 sm:space-y-3">
              <div className="relative">
                <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-bold flex items-center justify-center text-sm sm:text-xl shadow-md border-2 border-amber-600">
                  {getInitials(topThree[2].full_name)}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-600 text-white text-[10px] sm:text-xs font-semibold flex items-center justify-center shadow">
                  3
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[75px] sm:max-w-[140px]">
                  {topThree[2].full_name}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-amber-500 font-semibold">
                  {topThree[2].points} {activeMode === "course" ? "Track XP" : "XP"}
                </p>
                <p className="text-[9px] sm:text-[10px] text-slate-400">
                  {topThree[2].solved_tasks_count} Solved
                </p>
              </div>
              <div className="w-full h-14 sm:h-24 rounded-t-2xl bg-gradient-to-t from-amber-100 to-orange-50 dark:from-stone-900 dark:to-amber-950/40 border border-amber-300/50 dark:border-amber-900/50 flex items-center justify-center font-bold text-amber-700 text-base sm:text-xl shadow-inner" />
            </div>
          </div>
        )}

        {/* ===================================================================
            RANKINGS TABLE CONTAINER
        =================================================================== */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] overflow-hidden shadow-xs">
          {/* Table Header Filter */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-500" />
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                {activeMode === "overall" ? "Global Platform Standings" : `Rankings in ${selectedTrackInfo.shortName}`}
              </h2>
              <span className="text-xs font-medium text-slate-400">
                ({filtered.length} coders)
              </span>
            </div>

            <div className="relative max-w-xs w-full">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search coder name..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-[#1E293B] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={28} className="animate-spin text-indigo-500" />
              <span className="text-xs font-medium">Loading standings...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-[#1E293B] text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/50 dark:bg-[#090D16]/50">
                  <tr>
                    <th className="py-3 px-3 sm:px-5 w-12 sm:w-16 text-center">Rank</th>
                    <th className="py-3 px-3 sm:px-4">Coder</th>
                    <th className="hidden sm:table-cell py-3 px-4 text-center">
                      {activeMode === "overall" ? "Total Tasks Solved" : `Solved in ${selectedTrackInfo.shortName}`}
                    </th>
                    <th className="py-3 px-4 sm:px-6 text-right">
                      {activeMode === "overall" ? "AarCode XP" : "Course Track XP"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]/60">
                  {filtered.map((entry, index) => {
                    const rank = index + 1;
                    const isCurrentUser = user && entry.user_id === user.id;

                    return (
                      <tr
                        key={entry.user_id}
                        className={cn(
                          "transition-colors",
                          isCurrentUser
                            ? "bg-indigo-50/70 dark:bg-indigo-950/30 font-semibold"
                            : "hover:bg-slate-50/50 dark:hover:bg-[#1E293B]/30"
                        )}
                      >
                        {/* Rank Badge */}
                        <td className="py-3.5 px-3 sm:px-5 text-center">
                          {rank === 1 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-400/20 text-yellow-600 dark:text-yellow-400">
                              <Medal size={14} className="text-amber-500" />
                            </span>
                          ) : rank === 2 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300/20 text-slate-500">
                              <Medal size={14} className="text-slate-400" />
                            </span>
                          ) : rank === 3 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600/20 text-amber-700 dark:text-amber-500">
                              <Medal size={14} className="text-amber-600 dark:text-amber-500" />
                            </span>
                          ) : (
                            <span className="font-mono font-semibold text-slate-500 text-xs">
                              #{rank}
                            </span>
                          )}
                        </td>

                        {/* Name and Avatar */}
                        <td className="py-3.5 px-3 sm:px-4">
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-[11px] sm:text-xs shadow-sm shrink-0">
                              {getInitials(entry.full_name)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="text-slate-900 dark:text-slate-100 font-semibold truncate text-xs sm:text-sm">
                                  {entry.full_name}
                                </span>
                                {isCurrentUser && (
                                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-600 text-white shrink-0">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="sm:hidden text-[10px] text-slate-400 font-normal block">
                                {entry.solved_tasks_count} solved
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Solved Tasks (hidden on mobile, shown under name) */}
                        <td className="hidden sm:table-cell py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                            <CheckCircle2 size={13} />
                            <span>
                              {entry.solved_tasks_count}
                              {activeMode === "course" && ` / ${selectedTrackInfo.totalProblems}`}
                            </span>
                          </span>
                        </td>

                        {/* Points */}
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <span className="font-mono font-bold text-amber-500 text-xs sm:text-sm">
                            ★ {entry.points.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LeaderboardPage;
