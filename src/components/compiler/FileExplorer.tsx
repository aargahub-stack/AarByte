import { FileCode, MoreVertical, Trash2, Copy, Pencil, Play, Plus } from "lucide-react";
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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 dark:border-gray-800">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          My Workspace
        </span>
        <button
          onClick={onCreate}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          aria-label="New file"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {programs.length === 0 && (
          <div className="px-3 py-6 text-center text-xs text-gray-400 dark:text-gray-600">
            No saved programs yet.
            <br />
            Click + to create one.
          </div>
        )}
        {programs.map((program) => {
          const lang = getLanguageById(program.language);
          const isActive = program.id === currentProgramId;
          return (
            <div
              key={program.id}
              className={cn(
                "group relative flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors border-l-2",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-600"
                  : "border-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={() => onOpen(program)}
            >
              <FileCode
                size={14}
                className={cn("flex-shrink-0", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400")}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-800 dark:text-gray-200 truncate">{program.name}</div>
                <div className="text-[10px] text-gray-400 dark:text-gray-600">
                  {lang?.name} - {formatRelativeTime(program.updatedAt)}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuId(menuId === program.id ? null : program.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 transition-opacity"
                aria-label="More options"
              >
                <MoreVertical size={12} />
              </button>
              {menuId === program.id && (
                <>
                  <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setMenuId(null); }} aria-hidden="true" />
                  <div
                    className="absolute right-2 top-full mt-1 z-40 min-w-[140px] rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => { onOpen(program); setMenuId(null); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Play size={12} /> Open
                    </button>
                    <button
                      onClick={() => { onRename(program); setMenuId(null); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Pencil size={12} /> Rename
                    </button>
                    <button
                      onClick={() => { onDuplicate(program.id); setMenuId(null); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Copy size={12} /> Duplicate
                    </button>
                    <button
                      onClick={() => { onDelete(program.id); setMenuId(null); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
