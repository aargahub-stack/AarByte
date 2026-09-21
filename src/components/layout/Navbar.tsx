import { useState } from "react";
import { Menu, X, Moon, Sun, Terminal } from "lucide-react";
import { cn } from "@/utils/cn";
import { APP_NAME } from "@/config/constants";
import type { Route } from "@/types";

type NavbarProps = {
  route: Route;
  navigate: (to: Route) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

const NAV_ITEMS: { label: string; route: Route }[] = [
  { label: "Compiler", route: "compiler" },
  { label: "Problems", route: "problems" },
  { label: "Playground", route: "playground" },
  { label: "Docs", route: "docs" },
  { label: "Pricing", route: "pricing" },
];

export function Navbar({ route, navigate, theme, onToggleTheme }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (to: Route) => {
    navigate(to);
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button
              onClick={() => handleNav("landing")}
              className="flex items-center gap-2 text-gray-900 dark:text-gray-100"
              aria-label={`${APP_NAME} home`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white">
                <Terminal size={18} />
              </div>
              <span className="font-bold text-lg tracking-tight">{APP_NAME}</span>
            </button>
            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.route}
                  onClick={() => handleNav(item.route)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    route === item.route
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => handleNav("login")}
              className="hidden md:inline-flex px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => handleNav("compiler")}
              className="hidden md:inline-flex px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              Open Compiler
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.route}
              onClick={() => handleNav(item.route)}
              className={cn(
                "block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                route === item.route
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              {item.label}
            </button>
          ))}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleNav("login")}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              Login
            </button>
            <button
              onClick={() => handleNav("compiler")}
              className="flex-1 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg"
            >
              Open Compiler
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
