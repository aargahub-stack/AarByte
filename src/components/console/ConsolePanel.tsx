import { useState } from "react";
import { Terminal, Play, AlertCircle, CheckCircle2, XCircle, Clock, Cpu } from "lucide-react";
import { cn } from "@/utils/cn";
import type { ExecutionResult } from "@/types";
import { formatExecutionTime, formatMemory } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";

type ConsolePanelProps = {
  stdin: string;
  onStdinChange: (value: string) => void;
  result: ExecutionResult | null;
  isRunning: boolean;
  showExecutionTime: boolean;
  showMemoryUsage: boolean;
};

type Tab = "input" | "output" | "errors";

export function ConsolePanel({
  stdin,
  onStdinChange,
  result,
  isRunning,
  showExecutionTime,
  showMemoryUsage,
}: ConsolePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("output");

  const hasError = result?.status === "error" || result?.status === "timeout";
  const hasOutput = result?.status === "success";

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "input", label: "Input", icon: <Terminal size={14} /> },
    { id: "output", label: "Output", icon: <Terminal size={14} /> },
    { id: "errors", label: "Errors", icon: <AlertCircle size={14} /> },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <div className="flex items-center border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2",
              activeTab === tab.id
                ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-800 dark:hover:text-gray-200"
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.id === "output" && hasOutput && (
              <CheckCircle2 size={12} className="text-green-500" />
            )}
            {tab.id === "errors" && hasError && (
              <XCircle size={12} className="text-red-500" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === "input" && (
          <textarea
            value={stdin}
            onChange={(e) => onStdinChange(e.target.value)}
            placeholder="Enter standard input here..."
            className="w-full h-full p-3 text-sm font-mono text-gray-800 dark:text-gray-200 bg-transparent border-none outline-none resize-none placeholder:text-gray-400"
            aria-label="Standard input"
          />
        )}

        {activeTab === "output" && (
          <div className="p-3 font-mono text-sm">
            {isRunning && (
              <div className="flex items-center gap-2 text-blue-500">
                <Play size={14} className="animate-pulse" />
                <span>Executing...</span>
              </div>
            )}
            {!isRunning && !result && (
              <div className="text-gray-400 dark:text-gray-600 flex items-center gap-2">
                <Terminal size={14} />
                <span>Run your code to see output here.</span>
              </div>
            )}
            {!isRunning && result && result.status === "success" && (
              <div>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-800">
                  <CheckCircle2 size={14} className="text-green-500" />
                  <Badge variant="success">Execution completed</Badge>
                  {showExecutionTime && result.executionTime != null && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock size={12} />
                      {formatExecutionTime(result.executionTime)}
                    </span>
                  )}
                  {showMemoryUsage && result.memory != null && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Cpu size={12} />
                      {formatMemory(result.memory)}
                    </span>
                  )}
                </div>
                <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                  {result.stdout || "(no output)"}
                </pre>
              </div>
            )}
            {!isRunning && result && result.status === "timeout" && (
              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                <AlertCircle size={14} />
                <span>Execution timed out.</span>
              </div>
            )}
          </div>
        )}

        {activeTab === "errors" && (
          <div className="p-3 font-mono text-sm">
            {!isRunning && !result && (
              <div className="text-gray-400 dark:text-gray-600 flex items-center gap-2">
                <AlertCircle size={14} />
                <span>No errors to display.</span>
              </div>
            )}
            {!isRunning && result && result.stderr && (
              <div>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-800">
                  <XCircle size={14} className="text-red-500" />
                  <Badge variant="error">
                    {result.status === "error" ? "Compilation Error" : "Runtime Error"}
                  </Badge>
                </div>
                <pre className="whitespace-pre-wrap text-red-600 dark:text-red-400">
                  {result.stderr}
                </pre>
              </div>
            )}
            {!isRunning && result && !result.stderr && result.status === "success" && (
              <div className="text-green-500 flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>No errors. Execution successful.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
