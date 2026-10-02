export type LanguageConfig = {
  id: string;
  name: string;
  extension: string;
  monacoLanguage: string;
  starterCode: string;
  enabled: boolean;
};

export type ExecutionRequest = {
  language: string;
  sourceCode: string;
  stdin: string;
};

export type ExecutionResult = {
  status: "success" | "error" | "timeout";
  stdout: string;
  stderr: string;
  executionTime?: number;
  memory?: number;
};

export type EditorSettings = {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
};

export type AppearanceSettings = {
  theme: "light" | "dark" | "system";
};

export type ExecutionSettings = {
  showExecutionTime: boolean;
  showMemoryUsage: boolean;
};

export type Settings = EditorSettings & AppearanceSettings & ExecutionSettings;

export type Program = {
  id: string;
  name: string;
  language: string;
  sourceCode: string;
  stdin: string;
  createdAt: number;
  updatedAt: number;
};

export type ToastType = "success" | "error" | "info" | "warning";

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
};

export type Route =
  | "landing"
  | "dashboard"
  | "compiler"
  | "courses"
  | "course"
  | "problems"
  | "task"
  | "admin"
  | "leaderboard"
  | "playground"
  | "docs"
  | "pricing"
  | "privacy"
  | "terms"
  | "login"
  | "signup";


export * from "./database.types";

