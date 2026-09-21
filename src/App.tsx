import { useState } from "react";
import { ToastProvider } from "@/hooks/useToast";
import { useSettings } from "@/hooks/useSettings";
import { useTheme } from "@/hooks/useTheme";
import { useRouter } from "@/hooks/useRouter";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { AuthModal } from "@/components/compiler/AuthModal";

import { LandingPage } from "@/pages/LandingPage";
import { CompilerPage } from "@/pages/CompilerPage";
import { ProblemsPage, PlaygroundPage, DocsPage, PricingPage } from "@/pages/ComingSoonPages";

function App() {
  const { route, navigate } = useRouter();
  const { settings, updateSettings, resetSettings } = useSettings();
  const { theme, toggleTheme } = useTheme(settings.theme);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [showAuth, setShowAuth] = useState(false);

  const handleNavigate = (to: typeof route) => {
    if (to === "login" || to === "signup") {
      setAuthMode(to);
      setShowAuth(true);
    } else {
      navigate(to);
    }
  };

  const isCompiler = route === "compiler";

  return (
    <ToastProvider>
      <div className={theme === "dark" ? "dark" : ""}>
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
          {!isCompiler && (
            <Navbar route={route} navigate={handleNavigate} theme={theme} onToggleTheme={toggleTheme} />
          )}

          <main>
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
            {route === "problems" && <ProblemsPage navigate={handleNavigate} />}
            {route === "playground" && <PlaygroundPage navigate={handleNavigate} />}
            {route === "docs" && <DocsPage navigate={handleNavigate} />}
            {route === "pricing" && <PricingPage navigate={handleNavigate} />}
          </main>

          {!isCompiler && <Footer navigate={handleNavigate} />}
        </div>
      </div>

      <ToastContainer />
      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </ToastProvider>
  );
}

export default App;
