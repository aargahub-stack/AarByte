import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, User, Terminal, Loader2, AlertCircle } from "lucide-react";
import { APP_NAME } from "@/config/constants";
import { useAuth } from "@/hooks/useAuth";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "login" | "signup";
  onModeChange: (mode: "login" | "signup") => void;
};

export function AuthModal({ open, onClose, mode, onModeChange }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clear inputs and errors when modal opens or mode changes
  useEffect(() => {
    setErrorMessage(null);
  }, [mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await signIn({ email, password });
        if (!res.success) {
          setErrorMessage(res.error || "Failed to sign in. Check your credentials.");
        } else {
          onClose();
        }
      } else {
        if (!fullName.trim()) {
          setErrorMessage("Please enter your full name.");
          setLoading(false);
          return;
        }
        const res = await signUp({ email, password, fullName: fullName.trim() });
        if (!res.success) {
          setErrorMessage(res.error || "Failed to create account.");
        } else {
          onClose();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isLogin ? "Welcome back" : "Create AarByte Account"}
      width="sm"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Terminal size={18} />
          </div>
          <div>
            <span className="font-bold text-gray-900 dark:text-gray-100">{APP_NAME}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isLogin ? "Sign in to track progress & submit solutions" : "Join to learn and solve coding challenges"}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2 p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          {!isLogin && (
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ada Lovelace"
                  required={!isLogin}
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2 h-10 font-medium shadow-md shadow-blue-500/20"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                {isLogin ? "Signing in..." : "Creating account..."}
              </span>
            ) : (
              <span>{isLogin ? "Sign In" : "Sign Up"}</span>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => onModeChange(isLogin ? "signup" : "login")}
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            {isLogin ? "Create one" : "Sign in here"}
          </button>
        </p>
      </div>
    </Modal>
  );
}

export default AuthModal;
