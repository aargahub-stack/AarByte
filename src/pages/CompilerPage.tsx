import { useEffect, useState } from "react";
import {
  Play,
  Save,
  Share2,
  Settings as SettingsIcon,
  Moon,
  Sun,
  FilePlus,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Copy,
  Check,
  Code2,
  Terminal as TerminalIcon,
} from "lucide-react";
import { getLanguageById } from "@/config/languages";
import { executeCode } from "@/services/execution/wandboxExecutor";
import type { ExecutionResult, Program, Route, Settings } from "@/types";
import { usePrograms } from "@/hooks/usePrograms";
import { useToast } from "@/hooks/useToast";

import { CodeEditor } from "@/components/editor/CodeEditor";
import { ConsolePanel, type TerminalEntry } from "@/components/console/ConsolePanel";
import { LanguageSelector } from "@/components/compiler/LanguageSelector";
import { FileExplorer } from "@/components/compiler/FileExplorer";
import { SettingsModal } from "@/components/compiler/SettingsModal";
import { ShareModal } from "@/components/compiler/ShareModal";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/utils/cn";

type CompilerPageProps = {
  settings: Settings;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onUpdateSettings: (patch: Partial<Settings>) => void;
  onResetSettings: () => void;
  navigate: (to: Route | string) => void;
};

export function CompilerPage({
  settings,
  theme,
  onToggleTheme,
  onUpdateSettings,
  onResetSettings,
  navigate,
}: CompilerPageProps) {
  const { programs, createProgram, updateProgram, removeProgram, copyProgram } = usePrograms();
  const { showToast } = useToast();

  const [languageId, setLanguageId] = useState("python");
  const [sourceCode, setSourceCode] = useState(getLanguageById("python")!.starterCode);
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentProgramId, setCurrentProgramId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Unified interactive terminal state
  const [terminalEntries, setTerminalEntries] = useState<TerminalEntry[]>([]);
  const [sessionInputs, setSessionInputs] = useState<string[]>([]);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [prevStdout, setPrevStdout] = useState("");
  const [exitStatus, setExitStatus] = useState<"idle" | "running" | "waiting" | "success" | "error">("idle");

  const [showSettings, setShowSettings] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSaveAs, setShowSaveAs] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [newName, setNewName] = useState("");
  const [mobileConsoleOpen, setMobileConsoleOpen] = useState(false);

  const lang = getLanguageById(languageId)!;

  const handleLanguageChange = (id: string) => {
    const newLang = getLanguageById(id);
    if (!newLang) return;
    setLanguageId(id);
    try {
      localStorage.setItem("aarcode_last_used_lang", id);
    } catch {
      /* ignore */
    }
    setSourceCode(newLang.starterCode);
    setResult(null);
    setCurrentProgramId(null);
    setTerminalEntries([]);
    setSessionInputs([]);
    setPrevStdout("");
    setIsWaitingForInput(false);
    setExitStatus("idle");
  };

  const runStep = async (currentInputs: string[], previousStdout: string) => {
    setIsRunning(true);
    setExitStatus("running");
    try {
      const stdinPayload = currentInputs.length > 0 ? currentInputs.join("\n") + "\n" : "";
      const res = await executeCode({ language: languageId, sourceCode, stdin: stdinPayload });
      setResult(res);

      const isWaiting =
        res.status === "error" &&
        Boolean(res.stderr) &&
        (res.stderr.includes("NoSuchElementException") ||
          res.stderr.includes("No line found") ||
          res.stderr.includes("EOFError") ||
          res.stderr.includes("EOF when reading a line") ||
          res.stderr.includes("End of file") ||
          res.stderr.includes("cin.eof") ||
          res.stderr.includes("basic_ios::clear"));

      const currentStdout = res.stdout || "";
      const newChunk =
        previousStdout && currentStdout.startsWith(previousStdout)
          ? currentStdout.slice(previousStdout.length)
          : currentStdout;

      if (isWaiting) {
        if (newChunk) {
          setTerminalEntries((prev) => [
            ...prev,
            { id: crypto.randomUUID(), type: "output", text: newChunk },
          ]);
        }
        setPrevStdout(currentStdout);
        setIsWaitingForInput(true);
        setExitStatus("waiting");
        setIsRunning(false);
        return;
      }

      // Completed cleanly or encountered real error
      if (newChunk) {
        setTerminalEntries((prev) => [
          ...prev,
          { id: crypto.randomUUID(), type: "output", text: newChunk },
        ]);
      }

      if (res.status === "success") {
        setTerminalEntries((prev) => [
          ...prev,
          { id: crypto.randomUUID(), type: "system", text: "\n[Process completed with exit code 0]" },
        ]);
        setExitStatus("success");
        setIsWaitingForInput(false);
        showToast("success", "Execution completed successfully");
      } else if (res.status === "error") {
        if (res.stderr) {
          setTerminalEntries((prev) => [
            ...prev,
            { id: crypto.randomUUID(), type: "error", text: res.stderr },
            { id: crypto.randomUUID(), type: "system", text: "\n[Process exited with errors]" },
          ]);
        }
        setExitStatus("error");
        setIsWaitingForInput(false);
        showToast("error", "Execution finished with errors");
      } else {
        setTerminalEntries((prev) => [
          ...prev,
          { id: crypto.randomUUID(), type: "error", text: "Execution timed out (10s limit)" },
        ]);
        setExitStatus("error");
        setIsWaitingForInput(false);
        showToast("warning", "Execution timed out");
      }
    } catch {
      setTerminalEntries((prev) => [
        ...prev,
        { id: crypto.randomUUID(), type: "error", text: "Failed to connect to execution engine" },
      ]);
      setExitStatus("error");
      setIsWaitingForInput(false);
      showToast("error", "Failed to connect to execution engine");
    } finally {
      setIsRunning(false);
    }
  };

  const handleRun = async () => {
    setIsWaitingForInput(false);
    setSessionInputs([]);
    setPrevStdout("");
    setTerminalEntries([
      {
        id: crypto.randomUUID(),
        type: "system",
        text: `Compiling and executing ${lang.name}...\n`,
      },
    ]);
    await runStep([], "");
  };

  const handleSendInput = (inputText: string) => {
    // Append the user's input directly into the terminal stream on the straight prompt line
    setTerminalEntries((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: "input", text: inputText + "\n" },
    ]);
    const nextInputs = [...sessionInputs, inputText];
    setSessionInputs(nextInputs);
    runStep(nextInputs, prevStdout);
  };

  const handleClearTerminal = () => {
    setTerminalEntries([]);
    setSessionInputs([]);
    setPrevStdout("");
    setIsWaitingForInput(false);
    setExitStatus("idle");
    setResult(null);
  };

  const handleSave = () => {
    if (currentProgramId) {
      const existing = programs.find((p) => p.id === currentProgramId);
      if (existing) {
        updateProgram({
          ...existing,
          name: existing.name,
          language: languageId,
          sourceCode,
          stdin,
        });
        showToast("success", "Program saved");
        return;
      }
    }
    setNewName(`solution.${lang.extension}`);
    setShowSaveAs(true);
  };

  const handleSaveAs = () => {
    const name = newName.trim() || `solution.${lang.extension}`;
    const program = createProgram(name, languageId, sourceCode, stdin);
    setCurrentProgramId(program.id);
    setShowSaveAs(false);
    showToast("success", "Program saved to workspace");
  };

  const handleResetStarter = () => {
    setSourceCode(lang.starterCode);
    setResult(null);
    showToast("info", `Reset to default ${lang.name} starter template`);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sourceCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showToast("success", "Code copied to clipboard");
  };

  const handleNewFile = () => {
    setSourceCode(lang.starterCode);
    setStdin("");
    setResult(null);
    setCurrentProgramId(null);
    setNewName(`untitled.${lang.extension}`);
    setShowSaveAs(true);
  };

  const handleOpenProgram = (program: Program) => {
    setLanguageId(program.language);
    setSourceCode(program.sourceCode);
    setStdin(program.stdin);
    setCurrentProgramId(program.id);
    setResult(null);
  };

  const handleDelete = (id: string) => {
    removeProgram(id);
    if (currentProgramId === id) {
      setCurrentProgramId(null);
      setSourceCode(lang.starterCode);
    }
    showToast("info", "Program deleted");
  };

  const handleRename = (program: Program) => {
    setNewName(program.name);
    setShowRename(true);
    setCurrentProgramId(program.id);
  };

  const handleConfirmRename = () => {
    const existing = programs.find((p) => p.id === currentProgramId);
    if (existing) {
      updateProgram({ ...existing, name: newName.trim() || existing.name });
      showToast("success", "Program renamed");
    }
    setShowRename(false);
  };

  const handleDuplicate = (id: string) => {
    copyProgram(id);
    showToast("success", "Program duplicated");
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        setShowSidebar((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceCode, stdin, languageId, currentProgramId]);

  const activeFileName = currentProgramId
    ? programs.find((p) => p.id === currentProgramId)?.name || `main.${lang.extension}`
    : `main.${lang.extension}`;

  return (
    <div className="h-screen w-full flex flex-col font-sans bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#121314] dark:text-[#ECEDEE] overflow-hidden select-none">
      {/* ===================================================================
          TOP PROFESSIONAL IDE NAVIGATION & CONTROL BAR
      =================================================================== */}
      <header className="h-14 flex items-center justify-between px-3 sm:px-4 bg-white dark:bg-[#151718] border-b border-[#E5E7EB] dark:border-[#202425] shrink-0 z-20">
        {/* Left: Sidebar toggle + Brand + Breadcrumbs + Language */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-1.5 rounded-xl text-[#6B7280] hover:text-[#121314] dark:text-[#8A9099] dark:hover:text-[#ECEDEE] hover:bg-slate-100 dark:hover:bg-[#1E2022] transition-colors hidden lg:flex items-center justify-center cursor-pointer"
            aria-label="Toggle sidebar"
            title="Toggle Sidebar (Ctrl+B)"
          >
            {showSidebar ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
          </button>

          <button
            onClick={() => navigate("landing")}
            className="flex items-center gap-2 group focus:outline-none cursor-pointer"
            aria-label="AarCode home"
          >
            <div className="w-8 h-8 rounded-xl bg-[#00F076]/10 border border-[#00F076]/20 p-1 flex items-center justify-center group-hover:scale-105 transition-transform">
              <img src="/AarCode.png" alt="AarCode" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-sm tracking-tight text-[#121314] dark:text-[#ECEDEE] hidden sm:inline">
              AarCode
            </span>
          </button>

          <span className="text-[#D1D5DB] dark:text-[#2C3133] hidden sm:inline">/</span>

          {/* Active File Chip */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2022] border border-[#E5E7EB] dark:border-[#2C3133] text-xs font-mono text-[#121314] dark:text-[#ECEDEE]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span>{activeFileName}</span>
          </div>

          <div className="w-px h-5 bg-[#E5E7EB] dark:bg-[#202425] mx-1 hidden sm:block" />

          {/* Language Selector */}
          <LanguageSelector value={languageId} onChange={handleLanguageChange} />

          {/* Live Execution Status Pulse */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F8FA] dark:bg-[#111213] text-[11px] font-medium text-[#6B7280] dark:text-[#8A9099] border border-[#E5E7EB] dark:border-[#202425]">
            {isRunning ? (
              <span className="flex items-center gap-1.5 text-[#00F076] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F076] animate-ping" />
                Executing...
              </span>
            ) : result?.status === "success" ? (
              <span className="flex items-center gap-1 text-[#10B981] font-semibold">
                <span>✓ Ready ({result.executionTime ? `${result.executionTime}s` : "0.2s"})</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B7280] dark:bg-[#8A9099]" />
                <span>Compiler Ready</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Tools + Run Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Reset starter code */}
          <button
            onClick={handleResetStarter}
            className="p-2 rounded-xl text-[#6B7280] hover:text-[#121314] dark:text-[#8A9099] dark:hover:text-[#ECEDEE] hover:bg-slate-100 dark:hover:bg-[#1E2022] transition-colors cursor-pointer"
            title="Reset to Template"
            aria-label="Reset Template"
          >
            <RotateCcw size={15} />
          </button>

          {/* New file */}
          <button
            onClick={handleNewFile}
            className="p-2 rounded-xl text-[#6B7280] hover:text-[#121314] dark:text-[#8A9099] dark:hover:text-[#ECEDEE] hover:bg-slate-100 dark:hover:bg-[#1E2022] transition-colors cursor-pointer"
            title="New File"
            aria-label="New file"
          >
            <FilePlus size={15} />
          </button>

          {/* Save (Ctrl+S) */}
          <button
            onClick={handleSave}
            className="p-2 rounded-xl text-[#6B7280] hover:text-[#121314] dark:text-[#8A9099] dark:hover:text-[#ECEDEE] hover:bg-slate-100 dark:hover:bg-[#1E2022] transition-colors cursor-pointer"
            title="Save (Ctrl+S)"
            aria-label="Save"
          >
            <Save size={15} />
          </button>

          {/* Share */}
          <button
            onClick={() => setShowShare(true)}
            className="p-2 rounded-xl text-[#6B7280] hover:text-[#121314] dark:text-[#8A9099] dark:hover:text-[#ECEDEE] hover:bg-slate-100 dark:hover:bg-[#1E2022] transition-colors cursor-pointer"
            title="Share Code Snippet"
            aria-label="Share"
          >
            <Share2 size={15} />
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl text-[#6B7280] hover:text-[#121314] dark:text-[#8A9099] dark:hover:text-[#ECEDEE] hover:bg-slate-100 dark:hover:bg-[#1E2022] transition-colors cursor-pointer"
            title="Editor Settings"
            aria-label="Settings"
          >
            <SettingsIcon size={15} />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-[#6B7280] hover:text-[#121314] dark:text-[#8A9099] dark:hover:text-[#ECEDEE] hover:bg-slate-100 dark:hover:bg-[#1E2022] transition-colors cursor-pointer"
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <div className="w-px h-5 bg-[#E5E7EB] dark:bg-[#202425] mx-1" />

          {/* Prominent High-Contrast Emerald Run Button */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={cn(
              "group inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl font-semibold text-xs sm:text-sm text-[#0C0D0E] shadow-[0_0_20px_rgba(0,240,118,0.22)] transition-all duration-200 cursor-pointer",
              isRunning
                ? "bg-[#00F076]/70 cursor-wait"
                : "bg-[#00F076] hover:bg-[#00D96A] hover:shadow-[0_0_28px_rgba(0,240,118,0.36)] hover:-translate-y-0.5 active:translate-y-0"
            )}
          >
            {isRunning ? (
              <Loader2 size={15} className="animate-spin text-[#0C0D0E]" />
            ) : (
              <Play size={15} className="fill-[#0C0D0E]" />
            )}
            <span>{isRunning ? "Running..." : "Run Code"}</span>
            <span className="hidden sm:inline text-[10px] font-mono opacity-80 px-1.5 py-0.5 rounded bg-black/15">
              Ctrl+↵
            </span>
          </button>
        </div>
      </header>

      {/* ===================================================================
          ANIMATED NEON LASER BEAM (while executing)
      =================================================================== */}
      {isRunning && (
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#00F076] to-transparent animate-pulse z-30" />
      )}

      {/* ===================================================================
          MAIN WORKSPACE LAYOUT: SIDEBAR + EDITOR + CONSOLE
      =================================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: File Explorer */}
        {showSidebar && (
          <aside className="w-60 shrink-0 hidden lg:flex flex-col z-10">
            <FileExplorer
              programs={programs}
              currentProgramId={currentProgramId}
              onOpen={handleOpenProgram}
              onCreate={handleNewFile}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onRename={handleRename}
            />
          </aside>
        )}

        {/* Center & Right: Editor Pane + Terminal Console */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden p-2 gap-2 bg-[#F7F8FA] dark:bg-[#0C0D0E]">
          {/* Monaco Editor Container */}
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] rounded-2xl overflow-hidden shadow-xs">
            {/* Editor Tab Bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-[#0C0D0E] border-b border-[#E5E7EB] dark:border-[#202425] shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] text-xs font-semibold text-slate-800 dark:text-[#ECEDEE] shadow-xs">
                  <Code2 size={13} className="text-[#00F076]" />
                  <span>{activeFileName}</span>
                </div>
              </div>

              {/* Quick Editor Actions */}
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={handleCopyCode}
                  className="p-1 rounded-md hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-[#202425] transition-colors"
                  title="Copy Code"
                >
                  {copiedCode ? (
                    <Check size={13} className="text-emerald-500" />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              </div>
            </div>

            {/* Monaco Editor Component */}
            <div className="flex-1 min-h-0">
              <CodeEditor
                value={sourceCode}
                onChange={setSourceCode}
                language={lang.monacoLanguage}
                theme={theme}
                settings={settings}
              />
            </div>

            {/* Status Bar */}
            <div className="h-6 px-3 bg-slate-50 dark:bg-[#0C0D0E] border-t border-[#E5E7EB] dark:border-[#202425] flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
              <div className="flex items-center gap-3">
                <span>{lang.name}</span>
                <span>•</span>
                <span>UTF-8</span>
                <span>•</span>
                <span>Spaces: {settings.tabSize}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-[#00F076] font-sans font-semibold">
                <TerminalIcon size={11} />
                <span>AarCode Engine</span>
              </div>
            </div>
          </div>

          {/* Desktop Terminal Console Pane */}
          <div className="lg:w-[42%] xl:w-[38%] shrink-0 flex flex-col min-h-0 hidden lg:flex">
            <ConsolePanel
              entries={terminalEntries}
              isRunning={isRunning}
              isWaitingForInput={isWaitingForInput}
              onSendInput={handleSendInput}
              onClearOutput={handleClearTerminal}
              showExecutionTime={settings.showExecutionTime}
              showMemoryUsage={settings.showMemoryUsage}
              executionTime={result?.executionTime}
              memory={result?.memory}
              exitStatus={exitStatus}
              onRun={handleRun}
            />
          </div>
        </main>
      </div>

      {/* Mobile Floating Console Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setMobileConsoleOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#00F076] text-[#0C0D0E] font-bold text-xs shadow-xl shadow-emerald-500/25"
        >
          <TerminalIcon size={16} />
          <span>Console {exitStatus === "waiting" ? "• Awaiting Input" : result ? "• Ready" : ""}</span>
        </button>
      </div>

      {/* Mobile Fullscreen Console Drawer */}
      {mobileConsoleOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#F7F8FA] dark:bg-[#0C0D0E] p-3 flex flex-col animate-in">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#E5E7EB] dark:border-[#202425]">
            <span className="text-sm font-bold">Execution Console</span>
            <button
              onClick={() => setMobileConsoleOpen(false)}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-[#202425] text-slate-700 dark:text-[#ECEDEE]"
            >
              Close
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <ConsolePanel
              entries={terminalEntries}
              isRunning={isRunning}
              isWaitingForInput={isWaitingForInput}
              onSendInput={handleSendInput}
              onClearOutput={handleClearTerminal}
              showExecutionTime={settings.showExecutionTime}
              showMemoryUsage={settings.showMemoryUsage}
              executionTime={result?.executionTime}
              memory={result?.memory}
              exitStatus={exitStatus}
              onRun={handleRun}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdate={onUpdateSettings}
        onReset={onResetSettings}
      />
      <ShareModal
        open={showShare}
        onClose={() => setShowShare(false)}
        onCopyLink={() => showToast("success", "Link copied to clipboard")}
      />

      <Modal open={showSaveAs} onClose={() => setShowSaveAs(false)} title="Save as" width="sm">
        <div className="space-y-3 font-sans">
          <label className="text-xs font-semibold text-slate-700 dark:text-[#ECEDEE]">File name</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveAs()}
            className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5E7EB] dark:border-[#202425] bg-white dark:bg-[#0C0D0E] text-[#121314] dark:text-[#ECEDEE] focus:outline-none focus:ring-1 focus:ring-[#00F076]"
            placeholder={`solution.${lang.extension}`}
            autoFocus
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowSaveAs(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSaveAs}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showRename} onClose={() => setShowRename(false)} title="Rename file" width="sm">
        <div className="space-y-3 font-sans">
          <label className="text-xs font-semibold text-slate-700 dark:text-[#ECEDEE]">New name</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirmRename()}
            className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5E7EB] dark:border-[#202425] bg-white dark:bg-[#0C0D0E] text-[#121314] dark:text-[#ECEDEE] focus:outline-none focus:ring-1 focus:ring-[#00F076]"
            autoFocus
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowRename(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleConfirmRename}>Rename</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CompilerPage;
