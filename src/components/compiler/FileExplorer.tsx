import {
  FileCode,
  MoreVertical,
  Trash2,
  Copy,
  Pencil,
  Play,
  Plus,
  FolderCode,
  Keyboard,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/cn";
import type { Program } from "@/types";
import { getLanguageById } from "@/config/languages";
import { formatRelativeTime } from "@/utils/format";

type FileExplorerProps = {
  programs: Program[];
  currentProgramId: string | null;
  onOpen: (program: Program) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (program: Program) => void;
};

export function FileExplorer({
  programs,
  currentProgramId,
  onOpen,
  onCreate,
  onDelete,
  onDuplicate,
  onRename,
}: FileExplorerProps) {
  const [menuId, setMenuId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full font-sans bg-white dark:bg-[#0F172A] border-r border-slate-200/80 dark:border-[#1E293B] select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-[#1E293B]">
        <div className="flex items-center gap-2">
          <FolderCode size={15} className="text-[#6366F1]" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Explorer
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-300">
            {programs.length}
          </span>
        </div>
        <button
          onClick={onCreate}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          aria-label="New file"
          title="New Program"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {programs.length === 0 ? (
          <div className="px-4 py-10 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#090D16] border border-slate-200 dark:border-[#1E293B] flex items-center justify-center text-slate-400 mx-auto">
              <FileCode size={18} />
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              No saved programs yet.
            </p>
            <button
              onClick={onCreate}
              className="text-xs font-semibold text-[#6366F1] dark:text-indigo-400 hover:underline"
            >
              + Create your first file
            </button>
          </div>
        ) : (
          programs.map((program) => {
            const lang = getLanguageById(program.language);
            const isActive = program.id === currentProgramId;

            return (
              <div
                key={program.id}
                className={cn(
                  "group relative flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 border",
                  isActive
                    ? "bg-indigo-50/80 dark:bg-indigo-950/30 border-[#6366F1]/40 text-slate-900 dark:text-white shadow-xs"
                    : "border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                )}
                onClick={() => onOpen(program)}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-1">
                  <FileCode
                    size={15}
                    className={cn(
                      "shrink-0",
                      isActive ? "text-[#6366F1]" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    )}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate leading-tight">
                      {program.name}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                      <span>{lang?.name || program.language}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(program.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* More Options Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuId(menuId === program.id ? null : program.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700/60 text-slate-400 transition-opacity"
                  aria-label="More options"
                >
                  <MoreVertical size={13} />
                </button>

                {/* Dropdown Menu */}
                {menuId === program.id && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuId(null);
                      }}
                      aria-hidden="true"
                    />
                    <div
                      className="absolute right-2 top-full mt-1 z-40 min-w-[140px] rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          onOpen(program);
                          setMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      >
                        <Play size={13} /> Open
                      </button>
                      <button
                        onClick={() => {
                          onRename(program);
                          setMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      >
                        <Pencil size={13} /> Rename
                      </button>
                      <button
                        onClick={() => {
                          onDuplicate(program.id);
                          setMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      >
                        <Copy size={13} /> Duplicate
                      </button>
                      <div className="border-t border-slate-100 dark:border-[#1E293B] my-1" />
                      <button
                        onClick={() => {
                          onDelete(program.id);
                          setMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Shortcut Cheat Sheet */}
      <div className="p-3 border-t border-slate-200/80 dark:border-[#1E293B] bg-slate-50/60 dark:bg-[#090D16]/60 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Keyboard size={12} className="text-[#6366F1]" /> Run Code
          </span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] font-mono text-[10px] font-bold">
            Ctrl+↵
          </kbd>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock size={12} className="text-slate-400" /> Save Code
          </span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] font-mono text-[10px] font-bold">
            Ctrl+S
          </kbd>
        </div>
      </div>
    </div>
  );
}
