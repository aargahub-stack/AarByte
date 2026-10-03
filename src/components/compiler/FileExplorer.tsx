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
    <div className="flex flex-col h-full font-urbanist bg-white dark:bg-[#151718] border-r border-[#E5E7EB] dark:border-[#202425] select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] dark:border-[#202425]">
        <div className="flex items-center gap-2">
          <FolderCode size={15} className="text-emerald-500 dark:text-[#00F076]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#121314] dark:text-[#ECEDEE]">
            Explorer
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-[#00F076]">
            {programs.length}
          </span>
        </div>
        <button
          onClick={onCreate}
          className="p-1 rounded-lg text-[#8A9099] hover:text-[#121314] dark:hover:text-[#ECEDEE] hover:bg-[#F7F8FA] dark:hover:bg-[#1A1D1E] transition-colors"
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
            <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425] flex items-center justify-center text-[#8A9099] mx-auto">
              <FileCode size={18} />
            </div>
            <p className="text-xs font-medium text-[#6B7280] dark:text-[#8A9099]">
              No saved programs yet.
            </p>
            <button
              onClick={onCreate}
              className="text-xs font-semibold text-emerald-600 dark:text-[#00F076] hover:underline"
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
                    ? "bg-emerald-500/10 border-emerald-500/30 text-[#121314] dark:text-[#ECEDEE] shadow-xs"
                    : "border-transparent text-[#6B7280] dark:text-[#8A9099] hover:bg-[#F7F8FA] dark:hover:bg-[#1A1D1E] hover:text-[#121314] dark:hover:text-[#ECEDEE]"
                )}
                onClick={() => onOpen(program)}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-1">
                  <FileCode
                    size={15}
                    className={cn(
                      "shrink-0",
                      isActive ? "text-emerald-500 dark:text-[#00F076]" : "text-[#8A9099] group-hover:text-[#121314] dark:group-hover:text-[#ECEDEE]"
                    )}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate leading-tight">
                      {program.name}
                    </div>
                    <div className="text-[10px] text-[#6B7280] dark:text-[#8A9099] truncate flex items-center gap-1.5 mt-0.5">
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
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-[#E5E7EB] dark:hover:bg-[#202425] text-[#8A9099] transition-opacity"
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
                      className="absolute right-2 top-full mt-1 z-40 min-w-[140px] rounded-xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] shadow-xl shadow-black/40 py-1.5 animate-in fade-in zoom-in-95 duration-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          onOpen(program);
                          setMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#121314] dark:text-[#ECEDEE] hover:bg-[#F7F8FA] dark:hover:bg-[#1A1D1E]"
                      >
                        <Play size={13} /> Open
                      </button>
                      <button
                        onClick={() => {
                          onRename(program);
                          setMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#121314] dark:text-[#ECEDEE] hover:bg-[#F7F8FA] dark:hover:bg-[#1A1D1E]"
                      >
                        <Pencil size={13} /> Rename
                      </button>
                      <button
                        onClick={() => {
                          onDuplicate(program.id);
                          setMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#121314] dark:text-[#ECEDEE] hover:bg-[#F7F8FA] dark:hover:bg-[#1A1D1E]"
                      >
                        <Copy size={13} /> Duplicate
                      </button>
                      <div className="border-t border-[#E5E7EB] dark:border-[#202425] my-1" />
                      <button
                        onClick={() => {
                          onDelete(program.id);
                          setMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10"
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
      <div className="p-3 border-t border-[#E5E7EB] dark:border-[#202425] bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[11px] text-[#6B7280] dark:text-[#8A9099] space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Keyboard size={12} className="text-emerald-500 dark:text-[#00F076]" /> Run Code
          </span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] font-mono text-[10px] font-bold text-[#121314] dark:text-[#ECEDEE]">
            Ctrl+↵
          </kbd>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock size={12} className="text-[#8A9099]" /> Save Code
          </span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] font-mono text-[10px] font-bold text-[#121314] dark:text-[#ECEDEE]">
            Ctrl+S
          </kbd>
        </div>
      </div>
    </div>
  );
}
