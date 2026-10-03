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
            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20"
            : "border-[#E5E7EB] dark:border-[#202425] bg-white dark:bg-[#151718] text-[#121314] dark:text-[#ECEDEE] hover:bg-[#F7F8FA] dark:hover:bg-[#1A1D1E]"
        )}
        aria-label="Select language"
        aria-expanded={open}
      >
        <span
          className={cn(
            "w-2 h-2 rounded-full bg-gradient-to-r shadow-xs",
            LANG_COLORS[selected.id] || "from-emerald-500 to-teal-500"
          )}
        />
        <span>{selected.name}</span>
        <span className="text-[10px] font-mono text-[#6B7280] dark:text-[#8A9099] uppercase">
          .{selected.extension}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-[#6B7280] dark:text-[#8A9099] transition-transform duration-200",
            open && "rotate-180 text-emerald-500 dark:text-[#00F076]"
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 w-64 rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] shadow-2xl shadow-black/40 p-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="relative mb-2 px-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A9099]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search language..."
              autoFocus
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#E5E7EB] dark:border-[#202425] bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#121314] dark:text-[#ECEDEE] placeholder:text-[#8A9099] focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "text-[#121314] dark:text-[#ECEDEE] hover:bg-[#F7F8FA] dark:hover:bg-[#1A1D1E]"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full bg-gradient-to-r",
                        LANG_COLORS[lang.id] || "from-emerald-500 to-teal-500"
                      )}
                    />
                    <span>{lang.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#6B7280] dark:text-[#8A9099]">
                      .{lang.extension}
                    </span>
                    {isSelected && <Check size={14} className="text-emerald-500 dark:text-[#00F076]" />}
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
