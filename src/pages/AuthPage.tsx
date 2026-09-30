import { useState, useEffect } from "react";
import { Check, Loader2, AlertCircle, ArrowLeft, Sun, Moon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/useToast";
import type { Route } from "@/types";

interface AuthPageProps {
  initialMode?: "login" | "signup";
  navigate: (to: Route | string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function AuthPage({
  initialMode = "login",
  navigate,
  theme,
  onToggleTheme,
}: AuthPageProps) {
  const { signIn, signUp, user } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
  }, [initialMode]);

  // If user is already logged in, redirect straight to student dashboard
  useEffect(() => {
    if (user) {
      navigate("dashboard");
    }
  }, [user, navigate]);

  const isLogin = mode === "login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await signIn({ email: email.trim(), password });
        if (!res.success) {
          setErrorMessage(res.error || "Invalid credentials. Please try again.");
        } else {
          navigate("dashboard");
        }
      } else {
        if (!fullName.trim()) {
          setErrorMessage("Please enter your full name.");
          setLoading(false);
          return;
        }
        const res = await signUp({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
        });
        if (!res.success) {
          setErrorMessage(res.error || "Failed to create your account.");
        } else {
          navigate("dashboard");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    try {
      const { error } = await authService.signInWithGoogle();
      if (error) {
        setErrorMessage(error.message || "Google sign-in could not be initialized.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to connect to Google OAuth.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      showToast("info", "Enter your email address above first to receive a password reset link.");
      return;
    }
    showToast("info", `If an account exists for ${email}, a reset link has been queued.`);
  };

  const switchMode = (nextMode: "login" | "signup") => {
    setMode(nextMode);
    setErrorMessage(null);
    navigate(nextMode);
  };

  return (
    <div className="min-h-screen w-full font-urbanist grid grid-cols-1 lg:grid-cols-2 bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-white">
      {/* =====================================================================
          LEFT PANEL: Brand Testimonial & Telemetry Showcase (White Based)
      ===================================================================== */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 overflow-hidden bg-white dark:bg-[#0B1120] border-r border-slate-200/80 dark:border-[#1E293B] text-slate-900 dark:text-white select-none">
        {/* Subtle Architectural Grid Overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(99,102,241,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.07) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Ambient Soft Indigo/Purple Radial Glows (No green) */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-12 right-12 w-80 h-80 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl" />

        {/* Top Brand Header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <button
            onClick={() => navigate("landing")}
            className="flex items-center gap-3.5 group focus:outline-none"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-white/10 border border-slate-200/80 dark:border-white/15 flex items-center justify-center p-2 shadow-sm group-hover:scale-105 transition-transform">
              <img
                src="/AarCode.png"
                alt="AarCode"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              AarCode
            </span>
          </button>
        </div>

        {/* Center Testimonial Quote + Feature Checklist */}
        <div className="relative z-10 max-w-xl my-auto space-y-8">
          <div className="space-y-4">
            <blockquote className="text-2xl xl:text-[2rem] font-semibold leading-[1.3] tracking-tight text-slate-900 dark:text-white">
              “We went from debugging syntax errors for hours to passing hidden test cases in minutes — across 36+ coding cohorts.”
            </blockquote>
            <p className="text-sm xl:text-base font-medium text-slate-500 dark:text-slate-400">
              Operations &amp; Technical Placement Lead, Campus Developer Network
            </p>
          </div>

          {/* Subtle Divider Line */}
          <div className="h-px w-full bg-slate-200/80 dark:bg-white/10" />

          {/* 3 Feature Checkmarks */}
          <ul className="space-y-4">
            {[
              "Atomic sandbox execution across every language track",
              "Real-time hidden test-case evaluation telemetry",
              "Multi-track DSA & Web Development role-based roadmaps",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3.5 text-sm xl:text-base font-semibold text-slate-700 dark:text-slate-200">
                <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-[#6366F1] dark:text-[#818CF8] flex items-center justify-center shrink-0 border border-indigo-200/60 dark:border-indigo-500/30">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Copyright */}
        <div className="relative z-10 text-xs font-semibold text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} AarCode. Enterprise Developer Learning SaaS OS.
        </div>
      </div>

      {/* =====================================================================
          RIGHT PANEL: Clean Workspace Sign-In / Sign-Up Form
      ===================================================================== */}
      <div className="relative flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-[#F8FAFC] dark:bg-[#090D16] transition-colors duration-300">
        {/* Top Bar (Mobile Logo + Back to Home + Theme Toggle) */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("landing")}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Show brand on mobile */}
            <div className="flex lg:hidden items-center gap-2">
              <img src="/AarCode.png" alt="AarCode" className="w-6 h-6 object-contain" />
              <span className="font-semibold text-base text-slate-900 dark:text-white">
                AarCode
              </span>
            </div>

            <button
              onClick={onToggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 hover:text-[#0F766E] transition-colors shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Centered Form Card */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-[2rem] font-semibold tracking-tight text-slate-900 dark:text-white mb-2">
              {isLogin ? "Welcome back" : "Create your workspace"}
            </h1>
            <p className="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400">
              {isLogin
                ? "Sign in to your developer workspace."
                : "Join 1,000+ developers mastering logic on AarCode."}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 flex items-start gap-2.5 p-3.5 text-xs sm:text-sm font-semibold rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400">
              <AlertCircle size={17} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ada Lovelace"
                  required={!isLogin}
                  disabled={loading}
                  className="w-full h-12 px-4 text-sm font-medium rounded-xl border border-slate-200/90 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition-all shadow-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Work email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@branch.com"
                required
                disabled={loading}
                className="w-full h-12 px-4 text-sm font-medium rounded-xl border border-slate-200/90 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition-all shadow-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs sm:text-sm font-bold text-[#0F766E] dark:text-teal-400 hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={loading}
                  className="w-full h-12 pl-4 pr-16 text-sm font-medium rounded-xl border border-slate-200/90 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white px-1.5 py-1 transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Keep me signed in checkbox */}
            <div className="flex items-center gap-2.5 pt-0.5">
              <input
                id="keep-signed-in"
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#2563EB] focus:ring-[#2563EB] accent-[#2563EB] cursor-pointer"
              />
              <label
                htmlFor="keep-signed-in"
                className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none"
              >
                Keep me signed in
              </label>
            </div>

            {/* Primary Sign In / Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#0B6E69] hover:bg-[#095955] text-white font-semibold text-sm sm:text-base shadow-lg shadow-teal-900/15 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{isLogin ? "Signing in..." : "Creating workspace..."}</span>
                </>
              ) : (
                <span>{isLogin ? "Sign In" : "Create Workspace"}</span>
              )}
            </button>
          </form>

          {/* Divider: or continue with */}
          <div className="relative my-7 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-[#1E293B]" />
            </div>
            <span className="relative px-4 bg-[#F8FAFC] dark:bg-[#090D16] text-xs font-semibold text-slate-400 dark:text-slate-500">
              or continue with
            </span>
          </div>

          {/* Sign in with Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full h-12 rounded-xl border border-slate-200/90 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-3 shadow-sm transition-all duration-200 disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 size={18} className="animate-spin text-[#0B6E69]" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                />
              </svg>
            )}
            <span>Sign in with Google</span>
          </button>

          {/* Bottom Switcher */}
          <p className="mt-8 text-center text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
            {isLogin ? "New to AarCode? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => switchMode(isLogin ? "signup" : "login")}
              className="font-extrabold text-[#0B6E69] dark:text-teal-400 hover:underline transition-colors"
            >
              {isLogin ? "Create a workspace" : "Sign in"}
            </button>
          </p>
        </div>

        {/* Subtle Bottom Spacer on Right Panel */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-600 font-medium">
          Protected by AarCode Secure Sandbox Authentication
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
