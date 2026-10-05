import { useState, useEffect } from "react";
import {
  Check,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Sun,
  Moon,
  Mail,
  MailCheck,
  RefreshCw,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
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

  const [mode, setMode] = useState<"login" | "signup" | "forgot-password" | "verify-sent">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string>("");
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
    setUnconfirmedEmail(null);
  }, [initialMode]);

  // If user is already logged in, redirect straight to student dashboard
  useEffect(() => {
    if (user) {
      navigate("dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setUnconfirmedEmail(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await signIn({ email: email.trim(), password });
        if (!res.success) {
          if (res.isEmailUnconfirmed) {
            setUnconfirmedEmail(res.email || email.trim());
          } else {
            setErrorMessage(res.error || "Invalid credentials. Please try again.");
          }
        } else {
          navigate("dashboard");
        }
      } else if (mode === "signup") {
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
        } else if (res.needsEmailConfirmation) {
          setSentEmail(email.trim());
          setMode("verify-sent");
        } else {
          navigate("dashboard");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await authService.resetPasswordForEmail(email.trim());
      if (error) {
        setErrorMessage(error.message || "Failed to send reset link.");
      } else {
        setForgotSent(true);
        showToast("success", "Password reset link sent to your email!");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Could not send reset link.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async (targetEmail: string) => {
    if (!targetEmail.trim()) return;
    setResendLoading(true);
    try {
      const { error } = await authService.resendVerificationEmail(targetEmail.trim());
      if (error) {
        showToast("error", error.message || "Could not resend email.");
      } else {
        showToast("success", `Verification link resent to ${targetEmail}!`);
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to resend.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    try {
      const { error } = await authService.signInWithGoogle();
      if (error) {
        if (
          error.message?.includes("provider is not enabled") ||
          error.message?.includes("Unsupported provider")
        ) {
          setErrorMessage(
            "Google Sign-In is not enabled yet in your Supabase project. In Supabase Dashboard, go to Authentication > Providers > Google, enable it, and enter your Client ID & Secret."
          );
        } else {
          setErrorMessage(error.message || "Google sign-in could not be initialized.");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to connect to Google OAuth.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const switchMode = (nextMode: "login" | "signup" | "forgot-password") => {
    setMode(nextMode);
    setErrorMessage(null);
    setUnconfirmedEmail(null);
    setForgotSent(false);
    if (nextMode === "login" || nextMode === "signup") {
      navigate(nextMode);
    }
  };

  return (
    <div className="h-full w-full max-h-screen font-urbanist grid grid-cols-1 lg:grid-cols-2 bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#121314] dark:text-[#ECEDEE] overflow-hidden">
      {/* =====================================================================
          LEFT PANEL: Brand Testimonial & Showcase (Desktop Viewport Fit)
      ===================================================================== */}
      <div className="relative hidden lg:flex flex-col justify-between p-8 xl:p-12 overflow-hidden bg-white dark:bg-[#151718] border-r border-[#E5E7EB] dark:border-[#202425] text-[#121314] dark:text-[#ECEDEE] select-none">
        {/* Subtle Architectural Grid Overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,240,118,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,240,118,0.07) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Ambient Radial Glows */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#00F076]/5 dark:bg-[#00F076]/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-12 right-12 w-80 h-80 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl" />

        {/* Top Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => navigate("landing")}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/10 border border-slate-200/80 dark:border-white/15 flex items-center justify-center p-2 shadow-xs group-hover:scale-105 transition-transform">
              <img
                src="/AarCode.png"
                alt="AarCode"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE]">
              AarCode
            </span>
          </button>
        </div>

        {/* Center Testimonial Quote + Feature Checklist */}
        <div className="relative z-10 max-w-lg my-auto space-y-5">
          <div className="space-y-2.5">
            <blockquote className="text-xl xl:text-2xl font-semibold leading-snug tracking-tight text-[#121314] dark:text-[#ECEDEE]">
              “We went from debugging syntax errors for hours to passing hidden test cases in minutes — across 36+ coding cohorts.”
            </blockquote>
            <p className="text-xs xl:text-sm font-medium text-[#6B7280] dark:text-[#8A9099]">
              Operations &amp; Technical Placement Lead, Campus Developer Network
            </p>
          </div>

          {/* Subtle Divider Line */}
          <div className="h-px w-full bg-[#E5E7EB] dark:bg-[#202425]" />

          {/* Feature Checkmarks */}
          <ul className="space-y-3">
            {[
              "Atomic compiler execution across every language track",
              "Real-time hidden test-case evaluation telemetry",
              "Multi-track DSA & Web Development role-based roadmaps",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-xs xl:text-sm font-semibold text-[#121314] dark:text-[#ECEDEE]">
                <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] flex items-center justify-center shrink-0 border border-emerald-500/25">
                  <Check size={10} strokeWidth={3} />
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Copyright */}
        <div className="relative z-10 text-[11px] font-semibold text-[#6B7280] dark:text-[#8A9099]">
          © {new Date().getFullYear()} AarCode. Enterprise Developer Learning SaaS.
        </div>
      </div>

      {/* =====================================================================
          RIGHT PANEL: Compact Form (Fits 100% within device frame, no scrolls)
      ===================================================================== */}
      <div className="relative h-full flex flex-col justify-between p-4 sm:p-6 lg:p-8 xl:p-10 bg-[#F7F8FA] dark:bg-[#0C0D0E] overflow-y-auto lg:overflow-hidden transition-colors duration-300">
        {/* Top Bar (Back to Home + Theme Toggle) */}
        <div className="flex items-center justify-between shrink-0">
          <button
            onClick={() => navigate("landing")}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#6B7280] dark:text-[#8A9099] hover:text-[#121314] dark:hover:text-[#ECEDEE] transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2.5">
            {/* Show brand on mobile */}
            <div className="flex lg:hidden items-center gap-1.5">
              <img src="/AarCode.png" alt="AarCode" className="w-5 h-5 object-contain" />
              <span className="font-bold text-sm text-[#121314] dark:text-[#ECEDEE]">
                AarCode
              </span>
            </div>

            <button
              onClick={onToggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-[#E5E7EB] dark:border-[#202425] bg-white dark:bg-[#151718] text-[#121314] dark:text-[#ECEDEE] hover:border-emerald-500/40 transition-colors shadow-xs"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>

        {/* Centered Form Card */}
        <div className="w-full max-w-[390px] mx-auto my-auto py-1 sm:py-2">
          {/* =========================================================
              VIEW 1: Verification Email Sent Confirmation Screen
          ========================================================= */}
          {mode === "verify-sent" && (
            <div className="text-center space-y-4 py-2 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-[#00F076] flex items-center justify-center mx-auto shadow-sm">
                <MailCheck size={28} />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE]">
                  Check your inbox
                </h1>
                <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#8A9099] leading-relaxed">
                  We sent a confirmation link to <span className="font-bold text-[#121314] dark:text-[#ECEDEE]">{sentEmail}</span>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#151718] border border-slate-200 dark:border-[#202425] text-left text-xs text-[#6B7280] dark:text-[#8A9099] space-y-1.5">
                <p className="font-semibold text-[#121314] dark:text-[#ECEDEE]">
                  Next step to activate:
                </p>
                <p className="text-[11px] leading-relaxed">
                  1. Open the email from AarCode and click <strong>&quot;Confirm your email&quot;</strong>.<br />
                  2. Once confirmed, come back here to sign in.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleResendVerification(sentEmail)}
                  disabled={resendLoading}
                  className="w-full h-10 rounded-xl border border-[#E5E7EB] dark:border-[#202425] bg-white dark:bg-[#151718] hover:bg-slate-50 dark:hover:bg-[#202425] text-slate-700 dark:text-[#ECEDEE] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-60"
                >
                  {resendLoading ? (
                    <Loader2 size={14} className="animate-spin text-[#00F076]" />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                  <span>Resend Confirmation Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="w-full h-10 rounded-xl bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] font-semibold text-xs shadow-[0_0_20px_rgba(0,240,118,0.2)] transition-all flex items-center justify-center gap-2"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 2: Forgot Password Screen
          ========================================================= */}
          {mode === "forgot-password" && (
            <div className="space-y-4 py-2 animate-in fade-in duration-200">
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[#00F076] flex items-center justify-center mb-2">
                  <KeyRound size={20} />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE]">
                  Reset password
                </h1>
                <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#8A9099]">
                  Enter your email address to receive password reset instructions.
                </p>
              </div>

              {errorMessage && (
                <div className="flex items-start gap-2 p-2.5 text-xs font-semibold rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 leading-snug">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {forgotSent ? (
                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-[#00F076] text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 size={16} />
                      <span>Reset Link Dispatched</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      If an account exists for <strong>{email}</strong>, a password recovery link has been sent. Check your inbox and spam folder.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="w-full h-10 rounded-xl bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] font-semibold text-xs shadow-[0_0_20px_rgba(0,240,118,0.2)] transition-all flex items-center justify-center"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#ECEDEE] mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      required
                      disabled={loading}
                      className="w-full h-10 px-3.5 text-xs sm:text-sm font-medium rounded-xl border border-[#E5E7EB] dark:border-[#202425] bg-white dark:bg-[#0C0D0E] text-[#121314] dark:text-[#ECEDEE] placeholder:text-zinc-400 dark:placeholder:text-[#8A9099] focus:outline-none focus:ring-1 focus:ring-[#00F076] transition-all shadow-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 rounded-xl bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,240,118,0.2)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Sending reset link...</span>
                      </>
                    ) : (
                      <span>Send Recovery Link</span>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="text-xs font-semibold text-[#6B7280] dark:text-[#8A9099] hover:text-[#121314] dark:hover:text-[#ECEDEE] transition-colors"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* =========================================================
              VIEW 3 & 4: Standard Login & Signup Forms
          ========================================================= */}
          {(mode === "login" || mode === "signup") && (
            <>
              {/* Header */}
              <div className="mb-3 sm:mb-4 text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE] mb-1">
                  {mode === "login" ? "Welcome back" : "Create your workspace"}
                </h1>
                <p className="text-xs sm:text-sm font-medium text-[#6B7280] dark:text-[#8A9099]">
                  {mode === "login"
                    ? "Sign in to your developer workspace."
                    : "Join 1,000+ developers mastering logic on AarCode."}
                </p>
              </div>

              {/* Unconfirmed Email Alert with 1-Click Resend */}
              {unconfirmedEmail && (
                <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Mail size={15} />
                    <span>Please Verify Your Email</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Your account was created, but you must confirm your email before signing in. Check your inbox or click below to resend.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleResendVerification(unconfirmedEmail)}
                    disabled={resendLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    {resendLoading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <RefreshCw size={13} />
                    )}
                    <span>Resend Confirmation Link</span>
                  </button>
                </div>
              )}

              {errorMessage && !unconfirmedEmail && (
                <div className="mb-3 flex items-start gap-2 p-2.5 text-xs font-semibold rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 leading-snug">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
                {mode === "signup" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#ECEDEE] mb-1">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ada Lovelace"
                      required
                      disabled={loading}
                      className="w-full h-10 px-3.5 text-xs sm:text-sm font-medium rounded-xl border border-[#E5E7EB] dark:border-[#202425] bg-white dark:bg-[#0C0D0E] text-[#121314] dark:text-[#ECEDEE] placeholder:text-zinc-400 dark:placeholder:text-[#8A9099] focus:outline-none focus:ring-1 focus:ring-[#00F076] transition-all shadow-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#ECEDEE] mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                    disabled={loading}
                    className="w-full h-10 px-3.5 text-xs sm:text-sm font-medium rounded-xl border border-[#E5E7EB] dark:border-[#202425] bg-white dark:bg-[#0C0D0E] text-[#121314] dark:text-[#ECEDEE] placeholder:text-zinc-400 dark:placeholder:text-[#8A9099] focus:outline-none focus:ring-1 focus:ring-[#00F076] transition-all shadow-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-[#ECEDEE]">
                      Password
                    </label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => switchMode("forgot-password")}
                        className="text-xs font-semibold text-emerald-600 dark:text-[#00F076] hover:underline transition-colors"
                      >
                        Forgot?
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
                      className="w-full h-10 pl-3.5 pr-14 text-xs sm:text-sm font-medium rounded-xl border border-[#E5E7EB] dark:border-[#202425] bg-white dark:bg-[#0C0D0E] text-[#121314] dark:text-[#ECEDEE] placeholder:text-zinc-400 dark:placeholder:text-[#8A9099] focus:outline-none focus:ring-1 focus:ring-[#00F076] transition-all shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white px-1.5 py-0.5 transition-colors"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Keep me signed in */}
                <div className="flex items-center gap-2 py-0.5">
                  <input
                    id="keep-signed-in"
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-[#202425] text-[#00F076] focus:ring-[#00F076] accent-[#00F076] cursor-pointer"
                  />
                  <label
                    htmlFor="keep-signed-in"
                    className="text-xs font-semibold text-[#6B7280] dark:text-[#8A9099] cursor-pointer select-none"
                  >
                    Keep me signed in
                  </label>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 rounded-xl bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,240,118,0.2)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{mode === "login" ? "Signing in..." : "Creating workspace..."}</span>
                    </>
                  ) : (
                    <span>{mode === "login" ? "Sign In" : "Create Workspace"}</span>
                  )}
                </button>
              </form>

              {/* Divider: or continue with */}
              <div className="relative my-3 sm:my-3.5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E5E7EB] dark:border-[#202425]" />
                </div>
                <span className="relative px-3 bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[11px] font-semibold text-[#6B7280] dark:text-[#8A9099]">
                  or continue with
                </span>
              </div>

              {/* Continue with Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full h-10 rounded-xl border border-[#E5E7EB] dark:border-[#202425] bg-white dark:bg-[#151718] hover:bg-slate-50 dark:hover:bg-[#202425] text-slate-700 dark:text-[#ECEDEE] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xs transition-all disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 size={16} className="animate-spin text-[#00F076]" />
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
                <span>Continue with Google</span>
              </button>

              {/* Bottom Switcher */}
              <p className="mt-3 sm:mt-3.5 text-center text-xs font-semibold text-[#6B7280] dark:text-[#8A9099]">
                {mode === "login" ? "New to AarCode? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                  className="font-bold text-emerald-600 dark:text-[#00F076] hover:underline transition-colors"
                >
                  {mode === "login" ? "Create a workspace" : "Sign in"}
                </button>
              </p>
            </>
          )}
        </div>

        {/* Bottom Security Footer */}
        <div className="text-center text-[11px] text-[#6B7280] dark:text-[#8A9099] font-medium shrink-0 pt-1">
          Protected by AarCode Secure Authentication
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
