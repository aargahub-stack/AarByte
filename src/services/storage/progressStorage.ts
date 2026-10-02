export interface LocalCompletedTask {
  task_id: string;
  is_completed: boolean;
  completed_at: string;
  points: number;
  language?: string;
}

const STORAGE_KEYS = {
  COMPLETED_TASKS: "aarcode_completed_tasks",
  LOCAL_XP: "aarcode_local_xp",
};

export const progressStorage = {
  /**
   * Get all tasks marked completed in localStorage.
   */
  getCompletedTasks(): Record<string, LocalCompletedTask> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED_TASKS);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch (e) {
      console.warn("[progressStorage] Failed to read completed tasks:", e);
      return {};
    }
  },

  /**
   * Get local earned XP.
   */
  getLocalXP(): number {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_XP);
      if (!raw) {
        // Compute from completed tasks if not explicitly set
        const completed = this.getCompletedTasks();
        const sum = Object.values(completed).reduce((acc, t) => acc + (t.points || 10), 0);
        return sum;
      }
      return parseInt(raw, 10) || 0;
    } catch {
      return 0;
    }
  },

  /**
   * Record a completed task and award points.
   */
  recordTaskCompleted(
    taskId: string,
    pointsAwarded: number = 10,
    language?: string
  ): { isNew: boolean; totalXP: number } {
    try {
      const completed = this.getCompletedTasks();
      const isNew = !completed[taskId]?.is_completed;

      completed[taskId] = {
        task_id: taskId,
        is_completed: true,
        completed_at: completed[taskId]?.completed_at || new Date().toISOString(),
        points: pointsAwarded,
        language: language || completed[taskId]?.language || undefined,
      };

      localStorage.setItem(STORAGE_KEYS.COMPLETED_TASKS, JSON.stringify(completed));

      if (language) {
        localStorage.setItem("aarcode_last_used_lang", language);
      }

      let currentXP = this.getLocalXP();
      if (isNew) {
        currentXP += pointsAwarded;
        localStorage.setItem(STORAGE_KEYS.LOCAL_XP, String(currentXP));
      }

      // Dispatch event for instant UI reactivity across all active components
      window.dispatchEvent(
        new CustomEvent("aarcode_progress_updated", {
          detail: { taskId, pointsAwarded, isNew, totalXP: currentXP },
        })
      );

      return { isNew, totalXP: currentXP };
    } catch (e) {
      console.error("[progressStorage] Failed to record task completion:", e);
      return { isNew: false, totalXP: 0 };
    }
  },

  /**
   * Check if a specific task ID is marked as completed locally.
   */
  isTaskCompleted(taskId: string): boolean {
    const completed = this.getCompletedTasks();
    return Boolean(completed[taskId]?.is_completed);
  },
};
