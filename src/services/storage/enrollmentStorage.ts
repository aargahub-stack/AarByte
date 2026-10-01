import { progressStorage } from "./progressStorage";

const STORAGE_KEY = "aarcode_enrolled_courses";

export const enrollmentStorage = {
  /**
   * Get list of enrolled course identifiers (IDs or slugs)
   */
  getEnrolledCourseIdentifiers(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("[enrollmentStorage] Failed to read enrolled courses:", e);
      return [];
    }
  },

  /**
   * Check if a course is enrolled either explicitly or via completed tasks in that course.
   */
  isEnrolled(courseId: string, courseSlug?: string, taskIds: string[] = []): boolean {
    const enrolled = this.getEnrolledCourseIdentifiers();
    if (enrolled.includes(courseId) || (courseSlug && enrolled.includes(courseSlug))) {
      return true;
    }

    // Auto-enroll if the user has solved any task in this course
    if (taskIds.length > 0) {
      const completed = progressStorage.getCompletedTasks();
      const hasSolvedAny = taskIds.some((id) => completed[id]?.is_completed);
      if (hasSolvedAny) {
        // Persist the enrollment so it remains explicitly remembered
        this.enroll(courseId);
        if (courseSlug) this.enroll(courseSlug);
        return true;
      }
    }

    return false;
  },

  /**
   * Enroll the user in a course
   */
  enroll(courseIdOrSlug: string): void {
    try {
      const current = this.getEnrolledCourseIdentifiers();
      if (!current.includes(courseIdOrSlug)) {
        current.push(courseIdOrSlug);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        window.dispatchEvent(
          new CustomEvent("aarcode_enrollment_updated", {
            detail: { courseIdOrSlug, enrolled: true },
          })
        );
      }
    } catch (e) {
      console.error("[enrollmentStorage] Failed to save enrollment:", e);
    }
  },

  /**
   * Unenroll from a course
   */
  unenroll(courseIdOrSlug: string): void {
    try {
      let current = this.getEnrolledCourseIdentifiers();
      current = current.filter((id) => id !== courseIdOrSlug);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      window.dispatchEvent(
        new CustomEvent("aarcode_enrollment_updated", {
          detail: { courseIdOrSlug, enrolled: false },
        })
      );
    } catch (e) {
      console.error("[enrollmentStorage] Failed to remove enrollment:", e);
    }
  },
};
