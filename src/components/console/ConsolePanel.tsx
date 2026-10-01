import { useState, useRef, useEffect } from "react";
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Trash2,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { formatExecutionTime, formatMemory } from "@/utils/format";

export type TerminalEntry = {
  id: string;
  type: "output" | "input" | "error" | "system";
  text: string;
};

type ConsolePanelProps = {
  entries: TerminalEntry[];
  isRunning: boolean;
  isWaitingForInput: boolean;
  onSendInput: (input: string) => void;
  onClearOutput: () => void;
  showExecutionTime: boolean;
  showMemoryUsage: boolean;
  executionTime?: number | null;
  memory?: number | null;
  exitStatus?: "idle" | "running" | "waiting" | "success" | "error";
  onRun?: () => void;
};

export function ConsolePanel({
  entries,
  isRunning,
  isWaitingForInput,
  onSendInput,
  onClearOutput,
  showExecutionTime,
  showMemoryUsage,
  executionTime,
  memory,
  exitStatus = "idle",
  onRun,
}: ConsolePanelProps) {
  const [inlineValue, setInlineValue] = useState("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever new entries arrive or input state changes
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries, isWaitingForInput, isRunning, inlineValue]);

  // Auto-focus input when program is waiting for input
  useEffect(() => {
    if (isWaitingForInput) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 30);
    }
  }, [isWaitingForInput]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = inlineValue;
      setInlineValue("");
      onSendInput(val);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fullText = entries.map((e) => e.text).join("");
    if (fullText) {
      navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClearOutput();
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex flex-col h-full font-sans bg-white dark:bg-[#0E131F] text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-[#1E293B] rounded-2xl overflow-hidden shadow-xs cursor-text select-text transition-colors duration-200"
    >
      {/* ===================================================================
          TERMINAL HEADER BAR (Output Window Title & Controls)
      =================================================================== */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-[#141A28] border-b border-slate-200/90 dark:border-[#1E293B] shrink-0 select-none transition-colors duration-200">
        {/* Left: Window Dots & "Output" Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200 dark:border-[#1E293B]">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>

          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide font-sans">
            Output
          </span>

          {/* Status Badge */}
          {isRunning ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-[#818CF8] border border-indigo-200/70 dark:border-indigo-500/25">
              <Loader2 size={11} className="animate-spin" />
              <span>Running</span>
            </span>
          ) : isWaitingForInput ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-500/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Input Required</span>
            </span>
          ) : exitStatus === "success" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-500/20">
              <CheckCircle2 size={11} />
              <span>Exit 0</span>
            </span>
          ) : exitStatus === "error" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/70 dark:border-rose-500/20">
              <XCircle size={11} />
              <span>Exit 1</span>
            </span>
          ) : null}
        </div>

        {/* Right: Telemetry & Actions */}
        <div className="flex items-center gap-2">
          {showExecutionTime && executionTime != null && (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-white dark:bg-[#090D16] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1E293B]">
              <Clock size={11} className="text-indigo-500 dark:text-[#818CF8]" />
              <span>{formatExecutionTime(executionTime)}</span>
            </span>
          )}

          {showMemoryUsage && memory != null && (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-white dark:bg-[#090D16] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1E293B]">
              <Cpu size={11} className="text-purple-600 dark:text-purple-400" />
              <span>{formatMemory(memory)}</span>
            </span>
          )}

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors"
            title="Copy Output"
            aria-label="Copy"
          >
            {copied ? <Check size={14} className="text-emerald-500 dark:text-emerald-400" /> : <Copy size={14} />}
          </button>

          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors"
            title="Clear Output"
            aria-label="Clear"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* ===================================================================
          TERMINAL BODY (Inline continuous output & typing stream)
      =================================================================== */}
      <div
        ref={terminalContainerRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed custom-scrollbar bg-white dark:bg-[#0E131F] transition-colors duration-200"
      >
        {entries.length === 0 && !isRunning && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 text-slate-400 dark:text-slate-500 font-sans select-none">
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium">Ctrl+Enter</kbd> or click <strong>Run</strong> to execute.
            </p>
            {onRun && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRun();
                }}
                className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] text-white text-xs font-bold shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
              >
                <Play size={12} className="fill-white" />
                <span>Run Program</span>
              </button>
            )}
          </div>
        )}

        {/* Continuous Monospace Output Stream */}
        <pre className="whitespace-pre-wrap font-mono text-sm text-slate-800 dark:text-slate-100 m-0 p-0 inline select-text">
          {entries.map((entry) => {
            if (entry.type === "input") {
              return (
                <span key={entry.id} className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {entry.text}
                </span>
              );
            }

            if (entry.type === "error") {
              return (
                <span key={entry.id} className="text-rose-600 dark:text-rose-400 font-medium">
                  {entry.text}
                </span>
              );
            }

            if (entry.type === "system") {
              return (
                <span key={entry.id} className="text-slate-400 dark:text-slate-500 text-xs italic">
                  {entry.text}
                </span>
              );
            }

            // Standard Output
            return <span key={entry.id}>{entry.text}</span>;
          })}

          {/* INLINE USER INPUT (Types directly on the straight prompt line) */}
          {isWaitingForInput && (
            <span className="inline-flex items-center align-baseline">
              <input
                ref={inputRef}
                type="text"
                value={inlineValue}
                onChange={(e) => setInlineValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none outline-none font-mono text-sm text-slate-900 dark:text-white p-0 m-0 caret-slate-900 dark:caret-white focus:ring-0 focus:outline-none inline-block min-w-[120px]"
                style={{ width: `${Math.max(6, inlineValue.length + 2)}ch` }}
                autoFocus
                spellCheck={false}
                autoComplete="off"
              />
            </span>
          )}
        </pre>

        {/* Live spinner if executing a background step */}
        {isRunning && entries.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs text-indigo-500 dark:text-indigo-400 ml-2 font-mono align-baseline">
            <Loader2 size={11} className="animate-spin" />
          </span>
        )}

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}

export default ConsolePanel;
