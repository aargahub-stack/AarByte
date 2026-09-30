import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Sparkles,
  Terminal,
  ShieldCheck,
  Compass,
  Cpu,
  Play,
  Layers,
} from "lucide-react";
import { cn } from "@/utils/cn";
import type { Route } from "@/types";

type LandingPageProps = {
  navigate: (to: Route | string) => void;
};

export function LandingPage({ navigate }: LandingPageProps) {
  return (
    <div className="font-sans bg-white dark:bg-[#090D16] text-slate-900 dark:text-white transition-colors duration-300 overflow-x-hidden">
      {/* B. Hero Section (Full-Bleed, Containerless, Screen-Height Adaptive) */}
      <HeroCardSection navigate={navigate} />

      {/* Rest of the Landing Page Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 space-y-20 lg:space-y-28">
        {/* C. Language & Tech Stack Strip */}
        <TechStackStrip navigate={navigate} />

        {/* D. Trust & Evaluation Metrics (Split Grid) */}
        <TrustMetricsSection navigate={navigate} />

        {/* E. Pricing Section ("Simple, Transparent Learning") */}
        <PricingSection navigate={navigate} />

        {/* F. Core Services Showcase (Everything You Need to Master Code) */}
        <CoreServicesSection navigate={navigate} />
      </div>
    </div>
  );
}

/* ============================================================================
   B. HERO SECTION (CONTAINERLESS & SCREEN-HEIGHT ADAPTIVE WITH /hero.png)
============================================================================ */
function HeroCardSection({ navigate }: { navigate: (to: Route | string) => void }) {
  const avatars = [
    { initials: "AK", bg: "from-indigo-500 to-purple-600" },
    { initials: "SR", bg: "from-violet-500 to-fuchsia-600" },
    { initials: "MJ", bg: "from-blue-500 to-indigo-600" },
    { initials: "DV", bg: "from-purple-600 to-pink-600" },
  ];

  return (
    <section className="relative w-full min-h-[calc(100dvh-5rem)] flex items-center justify-center py-6 sm:py-10 lg:py-6">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          {/* Left Content */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 xl:space-y-7 text-left z-10">
            {/* Headline (H1) */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.6rem] xl:text-[4.25rem] font-bold tracking-tight leading-[1.08] text-[#0F172A] dark:text-white">
              <span className="block">Master Logic.</span>
              <span className="block bg-gradient-to-r from-[#6366F1] via-[#5B46F6] to-[#7C3AED] dark:from-indigo-400 dark:via-[#6366F1] dark:to-purple-400 bg-clip-text text-transparent">
                Scale Your Coding
              </span>
              <span className="block">Skills.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-xl">
              All-in-one interactive platform to practice DSA, solve coding tasks with real-time compilers, and master web development — built for modern developers.
            </p>

            {/* CTA Buttons */}
            <div className="pt-1 flex flex-wrap items-center gap-3.5 sm:gap-4">
              <a
                href="#signup"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("signup");
                }}
                className="group inline-flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#6366F1] via-[#5B46F6] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white font-semibold text-sm sm:text-base lg:text-lg shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/45 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                <span>Start Coding Free</span>
                <ArrowRight
                  size={19}
                  className="group-hover:translate-x-1 transition-transform duration-200"
                />
              </a>

              <button
                onClick={() => navigate("compiler")}
                className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full border border-slate-200 dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0F172A] hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:border-indigo-500/40 text-slate-700 dark:text-slate-200 font-semibold text-sm sm:text-base transition-all duration-200"
              >
                <Play size={15} className="text-[#6366F1] fill-[#6366F1]" />
                <span>Try Live Compiler</span>
              </button>
            </div>

            {/* Social Proof: Avatar Stack + Text */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3.5">
              <div className="flex -space-x-2.5">
                {avatars.map((av, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white dark:ring-[#090D16] shadow-sm",
                      av.bg
                    )}
                  >
                    {av.initials}
                  </div>
                ))}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EEF2FF] dark:bg-[#0F172A] border border-indigo-200 dark:border-[#1E293B] text-[#6366F1] dark:text-indigo-400 font-semibold text-xs flex items-center justify-center ring-2 ring-white dark:ring-[#090D16]">
                  +1k
                </div>
              </div>
              <div className="text-xs sm:text-sm font-normal text-slate-600 dark:text-slate-300">
                Join <span className="text-slate-900 dark:text-white font-semibold">1,000+</span> passionate student developers
              </div>
            </div>
          </div>

          {/* Right Content: /hero.png Illustration scaled dynamically to screen height */}
          <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-end">
            <img
              src="/hero.png"
              alt="AarCode Developer Coding Illustration"
              className="w-full max-w-[480px] sm:max-w-[540px] lg:max-w-full max-h-[45vh] sm:max-h-[55vh] lg:max-h-[76dvh] object-contain select-none dark:rounded-3xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   C. LANGUAGE & TECH STACK STRIP
============================================================================ */
const TECH_STACK = [
  {
    name: "Python",
    badge: "DSA & AI",
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
        <path
          d="M11.9 2C7.8 2 8.2 3.8 8.2 3.8V5.9H12.1V6.6H6.5C6.5 6.6 4 6.3 4 10.3C4 14.3 6.2 14.1 6.2 14.1H7.5V12.2C7.5 12.2 7.4 10 9.7 10H13.8C13.8 10 15.8 10 15.8 8V4.2C15.8 4.2 16.1 2 11.9 2ZM9.8 3.3C10.2 3.3 10.6 3.7 10.6 4.1C10.6 4.5 10.2 4.9 9.8 4.9C9.4 4.9 9 4.5 9 4.1C9 3.7 9.4 3.3 9.8 3.3Z"
          fill="#6366F1"
        />
        <path
          d="M12.1 22C16.2 22 15.8 20.2 15.8 20.2V18.1H11.9V17.4H17.5C17.5 17.4 20 17.7 20 13.7C20 9.7 17.8 9.9 17.8 9.9H16.5V11.8C16.5 11.8 16.6 14 14.3 14H10.2C10.2 14 8.2 14 8.2 16V19.8C8.2 19.8 7.9 22 12.1 22ZM14.2 20.7C13.8 20.7 13.4 20.3 13.4 19.9C13.4 19.5 13.8 19.1 14.2 19.1C14.6 19.1 15 19.5 15 19.9C15 20.3 14.6 20.7 14.2 20.7Z"
          fill="#818CF8"
        />
      </svg>
    ),
  },
  {
    name: "Java",
    badge: "Enterprise & OOP",
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
        <path
          d="M9.5 14.5C9.5 14.5 8.5 15.1 10.2 15.4C12.3 15.7 13.4 15.6 15.7 15.1C15.7 15.1 16.3 15.5 17.2 15.8C12 18 5.4 15.7 9.5 14.5Z"
          fill="#6366F1"
        />
        <path
          d="M8.9 12.2C8.9 12.2 7.8 13 9.7 13.2C11.9 13.5 13.7 13.5 16.7 12.8C16.7 12.8 17.1 13.2 17.8 13.5C11.7 15.3 4.9 13.6 8.9 12.2Z"
          fill="#818CF8"
        />
        <path
          d="M13.5 2.5C15 4.5 12.2 6.3 12.2 8.2C12.2 9.5 13.6 10.5 13.6 10.5C13.6 10.5 11.2 9.6 11.8 7.6C12.3 5.8 14.5 4.9 13.5 2.5Z"
          fill="#A78BFA"
        />
        <path
          d="M6.5 18.5C9.5 19.8 15.8 19.7 18.5 18C18.5 18 17.9 19.5 14.2 20.2C10.1 21 5.1 20 6.5 18.5Z"
          fill="#6366F1"
        />
      </svg>
    ),
  },
  {
    name: "C++",
    badge: "Competitive",
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
        <path
          d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
          stroke="#6366F1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 9.5C9.2 8.8 8 8.8 7.2 9.5C6.2 10.5 6.2 13.5 7.2 14.5C8 15.2 9.2 15.2 10 14.5"
          stroke="#818CF8"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M13.5 12H16.5M15 10.5V13.5M17.5 12H20.5M19 10.5V13.5"
          stroke="#A78BFA"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "JavaScript",
    badge: "Full-Stack",
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="4"
          stroke="#6366F1"
          strokeWidth="2"
        />
        <path
          d="M11 11V16C11 17.1 10.1 17.5 9.2 17.5C8.5 17.5 8 17.1 7.8 16.6"
          stroke="#818CF8"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16.8 11.8C16.4 11.2 15.8 11 15 11C14.1 11 13.5 11.5 13.5 12.2C13.5 13 14.2 13.3 15.2 13.7C16.2 14.1 17 14.6 17 15.8C17 16.9 16.1 17.5 14.9 17.5C13.9 17.5 13.2 17 12.9 16.3"
          stroke="#A78BFA"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "TypeScript",
    badge: "Type-Safe",
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="4"
          stroke="#6366F1"
          strokeWidth="2"
        />
        <path
          d="M7.5 11H12.5M10 11V17.5"
          stroke="#818CF8"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M17.5 11.8C17.1 11.2 16.5 11 15.7 11C14.8 11 14.2 11.5 14.2 12.2C14.2 13 14.9 13.3 15.9 13.7C16.9 14.1 17.7 14.6 17.7 15.8C17.7 16.9 16.8 17.5 15.6 17.5C14.6 17.5 13.9 17 13.6 16.3"
          stroke="#A78BFA"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "HTML/CSS",
    badge: "Web Core",
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
        <path
          d="M4 3L5.5 19L12 21L18.5 19L20 3H4Z"
          stroke="#6366F1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 7H16L15.5 11H9L9.3 14.5L12 15.3L14.7 14.5L15 12.5"
          stroke="#818CF8"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

function TechStackStrip({ navigate }: { navigate: (to: Route | string) => void }) {
  return (
    <section aria-label="Supported Technologies">
      <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-lg shadow-slate-200/40 dark:shadow-none px-6 py-6 sm:px-10 sm:py-7">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 items-center">
          {TECH_STACK.map((tech) => (
            <button
              key={tech.name}
              onClick={() => navigate("compiler")}
              className="group flex items-center justify-center sm:justify-start gap-3.5 px-4 py-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#090D16] border border-slate-200/70 dark:border-[#1E293B] hover:border-[#6366F1]/60 dark:hover:border-[#6366F1]/60 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 group-hover:bg-indigo-500/20 transition-colors shrink-0">
                {tech.svg}
              </div>
              <div className="text-left">
                <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-[#6366F1] dark:group-hover:text-indigo-400 transition-colors">
                  {tech.name}
                </div>
                <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  {tech.badge}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   D. TRUST & EVALUATION METRICS (SPLIT GRID)
============================================================================ */
const METRIC_CARDS = [
  {
    value: "99.8%",
    label: "Evaluation Accuracy",
    detail: "Deterministic sandboxed test grading",
    accent: "from-[#6366F1] to-[#7C3AED]",
  },
  {
    value: "100+",
    label: "Curated Tasks & Test Cases",
    detail: "Hand-crafted DSA & Web challenges",
    accent: "from-[#4F46E5] to-[#6366F1]",
  },
  {
    value: "0.2s",
    label: "Average Code Execution Time",
    detail: "Ultra-low latency compiler engine",
    accent: "from-[#7C3AED] to-[#6366F1]",
  },
  {
    value: "100%",
    label: "Instant Browser Compilation",
    detail: "Zero local setup required",
    accent: "from-[#6366F1] to-indigo-400",
  },
];

function TrustMetricsSection({ navigate }: { navigate: (to: Route | string) => void }) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
      {/* Left Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/25 text-[#4F46E5] dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider">
          <Cpu size={14} className="text-[#6366F1]" />
          <span>Battle-Tested Judge</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.12] text-slate-900 dark:text-white">
          10,000+ Submissions Evaluated
        </h2>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
          From basic syntax to advanced algorithms, we help developers sharpen logic, pass hidden test cases, and crack technical rounds.
        </p>

        <div className="pt-2">
          <button
            onClick={() => navigate("problems")}
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#6366F1] via-[#4F46E5] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white font-semibold text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>Explore Practice Arena</span>
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform duration-200"
            />
          </button>
        </div>
      </div>

      {/* Right Column: 4 Modern Floating Metric Cards */}
      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {METRIC_CARDS.map((metric, idx) => (
          <div
            key={metric.label}
            className={cn(
              "group relative rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] p-7 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-[#6366F1]/60 dark:hover:border-[#6366F1]/60 hover:-translate-y-1 transition-all duration-300 overflow-hidden",
              idx % 2 === 1 && "sm:translate-y-3"
            )}
          >
            {/* Subtle corner glow */}
            <div className="pointer-events-none absolute -top-12 -right-12 w-28 h-28 rounded-full bg-indigo-500/10 group-hover:bg-indigo-500/20 blur-2xl transition-colors" />

            <div
              className={cn(
                "text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent mb-2",
                metric.accent
              )}
            >
              {metric.value}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
              {metric.label}
            </h3>
            <p className="text-sm font-normal text-slate-500 dark:text-slate-400">
              {metric.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================================
   E. PRICING SECTION ("SIMPLE, TRANSPARENT LEARNING")
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
      "Public Test Case Execution",
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
      "All Starter Features",
      "Full Web Development Roadmaps",
      "Hidden Test-Case Validations",
      "Detailed Error Stacks & Hints",
      "Global Leaderboard Ranking",
      "Course Completion Badges",
    ],
  },
  {
    name: "Campus / Team",
    price: "₹2,999",
    period: "/ month",
    tagline: "Built for coding clubs, bootcamps, and university cohorts.",
    features: [
      "Unlimited Student Accounts",
      "Custom Problem Creator (Admin Panel)",
      "College Contest Hosting",
      "Batch Analytics & Reports",
      "Dedicated Priority Support",
    ],
  },
];

function PricingSection({ navigate }: { navigate: (to: Route | string) => void }) {
  return (
    <section id="pricing" className="scroll-mt-24 space-y-12">
      {/* Centered Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/25 text-[#4F46E5] dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles size={13} className="text-[#6366F1]" />
          <span>Flexible Plans</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          Simple, Transparent Learning
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal">
          Start free forever and upgrade as you scale your algorithmic &amp; full-stack mastery.
        </p>
      </div>

      {/* 3-Card Pricing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-stretch">
        {PRICING_PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300",
              plan.popular
                ? "bg-[#090D16] dark:bg-[#0F172A] text-white border-2 border-[#6366F1] shadow-2xl shadow-indigo-500/25 lg:-translate-y-2"
                : "bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white border border-slate-200/90 dark:border-[#1E293B] shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-indigo-500/40"
            )}
          >
            {/* Highlighted Most Popular Pill */}
            {plan.popular && (
              <>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-3xl bg-gradient-to-b from-[#6366F1]/20 to-transparent" />
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#6366F1] to-[#7C3AED] text-white text-xs font-semibold uppercase tracking-wider shadow-lg shadow-indigo-500/40">
                  Most Popular
                </div>
              </>
            )}

            <div className="relative z-10 space-y-6">
              <div>
                <h3
                  className={cn(
                    "text-xl font-bold mb-2",
                    plan.popular ? "text-white" : "text-slate-900 dark:text-white"
                  )}
                >
                  {plan.name}
                </h3>
                <p
                  className={cn(
                    "text-sm font-normal min-h-[40px]",
                    plan.popular ? "text-slate-300" : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  {plan.tagline}
                </p>
              </div>

              {/* Price Display */}
              <div className="flex items-baseline gap-1.5 pt-2 pb-4 border-b border-slate-200/80 dark:border-[#1E293B]">
                <span
                  className={cn(
                    "text-4xl sm:text-5xl font-bold tracking-tight",
                    plan.popular ? "text-white" : "text-slate-900 dark:text-white"
                  )}
                >
                  {plan.price}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    plan.popular ? "text-indigo-300" : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  {plan.period}
                </span>
              </div>

              {/* Checklist */}
              <ul className="space-y-3.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm font-medium">
                    <div
                      className={cn(
                        "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                        plan.popular
                          ? "bg-[#6366F1] text-white"
                          : "bg-indigo-500/15 text-[#6366F1] dark:text-indigo-400"
                      )}
                    >
                      <Check size={13} strokeWidth={2.5} />
                    </div>
                    <span
                      className={cn(
                        plan.popular ? "text-slate-200" : "text-slate-700 dark:text-slate-300"
                      )}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <div className="relative z-10 pt-8">
              <button
                onClick={() => navigate("signup")}
                className={cn(
                  "w-full py-3.5 px-6 rounded-full font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2",
                  plan.popular
                    ? "bg-gradient-to-r from-[#6366F1] via-[#4F46E5] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white shadow-lg shadow-indigo-500/35 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
                    : "bg-slate-100 dark:bg-[#090D16] hover:bg-[#6366F1] dark:hover:bg-[#6366F1] text-slate-900 dark:text-white hover:text-white border border-slate-200 dark:border-[#1E293B] hover:border-transparent"
                )}
              >
                <span>Get Started</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================================
   F. CORE SERVICES SHOWCASE (EVERYTHING YOU NEED TO MASTER CODE)
============================================================================ */
const CORE_SERVICES = [
  {
    icon: Terminal,
    title: "Interactive In-Browser Execution",
    description: "Monaco editor runner across multiple languages",
    route: "compiler" as Route,
    badge: "Real-Time IDE",
  },
  {
    icon: ShieldCheck,
    title: "Automated Judge Engine",
    description: "Instant public & hidden testcase evaluation",
    route: "problems" as Route,
    badge: "Test Runner",
  },
  {
    icon: Compass,
    title: "Structured Roadmaps",
    description: "Zero to mastery tracks for DSA & Web Dev",
    route: "courses" as Route,
    badge: "Guided Tracks",
  },
];

function CoreServicesSection({ navigate }: { navigate: (to: Route | string) => void }) {
  return (
    <section className="relative rounded-[2rem] bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-[#1E293B] shadow-2xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-10 lg:p-14 overflow-hidden">
      {/* Subtle Ambient Glow */}
      <div className="pointer-events-none absolute -bottom-28 -right-28 w-96 h-96 rounded-full bg-gradient-to-tl from-[#6366F1]/20 via-[#7C3AED]/15 to-transparent blur-3xl" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/25 text-[#4F46E5] dark:text-indigo-300 text-xs sm:text-sm font-semibold">
            <Layers size={14} className="text-[#6366F1]" />
            <span>AarCode Services</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.12] text-slate-900 dark:text-white">
            Everything You Need to Master Code
          </h2>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
            Practical tools, interactive editors, and automated test runners to help you learn faster and build real projects.
          </p>

          {/* CTA Button */}
          <div className="pt-2">
            <button
              onClick={() => navigate("courses")}
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#6366F1] via-[#4F46E5] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white font-semibold text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>Explore All Tracks</span>
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform duration-200"
              />
            </button>
          </div>
        </div>

        {/* Right Column: 3 Interactive Feature List Cards */}
        <div className="lg:col-span-7 space-y-4">
          {CORE_SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.title}
                onClick={() => navigate(service.route)}
                className="group w-full text-left rounded-2xl bg-[#F8FAFC] dark:bg-[#090D16] border border-slate-200/90 dark:border-[#1E293B] hover:border-[#6366F1] dark:hover:border-[#6366F1] p-5 sm:p-6 flex items-center justify-between gap-4 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#6366F1]/15 to-[#7C3AED]/15 dark:from-[#6366F1]/20 dark:to-[#7C3AED]/20 border border-indigo-500/25 flex items-center justify-center text-[#6366F1] dark:text-indigo-400 group-hover:bg-[#6366F1] group-hover:text-white transition-all duration-200 shrink-0">
                    <Icon size={24} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white group-hover:text-[#6366F1] dark:group-hover:text-indigo-400 transition-colors">
                        {service.title}
                      </h3>
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-[#6366F1] dark:text-indigo-300 border border-indigo-500/20">
                        {service.badge}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base font-normal text-slate-600 dark:text-slate-400">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Hover Arrow */}
                <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] group-hover:bg-[#6366F1] group-hover:border-[#6366F1] flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-white transition-all duration-200 shrink-0">
                  <ArrowUpRight
                    size={18}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
