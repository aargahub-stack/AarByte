import { supabase } from "./supabase";
import { executeCode } from "./execution/wandboxExecutor";
import type {
  SubmissionStatus,
  TestCase,
  Task,
  Profile,
} from "@/types/database.types";

export interface SubmitSolutionParams {
  taskId: string;
  userId: string;
  code: string;
  language: string;
  stopOnFirstFailure?: boolean;
}

export interface TestCaseEvaluation {
  testCaseId: string;
  index: number;
  isHidden: boolean;
  passed: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  explanation?: string | null;
  executionTimeMs?: number;
  errorMessage?: string | null;
}

export interface JudgeResult {
  submissionId?: string;
  status: SubmissionStatus;
  passedCases: number;
  totalCases: number;
  totalExecutionTimeMs: number;
  errorMessage?: string | null;
  testCaseResults: TestCaseEvaluation[];
  pointsEarned: number;
  isAlreadyCompleted: boolean;
}

function normalizeOutput(output: string): string {
  return (output || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
}

export const judgeService = {
  /**
   * Secure Judge: Evaluates solution against ALL test cases (public and hidden),
   * records submission, awards points and updates progress if passed.
   */
  async submitSolution({
    taskId,
    userId,
    code,
    language,
    stopOnFirstFailure = false,
  }: SubmitSolutionParams): Promise<JudgeResult> {
    const startTime = performance.now();

    // 1. Fetch task details for points
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, points, title")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      throw new Error(`Task not found: ${taskError?.message || "Invalid taskId"}`);
    }

    // 2. Fetch all test cases (both public and hidden)
    const { data: testCases, error: tcError } = await supabase
      .from("test_cases")
      .select("id, task_id, input, expected_output, is_hidden, explanation, created_at")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });

    if (tcError) {
      throw new Error(`Failed to load test cases: ${tcError.message}`);
    }

    const cases: TestCase[] = testCases || [];
    const evaluationResults: TestCaseEvaluation[] = [];

    let passedCount = 0;
    let finalStatus: SubmissionStatus = "passed";
    let finalErrorMessage: string | null = null;
    let cumulativeExecutionTime = 0;

    // Handle edge-case: No test cases exist
    if (cases.length === 0) {
      // Run once with empty stdin to check for compile / syntax errors
      const execResult = await executeCode({
        language,
        sourceCode: code,
        stdin: "",
      });

      cumulativeExecutionTime += execResult.executionTime || 0;

      if (execResult.status === "error") {
        const isCompile = /error|syntax|undefined/i.test(execResult.stderr);
        finalStatus = isCompile ? "compile_error" : "runtime_error";
        finalErrorMessage = execResult.stderr || "Execution error.";
      } else if (execResult.status === "timeout") {
        finalStatus = "timeout";
        finalErrorMessage = "Time limit exceeded.";
      } else {
        finalStatus = "passed";
      }
    } else {
      // 3. Sequentially evaluate each test case
      for (let i = 0; i < cases.length; i++) {
        const tc = cases[i];
        const execResult = await executeCode({
          language,
          sourceCode: code,
          stdin: tc.input || "",
        });

        const timeMs = execResult.executionTime || 0;
        cumulativeExecutionTime += timeMs;

        // Check for runtime/compile errors
        if (execResult.status === "timeout") {
          finalStatus = "timeout";
          finalErrorMessage = "Time limit exceeded.";
          evaluationResults.push({
            testCaseId: tc.id,
            index: i + 1,
            isHidden: tc.is_hidden,
            passed: false,
            executionTimeMs: timeMs,
            errorMessage: "Time limit exceeded",
            input: tc.is_hidden ? undefined : tc.input,
            expectedOutput: tc.is_hidden ? undefined : tc.expected_output,
            actualOutput: tc.is_hidden ? undefined : execResult.stdout,
            explanation: tc.is_hidden ? "Failed on hidden test case" : tc.explanation,
          });
          if (stopOnFirstFailure) break;
          continue;
        }

        if (execResult.status === "error") {
          const isCompile = /error|syntax|compile/i.test(execResult.stderr);
          finalStatus = isCompile ? "compile_error" : "runtime_error";
          finalErrorMessage = execResult.stderr;
          evaluationResults.push({
            testCaseId: tc.id,
            index: i + 1,
            isHidden: tc.is_hidden,
            passed: false,
            executionTimeMs: timeMs,
            errorMessage: tc.is_hidden ? "Runtime/Compile error on hidden test case" : execResult.stderr,
            input: tc.is_hidden ? undefined : tc.input,
            expectedOutput: tc.is_hidden ? undefined : tc.expected_output,
            actualOutput: tc.is_hidden ? undefined : execResult.stdout,
            explanation: tc.is_hidden ? "Failed on hidden test case" : tc.explanation,
          });
          if (stopOnFirstFailure) break;
          continue;
        }

        // Compare trimmed stdout with expected_output
        const actual = normalizeOutput(execResult.stdout);
        const expected = normalizeOutput(tc.expected_output);
        const isMatch = actual === expected;

        if (isMatch) {
          passedCount++;
          evaluationResults.push({
            testCaseId: tc.id,
            index: i + 1,
            isHidden: tc.is_hidden,
            passed: true,
            executionTimeMs: timeMs,
            input: tc.is_hidden ? undefined : tc.input,
            expectedOutput: tc.is_hidden ? undefined : tc.expected_output,
            actualOutput: tc.is_hidden ? undefined : execResult.stdout,
          });
        } else {
          if (finalStatus === "passed") {
            finalStatus = "failed";
            finalErrorMessage = tc.is_hidden
              ? "Failed on hidden test case"
              : `Output mismatch on test case #${i + 1}`;
          }

          evaluationResults.push({
            testCaseId: tc.id,
            index: i + 1,
            isHidden: tc.is_hidden,
            passed: false,
            executionTimeMs: timeMs,
            input: tc.is_hidden ? undefined : tc.input,
            expectedOutput: tc.is_hidden ? undefined : tc.expected_output,
            actualOutput: tc.is_hidden ? undefined : execResult.stdout,
            explanation: tc.is_hidden ? "Failed on hidden test case" : tc.explanation,
            errorMessage: tc.is_hidden ? "Failed on hidden test case" : "Wrong Answer",
          });

          if (stopOnFirstFailure) break;
        }
      }
    }

    const totalCasesCount = cases.length || 1;
    const isAllPassed = (cases.length === 0 && finalStatus === "passed") || passedCount === cases.length;
    if (isAllPassed) {
      finalStatus = "passed";
      finalErrorMessage = null;
    }

    // 4. Insert submission record into public.submissions
    let submissionId: string | undefined;
    try {
      const { data: subData, error: subError } = await supabase
        .from("submissions")
        .insert({
          user_id: userId,
          task_id: taskId,
          code,
          status: finalStatus,
          passed_cases: passedCount,
          total_cases: totalCasesCount,
          execution_time_ms: cumulativeExecutionTime,
          error_message: finalErrorMessage,
        })
        .select("id")
        .single();

      if (subError) {
        console.error("[judgeService] Error creating submission record:", subError.message);
      } else {
        submissionId = subData?.id;
      }
    } catch (e: any) {
      console.error("[judgeService] Submissions insert exception:", e.message);
    }

    // 5. If passed, handle progress & points
    let pointsEarned = 0;
    let isAlreadyCompleted = false;

    if (finalStatus === "passed") {
      try {
        // Check existing progress
        const { data: existingProgress } = await supabase
          .from("user_task_progress")
          .select("is_completed")
          .eq("user_id", userId)
          .eq("task_id", taskId)
          .maybeSingle();

        isAlreadyCompleted = !!existingProgress?.is_completed;

        // Upsert user_task_progress
        await supabase
          .from("user_task_progress")
          .upsert({
            user_id: userId,
            task_id: taskId,
            is_completed: true,
            best_submission_id: submissionId || null,
            completed_at: new Date().toISOString(),
          }, { onConflict: "user_id,task_id" });

        // If first time completion, award points in public.profiles
        if (!isAlreadyCompleted) {
          const awardPoints = (task as any).points ?? 10;
          pointsEarned = awardPoints;

          const { data: profile } = await supabase
            .from("profiles")
            .select("points")
            .eq("id", userId)
            .single();

          const currentPoints = (profile as any)?.points || 0;

          await supabase
            .from("profiles")
            .update({
              points: currentPoints + awardPoints,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        }
      } catch (err: any) {
        console.error("[judgeService] Error updating progress/points:", err.message);
      }
    }

    return {
      submissionId,
      status: finalStatus,
      passedCases: passedCount,
      totalCases: totalCasesCount,
      totalExecutionTimeMs: cumulativeExecutionTime,
      errorMessage: finalErrorMessage,
      testCaseResults: evaluationResults,
      pointsEarned,
      isAlreadyCompleted,
    };
  },

  /**
   * Run code against ONLY public test cases (for practice / quick run without recording a final submission).
   */
  async runPublicTestCases({
    taskId,
    code,
    language,
  }: {
    taskId: string;
    code: string;
    language: string;
  }): Promise<{
    passedCases: number;
    totalCases: number;
    results: TestCaseEvaluation[];
  }> {
    const { data: testCases, error } = await supabase
      .from("test_cases")
      .select("*")
      .eq("task_id", taskId)
      .eq("is_hidden", false)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to load public test cases: ${error.message}`);
    }

    const cases: TestCase[] = testCases || [];
    const results: TestCaseEvaluation[] = [];
    let passed = 0;

    for (let i = 0; i < cases.length; i++) {
      const tc = cases[i];
      const res = await executeCode({
        language,
        sourceCode: code,
        stdin: tc.input || "",
      });

      const actual = normalizeOutput(res.stdout);
      const expected = normalizeOutput(tc.expected_output);
      const isMatch = res.status === "success" && actual === expected;

      if (isMatch) passed++;

      results.push({
        testCaseId: tc.id,
        index: i + 1,
        isHidden: false,
        passed: isMatch,
        executionTimeMs: res.executionTime,
        errorMessage: res.status !== "success" ? res.stderr : undefined,
        input: tc.input,
        expectedOutput: tc.expected_output,
        actualOutput: res.stdout,
        explanation: tc.explanation,
      });
    }

    return {
      passedCases: passed,
      totalCases: cases.length,
      results,
    };
  },
};

export default judgeService;
