import { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  Moon,
  Sun,
  Trophy,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Zap,
  Flame,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/utils/cn";
import type { Route } from "@/types";
import { useAuth } from "@/hooks/useAuth";

type NavbarProps = {
  route: Route;
  navigate: (to: Route | string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

interface NavItem {
  label: string;
  route: Route;
  isAnchor?: string;
}

const PUBLIC_NAV_ITEMS: NavItem[] = [
  { label: "Courses", route: "courses" },
  { label: "Practice Arena", route: "problems" },
  { label: "Compiler", route: "compiler" },
  { label: "Pricing", route: "pricing", isAnchor: "pricing" },
];

const STUDENT_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", route: "dashboard" },
  { label: "Courses", route: "courses" },
  { label: "Practice Arena", route: "problems" },
  { label: "Compiler", route: "compiler" },
  { label: "Leaderboard", route: "leaderboard" },
];

export function Navbar({ route, navigate, theme, onToggleTheme }: NavbarProps) {
  const { user, profile, isAdmin, points, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navItems = user ? STUDENT_NAV_ITEMS : PUBLIC_NAV_ITEMS;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNav = (item: NavItem | { route: Route | string; isAnchor?: string }) => {
    setMobileOpen(false);
    setUserDropdownOpen(false);

    if (item.route === "compiler") {
      window.open("#/compiler", "_blank", "noopener,noreferrer");
      return;
    }

    if (item.isAnchor) {
      if (route !== "landing") {
        navigate("landing");
        setTimeout(() => {
          document.getElementById(item.isAnchor!)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        const el = document.getElementById(item.isAnchor);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else {
          navigate(item.route);
        }
      }
      return;
    }

    navigate(item.route);
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 font-urbanist bg-white/90 dark:bg-[#090D16]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left: AarCode Logo + bold "AarCode" text */}
          <button
            onClick={() => handleNav({ route: user ? "dashboard" : "landing" })}
            className="flex items-center gap-3 group focus:outline-none"
            aria-label="AarCode home"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50/80 dark:bg-indigo-500/15 border border-indigo-200/70 dark:border-indigo-500/20 p-1.5 group-hover:scale-105 group-hover:border-indigo-500/40 transition-all duration-200">
              <img
                src="/AarCode.png"
                alt="AarCode Logo"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            <span className="font-semibold text-2xl tracking-tight text-slate-900 dark:text-white">
              AarCode
            </span>
          </button>

          {/* Center: Navigation Links - Clean Minimalist with Neat Underline on Hover & Active */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 lg:gap-3">
            {navItems.map((item) => {
              const isActive =
                !item.isAnchor &&
                (route === item.route ||
                  (item.route === "dashboard" && route === "landing" && Boolean(user)) ||
                  (item.route === "courses" && route === "course") ||
                  (item.route === "problems" && route === "task"));

              return (
                <button
                  key={item.label}
                  onClick={() => handleNav(item)}
                  className={cn(
                    "relative px-3 py-2 text-sm transition-colors duration-200 group focus:outline-none select-none",
                    isActive
                      ? "text-[#6366F1] dark:text-indigo-400 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium"
                  )}
                >
                  <span>{item.label}</span>
                  {/* Neat Underline Indicator */}
                  <span
                    className={cn(
                      "absolute bottom-0.5 left-2.5 right-2.5 h-[2px] rounded-full transition-all duration-200 origin-center",
                      isActive
                        ? "bg-[#6366F1] dark:bg-indigo-400 opacity-100 scale-x-100 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                        : "bg-[#6366F1] dark:bg-indigo-400 opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100"
                    )}
                  />
                </button>
              );
            })}
          </nav>

          {/* Right: Theme toggle switch (Sun/Moon icon) + "Login ->" rounded pill button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleTheme}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/40 transition-all duration-200 shadow-sm"
              aria-label="Toggle theme"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {/* Streak Badge */}
                <button
                  onClick={() => handleNav({ route: "streak" })}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold transition-all cursor-pointer"
                  title="View Daily Coding Streak & History"
                >
                  <Flame size={13} className="text-amber-500 fill-amber-500/20" />
                  <span>Streak</span>
                </button>

                {/* Points Badge */}
                <button
                  onClick={() => handleNav({ route: "analytics" })}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all cursor-pointer"
                  title="View Learning Analytics"
                >
                  <Zap size={13} className="text-amber-500 fill-amber-500/20" />
                  <span>{points} XP</span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 pr-3 rounded-full border border-slate-200 dark:border-[#1E293B] hover:border-indigo-500/40 bg-white dark:bg-[#0F172A] transition-all text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#7C3AED] text-white flex items-center justify-center text-[10px] font-bold">
                        {getInitials(profile?.full_name || user.email)}
                      </div>
                    )}
                    <span className="hidden sm:inline max-w-[120px] truncate">
                      {profile?.full_name || user.email?.split("@")[0]}
                    </span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] shadow-2xl py-2 z-50 animate-in">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-[#1E293B]">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {profile?.full_name || "Developer"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full",
                              isAdmin
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                            )}
                          >
                            {isAdmin ? "Admin" : "Student"}
                          </span>
                          <span className="text-xs text-amber-500 font-bold">
                            ★ {points} XP
                          </span>
                        </div>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => handleNav({ route: "admin" })}
                          className="w-full text-left px-4 py-2.5 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2.5 transition-colors font-semibold"
                        >
                          <ShieldAlert size={16} />
                          <span>Admin Dashboard</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleNav({ route: "streak" })}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center gap-2.5 transition-colors font-medium"
                      >
                        <Flame size={16} className="text-amber-500" />
                        <span>Daily Streak</span>
                      </button>

                      <button
                        onClick={() => handleNav({ route: "analytics" })}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center gap-2.5 transition-colors font-medium"
                      >
                        <TrendingUp size={16} className="text-[#6366F1]" />
                        <span>Learning Analytics</span>
                      </button>

                      <button
                        onClick={() => handleNav({ route: "leaderboard" })}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center gap-2.5 transition-colors font-medium"
                      >
                        <Trophy size={16} className="text-amber-500" />
                        <span>Leaderboard</span>
                      </button>

                      <div className="border-t border-slate-100 dark:border-[#1E293B] my-1" />

                      <button
                        onClick={() => {
                          signOut();
                          setUserDropdownOpen(false);
                          navigate("landing");
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 transition-colors font-semibold"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleNav({ route: "login" })}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full bg-gradient-to-r from-[#6366F1] via-[#4F46E5] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                <span>Login</span>
                <ArrowRight size={15} />
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-full border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] px-4 py-4 space-y-2 animate-in max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Mobile User Profile & XP Badge if signed in */}
          {user && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] mb-3 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#7C3AED] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {getInitials(profile?.full_name || user.email)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {profile?.full_name || user.email?.split("@")[0]}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-600 dark:text-indigo-400 text-xs font-bold shrink-0">
                <Zap size={13} className="text-amber-500 fill-amber-500/20" />
                <span>{points} XP</span>
              </div>
            </div>
          )}

          {navItems.map((item) => {
            const isActive =
              !item.isAnchor &&
              (route === item.route ||
                (item.route === "dashboard" && route === "landing" && Boolean(user)) ||
                (item.route === "courses" && route === "course") ||
                (item.route === "problems" && route === "task"));

            return (
              <button
                key={item.label}
                onClick={() => handleNav(item)}
                className={cn(
                  "flex items-center justify-between w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all min-h-[44px]",
                  isActive
                    ? "bg-[#6366F1] text-white shadow-sm shadow-indigo-500/20"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-[#0F172A]"
                )}
              >
                <span>{item.label}</span>
                <ArrowRight size={15} className={isActive ? "text-white" : "opacity-40"} />
              </button>
            );
          })}

          {isAdmin && (
            <button
              onClick={() => handleNav({ route: "admin" })}
              className="flex items-center justify-between w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 min-h-[44px]"
            >
              <span className="flex items-center gap-2.5">
                <ShieldAlert size={16} />
                <span>Admin Dashboard</span>
              </span>
              <ArrowRight size={15} className="opacity-40" />
            </button>
          )}

          {user ? (
            <div className="pt-2 border-t border-slate-200/80 dark:border-[#1E293B]">
              <button
                onClick={() => {
                  signOut();
                  setMobileOpen(false);
                  navigate("landing");
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors min-h-[44px]"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="pt-2">
              <button
                onClick={() => handleNav({ route: "login" })}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold bg-gradient-to-r from-[#6366F1] to-[#7C3AED] text-white rounded-full shadow-md shadow-indigo-500/25 min-h-[44px]"
              >
                <span>Login</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
