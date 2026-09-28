import { useState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Code2,
  Terminal,
  Layers,
  Search,
  Loader2,
  Trophy,
} from "lucide-react";
import { courseService } from "@/services/courseService";
import type { CourseWithModules, UserTaskProgress } from "@/types/database.types";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";

// Fallback demo courses shown if database is not yet seeded
const DEMO_COURSES: CourseWithModules[] = [
  {
    id: "demo-python",
    title: "Python Data Structures & Algorithms",
    slug: "python-dsa",
    description: "Master essential algorithms, arrays, hash maps, and recursion with LeetCode-style Python tasks.",
    icon: "code",
    is_published: true,
    modules: [
      {
        id: "mod-py-1",
        course_id: "demo-python",
        title: "Module 1: Arrays & Two Pointers",
        order_index: 1,
        tasks: [
          {
            id: "task-py-twosum",
            module_id: "mod-py-1",
            title: "Two Sum",
            slug: "two-sum",
            description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
            task_type: "algorithm",
            language: "python",
            difficulty: "easy",
            starter_code: "def two_sum(nums, target):\n    # Write your solution here\n    pass\n\nimport sys, json\nlines = sys.stdin.read().splitlines()\nif lines:\n    nums = json.loads(lines[0])\n    target = int(lines[1])\n    print(json.dumps(two_sum(nums, target)))\n",
            solution_code: null,
            hints: ["Use a hash map to store previously seen numbers."],
            points: 10,
            order_index: 1,
          },
          {
            id: "task-py-palindrome",
            module_id: "mod-py-1",
            title: "Valid Palindrome",
            slug: "valid-palindrome",
            description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
            task_type: "algorithm",
            language: "python",
            difficulty: "easy",
            starter_code: "def is_palindrome(s: str) -> bool:\n    # Return True if s is palindrome\n    pass\n\nimport sys\ns = sys.stdin.read().strip()\nprint(str(is_palindrome(s)).lower())\n",
            solution_code: null,
            hints: ["Filter non-alphanumeric characters with .isalnum()"],
            points: 10,
            order_index: 2,
          },
        ],
      },
      {
        id: "mod-py-2",
        course_id: "demo-python",
        title: "Module 2: Stacks & Sliding Window",
        order_index: 2,
        tasks: [
          {
            id: "task-py-valid-parentheses",
            module_id: "mod-py-2",
            title: "Valid Parentheses",
            slug: "valid-parentheses",
            description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
            task_type: "algorithm",
            language: "python",
            difficulty: "medium",
            starter_code: "def is_valid(s: str) -> bool:\n    stack = []\n    # Implement validation\n    return False\n\nimport sys\nprint(str(is_valid(sys.stdin.read().strip())).lower())\n",
            solution_code: null,
            hints: ["Push opening brackets to stack and pop matching closers."],
            points: 15,
            order_index: 1,
          },
        ],
      },
    ],
  },
  {
    id: "demo-cpp",
    title: "C++ Competitive Programming Core",
    slug: "cpp-competitive-core",
    description: "High-performance problem solving techniques using modern C++20 and STL containers.",
    icon: "terminal",
    is_published: true,
    modules: [
      {
        id: "mod-cpp-1",
        course_id: "demo-cpp",
        title: "Module 1: Fast I/O & STL Vectors",
        order_index: 1,
        tasks: [
          {
            id: "task-cpp-reversal",
            module_id: "mod-cpp-1",
            title: "Array Reversal in Place",
            slug: "array-reversal",
            description: "Reverse an array of N integers in place without allocating extra memory.",
            task_type: "algorithm",
            language: "cpp",
            difficulty: "easy",
            starter_code: "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> a(n);\n    for(int i = 0; i < n; i++) cin >> a[i];\n    reverse(a.begin(), a.end());\n    for(int i = 0; i < n; i++) {\n        cout << a[i] << (i + 1 == n ? \"\" : \" \");\n    }\n    cout << endl;\n    return 0;\n}\n",
            solution_code: null,
            hints: ["Use std::reverse or two pointers swap."],
            points: 10,
            order_index: 1,
          },
        ],
      },
    ],
  },
  {
    id: "demo-js",
    title: "JavaScript & Frontend Engineering",
    slug: "javascript-mastery",
    description: "Deep dive into asynchronous JavaScript, event loop, closures, and algorithmic problem solving.",
    icon: "layout",
    is_published: true,
    modules: [
      {
        id: "mod-js-1",
        course_id: "demo-js",
        title: "Module 1: Functional Programming & Array Transforms",
        order_index: 1,
        tasks: [
          {
            id: "task-js-flatten",
            module_id: "mod-js-1",
            title: "Flatten Deep Array",
            slug: "flatten-deep-array",
            description: "Implement a function `flatten(arr)` that flattens a multi-dimensional array into a single dimension without using `Array.prototype.flat`.",
            task_type: "algorithm",
            language: "javascript",
            difficulty: "medium",
            starter_code: "function flatten(arr) {\n  // Implement array flattener\n  return [];\n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n  const parsed = JSON.parse(input);\n  console.log(JSON.stringify(flatten(parsed)));\n}\n",
            solution_code: null,
            hints: ["Recursively process elements or use a stack."],
            points: 15,
            order_index: 1,
          },
        ],
      },
    ],
  },
];

interface CoursesPageProps {
  navigate: (to: string, params?: Record<string, string>) => void;
}

export function CoursesPage({ navigate }: CoursesPageProps) {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseWithModules[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, UserTaskProgress>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data, error } = await courseService.getCourses();
        let courseList = data && data.length > 0 ? data : DEMO_COURSES;
        setCourses(courseList);

        if (user?.id) {
          const allTaskIds = courseList.flatMap((c) =>
            c.modules.flatMap((m) => m.tasks.map((t) => t.id))
          );
          const { data: prog } = await courseService.getUserProgress(user.id, allTaskIds);
          if (prog) {
            setProgressMap(prog);
          }
        }
      } catch (e) {
        console.error("Failed to load courses:", e);
        setCourses(DEMO_COURSES);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.id]);

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateProgress = (course: CourseWithModules) => {
    const tasks = course.modules.flatMap((m) => m.tasks);
    if (tasks.length === 0) return { solved: 0, total: 0, percent: 0 };
    const solved = tasks.filter((t) => progressMap[t.id]?.is_completed).length;
    const percent = Math.round((solved / tasks.length) * 100);
    return { solved, total: tasks.length, percent };
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-950 to-gray-950 text-white p-8 sm:p-10 border border-blue-500/20 shadow-2xl">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Sparkles size={14} className="animate-spin" />
              <span>Curated Interactive Learning Tracks</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Level Up Your Coding Mastery
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Step-by-step problem sets designed to build foundational computer science skills,
              algorithm patterns, and technical interview readiness.
            </p>

            {/* Search Input */}
            <div className="pt-2 max-w-md">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tracks (e.g., Python, C++, Algorithms)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/90 border border-gray-700/80 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tracks Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
              <span>Available Learning Tracks</span>
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                ({filteredCourses.length} {filteredCourses.length === 1 ? "track" : "tracks"})
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <Loader2 size={32} className="animate-spin text-blue-500" />
              <p className="text-sm">Loading course roadmap...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No courses found matching "{searchQuery}".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const { solved, total, percent } = calculateProgress(course);
                const isCompleted = total > 0 && solved === total;

                return (
                  <div
                    key={course.id}
                    onClick={() => navigate("course", { slug: course.slug })}
                    className="group cursor-pointer rounded-2xl bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 shadow-sm hover:shadow-xl dark:hover:shadow-blue-500/5 transition-all duration-200 flex flex-col justify-between overflow-hidden"
                  >
                    <div className="p-6 space-y-4">
                      {/* Top icon and tag */}
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                          <Code2 size={24} />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {course.modules.length} {course.modules.length === 1 ? "Chapter" : "Chapters"}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1.5">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {course.description || "Interactive problem solving track for mastering programming concepts."}
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                          <span>Progress</span>
                          <span className={cn(isCompleted && "text-green-500 font-bold")}>
                            {percent}% ({solved}/{total} Solved)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-500 rounded-full",
                              isCompleted
                                ? "bg-green-500"
                                : "bg-gradient-to-r from-blue-500 to-indigo-500"
                            )}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                      <span>{isCompleted ? "Review Track" : solved > 0 ? "Continue Journey" : "Start Track"}</span>
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
