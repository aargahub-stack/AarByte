import React, { useState, useEffect } from "react";
import { Lock, CheckCircle2, AlertCircle, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { authService } from "@/services/authService";
import { supabase } from "@/services/supabase";
import { useToast } from "@/hooks/useToast";
import type { Route } from "@/types";

interface ResetPasswordPageProps {
  navigate: (to: Route | string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  navigate,
}) => {
  const { showToast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [isInvalidLink, setIsInvalidLink] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Authenticate session from URL tokens or active recovery session
  useEffect(() => {
    let isMounted = true;

    async function initializeRecoverySession() {
      try {
        // 1. Check if Supabase already has an active session
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession) {
          if (isMounted) {
            setSessionReady(true);
            setVerifyingSession(false);
          }
          return;
        }

        // 2. Extract tokens from URL hash (supporting potential double-hashes from email redirects)
        const rawHash = window.location.hash || "";
        const tokenMatch = rawHash.match(/access_token=([^&]+)/);
        const refreshMatch = rawHash.match(/refresh_token=([^&]+)/);

        if (tokenMatch && refreshMatch) {
          const accessToken = decodeURIComponent(tokenMatch[1]);
          const refreshToken = decodeURIComponent(refreshMatch[1]);

          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!error && data.session) {
            if (isMounted) {
              setSessionReady(true);
              setVerifyingSession(false);
            }
            return;
          }
        }

        // 3. Extract PKCE code from URL query parameters if present
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && data.session) {
            if (isMounted) {
              setSessionReady(true);
              setVerifyingSession(false);
            }
            return;
          }
        }

        // 4. Fallback check: if no recovery tokens found and no session
        if (isMounted) {
          setVerifyingSession(false);
          // If there were no tokens in hash or search, mark as invalid
          if (!rawHash.includes("access_token") && !code) {
            setIsInvalidLink(true);
          }
        }
      } catch (err) {
        if (isMounted) {
          setVerifyingSession(false);
          setIsInvalidLink(true);
        }
      }
    }

    initializeRecoverySession();

    // Subscribe to auth state updates (e.g. PASSWORD_RECOVERY event)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && isMounted)) {
        setSessionReady(true);
        setVerifyingSession(false);
        setIsInvalidLink(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      // Ensure we have a valid session before updating
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession && !sessionReady) {
        setErrorMessage("Recovery session expired or missing. Please request a new password reset link from the login page.");
        setLoading(false);
        return;
      }

      const { error } = await authService.updateUserPassword(newPassword);
      if (error) {
        if (error.message?.includes("Auth session missing")) {
          setErrorMessage("Your recovery link has expired. Please request a new reset link.");
          setIsInvalidLink(true);
        } else {
          setErrorMessage(error.message || "Failed to update password.");
        }
      } else {
        setSuccess(true);
        showToast("success", "Password updated successfully! You can now log in.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred while resetting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full min-h-screen font-urbanist flex flex-col justify-between p-4 sm:p-6 lg:p-10 bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Top Header */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between">
        <button
          onClick={() => navigate("login")}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Sign In</span>
        </button>

        <div className="flex items-center gap-2">
          <img src="/AarCode.png" alt="AarCode" className="w-6 h-6 object-contain" />
          <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
            AarCode
          </span>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        <div className="bg-white dark:bg-[#0E1526] border border-slate-200/90 dark:border-[#1E293B] rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
          {verifyingSession ? (
            /* Loading / Token Verification State */
            <div className="text-center py-8 space-y-3">
              <Loader2 size={32} className="animate-spin text-indigo-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Verifying recovery credentials...
              </p>
            </div>
          ) : isInvalidLink && !sessionReady ? (
            /* Invalid or Expired Recovery Link */
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-500 flex items-center justify-center mx-auto">
                <AlertCircle size={28} />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  Reset Link Expired
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  This password reset link is invalid, already used, or has expired. Please request a fresh reset link to continue.
                </p>
              </div>
              <button
                onClick={() => navigate("login")}
                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center"
              >
                Request New Reset Link
              </button>
            </div>
          ) : success ? (
            /* Success State */
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Password Reset Complete
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Your new password has been securely saved. You can now access your workspace with your updated credentials.
              </p>
              <button
                onClick={() => navigate("login")}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center"
              >
                Sign In Now
              </button>
            </div>
          ) : (
            /* Reset Password Form */
            <div className="space-y-5">
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <KeyRound size={20} />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  Set New Password
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Please enter and confirm your new secure password below.
                </p>
              </div>

              {errorMessage && (
                <div className="flex items-start gap-2 p-3 text-xs font-semibold rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 leading-snug">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      disabled={loading}
                      className="w-full h-11 pl-3.5 pr-14 text-sm font-medium rounded-xl border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white px-1.5 py-0.5"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    minLength={6}
                    disabled={loading}
                    className="w-full h-11 px-3.5 text-sm font-medium rounded-xl border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all shadow-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="w-full max-w-md mx-auto text-center text-xs text-slate-400 dark:text-slate-600 font-medium">
        © {new Date().getFullYear()} AarCode Security. All authentication encrypted with TLS.
      </div>
    </div>
  );
};
export default ResetPasswordPage;
