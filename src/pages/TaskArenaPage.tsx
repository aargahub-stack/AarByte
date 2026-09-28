import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Terminal,
  Code2,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  Award,
  Layers,
} from "lucide-react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { LanguageSelector } from "@/components/compiler/LanguageSelector";
import { getLanguageById, LANGUAGES } from "@/config/languages";
import { courseService } from "@/services/courseService";
import { executeCode } from "@/services/execution/wandboxExecutor";

import { judgeService, type JudgeResult, type TestCaseEvaluation } from "@/services/judgeService";
import type { TaskWithPublicTestCases, TestCase, EditorSettings } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils/cn";

interface TaskArenaPageProps {
  taskId: string;
  theme: "light" | "dark";
  navigate: (to: string, params?: Record<string, string>) => void;
}

// Built-in sample tasks for testing even before seeding Supabase
const DEMO_TASKS_MAP: Record<string, TaskWithPublicTestCases> = {
  "task-py-twosum": {
    id: "task-py-twosum",
    module_id: "mod-py-1",
    title: "Two Sum",
    slug: "two-sum",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.

### Constraints:
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- Only one valid answer exists.`,
    task_type: "algorithm",
    language: "python",
    difficulty: "easy",
    starter_code: `def two_sum(nums, target):
    # Return [index1, index2]
    lookup = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in lookup:
            return [lookup[diff], i]
        lookup[num] = i
    return []

# Standard I/O runner
import sys, json
lines = sys.stdin.read().splitlines()
if lines:
    nums = json.loads(lines[0])
    target = int(lines[1])
    print(json.dumps(two_sum(nums, target)))
`,
    solution_code: null,
    hints: [
      "A brute force approach would search all pairs in O(n^2) time.",
      "Can you use a hash map to look up complements in O(1) time?",
    ],
    points: 10,
    order_index: 1,
    test_cases: [
      {
        id: "tc-1",
        task_id: "task-py-twosum",
        input: "[2, 7, 11, 15]\n9",
        expected_output: "[0, 1]",
        is_hidden: false,
        explanation: "nums[0] + nums[1] == 9, so return [0, 1].",
      },
      {
        id: "tc-2",
        task_id: "task-py-twosum",
        input: "[3, 2, 4]\n6",
        expected_output: "[1, 2]",
        is_hidden: false,
        explanation: "nums[1] + nums[2] == 6, so return [1, 2].",
      },
      {
        id: "tc-3",
        task_id: "task-py-twosum",
        input: "[3, 3]\n6",
        expected_output: "[0, 1]",
        is_hidden: false,
        explanation: "nums[0] + nums[1] == 6, so return [0, 1].",
      },
    ],
  },
  "task-py-palindrome": {
    id: "task-py-palindrome",
    module_id: "mod-py-1",
    title: "Valid Palindrome",
    slug: "valid-palindrome",
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Alphanumeric characters include letters and numbers.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.`,
    task_type: "algorithm",
    language: "python",
    difficulty: "easy",
    starter_code: `def is_palindrome(s: str) -> bool:
    filtered = "".join(ch.lower() for ch in s if ch.isalnum())
    return filtered == filtered[::-1]

import sys
s = sys.stdin.read().strip()
print(str(is_palindrome(s)).lower())
`,
    solution_code: null,
    hints: [
      "Consider using two pointers from the start and end of the string.",
      "Filter out punctuation and ignore casing before comparing.",
    ],
    points: 10,
    order_index: 2,
    test_cases: [
      {
        id: "tc-pal-1",
        task_id: "task-py-palindrome",
        input: "A man, a plan, a canal: Panama",
        expected_output: "true",
        is_hidden: false,
        explanation: '"amanaplanacanalpanama" is a palindrome.',
      },
      {
        id: "tc-pal-2",
        task_id: "task-py-palindrome",
        input: "race a car",
        expected_output: "false",
        is_hidden: false,
        explanation: '"raceacar" is not a palindrome.',
      },
    ],
  },
};

const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 14,
  tabSize: 4,
  wordWrap: true,
  minimap: false,
  lineNumbers: true,
};

export function TaskArenaPage({ taskId, theme, navigate }: TaskArenaPageProps) {
  const { user, openAuthModal, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [task, setTask] = useState<TaskWithPublicTestCases | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [activeBottomTab, setActiveBottomTab] = useState<"testcase" | "result">("testcase");
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [customStdin, setCustomStdin] = useState("");
  const [isCustomInput, setIsCustomInput] = useState(false);

  const [expandedHints, setExpandedHints] = useState<Record<number, boolean>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [runTestResults, setRunTestResults] = useState<TestCaseEvaluation[] | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    async function loadTask() {
      setLoading(true);
      try {
        const { data, error } = await courseService.getTaskDetails(taskId);
        if (data) {
          setTask(data);
          setLanguage(data.language || "python");
          setCode(data.starter_code || getLanguageById(data.language || "python")?.starterCode || "");
          if (data.test_cases && data.test_cases.length > 0) {
            setCustomStdin(data.test_cases[0].input || "");
          }
        } else if (DEMO_TASKS_MAP[taskId]) {
          const demo = DEMO_TASKS_MAP[taskId];
          setTask(demo);
          setLanguage(demo.language);
          setCode(demo.starter_code || "");
          if (demo.test_cases && demo.test_cases.length > 0) {
            setCustomStdin(demo.test_cases[0].input || "");
          }
        } else {
          // Fallback to first demo task
          const demo = DEMO_TASKS_MAP["task-py-twosum"];
          setTask(demo);
          setLanguage(demo.language);
          setCode(demo.starter_code || "");
          if (demo.test_cases && demo.test_cases.length > 0) {
            setCustomStdin(demo.test_cases[0].input || "");
          }
        }
      } catch (e: any) {
        console.error("Error loading task:", e);
      } finally {
        setLoading(false);
      }
    }

    loadTask();
  }, [taskId]);

  const handleResetCode = () => {
    if (!task) return;
    if (confirm("Reset editor to starter code?")) {
      setCode(task.starter_code || getLanguageById(language)?.starterCode || "");
      showToast("info", "Code reset to default");
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  // Run against Public Testcases only
  const handleRunCode = async () => {
    if (!task) return;
    setIsRunning(true);
    setActiveBottomTab("result");
    setJudgeResult(null);

    try {
      if (task.id.startsWith("demo-") || !task.id.includes("-")) {
        // Evaluate locally against task's public test cases
        const sampleCases = task.test_cases || [];
        const evals: TestCaseEvaluation[] = [];
        let passed = 0;

        for (let i = 0; i < sampleCases.length; i++) {
          const tc = sampleCases[i];
          const inputToRun = isCustomInput && i === selectedCaseIndex ? customStdin : tc.input;
          const res = await executeCode({
            language,
            sourceCode: code,
            stdin: inputToRun || "",
          });


          const actual = (res.stdout || "").replace(/\r\n/g, "\n").trim();
          const expected = (tc.expected_output || "").replace(/\r\n/g, "\n").trim();
          const isMatch = res.status === "success" && actual === expected;

          if (isMatch) passed++;

          evals.push({
            testCaseId: tc.id,
            index: i + 1,
            isHidden: false,
            passed: isMatch,
            input: tc.input,
            expectedOutput: tc.expected_output,
            actualOutput: res.stdout,
            executionTimeMs: res.executionTime,
            errorMessage: res.status !== "success" ? res.stderr : undefined,
          });
        }

        setRunTestResults(evals);
      } else {
        const res = await judgeService.runPublicTestCases({
          taskId: task.id,
          code,
          language,
        });
        setRunTestResults(res.results);
      }
    } catch (err: any) {
      showToast("error", err.message || "Execution failed");
    } finally {
      setIsRunning(false);
    }
  };

  // Submit against ALL test cases (Public + Hidden)
  const handleSubmit = async () => {
    if (!task) return;

    if (!user) {
      showToast("warning", "Please sign in to submit and earn AarByte points!");
      openAuthModal("login");
      return;
    }

    setIsSubmitting(true);
    setActiveBottomTab("result");
    setRunTestResults(null);

    try {
      const res = await judgeService.submitSolution({
        taskId: task.id,
        userId: user.id,
        code,
        language,
      });

      setJudgeResult(res);

      if (res.status === "passed") {
        setShowCelebration(true);
        refreshProfile();
        // Fire confetti
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
        });
      } else {
        showToast("error", `Submission: ${res.status.toUpperCase()}`);
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to submit solution");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-500">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <span className="ml-3 text-sm font-medium">Entering Practice Arena...</span>
      </div>
    );
  }

  const publicCases = task.test_cases || [];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Top Arena Navigation Bar */}
      <div className="h-12 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("courses")}
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Problem List</span>
          </button>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate max-w-xs">
            {task.title}
          </span>
          <span
            className={cn(
              "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border",
              task.difficulty === "easy"
                ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                : task.difficulty === "medium"
                ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
            )}
          >
            {task.difficulty}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetCode}
            title="Reset to starter code"
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            <span>Run Code</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            <span>Submit Solution</span>
          </button>
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left Panel: Problem Statement & Testcase Samples */}
        <div className="lg:w-[48%] border-r border-gray-200 dark:border-gray-800 flex flex-col min-h-0 bg-white dark:bg-gray-950 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2 border-b border-gray-100 dark:border-gray-800/80 pb-4">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              {task.title}
            </h1>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                <Sparkles size={13} />
                {task.points || 10} Points
              </span>
              <span>•</span>
              <span className="font-mono uppercase">{task.language}</span>
              <span>•</span>
              <span>Algorithm Challenge</span>
            </div>
          </div>

          {/* Problem Statement Body */}
          <div className="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 space-y-3 whitespace-pre-line leading-relaxed">
            {task.description}
          </div>

          {/* Public Test Cases Section */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Sample Examples
            </h3>
            {publicCases.map((tc, idx) => (
              <div
                key={tc.id || idx}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-4 space-y-2.5 text-xs font-mono"
              >
                <div className="flex items-center justify-between text-gray-500">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    Example {idx + 1}
                  </span>
                  <button
                    onClick={() => handleCopy(tc.input, idx)}
                    className="p-1 hover:text-blue-500 transition-colors"
                    title="Copy input"
                  >
                    {copiedIndex === idx ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-sans font-semibold text-gray-400">Input:</span>
                  <div className="p-2 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre">
                    {tc.input || "(empty)"}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-sans font-semibold text-gray-400">Expected Output:</span>
                  <div className="p-2 rounded bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre">
                    {tc.expected_output}
                  </div>
                </div>

                {tc.explanation && (
                  <p className="font-sans text-[11px] text-gray-500 dark:text-gray-400 italic pt-1">
                    Explanation: {tc.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Hints Accordion */}
          {task.hints && task.hints.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <HelpCircle size={14} />
                <span>Hints ({task.hints.length})</span>
              </h3>
              {task.hints.map((hint, hIdx) => {
                const isHintOpen = !!expandedHints[hIdx];
                return (
                  <div
                    key={hIdx}
                    className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedHints((prev) => ({ ...prev, [hIdx]: !prev[hIdx] }))
                      }
                      className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors"
                    >
                      <span>Hint {hIdx + 1}</span>
                      {isHintOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {isHintOpen && (
                      <div className="p-3.5 text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-950 leading-relaxed border-t border-gray-100 dark:border-gray-800">
                        {hint}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Panel: Top Monaco Editor + Bottom Execution Console */}
        <div className="flex-1 flex flex-col min-h-0 bg-gray-900">
          {/* Editor Header Bar */}
          <div className="h-10 border-b border-gray-800 bg-gray-950 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Code2 size={15} className="text-blue-400" />
              <span className="text-xs font-semibold text-gray-300">Code Editor</span>
            </div>

            {/* Language Selector */}
            <div className="w-36">
              <LanguageSelector
                value={language}
                onChange={(langId: string) => setLanguage(langId)}
              />
            </div>

          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-[300px] overflow-hidden">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={getLanguageById(language)?.monacoLanguage || language}
              theme={theme}
              settings={DEFAULT_SETTINGS}
            />
          </div>

          {/* Bottom Console / Test Results Panel */}
          <div className="h-[280px] border-t border-gray-800 bg-gray-950 flex flex-col shrink-0">
            {/* Console Tab Header */}
            <div className="h-10 border-b border-gray-800 px-4 flex items-center justify-between bg-gray-900/60">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveBottomTab("testcase")}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-lg transition-colors",
                    activeBottomTab === "testcase"
                      ? "bg-gray-800 text-blue-400 shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  )}
                >
                  Testcases
                </button>
                <button
                  onClick={() => setActiveBottomTab("result")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors",
                    activeBottomTab === "result"
                      ? "bg-gray-800 text-blue-400 shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  )}
                >
                  <span>Test Result</span>
                  {(judgeResult || runTestResults) && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </button>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {isRunning && <span className="text-blue-400 animate-pulse">Running test cases...</span>}
                {isSubmitting && <span className="text-emerald-400 animate-pulse">Evaluating solution...</span>}
              </div>
            </div>

            {/* Console Body Content */}
            <div className="flex-1 p-4 overflow-y-auto text-xs font-mono">
              {activeBottomTab === "testcase" ? (
                /* Tab 1: Interactive Testcases */
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {publicCases.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedCaseIndex(idx);
                          setIsCustomInput(false);
                          setCustomStdin(publicCases[idx]?.input || "");
                        }}
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                          !isCustomInput && selectedCaseIndex === idx
                            ? "bg-blue-600 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        )}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setIsCustomInput(true)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                        isCustomInput
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      )}
                    >
                      Custom Input
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-400 text-[11px] font-sans font-semibold">
                      Standard Input (stdin):
                    </label>
                    <textarea
                      value={customStdin}
                      onChange={(e) => setCustomStdin(e.target.value)}
                      rows={4}
                      placeholder="Input data to pass to program stdin..."
                      className="w-full p-2.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-xs"
                    />
                  </div>
                </div>
              ) : (
                /* Tab 2: Test Results & Evaluation Breakdown */
                <div>
                  {!judgeResult && !runTestResults && !isRunning && !isSubmitting && (
                    <div className="text-center py-10 text-gray-500 font-sans">
                      <Terminal size={24} className="mx-auto mb-2 opacity-50" />
                      <p>Run your code or submit your solution to view evaluation output.</p>
                    </div>
                  )}

                  {/* Submission Judge Result View */}
                  {judgeResult && (
                    <div className="space-y-4">
                      {/* Top Result Banner */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {judgeResult.status === "passed" ? (
                            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm font-sans">
                              <CheckCircle2 size={18} />
                              <span>Accepted</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-rose-400 font-bold text-sm font-sans">
                              <XCircle size={18} />
                              <span className="capitalize">{judgeResult.status.replace("_", " ")}</span>
                            </div>
                          )}
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400 text-xs font-sans">
                            {judgeResult.passedCases} / {judgeResult.totalCases} Test Cases Passed
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-400 font-sans">
                          <span className="flex items-center gap-1">
                            <Clock size={13} />
                            {judgeResult.totalExecutionTimeMs} ms
                          </span>
                          {judgeResult.pointsEarned > 0 && (
                            <span className="text-amber-400 font-bold">
                              +{judgeResult.pointsEarned} XP
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Error message detail if present */}
                      {judgeResult.errorMessage && (
                        <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-300 text-xs font-mono whitespace-pre-wrap">
                          {judgeResult.errorMessage}
                        </div>
                      )}

                      {/* Case evaluations list */}
                      <div className="space-y-2">
                        {judgeResult.testCaseResults.map((tc, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "p-3 rounded-lg border text-xs space-y-1.5",
                              tc.passed
                                ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-300"
                                : "bg-rose-950/20 border-rose-900/40 text-rose-300"
                            )}
                          >
                            <div className="flex justify-between font-bold font-sans">
                              <span>
                                {tc.isHidden ? "Hidden Testcase" : `Testcase ${tc.index}`}
                              </span>
                              <span>{tc.passed ? "Passed" : "Failed"}</span>
                            </div>

                            {!tc.isHidden && tc.input && (
                              <div className="font-mono text-gray-400 text-[11px]">
                                Input: {tc.input}
                              </div>
                            )}
                            {!tc.isHidden && tc.actualOutput && (
                              <div className="font-mono text-gray-300 text-[11px]">
                                Output: {tc.actualOutput.trim()}
                              </div>
                            )}
                            {!tc.isHidden && tc.expectedOutput && !tc.passed && (
                              <div className="font-mono text-gray-400 text-[11px]">
                                Expected: {tc.expectedOutput.trim()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Public Run Code Result View */}
                  {runTestResults && !judgeResult && (
                    <div className="space-y-3">
                      <div className="text-xs font-sans font-bold text-gray-300 flex items-center justify-between">
                        <span>Sample Cases Evaluation</span>
                        <span className="text-gray-400">
                          {runTestResults.filter((r) => r.passed).length} / {runTestResults.length} Passed
                        </span>
                      </div>

                      <div className="space-y-2">
                        {runTestResults.map((res, i) => (
                          <div
                            key={i}
                            className={cn(
                              "p-3 rounded-lg border text-xs space-y-1",
                              res.passed
                                ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-300"
                                : "bg-rose-950/20 border-rose-900/40 text-rose-300"
                            )}
                          >
                            <div className="flex justify-between font-bold font-sans">
                              <span>Example {res.index}</span>
                              <span>{res.passed ? "Passed" : "Wrong Answer"}</span>
                            </div>
                            <div className="text-[11px] text-gray-400">Input: {res.input}</div>
                            <div className="text-[11px] text-gray-300">
                              Your Output: {res.actualOutput?.trim() || "(no output)"}
                            </div>
                            {!res.passed && (
                              <div className="text-[11px] text-gray-400">
                                Expected: {res.expectedOutput?.trim()}
                              </div>
                            )}
                            {res.errorMessage && (
                              <div className="text-[11px] text-red-400 pt-1">
                                {res.errorMessage}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success / Points Modal Celebration */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Award size={36} className="animate-bounce" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                Challenge Solved!
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                All public and hidden test cases passed successfully.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
              <Sparkles size={18} />
              <span>+{judgeResult?.pointsEarned || 10} XP Awarded</span>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setShowCelebration(false)}
                className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Stay Here
              </button>
              <button
                onClick={() => {
                  setShowCelebration(false);
                  navigate("courses");
                }}
                className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all"
              >
                Next Challenge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskArenaPage;
