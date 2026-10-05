import { useState, useMemo } from "react";
import {
  Code2,
  Trophy,
  Flame,
  Zap,
  CheckCircle2,
  Lock,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Share2,
  Award,
  Layers,
  GitBranch,
  Cpu,
  Binary,
  ShieldCheck,
  ChevronLeft,
  Github,
  Linkedin,
  Globe,
  Terminal,
  X,
  Printer,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils/cn";
import { planStorage } from "@/services/storage/planStorage";
import type { Route } from "@/types";

interface ProfilePageProps {
  username?: string;
  navigate: (to: Route | string, params?: Record<string, string>) => void;
}

interface CredentialItem {
  id: string;
  verificationId: string;
  title: string;
  track: string;
  issuedDate: string;
  score: string;
  status: "verified" | "in_progress";
  modulesCompleted: number;
  totalModules: number;
}

interface BadgeItem {
  id: string;
  title: string;
  description: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: string;
  icon: any;
}

export function ProfilePage({ username: propUsername, navigate }: ProfilePageProps) {
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const isSelf =
    !propUsername ||
    propUsername === profile?.username ||
    propUsername === profile?.full_name?.toLowerCase().replace(/\s+/g, "-") ||
    propUsername === user?.email?.split("@")[0] ||
    propUsername === "aravindh";

  const displayFullName = isSelf
    ? profile?.full_name || "Aravindh S"
    : propUsername
    ? propUsername.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Developer";

  const displayUsername = propUsername || profile?.username || user?.email?.split("@")[0] || "aravindh";
  const userPlan = planStorage.getPlan(user?.id);
  const isPro = userPlan === "pro" || profile?.role === "admin";

  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<CredentialItem | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number } | null>(null);

  // Bio state
  const bio =
    profile?.bio ||
    "Systems & Algorithmic Developer. Focused on asymptotic optimization, graph recursion, and low-latency execution engines. Logic First.";

  // Problem stats
  const totalSolved = 13;
  const totalTasks = 105;
  const easySolved = 8;
  const easyTotal = 45;
  const mediumSolved = 4;
  const mediumTotal = 42;
  const hardSolved = 1;
  const hardTotal = 18;
  const totalXP = profile?.points && profile.points > 0 ? profile.points : 195;
  const globalRank = "#4";

  // Verifiable Credentials
  const credentials: CredentialItem[] = [
    {
      id: "cred-python-dsa",
      verificationId: "AC-2026-8492",
      title: "Python Data Structures & Advanced Algorithms",
      track: "Core Computer Science Track",
      issuedDate: "October 02, 2026",
      score: "98.4%",
      status: "verified",
      modulesCompleted: 9,
      totalModules: 9,
    },
    {
      id: "cred-algo-interview",
      verificationId: "AC-2026-3108",
      title: "Algorithmic Interview & Core Logic Foundations",
      track: "Technical Assessment & Machine Coding Track",
      issuedDate: "September 18, 2026",
      score: "94.0%",
      status: "verified",
      modulesCompleted: 6,
      totalModules: 6,
    },
  ];

  // Skill Badges (Clean developer badges, NO emojis)
  const badges: BadgeItem[] = [
    {
      id: "b1",
      title: "Algorithmic Pioneer",
      description: "Solved initial 10 core algorithmic challenges on AarCode.",
      category: "Milestone",
      unlocked: true,
      unlockedAt: "Sept 2026",
      icon: Code2,
    },
    {
      id: "b2",
      title: "Streak Sentinel",
      description: "Maintained an uninterrupted daily problem solving streak.",
      category: "Consistency",
      unlocked: true,
      unlockedAt: "Oct 2026",
      icon: Flame,
    },
    {
      id: "b3",
      title: "Recursion Tactician",
      description: "Mastered recursive tree DFS and topological graph traversals.",
      category: "Algorithms",
      unlocked: true,
      unlockedAt: "Oct 2026",
      icon: GitBranch,
    },
    {
      id: "b4",
      title: "Latency Optimizer",
      description: "Achieved deterministic sub-30ms execution on judge engine.",
      category: "Performance",
      unlocked: true,
      unlockedAt: "Oct 2026",
      icon: Zap,
    },
    {
      id: "b5",
      title: "Dynamic Programming Ace",
      description: "Solve 15 memoization and 2D tabular DP challenges.",
      category: "Mastery",
      unlocked: false,
      icon: Layers,
    },
    {
      id: "b6",
      title: "Bitwise Strategist",
      description: "Solve bit manipulation and bitmasking algorithmic puzzles.",
      category: "Systems",
      unlocked: false,
      icon: Binary,
    },
    {
      id: "b7",
      title: "Concurrency Architect",
      description: "Complete thread synchronization and lock-free data structures.",
      category: "Systems",
      unlocked: false,
      icon: Cpu,
    },
    {
      id: "b8",
      title: "Century Solver",
      description: "Reach the milestone of 100 verified problem solutions.",
      category: "Milestone",
      unlocked: false,
      icon: Trophy,
    },
  ];

  // Generate 52 weeks x 7 days heatmap matrix (365 days)
  const heatmapData = useMemo(() => {
    const weeks: { date: string; count: number; level: number }[][] = [];
    const today = new Date();
    // Start roughly 52 weeks ago on a Sunday
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 52 * 7);

    for (let w = 0; w < 52; w++) {
      const week: { date: string; count: number; level: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (w * 7 + d));
        const dateStr = currentDate.toISOString().split("T")[0];

        // Deterministic pseudo-random activity for demonstration
        const dayOfYear = (w * 7 + d) % 365;
        let count = 0;
        let level = 0;

        // Recent days have active solves
        if (w >= 44) {
          if ((dayOfYear * 7) % 5 === 0) {
            count = 4;
            level = 3;
          } else if ((dayOfYear * 3) % 2 === 0) {
            count = 2;
            level = 2;
          } else if (dayOfYear % 3 === 0) {
            count = 1;
            level = 1;
          } else if (w >= 50 && d >= 4) {
            count = 6;
            level = 4;
          }
        } else if (dayOfYear % 4 === 0) {
          count = (dayOfYear % 3) + 1;
          level = count >= 3 ? 3 : count >= 2 ? 2 : 1;
        }

        week.push({ date: dateStr, count, level });
      }
      weeks.push(week);
    }
    return weeks;
  }, []);

  const handleCopyProfile = () => {
    const url = `${window.location.origin}/#/profile/${displayUsername}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast("success", "Profile URL copied to clipboard");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCertificateLink = (cred: CredentialItem) => {
    const url = `${window.location.origin}/#/profile/${displayUsername}?cert=${cred.verificationId}`;
    navigator.clipboard.writeText(url);
    showToast("success", `Certificate link copied: ${cred.verificationId}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#121314] dark:text-[#ECEDEE] font-urbanist py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb / Top action bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-[#1F2327]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("dashboard")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-[#8A9099] hover:text-[#121314] dark:hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Back to Dashboard</span>
            </button>
            <span className="text-slate-300 dark:text-[#1F2327]">/</span>
            <span className="text-xs font-bold text-slate-700 dark:text-[#ECEDEE] uppercase tracking-wider">
              Developer Profile
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyProfile}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#202425] bg-white dark:bg-[#131517] hover:border-emerald-500/50 text-xs font-semibold text-slate-700 dark:text-[#ECEDEE] transition-all shadow-xs cursor-pointer"
            >
              {copiedLink ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
              <span>{copiedLink ? "Link Copied" : "Share Profile"}</span>
            </button>

            {isSelf && (
              <button
                onClick={() => navigate("compiler")}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00F076] hover:from-emerald-500 hover:to-[#00F076] text-black text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Terminal size={14} />
                <span>Open Compiler</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column LeetCode / CodeChef Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* =================================================================
              LEFT COLUMN: USER OVERVIEW & PROBLEM BREAKDOWN (4 cols)
          ================================================================= */}
          <div className="lg:col-span-4 space-y-6">
            {/* User Profile Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-[#1F2327] bg-white dark:bg-[#131517] p-6 shadow-xs space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="relative">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={displayFullName}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500/30"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-[#00F076] text-black font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
                      {displayFullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div
                    className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-[#131517] flex items-center justify-center text-black"
                    title="Active AarCode Developer"
                  >
                    <CheckCircle2 size={13} className="text-black stroke-[3]" />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      isPro
                        ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border-emerald-500/20"
                    )}
                  >
                    {isPro ? "AarCode Pro Tier" : "Free Starter"}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-[#8A9099]">
                    Member since 2026
                  </span>
                </div>
              </div>

              {/* Name & Handle */}
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {displayFullName}
                </h1>
                <p className="text-xs font-mono text-emerald-600 dark:text-[#00F076] mt-0.5">
                  @{displayUsername}
                </p>
              </div>

              {/* Bio */}
              <p className="text-xs leading-relaxed text-slate-600 dark:text-[#8A9099] border-t border-slate-100 dark:border-[#1F2327] pt-3">
                {bio}
              </p>

              {/* Platform Branding Tag */}
              <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200/80 dark:border-[#1F2327] flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-500 dark:text-[#8A9099]">Platform Standard</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-[#00F076]">
                  AarCode • Logic First.
                </span>
              </div>

              {/* Social / Web Links */}
              <div className="flex items-center gap-3 pt-2 text-slate-500 dark:text-[#8A9099]">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl border border-slate-200 dark:border-[#202425] hover:text-[#121314] dark:hover:text-white hover:border-emerald-500/40 transition-colors"
                  aria-label="GitHub Profile"
                >
                  <Github size={15} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl border border-slate-200 dark:border-[#202425] hover:text-[#121314] dark:hover:text-white hover:border-emerald-500/40 transition-colors"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin size={15} />
                </a>
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-[#8A9099] ml-auto">
                  <Globe size={13} />
                  <span>Global Solver</span>
                </div>
              </div>
            </div>

            {/* Global Standing & Performance Metrics */}
            <div className="rounded-2xl border border-slate-200 dark:border-[#1F2327] bg-white dark:bg-[#131517] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1F2327]">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#ECEDEE]">
                    Global Standing
                  </h3>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                  Top 1%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200/80 dark:border-[#1F2327]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-[#5B626A] block">
                    Global Rank
                  </span>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
                    {globalRank}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-semibold">
                    Among 14,200 Solvers
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200/80 dark:border-[#1F2327]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-[#5B626A] block">
                    Total XP
                  </span>
                  <span className="text-xl font-bold font-mono text-amber-500 mt-1 block">
                    {totalXP} XP
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-[#8A9099]">
                    Verified Evaluated
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-600 dark:text-[#8A9099]">
                <span>Acceptance Rate</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-[#00F076]">
                  88.4%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-[#202425] overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "88.4%" }} />
              </div>
            </div>

            {/* Problem Difficulty Split */}
            <div className="rounded-2xl border border-slate-200 dark:border-[#1F2327] bg-white dark:bg-[#131517] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1F2327]">
                <div className="flex items-center gap-2">
                  <Code2 size={16} className="text-emerald-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#ECEDEE]">
                    Problems Solved
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  {totalSolved} / {totalTasks}
                </span>
              </div>

              {/* Progress items */}
              <div className="space-y-3 font-mono text-xs">
                {/* Easy */}
                <div>
                  <div className="flex items-center justify-between mb-1 text-[11px]">
                    <span className="text-emerald-500 font-bold">Easy</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {easySolved} / {easyTotal}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#202425] overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${(easySolved / easyTotal) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Medium */}
                <div>
                  <div className="flex items-center justify-between mb-1 text-[11px]">
                    <span className="text-amber-500 font-bold">Medium</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {mediumSolved} / {mediumTotal}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#202425] overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${(mediumSolved / mediumTotal) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Hard */}
                <div>
                  <div className="flex items-center justify-between mb-1 text-[11px]">
                    <span className="text-rose-500 font-bold">Hard</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {hardSolved} / {hardTotal}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#202425] overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${(hardSolved / hardTotal) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Solved Ratio Summary */}
              <div className="pt-2 border-t border-slate-100 dark:border-[#1F2327] flex items-center justify-between text-[11px] text-slate-500 dark:text-[#8A9099]">
                <span>Curriculum Completion</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {Math.round((totalSolved / totalTasks) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* =================================================================
              RIGHT COLUMN: HEATMAP, SKILL BADGES & CREDENTIALS (8 cols)
          ================================================================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Activity Heatmap (GitHub-Style 365-Day Contribution Calendar) */}
            <div className="rounded-2xl border border-slate-200 dark:border-[#1F2327] bg-white dark:bg-[#131517] p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1F2327]">
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                      365-Day Algorithmic Activity Heatmap
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-[#8A9099] mt-0.5">
                    Evaluated test pass submissions and problem solving telemetry.
                  </p>
                </div>

                {/* Streak Counters */}
                <div className="flex items-center gap-2 font-mono text-xs">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200/80 dark:border-[#1F2327]">
                    <Flame size={14} className="text-amber-500" />
                    <span className="font-bold text-slate-900 dark:text-white">1 Day</span>
                    <span className="text-[10px] text-slate-400">Current</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200/80 dark:border-[#1F2327]">
                    <Zap size={14} className="text-emerald-500" />
                    <span className="font-bold text-slate-900 dark:text-white">14 Days</span>
                    <span className="text-[10px] text-slate-400">Record</span>
                  </div>
                </div>
              </div>

              {/* Heatmap Grid Matrix */}
              <div className="overflow-x-auto pb-2 custom-scrollbar">
                <div className="min-w-[680px]">
                  {/* Month header labels */}
                  <div className="flex text-[10px] font-mono text-slate-400 dark:text-[#5B626A] mb-1.5 justify-between px-1">
                    <span>Oct</span>
                    <span>Nov</span>
                    <span>Dec</span>
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                    <span>Jul</span>
                    <span>Aug</span>
                    <span>Sep</span>
                    <span>Oct</span>
                  </div>

                  {/* 52 Columns Grid */}
                  <div className="flex gap-[3px]">
                    {heatmapData.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-[3px]">
                        {week.map((day, dIdx) => {
                          const levelStyles = [
                            "bg-slate-100 dark:bg-[#16191B] border-transparent", // 0
                            "bg-emerald-950/80 dark:bg-[#064E3B] border-emerald-900/40", // 1
                            "bg-emerald-700 dark:bg-[#047857] border-emerald-600/40", // 2
                            "bg-emerald-500 dark:bg-[#10B981] border-emerald-400/40", // 3
                            "bg-[#00F076] dark:bg-[#00F076] shadow-[0_0_6px_rgba(0,240,118,0.4)]", // 4
                          ];

                          return (
                            <div
                              key={dIdx}
                              onMouseEnter={() => setHoveredCell({ date: day.date, count: day.count })}
                              onMouseLeave={() => setHoveredCell(null)}
                              className={cn(
                                "w-[11px] h-[11px] rounded-[2px] transition-transform duration-100 hover:scale-125 cursor-pointer border",
                                levelStyles[day.level]
                              )}
                              title={`${day.count} solves on ${day.date}`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Heatmap Footer Legend & Hover Details */}
                  <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs pt-3 border-t border-slate-100 dark:border-[#1F2327]">
                    <div className="font-mono text-[11px] text-slate-500 dark:text-[#8A9099]">
                      {hoveredCell ? (
                        <span>
                          <strong className="text-emerald-600 dark:text-[#00F076]">
                            {hoveredCell.count} problem{hoveredCell.count === 1 ? "" : "s"} solved
                          </strong>{" "}
                          on {hoveredCell.date}
                        </span>
                      ) : (
                        <span>Hover over cells to view daily submissions</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                      <span>Less</span>
                      <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-100 dark:bg-[#16191B]" />
                      <div className="w-2.5 h-2.5 rounded-[2px] bg-[#064E3B]" />
                      <div className="w-2.5 h-2.5 rounded-[2px] bg-[#047857]" />
                      <div className="w-2.5 h-2.5 rounded-[2px] bg-[#10B981]" />
                      <div className="w-2.5 h-2.5 rounded-[2px] bg-[#00F076]" />
                      <span>More</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Skill Badges & Achievements */}
            <div className="rounded-2xl border border-slate-200 dark:border-[#1F2327] bg-white dark:bg-[#131517] p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1F2327]">
                <div>
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                      Skill Badges & Milestones
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-[#8A9099] mt-0.5">
                    Recognized algorithmic proficiencies and platform achievements.
                  </p>
                </div>

                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-[#00F076]">
                  4 / 8 Unlocked
                </span>
              </div>

              {/* Badges Grid (Clean developer aesthetics, NO emojis) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                {badges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={badge.id}
                      className={cn(
                        "p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-3 relative group",
                        badge.unlocked
                          ? "bg-slate-50/70 dark:bg-[#0C0D0E] border-slate-200/90 dark:border-[#1F2327] hover:border-emerald-500/50 hover:shadow-xs"
                          : "bg-slate-50/30 dark:bg-[#0C0D0E]/40 border-slate-200/40 dark:border-[#1F2327]/40 opacity-60"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center border transition-all",
                            badge.unlocked
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border-emerald-500/20 group-hover:scale-105"
                              : "bg-slate-200/50 dark:bg-[#1A1D20] text-slate-400 border-slate-300/40 dark:border-[#22272B]"
                          )}
                        >
                          <Icon size={18} />
                        </div>

                        {badge.unlocked ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border border-emerald-500/20">
                            <CheckCircle2 size={10} />
                            <span>Earned</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-slate-200/60 dark:bg-[#1A1D20] text-slate-400">
                            <Lock size={10} />
                            <span>Locked</span>
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {badge.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-[#8A9099] mt-1 leading-snug line-clamp-2">
                          {badge.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-[#1F2327] flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>{badge.category}</span>
                        {badge.unlockedAt && <span>{badge.unlockedAt}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Verifiable Credentials & Certificates */}
            <div className="rounded-2xl border border-slate-200 dark:border-[#1F2327] bg-white dark:bg-[#131517] p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-[#1F2327]">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                      Verifiable Credentials & Certificates
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-[#8A9099] mt-0.5">
                    Cryptographically verifiable certifications issued under AarCode standards.
                  </p>
                </div>

                <div className="text-[11px] font-mono text-slate-400 dark:text-[#8A9099]">
                  Platform: <strong className="text-emerald-600 dark:text-[#00F076]">AarCode</strong>
                </div>
              </div>

              {/* Credentials List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {credentials.map((cred) => (
                  <div
                    key={cred.id}
                    className="p-5 rounded-xl border border-slate-200 dark:border-[#1F2327] bg-slate-50/50 dark:bg-[#0C0D0E] hover:border-emerald-500/40 transition-all space-y-4 relative group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-emerald-600 dark:text-[#00F076] tracking-wider block">
                          {cred.track}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 group-hover:text-emerald-600 dark:group-hover:text-[#00F076] transition-colors">
                          {cred.title}
                        </h4>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Award size={16} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono p-3 rounded-lg bg-white dark:bg-[#131517] border border-slate-200/80 dark:border-[#1F2327]">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Credential ID</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {cred.verificationId}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Issued Date</span>
                        <span className="text-slate-700 dark:text-slate-300">{cred.issuedDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Grade Metric</span>
                        <span className="font-bold text-emerald-600 dark:text-[#00F076]">
                          {cred.score}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Status</span>
                        <span className="text-emerald-500 font-bold">VERIFIED</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setSelectedCredential(cred)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-emerald-600 dark:hover:bg-[#00F076] dark:hover:text-black transition-colors cursor-pointer text-center"
                      >
                        Inspect Certificate
                      </button>

                      <button
                        onClick={() => handleCopyCertificateLink(cred)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-[#202425] bg-white dark:bg-[#131517] hover:border-emerald-500/40 text-slate-500 dark:text-[#8A9099] hover:text-[#121314] dark:hover:text-white transition-colors cursor-pointer"
                        title="Copy verification URL"
                      >
                        <Copy size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Byline Branding Guarantee */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0C0D0E] border border-slate-200/60 dark:border-[#1F2327] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-[#8A9099]">
                <span>
                  Byline: <strong className="text-slate-800 dark:text-slate-200">An AarGa Hub Software Production.</strong>
                </span>
                <span className="font-mono text-[11px] text-emerald-600 dark:text-[#00F076]">
                  AarCode — Logic First.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          CERTIFICATE MODAL (VERIFIABLE CREDENTIAL VIEW)
      ===================================================================== */}
      {selectedCredential && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in">
          <div className="w-full max-w-2xl bg-white dark:bg-[#111315] border border-slate-200 dark:border-[#22272B] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header Bar */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#1F2327] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#ECEDEE]">
                  AarCode Official Credential Verification
                </span>
              </div>
              <button
                onClick={() => setSelectedCredential(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1A1D20] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Certificate Canvas / Render Frame */}
            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
              <div className="rounded-2xl border-2 border-emerald-500/30 p-8 sm:p-10 bg-gradient-to-b from-slate-50/80 to-white dark:from-[#0C0D0E] dark:to-[#131517] relative text-center space-y-6">
                {/* Watermark / Background Accent */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 dark:text-[#00F076] border border-emerald-500/20 px-2 py-0.5 rounded-md">
                  <CheckCircle2 size={11} />
                  <span>CRYPTOGRAPHICALLY VERIFIED</span>
                </div>

                {/* AarCode Logo & Byline */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-xl bg-[#151718] border border-[#202425] p-2 flex items-center justify-center shadow-md">
                    <img src="/AarCode.png" alt="AarCode" className="w-full h-full object-contain" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    AarCode
                  </h2>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-[#00F076]">
                    Logic First.
                  </span>
                  <span className="text-[11px] text-slate-400">
                    An AarGa Hub Software Production.
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs uppercase font-mono tracking-widest text-slate-400">
                    Certificate of Algorithmic Mastery
                  </p>
                  <p className="text-xs text-slate-500">This certifies that</p>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {displayFullName}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto pt-2">
                    has successfully solved and passed all algorithmic challenge test suites for
                  </p>
                  <h4 className="text-lg font-bold text-emerald-600 dark:text-[#00F076] pt-1">
                    {selectedCredential.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Track: {selectedCredential.track} • Grade: {selectedCredential.score}
                  </p>
                </div>

                {/* Seal & Metadata */}
                <div className="pt-6 border-t border-slate-200 dark:border-[#1F2327] flex flex-col sm:flex-row items-center justify-between gap-4 text-left font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Verification Hash ID</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {selectedCredential.verificationId}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Issue Timestamp</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {selectedCredential.issuedDate}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Validation Engine</span>
                    <span className="text-emerald-500 font-bold">AarCode Execution Runtime</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-[#1F2327] flex items-center justify-between gap-3 bg-slate-50 dark:bg-[#0C0D0E] shrink-0">
              <span className="text-xs font-mono text-slate-400">
                Shareable verification link active
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCertificateLink(selectedCredential)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-[#202425] bg-white dark:bg-[#131517] text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500/40 transition-colors cursor-pointer"
                >
                  <Copy size={14} />
                  <span>Copy Verification Link</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
