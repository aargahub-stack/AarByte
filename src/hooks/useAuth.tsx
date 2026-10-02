import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile, UserRole } from "@/types/database.types";
import { authService, type SignInParams, type SignUpParams } from "@/services/authService";
import { useToast } from "./useToast";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: UserRole;
  isAdmin: boolean;
  points: number;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "signup";
  openAuthModal: (mode?: "login" | "signup") => void;
  signIn: (params: SignInParams) => Promise<{ success: boolean; error?: string; isEmailUnconfirmed?: boolean; email?: string }>;
  signUp: (params: SignUpParams) => Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean; email?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");
  const { showToast } = useToast();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const p = await authService.getUserProfile(userId);
      setProfile(p);
      return p;
    } catch (e: any) {
      console.error("[useAuth] Failed to load user profile:", e);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    // Initial auth check
    authService.getCurrentUser().then(async (currentUser) => {
      if (!mounted) return;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      }
      setLoading(false);
    });

    // Subscribe to auth state updates
    const { data: { subscription } } = authService.onAuthStateChange(
      async (_event, session: Session | null, newProfile: Profile | null) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        if (newProfile) {
          setProfile(newProfile);
        } else if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const openAuthModal = useCallback((mode: "login" | "signup" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const signIn = useCallback(
    async (params: SignInParams) => {
      try {
        const { user: signedInUser, session, error } = await authService.signIn(params);
        if (error) {
          const isUnconfirmed =
            error.message?.toLowerCase().includes("email not confirmed") ||
            error.message?.toLowerCase().includes("email not verified") ||
            (error as any).code === "email_not_confirmed";

          if (isUnconfirmed) {
            return {
              success: false,
              error: "Please confirm your email address before signing in.",
              isEmailUnconfirmed: true,
              email: params.email,
            };
          }

          showToast("error", error.message || "Failed to sign in");
          return { success: false, error: error.message };
        }

        if (signedInUser && session) {
          setUser(signedInUser);
          await fetchProfile(signedInUser.id);
          showToast("success", "Welcome back to AarCode!");
          setIsAuthModalOpen(false);
          return { success: true };
        }
        return { success: false, error: "Unexpected sign in response" };
      } catch (err: any) {
        const msg = err.message || "Failed to sign in";
        showToast("error", msg);
        return { success: false, error: msg };
      }
    },
    [fetchProfile, showToast]
  );

  const signUp = useCallback(
    async (params: SignUpParams) => {
      try {
        const { user: newUser, session, error } = await authService.signUp(params);
        if (error) {
          showToast("error", error.message || "Failed to create account");
          return { success: false, error: error.message };
        }

        // If email confirmation is enabled in Supabase, session is null
        if (newUser && !session) {
          return {
            success: true,
            needsEmailConfirmation: true,
            email: params.email,
          };
        }

        if (newUser && session) {
          setUser(newUser);
          await fetchProfile(newUser.id);
          showToast("success", "Account created successfully! Welcome to AarCode.");
          setIsAuthModalOpen(false);
          return { success: true };
        }
        return { success: false, error: "Unexpected sign up response" };
      } catch (err: any) {
        const msg = err.message || "Failed to create account";
        showToast("error", msg);
        return { success: false, error: msg };
      }
    },
    [fetchProfile, showToast]
  );

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
    setProfile(null);
    showToast("info", "Signed out successfully");
  }, [showToast]);

  // Strict security: Only aravindhofficiallinks@gmail.com can be granted admin privileges
  const isSuperAdminEmail =
    (user?.email === "aravindhofficiallinks@gmail.com" || profile?.email === "aravindhofficiallinks@gmail.com");
  const role: UserRole = isSuperAdminEmail && profile?.role === "admin" ? "admin" : "student";
  const isAdmin = role === "admin";
  const points = profile?.points || 0;


  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        points,
        loading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default useAuth;
