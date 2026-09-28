import { useState } from "react";
import { ToastProvider } from "@/hooks/useToast";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { useTheme } from "@/hooks/useTheme";
import { useRouter } from "@/hooks/useRouter";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { AuthModal } from "@/components/compiler/AuthModal";

import { LandingPage } from "@/pages/LandingPage";
import { CompilerPage } from "@/pages/CompilerPage";
import { CoursesPage } from "@/pages/CoursesPage";
import { CourseDetailsPage } from "@/pages/CourseDetailsPage";
import { ProblemsPage } from "@/pages/ProblemsPage";
import { TaskArenaPage } from "@/pages/TaskArenaPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { LeaderboardPage } from "@/pages/LeaderboardPage";
import { PlaygroundPage, DocsPage, PricingPage } from "@/pages/ComingSoonPages";
import type { Route } from "@/types";

function MainApp() {
  const { route, params, navigate } = useRouter();
  const { settings, updateSettings, resetSettings } = useSettings();
  const { theme, toggleTheme } = useTheme(settings.theme);
  const { isAuthModalOpen, authModalMode, closeAuthModal, openAuthModal } = useAuth();

  const handleNavigate = (to: Route | string, navParams?: Record<string, string>) => {
    if (to === "login" || to === "signup") {
      openAuthModal(to);
    } else {
      navigate(to, navParams);
    }
  };

  const isFullScreenArena = route === "compiler" || route === "task";

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col justify-between">
        {/* Main Navbar shown on non-fullscreen IDE pages */}
        {!isFullScreenArena && (
          <Navbar
            route={route}
            navigate={handleNavigate}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}

        {/* Dynamic Route Pages */}
        <main className="flex-1">
          {route === "landing" && <LandingPage navigate={handleNavigate} />}

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
