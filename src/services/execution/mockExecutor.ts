import type { ExecutionRequest, ExecutionResult } from "@/types";
import { getLanguageById } from "@/config/languages";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractStdinReads(sourceCode: string): string[] {
  const reads: string[] = [];
  const patterns = [
    /input\((?:["'`](.*?)["'`])?\)/g,
    /scanf\(["'`](.*?)["'`]/g,
    /cin\s*>>\s*\w+/g,
    /readline\(\)/g,
    /Scanner\([^)]*\)\.nextLine\(\)/g,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(sourceCode)) !== null) {
      reads.push(match[1] ?? "");
    }
  }
  return reads;
}

async function executeMock(request: ExecutionRequest): Promise<ExecutionResult> {
  const lang = getLanguageById(request.language);
  if (!lang) {
    return {
      status: "error",
      stdout: "",
      stderr: `Unsupported language: ${request.language}`,
    };
  }

  if (!lang.enabled) {
    return {
      status: "error",
      stdout: "",
      stderr: `Execution for ${lang.name} is not yet available. The execution engine is currently in development.`,
    };
  }

  await delay(300 + Math.random() * 700);

  const { sourceCode, stdin } = request;

  if (sourceCode.trim() === "") {
    return {
      status: "error",
      stdout: "",
      stderr: "No source code provided.",
    };
  }

  const hasSyntaxError = sourceCode.includes("syntax_error(") || sourceCode.includes("###ERROR###");
  if (hasSyntaxError) {
    return {
      status: "error",
      stdout: "",
      stderr: `SyntaxError: unexpected token on line ${Math.floor(Math.random() * 20) + 1}`,
      executionTime: 0.01,
      memory: 0,
    };
  }

  const stdinLines = stdin.split("\n").filter((l) => l.trim() !== "");
  const _stdinReads = extractStdinReads(sourceCode);
  void _stdinReads;

  let stdout = "";
  const printPatterns: Record<string, RegExp> = {
    python: /print\((?:f["'`]|["'`])?(.*?)["'`]?\)/g,
    javascript: /console\.log\((.*?)\)/g,
    typescript: /console\.log\((.*?)\)/g,
  };

  const pattern = printPatterns[request.language];
  if (pattern) {
    let match;
    while ((match = pattern.exec(sourceCode)) !== null) {
      let content = match[1].trim();
      content = content.replace(/^["'`]|["'`]$/g, "");
      if (content.includes("${")) {
        content = content
          .replace(/\$\{([^}]+)\}/g, (_, expr) => {
            if (expr.includes("input()") && stdinLines.length > 0) {
              return stdinLines.shift() ?? "";
            }
            return `<${expr.trim()}>`;
          })
          .replace(/^f["'`]|["'`]$/g, "");
      }
      stdout += content + "\n";
    }
  }

  if (stdout === "") {
    const grep = /System\.out\.println\((.*?)\)/g;
    let m;
    while ((m = grep.exec(sourceCode)) !== null) {
      stdout += m[1].replace(/^["'`]|["'`]$/g, "") + "\n";
    }
  }

  if (stdout === "") {
    const cppGrep = /std::cout\s*<<\s*(.*?)(?:\s*<<\s*std::endl)?;/g;
    let m;
    while ((m = cppGrep.exec(sourceCode)) !== null) {
      stdout += m[1].replace(/^["'`]|["'`]$/g, "").replace(/\\n/g, "\n") + "\n";
    }
  }

  if (stdout === "") {
    const cGrep = /printf\((.*?)\)/g;
    let m;
    while ((m = cGrep.exec(sourceCode)) !== null) {
      stdout += m[1].replace(/^["'`]|["'`]$/g, "").replace(/\\n/g, "\n");
    }
  }

  if (stdout === "") {
    const goGrep = /fmt\.Println\((.*?)\)/g;
    let m;
    while ((m = goGrep.exec(sourceCode)) !== null) {
      stdout += m[1].replace(/^["'`]|["'`]$/g, "") + "\n";
    }
  }

  if (stdout === "") {
    const rustGrep = /println!\((.*?)\)/g;
    let m;
    while ((m = rustGrep.exec(sourceCode)) !== null) {
      stdout += m[1].replace(/^["'`]|["'`]$/g, "") + "\n";
    }
  }

  if (stdout === "") {
    const phpGrep = /echo\s+(.*?);/g;
    let m;
    while ((m = phpGrep.exec(sourceCode)) !== null) {
      stdout += m[1].replace(/^["'`]|["'`]$/g, "").replace(/\\n/g, "\n") + "\n";
    }
  }

  const execTime = 0.05 + Math.random() * 0.8;
  const memory = 5 + Math.floor(Math.random() * 40);

  return {
    status: "success",
    stdout: stdout || "(no output)\n",
    stderr: "",
    executionTime: Math.round(execTime * 1000),
    memory: memory * 1024,
  };
}

export type ExecuteCodeFn = (request: ExecutionRequest) => Promise<ExecutionResult>;

export const executeCode: ExecuteCodeFn = executeMock;
