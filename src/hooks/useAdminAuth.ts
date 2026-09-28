import { useState, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database.types";
import { authService } from "@/services/authService";

export interface AdminAuthState {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to guard admin routes/components and verify if current user is an admin.
 */
export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    profile: null,
    isAdmin: false,
    loading: true,
    error: null,
  });

  const checkAuth = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const userWithProfile = await authService.getCurrentUserWithProfile();

      if (!userWithProfile || !userWithProfile.user) {
        setState({
          user: null,
          profile: null,
          isAdmin: false,
          loading: false,
          error: "User is not authenticated",
        });
        return;
      }

      const isAdmin =
        userWithProfile.profile?.role === "admin" &&
        userWithProfile.user.email === "aravindhofficiallinks@gmail.com";
      setState({
        user: userWithProfile.user,
        profile: userWithProfile.profile,
        isAdmin,
        loading: false,
        error: isAdmin ? null : "Unauthorized: Admin privileges required",
      });
    } catch (err: any) {
      setState({
        user: null,
        profile: null,
        isAdmin: false,
        loading: false,
        error: err.message || "Failed to authenticate admin",
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((_event, session, profile) => {
      const isAdmin =
        profile?.role === "admin" && session?.user?.email === "aravindhofficiallinks@gmail.com";
      setState({
        user: session?.user ?? null,
        profile,
        isAdmin,
        loading: false,
        error: !session ? "User is not authenticated" : (!isAdmin ? "Unauthorized: Admin privileges required" : null),
      });
    });


    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuth]);

  return {
    ...state,
    refetch: checkAuth,
  };
}

export default useAdminAuth;
