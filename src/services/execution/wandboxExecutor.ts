import type { ExecutionRequest, ExecutionResult } from "@/types";

const DEFAULT_WANDBOX_URL = "https://wandbox.org/api";

function getWandboxBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_WANDBOX_API_URL as string | undefined)?.trim();
  const url = envUrl || DEFAULT_WANDBOX_URL;
  return url.replace(/\/+$/, "");
}

/**
 * Verified Wandbox compiler targets for each supported language.
 * Free, public, no API key or credit card required.
 */
const LANGUAGE_MAP: Record<string, { compiler: string; options?: string }> = {
  python: { compiler: "cpython-3.12.7" },
  javascript: { compiler: "nodejs-20.17.0" },
  typescript: { compiler: "typescript-5.6.2" },
  c: { compiler: "gcc-13.2.0-c" },
  cpp: { compiler: "gcc-13.2.0" },
  java: { compiler: "openjdk-jdk-21+35" },
  go: { compiler: "go-1.23.2" },
  rust: { compiler: "rust-1.82.0" },
  php: { compiler: "php-8.3.12" },
};

export interface WandboxResponse {
  status: string; // "0" for success, non-zero for runtime error/exit code
  signal?: string;
  compiler_output?: string;
  compiler_error?: string;
  compiler_message?: string;
  program_output?: string;
  program_error?: string;
  program_message?: string;
  permlink?: string;
  url?: string;
}

const REQUEST_TIMEOUT_MS = 20000;

export async function executeCode(request: ExecutionRequest): Promise<ExecutionResult> {
  const baseUrl = getWandboxBaseUrl();
  const config = LANGUAGE_MAP[request.language];

  if (!config) {
    return {
      status: "error",
      stdout: "",
      stderr: `Language "${request.language}" is not currently mapped to a Wandbox compiler target.`,
    };
  }

  if (!request.sourceCode.trim()) {
    return {
      status: "error",
      stdout: "",
      stderr: "No code provided to execute.",
    };
  }

  let codeToRun = request.sourceCode;

  // Wandbox compiles Java into prog.java; if class is declared 'public class',
  // javac requires the filename to match the public class name.
  // Converting 'public class' to 'class' allows any class name to compile & execute.
  if (request.language === "java") {
    codeToRun = codeToRun.replace(/\bpublic\s+class\b/g, "class");
  }

  const startTime = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/compile.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        compiler: config.compiler,
        code: codeToRun,
        stdin: request.stdin || "",
        ...(config.options ? { options: config.options } : {}),
      }),
    });

    clearTimeout(timeoutId);
    const elapsedMs = Math.round(performance.now() - startTime);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return {
        status: "error",
        stdout: "",
        stderr: `Wandbox API returned HTTP ${response.status}: ${errorText || response.statusText}`,
        executionTime: elapsedMs,
      };
    }

    const data = (await response.json()) as WandboxResponse;

    // Check for compilation errors (C, C++, Java, Rust, etc.)
    if (data.compiler_error && data.compiler_error.trim() !== "") {
      return {
        status: "error",
        stdout: data.compiler_output || "",
        stderr: data.compiler_error || data.compiler_message || "Compilation failed.",
        executionTime: elapsedMs,
      };
    }

    // Process termination signals or timeouts
    if (data.signal && data.signal.trim() !== "") {
      return {
        status: "timeout",
        stdout: data.program_output || "",
        stderr: `Process terminated with signal: ${data.signal}`,
        executionTime: elapsedMs,
      };
    }

    const isExitError = data.status !== "0";

    return {
      status: isExitError ? "error" : "success",
      stdout: data.program_output || (!isExitError && !data.program_error ? "(no output)\n" : ""),
      stderr: data.program_error || (isExitError ? data.program_message || `Process exited with code ${data.status}` : ""),
      executionTime: elapsedMs,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    const elapsedMs = Math.round(performance.now() - startTime);

    if (error.name === "AbortError") {
      return {
        status: "timeout",
        stdout: "",
        stderr: `Execution timed out after ${REQUEST_TIMEOUT_MS / 1000}s.\nWandbox did not return a response within the timeout window.`,
        executionTime: elapsedMs,
      };
    }

    return {
      status: "error",
      stdout: "",
      stderr: `Network error connecting to Wandbox API at ${baseUrl}.\nDetail: ${error.message || "Failed to fetch"}`,
      executionTime: elapsedMs,
    };
  }
}
