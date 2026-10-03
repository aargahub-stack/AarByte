import { useEffect } from "react";
import { ToastProvider } from "@/hooks/useToast";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { useTheme } from "@/hooks/useTheme";
import { useRouter } from "@/hooks/useRouter";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { AuthModal } from "@/components/compiler/AuthModal";
import { cn } from "@/utils/cn";

import { LandingPage } from "@/pages/LandingPage";
import { AuthPage } from "@/pages/AuthPage";
import { StudentDashboardPage } from "@/pages/StudentDashboardPage";
import { CompilerPage } from "@/pages/CompilerPage";
import { CoursesPage } from "@/pages/CoursesPage";
import { CourseDetailsPage } from "@/pages/CourseDetailsPage";
import { ProblemsPage } from "@/pages/ProblemsPage";
import { TaskArenaPage } from "@/pages/TaskArenaPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { LeaderboardPage } from "@/pages/LeaderboardPage";
import { PlaygroundPage, DocsPage, PricingPage } from "@/pages/ComingSoonPages";
import { LegalPage } from "@/pages/LegalPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { StreakPage } from "@/pages/StreakPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import type { Route } from "@/types";

function MainApp() {
  const { route, params, navigate } = useRouter();
  const { settings, updateSettings, resetSettings } = useSettings();
  const { theme, toggleTheme } = useTheme(settings.theme);
  const { user, isAuthModalOpen, authModalMode, closeAuthModal, openAuthModal } = useAuth();

  const handleNavigate = (to: Route | string, navParams?: Record<string, string>) => {
    if (to === "compiler") {
      window.open("#/compiler", "_blank", "noopener,noreferrer");
      return;
    }
    navigate(to, navParams);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [route]);

  const isFullScreenArena =
    route === "compiler" ||
    route === "task" ||
    route === "login" ||
    route === "signup" ||
    route === "reset-password" ||
    route === "admin";

  return (
    <div className={cn("w-full h-full", theme === "dark" ? "dark" : "")}>
      <div
        className={cn(
          "w-full font-urbanist bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 transition-colors duration-300",
          isFullScreenArena
            ? "h-full overflow-hidden flex flex-col"
            : "min-h-full flex flex-col justify-between"
        )}
      >
        {/* Main Navbar shown on non-fullscreen pages */}
        {!isFullScreenArena && (
          <Navbar
            route={route}
            navigate={handleNavigate}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}

        {/* Dynamic Route Pages */}
        <main
          className={cn(
            isFullScreenArena ? "flex-1 flex flex-col min-h-0 overflow-hidden" : "flex-1"
          )}
        >
          {/* When student is logged in, landing & dashboard routes show StudentDashboardPage */}
          {(route === "landing" || route === "dashboard") &&
            (user ? (
              <StudentDashboardPage navigate={handleNavigate} />
            ) : (
              <LandingPage navigate={handleNavigate} />
            ))}

          {(route === "login" || route === "signup") && (
            <AuthPage
              initialMode={route === "signup" ? "signup" : "login"}
              navigate={handleNavigate}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          )}

          {route === "compiler" && (
            <CompilerPage
              settings={settings}
              theme={theme}
              onToggleTheme={toggleTheme}
              onUpdateSettings={updateSettings}
              onResetSettings={resetSettings}
              navigate={handleNavigate}
            />
          )}

          {route === "courses" && <CoursesPage navigate={handleNavigate} />}

          {route === "course" && (
            <CourseDetailsPage
              slug={params.slug || "python-dsa"}
              navigate={handleNavigate}
            />
          )}

          {route === "problems" && <ProblemsPage navigate={handleNavigate} />}

          {route === "task" && (
            <TaskArenaPage
              taskId={params.taskId || "task-py-twosum"}
              theme={theme}
              navigate={handleNavigate}
            />
          )}

          {route === "admin" && <AdminDashboardPage navigate={handleNavigate} />}

          {route === "leaderboard" && <LeaderboardPage />}

          {route === "playground" && <PlaygroundPage navigate={handleNavigate} />}
          {route === "docs" && <DocsPage navigate={handleNavigate} />}
          {route === "pricing" && <PricingPage navigate={handleNavigate} />}
          {(route === "privacy" || route === "terms") && (
            <LegalPage
              initialTab={route === "terms" ? "terms" : "privacy"}
              navigate={handleNavigate}
            />
          )}
          {route === "reset-password" && (
            <ResetPasswordPage
              navigate={handleNavigate}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          )}

          {route === "streak" && <StreakPage navigate={handleNavigate} />}
          {route === "analytics" && <AnalyticsPage navigate={handleNavigate} />}
        </main>

        {/* Footer */}
        {!isFullScreenArena && <Footer navigate={handleNavigate} />}
      </div>

      <ToastContainer />
      <AuthModal
        open={isAuthModalOpen}
        onClose={closeAuthModal}
        mode={authModalMode}
        onModeChange={(m) => openAuthModal(m)}
      />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
