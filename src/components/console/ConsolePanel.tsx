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
      className="flex flex-col h-full font-urbanist bg-white dark:bg-[#151718] text-[#121314] dark:text-[#ECEDEE] border border-[#E5E7EB] dark:border-[#202425] rounded-2xl overflow-hidden shadow-xs cursor-text select-text transition-colors duration-200"
    >
      {/* ===================================================================
          TERMINAL HEADER BAR (Output Window Title & Controls)
      =================================================================== */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#F7F8FA] dark:bg-[#0C0D0E] border-b border-[#E5E7EB] dark:border-[#202425] shrink-0 select-none transition-colors duration-200">
        {/* Left: Window Dots & "Output" Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 pr-2 border-r border-[#E5E7EB] dark:border-[#202425]">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>

          <span className="text-xs font-semibold text-[#121314] dark:text-[#ECEDEE] tracking-wide">
            Output
          </span>

          {/* Status Badge */}
          {isRunning ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border border-emerald-500/20">
              <Loader2 size={11} className="animate-spin" />
              <span>Running</span>
            </span>
          ) : isWaitingForInput ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-[#00F076] border border-emerald-500/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F076]" />
              <span>Input Required</span>
            </span>
          ) : exitStatus === "success" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border border-emerald-500/20">
              <CheckCircle2 size={11} />
              <span>Exit 0</span>
            </span>
          ) : exitStatus === "error" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <XCircle size={11} />
              <span>Exit 1</span>
            </span>
          ) : null}
        </div>

        {/* Right: Telemetry & Actions */}
        <div className="flex items-center gap-2">
          {showExecutionTime && executionTime != null && (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-white dark:bg-[#151718] text-[#6B7280] dark:text-[#8A9099] border border-[#E5E7EB] dark:border-[#202425]">
              <Clock size={11} className="text-emerald-500 dark:text-[#00F076]" />
              <span>{formatExecutionTime(executionTime)}</span>
            </span>
          )}

          {showMemoryUsage && memory != null && (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-white dark:bg-[#151718] text-[#6B7280] dark:text-[#8A9099] border border-[#E5E7EB] dark:border-[#202425]">
              <Cpu size={11} className="text-emerald-500 dark:text-[#00F076]" />
              <span>{formatMemory(memory)}</span>
            </span>
          )}

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-[#6B7280] dark:text-[#8A9099] hover:text-[#121314] dark:hover:text-[#ECEDEE] hover:bg-[#E5E7EB] dark:hover:bg-[#202425] transition-colors"
            title="Copy Output"
            aria-label="Copy"
          >
            {copied ? <Check size={14} className="text-emerald-500 dark:text-[#00F076]" /> : <Copy size={14} />}
          </button>

          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg text-[#6B7280] dark:text-[#8A9099] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
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
        className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed custom-scrollbar bg-[#F7F8FA] dark:bg-[#0C0D0E] transition-colors duration-200"
      >
        {entries.length === 0 && !isRunning && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 text-[#6B7280] dark:text-[#8A9099] select-none">
            <p className="text-xs text-[#6B7280] dark:text-[#8A9099] max-w-sm">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#151718] font-mono text-[10px] text-[#121314] dark:text-[#ECEDEE] border border-[#E5E7EB] dark:border-[#202425] font-semibold">Ctrl+Enter</kbd> or click <strong>Run</strong> to execute.
            </p>
            {onRun && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRun();
                }}
                className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] text-xs font-semibold shadow-[0_0_15px_rgba(0,240,118,0.2)] transition-all cursor-pointer"
              >
                <Play size={12} className="fill-[#0C0D0E]" />
                <span>Run Program</span>
              </button>
            )}
          </div>
        )}

        {/* Continuous Monospace Output Stream */}
        <pre className="whitespace-pre-wrap font-mono text-sm text-[#121314] dark:text-[#ECEDEE] m-0 p-0 inline select-text">
          {entries.map((entry) => {
            if (entry.type === "input") {
              return (
                <span key={entry.id} className="text-emerald-600 dark:text-[#00F076] font-medium">
                  {entry.text}
                </span>
              );
            }

            if (entry.type === "error") {
              return (
                <span key={entry.id} className="text-rose-500 font-medium">
                  {entry.text}
                </span>
              );
            }

            if (entry.type === "system") {
              return (
                <span key={entry.id} className="text-[#6B7280] dark:text-[#8A9099] text-xs italic">
                  {entry.text}
                </span>
              );
            }

            // Standard Output
            return <span key={entry.id}>{entry.text}</span>;
          })}

          {/* INLINE USER INPUT */}
          {isWaitingForInput && (
            <span className="inline-flex items-center align-baseline">
              <input
                ref={inputRef}
                type="text"
                value={inlineValue}
                onChange={(e) => setInlineValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none outline-none font-mono text-sm text-[#121314] dark:text-[#ECEDEE] p-0 m-0 caret-[#00F076] focus:ring-0 focus:outline-none inline-block min-w-[120px]"
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
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-500 dark:text-[#00F076] ml-2 font-mono align-baseline">
            <Loader2 size={11} className="animate-spin" />
          </span>
        )}

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}

export default ConsolePanel;
