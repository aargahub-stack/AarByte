import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Terminal,
  ShieldCheck,
  Compass,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/utils/cn";
import type { Route } from "@/types";

interface LandingPageProps {
  navigate: (to: Route | string) => void;
}

export function LandingPage({ navigate }: LandingPageProps) {
  return (
    <div className="font-urbanist bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#121314] dark:text-[#ECEDEE] transition-colors duration-300 overflow-x-hidden selection:bg-[#10B981]/25 selection:text-[#0C0D0E] dark:selection:text-[#10B981]">
      {/* ===================================================================
          B. HERO SECTION
      =================================================================== */}
      <HeroSection navigate={navigate} />

      {/* ===================================================================
          C. SUPPORTED LANGUAGES CAROUSEL (EDGE-TO-EDGE VIEWPORT)
      =================================================================== */}
      <SupportedLanguagesCarousel navigate={navigate} />

      {/* Main Container for Subsequent Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-10 pb-16 sm:pb-20 lg:pb-24 space-y-24 sm:space-y-28 lg:space-y-36">

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

        {/* ===================================================================
            G. FREQUENTLY ASKED QUESTIONS (ACCORDION)
        =================================================================== */}
        <FaqSection />
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
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-[4rem] leading-[1.08] text-[#121314] dark:text-[#ECEDEE]">
              <span className="block font-semibold">Master Logic.</span>
              <span className="block font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE]">
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

          {/* Right Column: Hero Brand Illustration */}
          <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-end">
            {/* Ambient emerald glow behind illustration */}
            <div className="absolute w-[85%] h-[85%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,240,118,0.25),transparent_70%)] blur-2xl -z-10 pointer-events-none dark:opacity-80 opacity-50" />

            <div className="relative group w-full max-w-[560px] flex items-center justify-center">
              <img
                src="/hero.png"
                alt="AarCode Developer"
                className="w-full h-auto max-h-[440px] sm:max-h-[500px] lg:max-h-[560px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_25px_50px_rgba(0,0,0,0.7)] transition-transform duration-500 ease-out group-hover:scale-[1.02] select-none"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   C. SUPPORTED LANGUAGES CAROUSEL (INFINITE MARQUEE)
============================================================================ */
interface LanguageItem {
  name: string;
  code: string;
  icon: React.ReactNode;
}

const LANGUAGES: LanguageItem[] = [
  {
    name: "Python",
    code: "py",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2c-3.3 0-6 1.2-6 3.5v2.5h6v1H4.5C2.5 9 1 10.7 1 13c0 2.5 1.7 4 4 4h2v-2c0-2 1.5-3.5 3.5-3.5h5c1.7 0 3-1.3 3-3V5.5C18.5 3.2 15.3 2 12 2z"/>
        <circle cx="9" cy="5.5" r="0.75" fill="currentColor"/>
        <path d="M12 22c3.3 0 6-1.2 6-3.5V16h-6v-1h7.5c2 0 3.5-1.7 3.5-4 0-2.5-1.7-4-4-4h-2v2c0 2-1.5 3.5-3.5 3.5h-5c-1.7 0-3 1.3-3 3v3c0 2.3 3.2 3.5 6.5 3.5z"/>
        <circle cx="15" cy="18.5" r="0.75" fill="currentColor"/>
      </svg>
    ),
  },
  {
    name: "Java",
    code: "java",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
        <line x1="6" y1="1" x2="6" y2="4"/>
        <line x1="10" y1="1" x2="10" y2="4"/>
        <line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    ),
  },
  {
    name: "C++",
    code: "cpp",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 21.5 7.5 21.5 16.5 12 22 2.5 16.5 2.5 7.5 12 2"/>
        <path d="M9.5 9.5a3.5 3.5 0 1 0 0 5"/>
        <line x1="15" y1="12" x2="19" y2="12"/>
        <line x1="17" y1="10" x2="17" y2="14"/>
      </svg>
    ),
  },
  {
    name: "JavaScript",
    code: "js",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="4"/>
        <path d="M16 8v8a2 2 0 0 1-2 2h-1"/>
        <path d="M8 15a2 2 0 0 0 2 2h1a1.5 1.5 0 0 0 0-3H10a1.5 1.5 0 0 1 0-3h1a2 2 0 0 1 2 2"/>
      </svg>
    ),
  },
  {
    name: "TypeScript",
    code: "ts",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="4"/>
        <path d="M7 9h6"/>
        <path d="M10 9v9"/>
        <path d="M14 15.5a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 0-3h-1a1.5 1.5 0 0 1 0-3h1A1.5 1.5 0 0 1 18 9.5"/>
      </svg>
    ),
  },
  {
    name: "HTML/CSS",
    code: "html",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
        <line x1="14" y1="4" x2="10" y2="20"/>
      </svg>
    ),
  },
  {
    name: "SQL",
    code: "sql",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
  },
  {
    name: "Go",
    code: "go",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 8h6a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H3"/>
        <path d="M9 12H3"/>
        <path d="M15 12h6"/>
        <path d="M18 9l3 3-3 3"/>
      </svg>
    ),
  },
];

function SupportedLanguagesCarousel({ navigate }: { navigate: (to: Route | string) => void }) {
  const marqueeItems = [...LANGUAGES, ...LANGUAGES, ...LANGUAGES, ...LANGUAGES];

  return (
    <section aria-label="Supported Languages" className="w-full pt-6 pb-2 sm:pt-8 sm:pb-3 overflow-hidden">
      <style>{`
        @keyframes infinite-marquee-scroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .running-marquee-track {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: infinite-marquee-scroll 32s linear infinite;
        }
        .running-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-center justify-between flex-wrap gap-2 text-xs font-mono uppercase tracking-wider text-[#6B7280] dark:text-[#8A9099]">
        <span>Multi-Language Standard Execution</span>
        <span>Zero Local Setup Required</span>
      </div>

      {/* Full-width Marquee Track */}
      <div className="w-full overflow-hidden py-2 select-none">
        <div className="running-marquee-track flex gap-4 w-max">
          {marqueeItems.map((item, idx) => (
            <button
              key={`${item.name}-${idx}`}
              onClick={() => navigate("compiler")}
              className="group/capsule shrink-0 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#0C0D0E] border border-[#202425] hover:border-[#10B981]/50 hover:bg-[#151718] transition-all duration-300 text-left cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.12)] hover:-translate-y-0.5 active:translate-y-0 select-none"
            >
              <span className="text-[#8A9099] group-hover/capsule:text-[#10B981] transition-colors">
                {item.icon}
              </span>
              <span className="text-sm font-semibold text-[#ECEDEE] group-hover/capsule:text-white transition-colors">
                {item.name}
              </span>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#181A1B] text-[#8A9099] border border-[#24282B] group-hover/capsule:border-[#10B981]/30 group-hover/capsule:text-[#10B981] transition-colors">
                .{item.code}
              </span>
              <ArrowUpRight
                size={13}
                className="text-[#525866] group-hover/capsule:text-[#10B981] group-hover/capsule:translate-x-0.5 group-hover/capsule:-translate-y-0.5 transition-all opacity-0 group-hover/capsule:opacity-100"
              />
            </button>
          ))}
        </div>
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
        <div className="inline-flex items-center px-3 py-1 rounded-md bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] text-xs font-mono text-[#6B7280] dark:text-[#8A9099]">
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
  monthlyPrice: string;
  yearlyPrice: string;
  period: string;
  tagline: string;
  popular?: boolean;
  ctaText: string;
  features: string[];
}

const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Starter",
    monthlyPrice: "₹0",
    yearlyPrice: "₹0",
    period: "/month",
    tagline: "Everything you need to start practicing and running code.",
    ctaText: "Get Started",
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
    monthlyPrice: "₹49",
    yearlyPrice: "₹39",
    period: "/month",
    tagline: "Unlock hidden test cases, curated roadmaps, and deep debugging.",
    popular: true,
    ctaText: "Upgrade",
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
    monthlyPrice: "₹1,199",
    yearlyPrice: "₹959",
    period: "/month",
    tagline: "Built for coding clubs, bootcamps, and university cohorts.",
    ctaText: "Upgrade",
    features: [
      "Unlimited Student Accounts",
      "Custom Problem Creator",
      "College Contest Hosting",
      "Batch Analytics & Reports",
      "Dedicated Priority Support",
    ],
  },
];

function PricingSection({ navigate }: { navigate: (to: Route | string) => void }) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="pricing" className="scroll-mt-24 space-y-10 sm:space-y-12">
      {/* Centered Header & Subtitle */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE]">
          Simple, transparent pricing
        </h2>
        <p className="text-base sm:text-lg text-[#6B7280] dark:text-[#8A9099] font-normal">
          No contracts. No surprise fees.
        </p>

        {/* Monthly / Yearly Pill Toggle */}
        <div className="pt-2 flex justify-center">
          <div className="inline-flex items-center p-1 rounded-full bg-[#E5E7EB]/80 dark:bg-[#1A1D1E] border border-[#E5E7EB] dark:border-[#262A2D]">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer",
                billingCycle === "monthly"
                  ? "bg-[#10B981] text-white shadow-sm"
                  : "text-[#6B7280] dark:text-[#8A9099] hover:text-[#121314] dark:hover:text-[#ECEDEE]"
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={cn(
                "px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5",
                billingCycle === "yearly"
                  ? "bg-[#10B981] text-white shadow-sm"
                  : "text-[#6B7280] dark:text-[#8A9099] hover:text-[#121314] dark:hover:text-[#ECEDEE]"
              )}
            >
              <span>Yearly</span>
              <span className={cn(
                "text-[10px] font-semibold lowercase px-1.5 py-0.5 rounded-full",
                billingCycle === "yearly"
                  ? "bg-white/20 text-white"
                  : "bg-[#10B981]/15 text-[#10B981]"
              )}>
                save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Box Connected Architecture matching UI Reference */}
      <div className="max-w-5xl mx-auto px-2 sm:px-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-6 lg:gap-0">
          {PRICING_PLANS.map((plan, index) => {
            const isCenter = plan.popular;
            const isLeft = index === 0;
            const isRight = index === 2;
            const displayPrice = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

            return (
              <div
                key={plan.name}
                className={cn(
                  "relative flex flex-col justify-between transition-all duration-200",
                  isCenter
                    ? "w-full lg:w-[38%] bg-gradient-to-b from-[#10B981] via-[#059669] to-[#047857] text-white rounded-3xl p-8 sm:p-9 lg:p-10 shadow-[0_25px_60px_-12px_rgba(16,185,129,0.45)] dark:shadow-[0_30px_70px_-12px_rgba(16,185,129,0.55)] z-20 lg:-my-6 lg:scale-[1.03]"
                    : cn(
                        "w-full lg:w-[31%] bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] p-7 sm:p-8 flex flex-col justify-between shadow-sm z-10",
                        isLeft && "rounded-3xl lg:rounded-r-none lg:border-r-0",
                        isRight && "rounded-3xl lg:rounded-l-none lg:border-l-0"
                      )
                )}
              >
                <div>
                  {/* Top Row: Price + (/month) and optional MOST POPULAR pill */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className={cn(
                          "text-4xl sm:text-5xl font-extrabold tracking-tight font-mono",
                          isCenter ? "text-white" : "text-[#121314] dark:text-[#ECEDEE]"
                        )}
                      >
                        {displayPrice}
                      </span>
                      <span
                        className={cn(
                          "text-xs sm:text-sm font-medium",
                          isCenter ? "text-white/80" : "text-[#6B7280] dark:text-[#8A9099]"
                        )}
                      >
                        {plan.period}
                      </span>
                    </div>

                    {isCenter && (
                      <span className="bg-white/20 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                        MOST POPULAR
                      </span>
                    )}
                  </div>

                  {/* Plan Name */}
                  <h3
                    className={cn(
                      "text-xl sm:text-2xl font-bold mb-1.5",
                      isCenter ? "text-white" : "text-[#121314] dark:text-[#ECEDEE]"
                    )}
                  >
                    {plan.name}
                  </h3>

                  {/* Plan Tagline */}
                  <p
                    className={cn(
                      "text-xs sm:text-sm min-h-[38px] leading-relaxed mb-6",
                      isCenter ? "text-white/85 font-normal" : "text-[#6B7280] dark:text-[#8A9099] font-normal"
                    )}
                  >
                    {plan.tagline}
                  </p>

                  {/* Feature Checklist with filled circular badges */}
                  <ul className="space-y-3 pt-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                            isCenter
                              ? "bg-white/25 text-white"
                              : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                          )}
                        >
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span
                          className={cn(
                            "text-xs sm:text-sm font-medium",
                            isCenter ? "text-white/95" : "text-[#374151] dark:text-[#D1D5DB]"
                          )}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Pill CTA Button */}
                <div className="pt-8">
                  <button
                    type="button"
                    onClick={() => navigate("signup")}
                    className={cn(
                      "w-full py-3.5 px-6 rounded-full text-xs sm:text-sm transition-all duration-200 cursor-pointer text-center",
                      isCenter
                        ? "bg-white hover:bg-emerald-50 text-emerald-700 dark:text-emerald-800 font-bold shadow-lg hover:scale-[1.02] active:scale-[0.99]"
                        : "bg-[#F0F2F5] dark:bg-[#1E2022] hover:bg-[#E5E7EB] dark:hover:bg-[#282C30] text-[#121314] dark:text-[#ECEDEE] font-semibold hover:scale-[1.01] active:scale-[0.99]"
                    )}
                  >
                    {plan.ctaText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
          <div className="inline-flex items-center px-3 py-1 rounded-md bg-[#F7F8FA] dark:bg-[#1E2022] border border-[#E5E7EB] dark:border-[#202425] text-xs font-mono text-[#6B7280] dark:text-[#8A9099]">
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

/* ============================================================================
   G. FREQUENTLY ASKED QUESTIONS (ACCORDION)
============================================================================ */
interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Is AarCode completely free for students?",
    answer:
      "Yes! The Starter tier is 100% free forever, giving you full access to solve public algorithmic challenges, use the in-browser compiler, and participate in community discussions without any credit card required.",
  },
  {
    question: "What programming languages are currently supported?",
    answer:
      "AarCode supports execution for Python, Java, C++, JavaScript, TypeScript, and HTML/CSS with isolated sub-second sandboxed evaluation.",
  },
  {
    question: "How does the Pro Coder plan at ₹49/month work?",
    answer:
      "The Pro tier unlocks edge-case diagnostics, complete company-specific interview roadmaps, hidden test case inputs, and performance profiling to help you crack technical rounds faster.",
  },
  {
    question: "Can colleges and clubs use the Campus tier for exams?",
    answer:
      "Yes. The Campus & Team plan (₹1,199/month) provides faculty and club admins with custom test creators, plagiarism checkers, real-time leaderboards, and downloadable batch performance reports.",
  },
];

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="scroll-mt-24 max-w-4xl mx-auto space-y-10">
      {/* Centered Header & Subtitle */}
      <div className="text-center max-w-2xl mx-auto space-y-3.5">
        <div className="inline-flex items-center px-3 py-1 rounded-md bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] text-xs font-mono text-[#6B7280] dark:text-[#8A9099]">
          <span>Frequently Asked</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE]">
          Frequently Asked Questions
        </h2>
        <p className="text-base sm:text-lg text-[#6B7280] dark:text-[#8A9099] font-normal">
          Everything you need to know about AarCode, evaluation, and pricing.
        </p>
      </div>

      {/* 4 Collapsible Accordion Items */}
      <div className="space-y-3.5">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.question}
              className={cn(
                "rounded-2xl transition-all duration-300 border overflow-hidden",
                isOpen
                  ? "bg-white dark:bg-[#151718] border-[#10B981]/50 shadow-[0_0_25px_rgba(16,185,129,0.08)]"
                  : "bg-white dark:bg-[#151718] border-[#E5E7EB] dark:border-[#202425] hover:border-[#D1D5DB] dark:hover:border-[#2C3133]"
              )}
            >
              <button
                type="button"
                onClick={() => toggleItem(index)}
                className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer transition-colors focus:outline-none"
                aria-expanded={isOpen}
              >
                <span
                  className={cn(
                    "text-base sm:text-lg font-semibold transition-colors duration-200",
                    isOpen
                      ? "text-[#10B981]"
                      : "text-[#121314] dark:text-[#ECEDEE]"
                  )}
                >
                  {faq.question}
                </span>
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300",
                    isOpen
                      ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30 rotate-180"
                      : "bg-[#F7F8FA] dark:bg-[#1E2022] text-[#6B7280] dark:text-[#8A9099] border-[#E5E7EB] dark:border-[#2C3133]"
                  )}
                >
                  <ChevronDown size={18} />
                </div>
              </button>

              {/* Smooth Collapsible Content */}
              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-[#6B7280] dark:text-[#8A9099] leading-relaxed border-t border-[#E5E7EB]/60 dark:border-[#202425]/60 mt-1">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

