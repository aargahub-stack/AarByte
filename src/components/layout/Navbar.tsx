import { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  Moon,
  Sun,
  Terminal,
  Trophy,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  BookOpen,
  Code2,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { APP_NAME } from "@/config/constants";
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
  icon: typeof Terminal;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Compiler", route: "compiler", icon: Terminal },
  { label: "Courses", route: "courses", icon: BookOpen },
  { label: "Practice Arena", route: "problems", icon: Code2 },
  { label: "Leaderboard", route: "leaderboard", icon: Trophy },
];

export function Navbar({ route, navigate, theme, onToggleTheme }: NavbarProps) {
  const { user, profile, isAdmin, points, signOut, openAuthModal } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNav = (to: Route | string) => {
    navigate(to);
    setMobileOpen(false);
    setUserDropdownOpen(false);
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
    <nav className="sticky top-0 z-40 bg-white/85 dark:bg-gray-950/85 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => handleNav("landing")}
              className="flex items-center gap-2.5 text-gray-900 dark:text-gray-100 group"
              aria-label={`${APP_NAME} home`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <Terminal size={18} />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                  {APP_NAME}
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  route === item.route ||
                  (item.route === "courses" && route === "course") ||
                  (item.route === "problems" && route === "task");

                return (
                  <button
                    key={item.route}
                    onClick={() => handleNav(item.route)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                      isActive
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 font-semibold"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900"
                    )}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Authenticated user UI */}
            {user ? (
              <div className="flex items-center gap-3">
                {/* Points Badge */}
                <div
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold"
                  title="Your AarByte Points"
                >
                  <Sparkles size={14} className="text-amber-500 animate-pulse" />
                  <span>{points} pts</span>
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 transition-all text-xs font-medium text-gray-800 dark:text-gray-200"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                        {getInitials(profile?.full_name || user.email)}
                      </div>
                    )}
                    <span className="hidden sm:inline max-w-[120px] truncate font-medium">
                      {profile?.full_name || user.email?.split("@")[0]}
                    </span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      {/* User Info Header */}
                      <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {profile?.full_name || "Coder"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={cn(
                              "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full",
                              isAdmin
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            )}
                          >
                            {isAdmin ? "Admin" : "Student"}
                          </span>
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                            ★ {points} XP
                          </span>
                        </div>
                      </div>

                      {/* Admin Link */}
                      {isAdmin && (
                        <button
                          onClick={() => handleNav("admin")}
                          className="w-full text-left px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2.5 transition-colors font-medium"
                        >
                          <ShieldAlert size={16} />
                          <span>Admin Dashboard</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleNav("leaderboard")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2.5 transition-colors"
                      >
                        <Trophy size={16} className="text-yellow-500" />
                        <span>Leaderboard</span>
                      </button>

                      <div className="border-t border-gray-100 dark:border-gray-800 my-1" />

                      <button
                        onClick={() => {
                          signOut();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Non-authenticated user CTA */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal("login")}
                  className="px-3.5 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuthModal("signup")}
                  className="px-3.5 py-1.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-sm shadow-blue-500/25 transition-all"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = route === item.route;
            return (
              <button
                key={item.route}
                onClick={() => handleNav(item.route)}
                className={cn(
                  "flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900"
                )}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {isAdmin && (
            <button
              onClick={() => handleNav("admin")}
              className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
            >
              <ShieldAlert size={16} />
              <span>Admin Dashboard</span>
            </button>
          )}

          {!user && (
            <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  openAuthModal("login");
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg text-center"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  openAuthModal("signup");
                }}
                className="flex-1 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg text-center"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
