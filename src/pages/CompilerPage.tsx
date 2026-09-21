import { useEffect, useState } from "react";
import { Play, Save, Share2, Settings as SettingsIcon, Moon, Sun, Terminal, FilePlus, Loader2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { APP_NAME } from "@/config/constants";
import { getLanguageById } from "@/config/languages";
import { executeCode } from "@/services/execution/mockExecutor";
import type { ExecutionResult, Program, Route, Settings } from "@/types";
import { usePrograms } from "@/hooks/usePrograms";
import { useToast } from "@/hooks/useToast";

import { CodeEditor } from "@/components/editor/CodeEditor";
import { ConsolePanel } from "@/components/console/ConsolePanel";
import { LanguageSelector } from "@/components/compiler/LanguageSelector";
import { FileExplorer } from "@/components/compiler/FileExplorer";
import { SettingsModal } from "@/components/compiler/SettingsModal";
import { ShareModal } from "@/components/compiler/ShareModal";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AdSlot } from "@/components/ui/AdSlot";

type CompilerPageProps = {
  settings: Settings;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onUpdateSettings: (patch: Partial<Settings>) => void;
  onResetSettings: () => void;
  navigate: (to: Route) => void;
};

export function CompilerPage({ settings, theme, onToggleTheme, onUpdateSettings, onResetSettings, navigate }: CompilerPageProps) {
  const { programs, createProgram, updateProgram, removeProgram, copyProgram } = usePrograms();
  const { showToast } = useToast();

  const [languageId, setLanguageId] = useState("python");
  const [sourceCode, setSourceCode] = useState(getLanguageById("python")!.starterCode);
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentProgramId, setCurrentProgramId] = useState<string | null>(null);

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
    setSourceCode(newLang.starterCode);
    setResult(null);
    setCurrentProgramId(null);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);
    try {
      const res = await executeCode({ language: languageId, sourceCode, stdin });
      setResult(res);
      if (res.status === "success") {
        showToast("success", "Execution completed");
      } else if (res.status === "error") {
        showToast("error", res.status === "error" ? "Execution failed" : "Execution timed out");
      }
    } catch {
      showToast("error", "Failed to execute code");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSave = () => {
    if (currentProgramId) {
      const existing = programs.find((p) => p.id === currentProgramId);
      if (existing) {
        updateProgram({ ...existing, name: existing.name, language: languageId, sourceCode, stdin });
        showToast("success", "Program saved");
        return;
      }
    }
    setNewName(`untitled.${lang.extension}`);
    setShowSaveAs(true);
  };

  const handleSaveAs = () => {
    const name = newName.trim() || `untitled.${lang.extension}`;
    const program = createProgram(name, languageId, sourceCode, stdin);
    setCurrentProgramId(program.id);
    setShowSaveAs(false);
    showToast("success", "Program saved");
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
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceCode, stdin, languageId, currentProgramId]);

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-950 overflow-hidden">
      <header className="flex items-center justify-between px-3 py-2.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden lg:block"
            aria-label="Toggle sidebar"
          >
            {showSidebar ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
          <button onClick={() => navigate("landing")} className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 text-white">
              <Terminal size={16} />
            </div>
            <span className="font-bold text-sm text-gray-900 dark:text-gray-100 hidden sm:inline">{APP_NAME}</span>
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" />
          <LanguageSelector value={languageId} onChange={handleLanguageChange} />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleNewFile}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="New file"
            title="New file"
          >
            <FilePlus size={16} />
          </button>
          <button
            onClick={handleSave}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Save"
            title="Save (Ctrl+S)"
          >
            <Save size={16} />
          </button>
          <button
            onClick={() => setShowShare(true)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Share"
            title="Share"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Settings"
            title="Settings"
          >
            <SettingsIcon size={16} />
          </button>
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
          <Button
            variant="primary"
            size="sm"
            onClick={handleRun}
            disabled={isRunning}
            className="min-w-[80px]"
          >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            <span className="hidden sm:inline">{isRunning ? "Running" : "Run"}</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {showSidebar && (
          <aside className="w-56 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden lg:flex flex-col">
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

        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="flex-1 min-h-0 border border-gray-200 dark:border-gray-800 rounded-lg m-1 overflow-hidden">
            <CodeEditor
              value={sourceCode}
              onChange={setSourceCode}
              language={lang.monacoLanguage}
              theme={theme}
              settings={settings}
            />
          </div>

          <div className="lg:w-[40%] lg:flex-shrink-0 flex flex-col m-1 min-h-0">
            <div className="flex-1 min-h-0">
              <ConsolePanel
                stdin={stdin}
                onStdinChange={setStdin}
                result={result}
                isRunning={isRunning}
                showExecutionTime={settings.showExecutionTime}
                showMemoryUsage={settings.showMemoryUsage}
              />
            </div>
          </div>
        </main>
      </div>

      <div className="px-3 py-1.5 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0 hidden lg:block">
        <AdSlot label="Advertisement" className="py-1.5" />
      </div>

      <div className="lg:hidden fixed bottom-4 right-4 z-30">
        <Button
          variant="primary"
          onClick={() => setMobileConsoleOpen(!mobileConsoleOpen)}
          className="shadow-lg"
        >
          <Terminal size={16} /> Console
        </Button>
      </div>

      {mobileConsoleOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white dark:bg-gray-900 p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Console</span>
            <button onClick={() => setMobileConsoleOpen(false)} className="text-gray-400 p-1">
              <PanelLeftClose size={18} />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <ConsolePanel
              stdin={stdin}
              onStdinChange={setStdin}
              result={result}
              isRunning={isRunning}
              showExecutionTime={settings.showExecutionTime}
              showMemoryUsage={settings.showMemoryUsage}
            />
          </div>
        </div>
      )}

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
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">File name</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveAs()}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`untitled.${lang.extension}`}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowSaveAs(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSaveAs}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showRename} onClose={() => setShowRename(false)} title="Rename file" width="sm">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New name</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirmRename()}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowRename(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleConfirmRename}>Rename</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
