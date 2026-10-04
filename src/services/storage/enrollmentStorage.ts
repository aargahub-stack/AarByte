import { progressStorage } from "./progressStorage";

export const enrollmentStorage = {
  /**
   * Get the localStorage key scoped to the authenticated user.
   */
  getStorageKey(userId?: string): string {
    return userId ? `aarcode_enrolled_courses_${userId}` : "aarcode_enrolled_courses_guest";
  },

  /**
   * Get list of enrolled course identifiers (IDs or slugs) for a specific user.
   * If no user is logged in, returns an empty array.
   */
  getEnrolledCourseIdentifiers(userId?: string): string[] {
    if (!userId) {
      return [];
    }

    try {
      // 1. Check user-scoped storage key
      const userKey = this.getStorageKey(userId);
      const raw = localStorage.getItem(userKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      }

      // 2. One-time migration from legacy key if user-scoped key is empty
      const legacyRaw = localStorage.getItem("aarcode_enrolled_courses");
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);
        if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
          localStorage.setItem(userKey, JSON.stringify(legacyParsed));
          localStorage.removeItem("aarcode_enrolled_courses");
          return legacyParsed;
        }
      }

      return [];
    } catch (e) {
      console.warn("[enrollmentStorage] Failed to read enrolled courses:", e);
      return [];
    }
  },

  /**
   * Check if a course is enrolled by the authenticated user.
   * Unauthenticated guests are never enrolled.
   */
  isEnrolled(
    courseId: string,
    courseSlug?: string,
    taskIds: string[] = [],
    userId?: string
  ): boolean {
    if (!userId) {
      return false;
    }

    const enrolled = this.getEnrolledCourseIdentifiers(userId);
    if (enrolled.includes(courseId) || (courseSlug && enrolled.includes(courseSlug))) {
      return true;
    }

    return false;
  },

  /**
   * Enroll the authenticated user in a course.
   */
  enroll(courseIdOrSlug: string, userId?: string): void {
    if (!userId) {
      return;
    }

    try {
      const userKey = this.getStorageKey(userId);
      const current = this.getEnrolledCourseIdentifiers(userId);
      if (!current.includes(courseIdOrSlug)) {
        current.push(courseIdOrSlug);
        localStorage.setItem(userKey, JSON.stringify(current));
        window.dispatchEvent(
          new CustomEvent("aarcode_enrollment_updated", {
            detail: { courseIdOrSlug, enrolled: true, userId },
          })
        );
      }
    } catch (e) {
      console.error("[enrollmentStorage] Failed to save enrollment:", e);
    }
  },

  /**
   * Unenroll the authenticated user from a course.
   */
  unenroll(courseIdOrSlug: string, userId?: string): void {
    if (!userId) {
      return;
    }

    try {
      const userKey = this.getStorageKey(userId);
      let current = this.getEnrolledCourseIdentifiers(userId);
      current = current.filter((id) => id !== courseIdOrSlug);
      localStorage.setItem(userKey, JSON.stringify(current));
      window.dispatchEvent(
        new CustomEvent("aarcode_enrollment_updated", {
          detail: { courseIdOrSlug, enrolled: false, userId },
        })
      );
    } catch (e) {
      console.error("[enrollmentStorage] Failed to remove enrollment:", e);
    }
  },
};
