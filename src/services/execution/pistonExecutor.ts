import type { ExecutionRequest, ExecutionResult } from "@/types";

const DEFAULT_PISTON_URL = "http://localhost:2000/api/v2";

/**
 * Normalizes the base URL by stripping trailing slashes.
 */
function getPistonBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_PISTON_API_URL as string | undefined)?.trim();
  const url = envUrl || DEFAULT_PISTON_URL;
  return url.replace(/\/+$/, "");
}

/**
 * Mapping AarByte language IDs to Piston runtime parameters.
 * Using wildcard "*" versions so Piston automatically selects whatever
 * runtime version is installed in the container/environment.
 */
const LANGUAGE_MAP: Record<string, { language: string; version: string; filename: string }> = {
  python: { language: "python", version: "*", filename: "main.py" },
  javascript: { language: "javascript", version: "*", filename: "index.js" },
  typescript: { language: "typescript", version: "*", filename: "index.ts" },
  java: { language: "java", version: "*", filename: "Main.java" },
  c: { language: "c", version: "*", filename: "main.c" },
  cpp: { language: "c++", version: "*", filename: "main.cpp" },
  go: { language: "go", version: "*", filename: "main.go" },
  rust: { language: "rust", version: "*", filename: "main.rs" },
  php: { language: "php", version: "*", filename: "index.php" },
};

export interface PistonRunOutput {
  stdout?: string;
  stderr?: string;
  output?: string;
  code?: number;
  signal?: string | null;
}

export interface PistonExecuteResponse {
  language?: string;
  version?: string;
  run?: PistonRunOutput;
  compile?: PistonRunOutput;
  message?: string;
}

const REQUEST_TIMEOUT_MS = 15000;

export async function executeCode(request: ExecutionRequest): Promise<ExecutionResult> {
  const baseUrl = getPistonBaseUrl();
  const langConfig = LANGUAGE_MAP[request.language];

  if (!langConfig) {
    return {
      status: "error",
      stdout: "",
      stderr: `Language "${request.language}" is not mapped to a supported Piston execution runtime.`,
    };
  }

  if (!request.sourceCode.trim()) {
    return {
      status: "error",
      stdout: "",
      stderr: "No code provided to execute.",
    };
  }

  const startTime = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [
          {
            name: langConfig.filename,
            content: request.sourceCode,
          },
        ],
        stdin: request.stdin || "",
        run_timeout: 5000,
        compile_timeout: 10000,
      }),
    });

    clearTimeout(timeoutId);

    const elapsedMs = Math.round(performance.now() - startTime);

    if (!response.ok) {
      const errData = (await response.json().catch(() => null)) as PistonExecuteResponse | null;
      const message = errData?.message || `HTTP ${response.status}: ${response.statusText}`;
      return {
        status: "error",
        stdout: "",
        stderr: `Piston execution failed: ${message}\n(Backend: ${baseUrl})`,
        executionTime: elapsedMs,
      };
    }

    const data = (await response.json()) as PistonExecuteResponse;

    // Handle API level messages (e.g. whitelist warnings)
    if (data.message && !data.run) {
      return {
        status: "error",
        stdout: "",
        stderr: `Piston API Message: ${data.message}\n(Backend: ${baseUrl})`,
        executionTime: elapsedMs,
      };
    }

    // Check compilation errors (C, C++, Java, Rust, etc.)
    if (data.compile && data.compile.code !== 0) {
      return {
        status: "error",
        stdout: data.compile.stdout || "",
        stderr: data.compile.stderr || data.compile.output || "Compilation failed with unknown error.",
        executionTime: elapsedMs,
      };
    }

    const run = data.run;
    if (!run) {
      return {
        status: "error",
        stdout: "",
        stderr: "Invalid response received from Piston: missing run result.",
        executionTime: elapsedMs,
      };
    }

    // Check for execution timeouts or signals
    const isTimeout = run.signal === "SIGKILL" || run.signal === "SIGTERM" || run.code === 124 || run.code === 137;
    if (isTimeout) {
      return {
        status: "timeout",
        stdout: run.stdout || "",
        stderr: run.stderr || run.output || "Execution timed out (process terminated).",
        executionTime: elapsedMs,
      };
    }

    const isExitError = typeof run.code === "number" && run.code !== 0;

    return {
      status: isExitError ? "error" : "success",
      stdout: run.stdout || (!isExitError && !run.stderr ? "(no output)\n" : ""),
      stderr: run.stderr || (isExitError ? run.output || `Process exited with code ${run.code}` : ""),
      executionTime: elapsedMs,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    const elapsedMs = Math.round(performance.now() - startTime);

    if (error.name === "AbortError") {
      return {
        status: "timeout",
        stdout: "",
        stderr: `Execution request timed out after ${REQUEST_TIMEOUT_MS / 1000}s.\nThe backend at ${baseUrl} is unresponsive or taking too long to respond.`,
        executionTime: elapsedMs,
      };
    }

    return {
      status: "error",
      stdout: "",
      stderr: `Cannot connect to Piston API at ${baseUrl}.\n\n` +
        `Possible causes:\n` +
        `• Your local Piston container is not running (start it with: docker run -d -p 2000:2000 ghcr.io/engineer-man/piston)\n` +
        `• The configured VITE_PISTON_API_URL is incorrect or unreachable\n` +
        `• Network/CORS policy blocked the connection\n\n` +
        `Detail: ${error.message || "Failed to fetch"}`,
      executionTime: elapsedMs,
    };
  }
}
