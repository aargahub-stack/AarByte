import { useState, useEffect } from "react";
import {
  Code2,
  CheckCircle2,
  Search,
  Sparkles,
  ArrowRight,
  Filter,
  Loader2,
  BookOpen,
} from "lucide-react";
import { courseService } from "@/services/courseService";
import type { Task, UserTaskProgress } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";

interface ProblemsPageProps {
  navigate: (to: string, params?: Record<string, string>) => void;
}

interface TaskWithCourse extends Task {
  courseTitle?: string;
  courseSlug?: string;
}

export function ProblemsPage({ navigate }: ProblemsPageProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskWithCourse[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, UserTaskProgress>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");

  useEffect(() => {
    async function loadTasks() {
      setLoading(true);
      try {
        const { data: courses } = await courseService.getCourses();
        if (courses && courses.length > 0) {
          const allTasks: TaskWithCourse[] = [];
          courses.forEach((c) => {
            c.modules.forEach((m) => {
              (m.tasks || []).forEach((t) => {
                allTasks.push({
                  ...t,
                  courseTitle: c.title,
                  courseSlug: c.slug,
                });
              });
            });
          });
          setTasks(allTasks);

          if (user?.id) {
            const taskIds = allTasks.map((t) => t.id);
            const { data: prog } = await courseService.getUserProgress(user.id, taskIds);
            if (prog) {
              setProgressMap(prog);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [user?.id]);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff =
      difficultyFilter === "all" || t.difficulty === difficultyFilter;
    const matchesLang =
      languageFilter === "all" || t.language.toLowerCase() === languageFilter.toLowerCase();
    return matchesSearch && matchesDiff && matchesLang;
  });

  const solvedCount = tasks.filter((t) => progressMap[t.id]?.is_completed).length;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Arena Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2 border border-blue-500/20">
              <Code2 size={14} />
              <span>Practice Arena</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              Algorithm Challenge Bank
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Pick a problem, write and test code against the Wandbox engine, and earn AarByte XP.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 px-5 text-right space-y-0.5">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Solved So Far
            </span>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              <span className="text-green-500">{solvedCount}</span>
              <span className="text-gray-400 text-sm"> / {tasks.length}</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems by name or keyword..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 w-full sm:w-auto">
            {["all", "easy", "medium", "hard"].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                  difficultyFilter === diff
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Problems Table */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-gray-400">
              <Loader2 size={28} className="animate-spin text-blue-500" />
              <span className="text-xs">Loading problem set...</span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-xs">
              No tasks found matching your filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase tracking-wider text-[10px] bg-gray-50/50 dark:bg-gray-950/40">
                  <tr>
                    <th className="py-3 px-5 w-12 text-center">Status</th>
                    <th className="py-3 px-4">Problem Title</th>
                    <th className="py-3 px-4">Track / Module</th>
                    <th className="py-3 px-4">Difficulty</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-5 text-right">Points</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-sans">
                  {filteredTasks.map((t) => {
                    const isSolved = !!progressMap[t.id]?.is_completed;
                    const diffBadge =
                      t.difficulty === "easy"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                        : t.difficulty === "medium"
                        ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
                        : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";

                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group"
                      >
                        <td className="py-3.5 px-5 text-center">
                          {isSolved ? (
                            <CheckCircle2 size={16} className="text-green-500 mx-auto" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700 mx-auto" />
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          <button
                            onClick={() => navigate("task", { taskId: t.id })}
                            className="text-left hover:underline"
                          >
                            {t.title}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                          {t.courseTitle || "General Practice"}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                              diffBadge
                            )}
                          >
                            {t.difficulty}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono uppercase text-[11px] text-gray-500">
                          {t.language}
                        </td>

                        <td className="py-3.5 px-5 text-right font-medium text-amber-500">
                          +{t.points} XP
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => navigate("task", { taskId: t.id })}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all"
                          >
                            <span>{isSolved ? "Practice" : "Solve"}</span>
                            <ArrowRight size={12} />
                          </button>
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

export default ProblemsPage;
