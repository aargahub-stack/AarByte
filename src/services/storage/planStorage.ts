/**
 * Plan & Subscription Management Storage
 * Handles Starter (₹0) vs Pro Coder (₹49/month) access states.
 */

const PLAN_STORAGE_KEY_PREFIX = "aarcode_user_plan_";

export type UserPlanTier = "starter" | "pro";

export const planStorage = {
  getPlan(userId?: string | null): UserPlanTier {
    if (!userId) {
      // Check guest/visitor plan
      try {
        const stored = localStorage.getItem("aarcode_active_plan");
        return stored === "pro" ? "pro" : "starter";
      } catch {
        return "starter";
      }
    }

    try {
      const stored = localStorage.getItem(`${PLAN_STORAGE_KEY_PREFIX}${userId}`);
      if (stored === "pro") return "pro";
      // Global fallback check
      const globalPlan = localStorage.getItem("aarcode_active_plan");
      return globalPlan === "pro" ? "pro" : "starter";
    } catch {
      return "starter";
    }
  },

  isProUser(userId?: string | null, isAdmin?: boolean): boolean {
    if (isAdmin) return true;
    return this.getPlan(userId) === "pro";
  },

  setPlan(tier: UserPlanTier, userId?: string | null): void {
    try {
      localStorage.setItem("aarcode_active_plan", tier);
      if (userId) {
        localStorage.setItem(`${PLAN_STORAGE_KEY_PREFIX}${userId}`, tier);
      }
      window.dispatchEvent(new CustomEvent("aarcode_plan_updated", { detail: { tier } }));
    } catch (e) {
      console.warn("[planStorage] Failed to set plan tier:", e);
    }
  },

  upgradeToPro(userId?: string | null): void {
    this.setPlan("pro", userId);
  },

  downgradeToStarter(userId?: string | null): void {
    this.setPlan("starter", userId);
  }
};
