import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Terminal,
  ShieldCheck,
  Compass,
  Cpu,
  Layers,
  Sparkles,
  Code2,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { cn } from "@/utils/cn";
import type { Route } from "@/types";

interface LandingPageProps {
  navigate: (to: Route | string) => void;
}

export function LandingPage({ navigate }: LandingPageProps) {
  return (
    <div className="font-urbanist bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#121314] dark:text-[#ECEDEE] transition-colors duration-300 overflow-x-hidden selection:bg-[#00F076]/25 selection:text-[#0C0D0E] dark:selection:text-[#00F076]">
      {/* ===================================================================
          B. HERO SECTION
      =================================================================== */}
      <HeroSection navigate={navigate} />

      {/* Main Container for Subsequent Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 space-y-24 sm:space-y-28 lg:space-y-36">
        {/* ===================================================================
            C. SUPPORTED LANGUAGES STRIP
        =================================================================== */}
        <SupportedLanguagesStrip navigate={navigate} />

        {/* ===================================================================
            D. EVALUATION METRICS (SPLIT LAYOUT)
        =================================================================== */}
        <EvaluationMetricsSection navigate={navigate} />

        {/* ===================================================================
            E. PRICING SECTION ("Simple, Transparent Learning")
        =================================================================== */}
        <PricingSection navigate={navigate} />

        {/* ===================================================================
            F. CORE PLATFORM FEATURES ("Everything You Need to Master Code")
        =================================================================== */}
        <CoreFeaturesSection navigate={navigate} />
      </div>
    </div>
  );
}

/* ============================================================================
   B. HERO SECTION
============================================================================ */
function HeroSection({ navigate }: { navigate: (to: Route | string) => void }) {
  const avatars = [
    { initials: "AK", bg: "bg-[#1E2328] text-[#00F076] border border-[#202425]" },
    { initials: "SR", bg: "bg-[#1B2026] text-[#ECEDEE] border border-[#202425]" },
    { initials: "MJ", bg: "bg-[#1F2522] text-[#00B8A3] border border-[#202425]" },
    { initials: "DV", bg: "bg-[#251F22] text-[#ECEDEE] border border-[#202425]" },
  ];

  return (
    <section className="relative w-full min-h-[calc(100dvh-5rem)] flex items-center justify-center py-10 sm:py-14 lg:py-16 border-b border-[#E5E7EB] dark:border-[#202425]/70">
      {/* Subtle terminal grid background pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#E5E7EB_1px,transparent_1px),linear-gradient(to_bottom,#E5E7EB_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#151718_1px,transparent_1px),linear-gradient(to_bottom,#151718_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 dark:opacity-40" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Headline, Subtitle, CTAs, Social Proof */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-7 text-left z-10">
            {/* H1 (Strictly font-semibold / clean font-bold, no heavy black) */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-[4rem] font-bold tracking-tight leading-[1.08] text-[#121314] dark:text-[#ECEDEE]">
              <span className="block">Master Logic.</span>
              <span className="block text-[#121314] dark:text-[#ECEDEE]">
                Scale Your Coding Skills.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#6B7280] dark:text-[#8A9099] font-normal leading-relaxed max-w-xl">
              An all-in-one interactive platform to practice DSA, solve coding tasks with real-time compilers, and master web development — built for modern developers.
            </p>

            {/* CTA Buttons */}
            <div className="pt-1 flex flex-wrap items-center gap-3.5 sm:gap-4">
              {/* Primary CTA (Electric Volt / High Contrast Terminal Vibe) */}
              <button
                onClick={() => navigate("signup")}
                className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-xl bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] font-semibold text-sm sm:text-base transition-all shadow-[0_0_24px_rgba(0,240,118,0.22)] hover:shadow-[0_0_32px_rgba(0,240,118,0.38)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>Start Coding Free</span>
                <ArrowRight
                  size={17}
                  className="group-hover:translate-x-1 transition-transform duration-200"
                />
              </button>

              {/* Secondary CTA (Clean Secondary Border Button) */}
              <button
                onClick={() => navigate("compiler")}
                className="inline-flex items-center gap-2 px-6 sm:px-7 py-3.5 rounded-xl border border-[#E5E7EB] dark:border-[#202425] bg-white dark:bg-[#151718] hover:bg-slate-50 dark:hover:bg-[#1C1F20] text-[#121314] dark:text-[#ECEDEE] font-medium text-sm sm:text-base transition-all hover:-translate-y-0.5 cursor-pointer shadow-xs"
              >
                <Terminal size={16} className="text-[#6B7280] dark:text-[#8A9099]" />
                <span>Try Live Compiler</span>
              </button>
            </div>

            {/* Social Proof */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3.5">
              <div className="flex -space-x-2">
                {avatars.map((av, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "w-8 h-8 sm:w-9 sm:h-9 rounded-full font-semibold text-[11px] flex items-center justify-center ring-2 ring-white dark:ring-[#0C0D0E] shadow-xs",
                      av.bg
                    )}
                  >
                    {av.initials}
                  </div>
                ))}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E5E7EB] dark:bg-[#1E2022] border border-[#D1D5DB] dark:border-[#2E3336] text-[#121314] dark:text-[#ECEDEE] font-semibold text-[11px] flex items-center justify-center ring-2 ring-white dark:ring-[#0C0D0E]">
                  +1k
                </div>
              </div>
              <div className="text-xs sm:text-sm font-normal text-[#6B7280] dark:text-[#8A9099]">
                Join <span className="text-[#121314] dark:text-[#ECEDEE] font-semibold">1,000+</span> passionate student developers
              </div>
            </div>
          </div>

          {/* Right Column: Clean Developer Workstation / Code Editor Card Preview */}
          <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-[560px] rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300 hover:border-[#D1D5DB] dark:hover:border-[#2C3133]">
              {/* Window Titlebar */}
              <div className="h-10 px-4 border-b border-[#E5E7EB] dark:border-[#202425] bg-[#F7F8FA] dark:bg-[#111213] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/80" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] text-xs font-mono text-[#6B7280] dark:text-[#8A9099]">
                  <Code2 size={13} className="text-[#00F076]" />
                  <span>two_sum.py</span>
                </div>
                <span className="text-[11px] font-mono text-[#6B7280] dark:text-[#8A9099]">Python 3.11</span>
              </div>

              {/* Code Editor Body */}
              <div className="p-4 sm:p-5 font-mono text-xs sm:text-[13px] leading-relaxed text-[#121314] dark:text-[#ECEDEE] overflow-x-auto bg-white dark:bg-[#151718]">
                <div className="space-y-1">
                  <p className="text-[#6B7280] dark:text-[#5B626A]"># Optimal O(N) Hash Map Lookup Pattern</p>
                  <p>
                    <span className="text-purple-600 dark:text-purple-400">def</span>{" "}
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">two_sum</span>
                    (nums: List[int], target: int) -&gt; List[int]:
                  </p>
                  <p className="pl-4">
                    seen = &#123;&#125;
                  </p>
                  <p className="pl-4">
                    <span className="text-purple-600 dark:text-purple-400">for</span> i, n{" "}
                    <span className="text-purple-600 dark:text-purple-400">in</span>{" "}
                    <span className="text-amber-600 dark:text-amber-400">enumerate</span>(nums):
                  </p>
                  <p className="pl-8">
                    diff = target - n
                  </p>
                  <p className="pl-8">
                    <span className="text-purple-600 dark:text-purple-400">if</span> diff{" "}
                    <span className="text-purple-600 dark:text-purple-400">in</span> seen:
                  </p>
                  <p className="pl-12">
                    <span className="text-purple-600 dark:text-purple-400">return</span> [seen[diff], i]
                  </p>
                  <p className="pl-8">
                    seen[n] = i
                  </p>
                  <p className="pl-4">
                    <span className="text-purple-600 dark:text-purple-400">return</span> []
                  </p>
                </div>
              </div>

              {/* Terminal Execution / Judge Status Bar */}
              <div className="border-t border-[#E5E7EB] dark:border-[#202425] bg-[#F7F8FA] dark:bg-[#111213] p-3.5 sm:p-4 space-y-3">
                {/* Passed Status Pill */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00B8A3]/10 border border-[#00B8A3]/25 text-[#00B8A3] text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#00B8A3] animate-pulse" />
                    <span>All Test Cases Passed (3/3)</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-[#6B7280] dark:text-[#8A9099]">
                    <span>Runtime: <strong className="text-[#121314] dark:text-[#ECEDEE] font-semibold">18ms</strong></span>
                    <span>Memory: <strong className="text-[#121314] dark:text-[#ECEDEE] font-semibold">14.2 MB</strong></span>
                  </div>
                </div>

                {/* Test verification chips */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] flex items-center justify-between text-[#6B7280] dark:text-[#8A9099]">
                    <span>Test 1: target=9</span>
                    <span className="text-[#00B8A3] font-semibold">Passed</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] flex items-center justify-between text-[#6B7280] dark:text-[#8A9099]">
                    <span>Test 2: Hidden Case</span>
                    <span className="text-[#00B8A3] font-semibold">Passed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   C. SUPPORTED LANGUAGES STRIP
============================================================================ */
const LANGUAGES = [
  { name: "Python", track: "Algorithms & AI", code: "py" },
  { name: "Java", track: "Enterprise OOP", code: "java" },
  { name: "C++", track: "High-Performance", code: "cpp" },
  { name: "JavaScript", track: "Full-Stack Web", code: "js" },
  { name: "TypeScript", track: "Type-Safe Systems", code: "ts" },
  { name: "HTML/CSS", track: "Responsive UI", code: "html" },
];

function SupportedLanguagesStrip({ navigate }: { navigate: (to: Route | string) => void }) {
  return (
    <section aria-label="Supported Languages" className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono uppercase tracking-wider text-[#6B7280] dark:text-[#8A9099]">
        <span>Multi-Language Standard Execution</span>
        <span>Zero Local Setup Required</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.name}
            onClick={() => navigate("compiler")}
            className="group p-4 rounded-xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] hover:border-[#121314] dark:hover:border-[#00F076]/60 transition-all duration-200 text-left cursor-pointer shadow-xs hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#F7F8FA] dark:bg-[#1E2022] text-[#6B7280] dark:text-[#8A9099] border border-[#E5E7EB] dark:border-[#2C3133]">
                .{lang.code}
              </span>
              <ArrowUpRight
                size={14}
                className="text-[#8A9099] group-hover:text-[#00F076] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </div>
            <div className="text-sm font-semibold text-[#121314] dark:text-[#ECEDEE] group-hover:text-[#121314] dark:group-hover:text-[#00F076] transition-colors">
              {lang.name}
            </div>
            <div className="text-[11px] font-normal text-[#6B7280] dark:text-[#8A9099] mt-0.5 truncate">
              {lang.track}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ============================================================================
   D. EVALUATION METRICS (SPLIT LAYOUT)
============================================================================ */
const METRICS = [
  {
    value: "99.8%",
    label: "Evaluation Accuracy",
    detail: "Deterministic sandboxed test grading with isolated worker sandboxes.",
  },
  {
    value: "100+",
    label: "Curated Tasks & Test Cases",
    detail: "Hand-crafted algorithmic puzzles and real-world frontend tasks.",
  },
  {
    value: "0.2s",
    label: "Average Execution Time",
    detail: "High-throughput isolated micro-containers with low compilation lag.",
  },
  {
    value: "100%",
    label: "Browser-Based Compilation",
    detail: "Instant zero-dependency compilation across multiple programming languages.",
  },
];

function EvaluationMetricsSection({ navigate }: { navigate: (to: Route | string) => void }) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
      {/* Left Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] text-xs font-mono text-[#6B7280] dark:text-[#8A9099]">
          <Cpu size={14} className="text-[#00F076]" />
          <span>Industrial Judge Engine</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.12] text-[#121314] dark:text-[#ECEDEE]">
          10,000+ Submissions Evaluated
        </h2>

        <p className="text-base sm:text-lg text-[#6B7280] dark:text-[#8A9099] font-normal leading-relaxed">
          From basic syntax to advanced algorithms, sharpen your logic, pass hidden test cases, and prepare for top technical rounds.
        </p>

        <div className="pt-2">
          <button
            onClick={() => navigate("problems")}
            className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-xl border border-[#E5E7EB] dark:border-[#202425] bg-white dark:bg-[#151718] hover:bg-slate-50 dark:hover:bg-[#1C1F20] text-[#121314] dark:text-[#ECEDEE] font-semibold text-sm sm:text-base transition-all hover:-translate-y-0.5 cursor-pointer shadow-xs"
          >
            <span>Explore Practice Arena</span>
            <ArrowRight
              size={17}
              className="text-[#6B7280] dark:text-[#8A9099] group-hover:text-[#121314] dark:group-hover:text-[#00F076] group-hover:translate-x-1 transition-all"
            />
          </button>
        </div>
      </div>

      {/* Right Column: 4 Clean Floating Metric Cards (Balanced font weights) */}
      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {METRICS.map((metric, idx) => (
          <div
            key={metric.label}
            className={cn(
              "rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] p-6 sm:p-7 shadow-xs hover:border-[#D1D5DB] dark:hover:border-[#2C3133] transition-all duration-200",
              idx % 2 === 1 && "sm:translate-y-2"
            )}
          >
            <div className="text-3xl sm:text-4xl font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE] mb-2 font-mono">
              {metric.value}
            </div>
            <h3 className="text-base font-semibold text-[#121314] dark:text-[#ECEDEE] mb-1.5">
              {metric.label}
            </h3>
            <p className="text-xs sm:text-sm font-normal text-[#6B7280] dark:text-[#8A9099] leading-relaxed">
              {metric.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================================
   E. PRICING SECTION ("Simple, Transparent Learning")
============================================================================ */
interface PricingPlan {
  name: string;
  price: string;
  period: string;
  tagline: string;
  popular?: boolean;
  features: string[];
}

const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Starter",
    price: "₹0",
    period: "/ month",
    tagline: "Everything you need to start practicing and running code.",
    features: [
      "Public Practice Tasks",
      "In-Browser Compiler",
      "Basic Algorithm Tracks",
      "Public Test Cases",
      "Community Forum",
    ],
  },
  {
    name: "Pro Coder",
    price: "₹499",
    period: "/ month",
    tagline: "Unlock hidden test cases, full roadmaps, and deep debugging.",
    popular: true,
    features: [
      "All Starter features",
      "Full Web Dev Roadmaps",
      "Hidden Test Cases",
      "Error Stacks & Hints",
      "Global Leaderboard",
      "Completion Badges",
    ],
  },
  {
    name: "Campus / Team",
    price: "₹2,999",
    period: "/ month",
    tagline: "Built for coding clubs, bootcamps, and university cohorts.",
    features: [
      "Unlimited Student Accounts",
      "Custom Problem Creator",
      "College Contest Hosting",
      "Batch Analytics",
      "Priority Support",
    ],
  },
];

function PricingSection({ navigate }: { navigate: (to: Route | string) => void }) {
  return (
    <section id="pricing" className="scroll-mt-24 space-y-12">
      {/* Centered Header & Subtitle */}
      <div className="text-center max-w-2xl mx-auto space-y-3.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] text-xs font-mono text-[#6B7280] dark:text-[#8A9099]">
          <Layers size={13} className="text-[#00F076]" />
          <span>Transparent Pricing</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE]">
          Simple, Transparent Learning
        </h2>
        <p className="text-base sm:text-lg text-[#6B7280] dark:text-[#8A9099] font-normal">
          Start free forever and upgrade as you scale your algorithmic &amp; full-stack mastery.
        </p>
      </div>

      {/* 3 Tier Cards with prices strictly in Indian Rupees (₹) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
        {PRICING_PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative rounded-2xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-200",
              plan.popular
                ? "bg-white dark:bg-[#151718] border-2 border-[#121314] dark:border-[#00F076] shadow-xl dark:shadow-[0_0_30px_rgba(0,240,118,0.12)] lg:-translate-y-2"
                : "bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] shadow-xs hover:border-[#D1D5DB] dark:hover:border-[#2C3133]"
            )}
          >
            {/* Highlighted Terminal Pill for Pro Coder */}
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#121314] dark:bg-[#00F076] text-white dark:text-[#0C0D0E] text-[11px] font-mono font-semibold uppercase tracking-wider shadow-sm">
                Most Popular
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#121314] dark:text-[#ECEDEE] mb-1.5">
                  {plan.name}
                </h3>
                <p className="text-xs sm:text-sm font-normal text-[#6B7280] dark:text-[#8A9099] min-h-[36px]">
                  {plan.tagline}
                </p>
              </div>

              {/* Price Display */}
              <div className="flex items-baseline gap-1.5 pt-1 pb-4 border-b border-[#E5E7EB] dark:border-[#202425]">
                <span className="text-4xl sm:text-5xl font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE] font-mono">
                  {plan.price}
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#6B7280] dark:text-[#8A9099]">
                  {plan.period}
                </span>
              </div>

              {/* Features List */}
              <ul className="space-y-3 pt-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-xs sm:text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">
                    <div
                      className={cn(
                        "mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                        plan.popular
                          ? "bg-[#00F076]/15 text-[#00F076]"
                          : "bg-[#E5E7EB] dark:bg-[#202425] text-[#121314] dark:text-[#ECEDEE]"
                      )}
                    >
                      <Check size={11} strokeWidth={2.8} />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <button
                onClick={() => navigate("signup")}
                className={cn(
                  "w-full py-3 px-5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer",
                  plan.popular
                    ? "bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] shadow-sm hover:-translate-y-0.5"
                    : "bg-[#F7F8FA] dark:bg-[#1E2022] hover:bg-[#E5E7EB] dark:hover:bg-[#262A2D] text-[#121314] dark:text-[#ECEDEE] border border-[#E5E7EB] dark:border-[#202425]"
                )}
              >
                <span>Get Started</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================================
   F. CORE PLATFORM FEATURES ("Everything You Need to Master Code")
============================================================================ */
const CORE_FEATURES = [
  {
    icon: Terminal,
    title: "Interactive In-Browser Execution",
    description: "Monaco-powered multi-language execution across Python, C++, Java, JS, and HTML. Instant compilation with zero configuration.",
    route: "compiler" as Route,
    badge: "Real-Time IDE",
  },
  {
    icon: ShieldCheck,
    title: "Automated Judge Engine",
    description: "Instant public and hidden test-case validation with real-time runtime benchmarks, execution memory profiles, and detailed error stacks.",
    route: "problems" as Route,
    badge: "Test Runner",
  },
  {
    icon: Compass,
    title: "Structured Roadmaps",
    description: "Zero to production-ready tracks for algorithms, data structures, and modern full-stack web development with guided milestones.",
    route: "courses" as Route,
    badge: "Guided Tracks",
  },
];

function CoreFeaturesSection({ navigate }: { navigate: (to: Route | string) => void }) {
  return (
    <section className="rounded-3xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] p-6 sm:p-10 lg:p-12 shadow-xs">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column: Headline and summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#F7F8FA] dark:bg-[#1E2022] border border-[#E5E7EB] dark:border-[#202425] text-xs font-mono text-[#6B7280] dark:text-[#8A9099]">
            <Sparkles size={13} className="text-[#00F076]" />
            <span>Platform Capabilities</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.12] text-[#121314] dark:text-[#ECEDEE]">
            Everything You Need to Master Code
          </h2>

          <p className="text-base sm:text-lg text-[#6B7280] dark:text-[#8A9099] font-normal leading-relaxed">
            Practical tools, interactive editors, and automated test runners engineered to help you learn faster and build real software.
          </p>

          <div className="pt-2">
            <button
              onClick={() => navigate("courses")}
              className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-xl border border-[#E5E7EB] dark:border-[#202425] bg-white dark:bg-[#111213] hover:bg-slate-50 dark:hover:bg-[#1A1C1D] text-[#121314] dark:text-[#ECEDEE] font-semibold text-sm sm:text-base transition-all hover:-translate-y-0.5 cursor-pointer shadow-xs"
            >
              <span>Explore All Tracks</span>
              <ArrowRight
                size={17}
                className="text-[#6B7280] dark:text-[#8A9099] group-hover:text-[#121314] dark:group-hover:text-[#00F076] group-hover:translate-x-1 transition-all"
              />
            </button>
          </div>
        </div>

        {/* Right Column: 3 Interactive Feature Cards */}
        <div className="lg:col-span-7 space-y-3.5">
          {CORE_FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                onClick={() => navigate(item.route)}
                className="group w-full text-left rounded-xl bg-[#F7F8FA] dark:bg-[#0C0D0E] border border-[#E5E7EB] dark:border-[#202425] hover:border-[#121314] dark:hover:border-[#00F076]/60 p-5 sm:p-6 flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer shadow-xs hover:-translate-y-0.5"
              >
                <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] flex items-center justify-center text-[#121314] dark:text-[#00F076] group-hover:border-[#00F076]/40 transition-all shrink-0">
                    <Icon size={22} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-semibold text-[#121314] dark:text-[#ECEDEE] group-hover:text-[#121314] dark:group-hover:text-[#00F076] transition-colors">
                        {item.title}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-[#151718] text-[#6B7280] dark:text-[#8A9099] border border-[#E5E7EB] dark:border-[#202425]">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-normal text-[#6B7280] dark:text-[#8A9099] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-lg border border-[#E5E7EB] dark:border-[#202425] bg-white dark:bg-[#151718] flex items-center justify-center text-[#6B7280] dark:text-[#8A9099] group-hover:text-[#121314] dark:group-hover:text-[#00F076] group-hover:border-[#00F076]/40 transition-all shrink-0">
                  <ArrowUpRight size={15} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
