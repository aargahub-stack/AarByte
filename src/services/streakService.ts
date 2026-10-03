/**
 * Professional Streak Tracking Service
 * Accurately tracks consecutive daily coding streaks, longest streaks,
 * dynamic 7-day calendar states, and milestone progress.
 */

export interface WeekDayItem {
  label: string;       // "S", "M", "T", "W", "T", "F", "S"
  fullDayName: string; // "Sunday", "Monday", etc.
  dateStr: string;     // "YYYY-MM-DD"
  dayNum: number;      // 1-31
  monthName: string;   // "Jan", "Feb", etc.
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isCompleted: boolean;
  status: "completed" | "active" | "missed" | "upcoming";
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  isSolvedToday: boolean;
  isStreakAtRisk: boolean;
  todayDateStr: string;
  activeDatesSet: Set<string>;
  weekDays: WeekDayItem[];
  nextMilestone: number;
  milestoneProgressPct: number;
  statusMessage: string;
  freezeDaysAvailable: number;
}

const STORAGE_KEYS = {
  ACTIVITY_DATES: "aarcode_activity_dates",
};

/**
 * Format a Date object into local "YYYY-MM-DD" string (safe from UTC shift)
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse an ISO date or timestamp into local "YYYY-MM-DD" string
 */
export function parseDateToLocalStr(timestamp: string | number | Date): string {
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return "";
    return formatLocalDate(d);
  } catch {
    return "";
  }
}

/**
 * Persist an active date locally whenever a user completes a task or practices
 */
export function recordDailyActivity(date: Date = new Date()): void {
  try {
    const dateStr = formatLocalDate(date);
    const existing = getStoredActivityDates();
    if (!existing.includes(dateStr)) {
      existing.push(dateStr);
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_DATES, JSON.stringify(existing));
    }
  } catch (e) {
    console.warn("[streakService] Failed to record daily activity:", e);
  }
}

/**
 * Retrieve manually stored activity dates
 */
export function getStoredActivityDates(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY_DATES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Calculate accurate streak telemetry given a list of completion timestamps
 */
export function calculateStreak(rawTimestamps: (string | null | undefined)[]): StreakInfo {
  const activeDatesSet = new Set<string>();

  // 1. Ingest all timestamps from tasks / submissions
  rawTimestamps.forEach((ts) => {
    if (!ts) return;
    const dateStr = parseDateToLocalStr(ts);
    if (dateStr) {
      activeDatesSet.add(dateStr);
    }
  });

  // 2. Ingest local activity dates history
  getStoredActivityDates().forEach((d) => {
    if (d) activeDatesSet.add(d);
  });

  const now = new Date();
  const todayStr = formatLocalDate(now);

  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterdayDate);

  const isSolvedToday = activeDatesSet.has(todayStr);
  const isSolvedYesterday = activeDatesSet.has(yesterdayStr);

  let currentStreak = 0;
  let isStreakAtRisk = false;

  if (isSolvedToday) {
    // Count consecutive days backwards starting from today
    currentStreak = 1;
    let checkDate = new Date(now);
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const str = formatLocalDate(checkDate);
      if (activeDatesSet.has(str)) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else if (isSolvedYesterday) {
    // User hasn't solved today yet, but solved yesterday -> streak is preserved/at risk!
    isStreakAtRisk = true;
    currentStreak = 1;
    let checkDate = new Date(yesterdayDate);
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const str = formatLocalDate(checkDate);
      if (activeDatesSet.has(str)) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else {
    // Missed yesterday and today -> streak is 0
    currentStreak = 0;
  }

  // 3. Calculate longest streak across history
  let longestStreak = currentStreak;
  const sortedDates = Array.from(activeDatesSet).sort();
  if (sortedDates.length > 0) {
    let currentRun = 1;
    let maxRun = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1] + "T00:00:00");
      const curr = new Date(sortedDates[i] + "T00:00:00");
      const diffMs = curr.getTime() - prev.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentRun++;
        if (currentRun > maxRun) maxRun = currentRun;
      } else if (diffDays > 1) {
        currentRun = 1;
      }
    }
    longestStreak = Math.max(longestStreak, maxRun);
  }

  // 4. Generate dynamic 7-day current week tracker (Sunday to Saturday)
  const weekDays = generateCurrentWeek(now, activeDatesSet);

  // 5. Determine Milestone & Progress
  const milestones = [3, 7, 14, 30, 50, 100, 365];
  const nextMilestone = milestones.find((m) => m > currentStreak) || (currentStreak + 50);
  const milestoneProgressPct = Math.min(100, Math.round((currentStreak / nextMilestone) * 100));

  // 6. Freeze Days & Status Messaging
  let freezeDaysAvailable = 1;
  if (currentStreak >= 14) {
    freezeDaysAvailable = 3;
  } else if (currentStreak >= 7) {
    freezeDaysAvailable = 2;
  }

  let statusMessage = "Solve at least 1 coding problem today to start your streak.";
  if (isSolvedToday) {
    statusMessage = currentStreak > 1
      ? `🔥 Fantastic! You extended your streak to ${currentStreak} days.`
      : "🔥 Great job! You started a 1-day streak. Keep it going tomorrow!";
  } else if (isStreakAtRisk) {
    statusMessage = `⚡ Solve 1 coding problem today to extend your ${currentStreak}-day streak!`;
  }

  return {
    currentStreak,
    longestStreak,
    isSolvedToday,
    isStreakAtRisk,
    todayDateStr: todayStr,
    activeDatesSet,
    weekDays,
    nextMilestone,
    milestoneProgressPct,
    statusMessage,
    freezeDaysAvailable,
  };
}

/**
 * Generates the 7 days of the current week (Sunday through Saturday)
 */
function generateCurrentWeek(refDate: Date, activeDatesSet: Set<string>): WeekDayItem[] {
  const dayOfWeekLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const fullDayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const todayStr = formatLocalDate(refDate);

  // Find Sunday of the current week
  const startOfWeek = new Date(refDate);
  const currentDayIndex = refDate.getDay(); // 0 = Sunday, 1 = Monday...
  startOfWeek.setDate(refDate.getDate() - currentDayIndex);
  startOfWeek.setHours(0, 0, 0, 0);

  const todayZero = new Date(refDate);
  todayZero.setHours(0, 0, 0, 0);

  const week: WeekDayItem[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);

    const dateStr = formatLocalDate(d);
    const dayZero = new Date(d);
    dayZero.setHours(0, 0, 0, 0);

    const isToday = dateStr === todayStr;
    const isPast = dayZero.getTime() < todayZero.getTime();
    const isFuture = dayZero.getTime() > todayZero.getTime();
    const isCompleted = activeDatesSet.has(dateStr);

    let status: WeekDayItem["status"] = "upcoming";
    if (isCompleted) {
      status = "completed";
    } else if (isToday) {
      status = "active";
    } else if (isPast) {
      status = "missed";
    } else {
      status = "upcoming";
    }

    week.push({
      label: dayOfWeekLabels[i],
      fullDayName: fullDayNames[i],
      dateStr,
      dayNum: d.getDate(),
      monthName: monthNames[d.getMonth()],
      isToday,
      isPast,
      isFuture,
      isCompleted,
      status,
    });
  }

  return week;
}

export interface DailyCompletedProblem {
  taskId: string;
  title: string;
  slug?: string;
  difficulty: string;
  language?: string;
  completedAt: string;
  formattedTime: string;
  points: number;
  courseTitle?: string;
}

/**
 * Groups all solved tasks by their local date (YYYY-MM-DD)
 */
export function groupCompletedProblemsByDate(
  progressMap: Record<string, { task_id?: string; completed_at?: string | null; points?: number; language?: string; is_completed?: boolean }>,
  allTasks: Array<{ id: string; title: string; slug?: string; difficulty?: string; language?: string; points?: number; courseTitle?: string }> = []
): Record<string, DailyCompletedProblem[]> {
  const grouped: Record<string, DailyCompletedProblem[]> = {};

  const taskLookup = new Map<string, (typeof allTasks)[0]>();
  allTasks.forEach((t) => taskLookup.set(t.id, t));

  Object.entries(progressMap).forEach(([taskId, progress]) => {
    if (!progress || !progress.is_completed) return;

    const rawTimestamp = progress.completed_at || new Date().toISOString();
    const dateStr = parseDateToLocalStr(rawTimestamp);
    if (!dateStr) return;

    const meta = taskLookup.get(taskId);
    const dateObj = new Date(rawTimestamp);
    const formattedTime = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "Completed";

    // Clean human-readable title fallback if task metadata isn't in lookup
    let cleanTitle = meta?.title;
    if (!cleanTitle) {
      cleanTitle = taskId
        .replace(/^task-/, "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    const problem: DailyCompletedProblem = {
      taskId: taskId,
      title: cleanTitle,
      slug: meta?.slug || taskId,
      difficulty: meta?.difficulty || "medium",
      language: progress.language || meta?.language || "code",
      completedAt: rawTimestamp,
      formattedTime,
      points: progress.points ?? meta?.points ?? 10,
      courseTitle: meta?.courseTitle,
    };

    if (!grouped[dateStr]) {
      grouped[dateStr] = [];
    }
    grouped[dateStr].push(problem);
  });

  // Sort tasks within each date descending (newest first)
  Object.keys(grouped).forEach((dateStr) => {
    grouped[dateStr].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  });

  return grouped;
}

/**
 * Format a YYYY-MM-DD date into friendly readable string (e.g. "Today, Oct 3, 2026")
 */
export function formatFriendlyDate(dateStr: string): string {
  try {
    const today = formatLocalDate(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatLocalDate(yesterday);

    const parts = dateStr.split("-").map(Number);
    if (parts.length !== 3) return dateStr;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);

    const formatted = d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (dateStr === today) {
      return `Today (${formatted})`;
    }
    if (dateStr === yesterdayStr) {
      return `Yesterday (${formatted})`;
    }
    return formatted;
  } catch {
    return dateStr;
  }
}
