import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search, Terminal } from "lucide-react";
import { cn } from "@/utils/cn";
import { LANGUAGES } from "@/config/languages";

type LanguageSelectorProps = {
  value: string;
  onChange: (id: string) => void;
};

const LANG_COLORS: Record<string, string> = {
  python: "from-blue-500 to-yellow-500",
  javascript: "from-yellow-400 to-amber-500",
  typescript: "from-blue-500 to-indigo-600",
  java: "from-red-500 to-orange-500",
  c: "from-blue-600 to-cyan-500",
  cpp: "from-indigo-600 to-purple-600",
  go: "from-cyan-400 to-blue-500",
  rust: "from-orange-500 to-amber-700",
  php: "from-indigo-400 to-purple-500",
};

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selected = LANGUAGES.find((l) => l.id === value) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.extension.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      <button
        onClick={() => {
          setOpen(!open);
          setSearch("");
        }}
        className={cn(
          "flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all duration-200 text-xs sm:text-sm font-semibold shadow-sm",
          open
            ? "border-[#6366F1] bg-indigo-50/70 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-300 ring-2 ring-[#6366F1]/20"
            : "border-slate-200/90 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#131D36]"
        )}
        aria-label="Select language"
        aria-expanded={open}
      >
        <span
          className={cn(
            "w-2 h-2 rounded-full bg-gradient-to-r shadow-xs",
            LANG_COLORS[selected.id] || "from-indigo-500 to-purple-500"
          )}
        />
        <span>{selected.name}</span>
        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase">
          .{selected.extension}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-slate-400 transition-transform duration-200",
            open && "rotate-180 text-[#6366F1]"
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 w-64 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] shadow-2xl shadow-slate-900/10 dark:shadow-black/60 p-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="relative mb-2 px-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search language..."
              autoFocus
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#090D16] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
            />
          </div>

          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar">
            {filtered.map((lang) => {
              const isSelected = lang.id === value;
              return (
                <button
                  key={lang.id}
                  onClick={() => {
                    onChange(lang.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150",
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-300"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full bg-gradient-to-r",
                        LANG_COLORS[lang.id] || "from-indigo-500 to-purple-500"
                      )}
                    />
                    <span>{lang.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                      .{lang.extension}
                    </span>
                    {isSelected && <Check size={14} className="text-[#6366F1]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
