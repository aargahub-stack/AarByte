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
} from "lucide-react";
import { courseService } from "@/services/courseService";
import type { LeaderboardEntry } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";

// Fallback demo leaderboard entries if table/view is freshly initialized
const DEMO_LEADERBOARD: LeaderboardEntry[] = [
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

export function LeaderboardPage() {
  const { user, profile } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await courseService.getLeaderboard(50);
      if (data && data.length > 0) {
        setLeaderboard(data);
      } else {
        // Use demo leaderboard
        setLeaderboard(DEMO_LEADERBOARD);
      }
    } catch (e) {
      console.error(e);
      setLeaderboard(DEMO_LEADERBOARD);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filtered = leaderboard.filter((entry) =>
    entry.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Leaderboard Header Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <Trophy size={14} className="text-amber-500" />
            <span>AarByte Global Rankings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Coder Hall of Fame
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Solve algorithmic tasks, earn XP points, and climb the leaderboard to showcase your coding expertise.
          </p>
        </div>

        {/* Podium for Top 3 Champions */}
        {topThree.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto items-end pt-6">
            {/* #2 Rank: Silver */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-800 font-bold flex items-center justify-center text-lg sm:text-xl shadow-lg shadow-slate-500/20 border-2 border-slate-300">
                  {getInitials(topThree[1].full_name)}
                </div>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-300 text-slate-900 text-xs font-semibold flex items-center justify-center shadow">
                  2
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[100px] sm:max-w-[140px]">
                  {topThree[1].full_name}
                </h3>
                <p className="text-[11px] text-amber-500 font-semibold">
                  {topThree[1].points} XP
                </p>
                <p className="text-[10px] text-gray-400">
                  {topThree[1].solved_tasks_count} Solved
                </p>
              </div>
              <div className="w-full h-24 sm:h-28 rounded-t-2xl bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-900 dark:to-slate-800/80 border border-slate-300 dark:border-slate-700/60 flex items-center justify-center font-bold text-slate-400 text-xl" />
            </div>

            {/* #1 Rank: Gold */}
            <div className="flex flex-col items-center space-y-3 -mt-6">
              <div className="relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500 drop-shadow-sm">
                  <Crown size={28} />
                </div>
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 text-amber-950 font-bold flex items-center justify-center text-xl sm:text-2xl shadow-xl shadow-yellow-500/30 border-4 border-yellow-300">
                  {getInitials(topThree[0].full_name)}
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-yellow-400 text-yellow-950 text-xs font-bold flex items-center justify-center shadow-md">
                  1
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[120px] sm:max-w-[160px]">
                  {topThree[0].full_name}
                </h3>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
                  {topThree[0].points} XP
                </p>
                <p className="text-[10px] text-gray-400">
                  {topThree[0].solved_tasks_count} Solved
                </p>
              </div>
              <div className="w-full h-32 sm:h-36 rounded-t-2xl bg-gradient-to-t from-amber-200 to-yellow-100 dark:from-amber-950 dark:to-yellow-900/40 border border-amber-300 dark:border-amber-700/50 flex items-center justify-center font-bold text-amber-500 text-2xl shadow-inner" />
            </div>

            {/* #3 Rank: Bronze */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-bold flex items-center justify-center text-lg sm:text-xl shadow-lg shadow-amber-700/20 border-2 border-amber-600">
                  {getInitials(topThree[2].full_name)}
                </div>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-semibold flex items-center justify-center shadow">
                  3
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[100px] sm:max-w-[140px]">
                  {topThree[2].full_name}
                </h3>
                <p className="text-[11px] text-amber-500 font-bold">
                  {topThree[2].points} XP
                </p>
                <p className="text-[10px] text-gray-400">
                  {topThree[2].solved_tasks_count} Solved
                </p>
              </div>
              <div className="w-full h-20 sm:h-24 rounded-t-2xl bg-gradient-to-t from-amber-100 to-orange-50 dark:from-stone-900 dark:to-amber-950/40 border border-amber-300/50 dark:border-amber-900/50 flex items-center justify-center font-bold text-amber-700 text-xl" />
            </div>
          </div>
        )}

        {/* Search & Rankings Table Container */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
          {/* Table Header Filter */}
          <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" />
              <span>Rankings Table</span>
            </h2>

            <div className="relative max-w-xs w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search coder name..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-gray-400">
              <Loader2 size={28} className="animate-spin text-blue-500" />
              <span className="text-xs">Loading leaderboard standings...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase tracking-wider text-[10px] bg-gray-50/50 dark:bg-gray-950/40">
                  <tr>
                    <th className="py-3 px-6 w-16 text-center">Rank</th>
                    <th className="py-3 px-4">Coder</th>
                    <th className="py-3 px-4 text-center">Solved Tasks</th>
                    <th className="py-3 px-6 text-right">AarByte XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {filtered.map((entry, index) => {
                    const rank = index + 1;
                    const isCurrentUser = user && entry.user_id === user.id;

                    return (
                      <tr
                        key={entry.user_id}
                        className={cn(
                          "transition-colors",
                          isCurrentUser
                            ? "bg-blue-50/70 dark:bg-blue-950/30 font-semibold"
                            : "hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                        )}
                      >
                        {/* Rank Badge */}
                        <td className="py-3.5 px-6 text-center">
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
                            <span className="font-mono font-semibold text-gray-500 text-xs">
                              #{rank}
                            </span>
                          )}
                        </td>

                        {/* Name and Avatar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                              {getInitials(entry.full_name)}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900 dark:text-gray-100 font-semibold">
                                {entry.full_name}
                              </span>
                              {isCurrentUser && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Solved Tasks */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold">
                            <CheckCircle2 size={13} />
                            {entry.solved_tasks_count}
                          </span>
                        </td>

                        {/* Points */}
                        <td className="py-3.5 px-6 text-right">
                          <span className="font-mono font-bold text-amber-500 text-sm">
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
