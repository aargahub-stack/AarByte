import { supabase } from "./supabase";
import type { Profile, UserRole } from "@/types/database.types";
import type { User, Session, AuthError } from "@supabase/supabase-js";

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface AuthUserWithProfile {
  user: User;
  profile: Profile | null;
}

export const authService = {
  /**
   * Register a new user with email, password, and full name.
   * Supabase trigger 'on_auth_user_created' will create the public.profiles record.
   */
  async signUp({ email, password, fullName }: SignUpParams): Promise<{
    user: User | null;
    session: Session | null;
    error: AuthError | null;
  }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    return {
      user: data.user,
      session: data.session,
      error,
    };
  },

  /**
   * Sign in an existing user with email and password.
   */
  async signIn({ email, password }: SignInParams): Promise<{
    user: User | null;
    session: Session | null;
    error: AuthError | null;
  }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      user: data.user,
      session: data.session,
      error,
    };
  },

  /**
   * Resend signup verification confirmation email.
   */
  async resendVerificationEmail(email: string): Promise<{ error: AuthError | null }> {
    const redirectUrl = `${window.location.origin}${window.location.pathname}`;
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error };
  },

  /**
   * Trigger password reset email via Supabase.
   */
  async resetPasswordForEmail(email: string): Promise<{ error: AuthError | null }> {
    const redirectUrl = `${window.location.origin}${window.location.pathname}`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error };
  },

  /**
   * Update the logged in or recovery-session user's password.
   */
  async updateUserPassword(newPassword: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  },

  /**
   * Sign in with Google OAuth via Supabase.
   */
  async signInWithGoogle(): Promise<{ error: AuthError | null }> {
    const redirectUrl = `${window.location.origin}${window.location.pathname}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
    return { error };
  },

  /**
   * Sign out the currently authenticated user.
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Get the current authenticated Supabase auth user.
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  /**
   * Fetch user profile (including role, points, avatar_url) from public.profiles.
   */
  async getUserProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("[authService] Error fetching user profile:", error.message);
      return null;
    }

    return data as Profile;
  },

  /**
   * Fetch current user along with their profile and role.
   */
  async getCurrentUserWithProfile(): Promise<AuthUserWithProfile | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const profile = await this.getUserProfile(user.id);
    return {
      user,
      profile,
    };
  },

  /**
   * Check if a given user ID or the current user has the 'admin' role.
   * Hard constraint: Strictly restricted to aravindhofficiallinks@gmail.com.
   */
  async checkIsAdmin(userId?: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    const targetId = userId || user?.id;
    if (!targetId) return false;

    // Hard guarantee: only aravindhofficiallinks@gmail.com can ever be admin
    if (user && user.id === targetId && user.email !== "aravindhofficiallinks@gmail.com") {
      return false;
    }

    const profile = await this.getUserProfile(targetId);
    return profile?.role === "admin" && profile?.email === "aravindhofficiallinks@gmail.com";
  },


  /**
   * Subscribe to auth state changes and fetch profile whenever auth changes.
   */
  onAuthStateChange(
    callback: (event: string, session: Session | null, profile: Profile | null) => void
  ) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await this.getUserProfile(session.user.id);
        callback(event, session, profile);
      } else {
        callback(event, null, null);
      }
    });
  },
};

export default authService;
