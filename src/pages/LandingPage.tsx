import {
  Terminal,
  Code2,
  Zap,
  Shield,
  GitBranch,
  Globe,
  Play,
  ArrowRight,
  Check,
  ChevronDown,
  Layers,
  Cpu,
  Keyboard,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/cn";
import { APP_NAME } from "@/config/constants";
import { LANGUAGES } from "@/config/languages";
import { Button } from "@/components/ui/Button";
import { AdSlot } from "@/components/ui/AdSlot";
import type { Route } from "@/types";

type LandingPageProps = {
  navigate: (to: Route) => void;
};

export function LandingPage({ navigate }: LandingPageProps) {
  return (
    <div className="bg-white dark:bg-gray-950">
      <HeroSection navigate={navigate} />
      <CompilerPreviewSection navigate={navigate} />
      <AdSlot className="max-w-7xl mx-auto px-4 my-12" />
      <SupportedLanguagesSection />
      <FeaturesSection />
      <HowItWorksSection />
      <WhyAarByteSection />
      <FaqSection />
      <CtaSection navigate={navigate} />
    </div>
  );
}

function HeroSection({ navigate }: { navigate: (to: Route) => void }) {
  return (
    <section className="relative overflow-hidden border-b border-gray-200 dark:border-gray-800">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-950 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium mb-6">
            <Zap size={12} /> Fast, modern, browser-based
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-6">
            Code. Run. Learn. Build.
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            A fast, modern online coding environment for developers, students and learners.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="primary" size="lg" onClick={() => navigate("compiler")}>
              <Play size={18} /> Open Compiler
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate("docs")}>
              Explore Features <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CompilerPreviewSection({ navigate }: { navigate: (to: Route) => void }) {
  return (
    <section className="py-16 lg:py-20 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            A professional IDE in your browser
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Powered by Monaco Editor -- the same engine behind VS Code.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden bg-gray-900 dark:bg-gray-900 max-w-5xl mx-auto">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-gray-400 ml-2">main.py - AarByte</span>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-gray-500">Python</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-600 text-white">Run</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="p-4 font-mono text-sm text-gray-300 bg-gray-900 min-h-[200px]">
              <div className="text-blue-400">def <span className="text-yellow-300">main</span>():</div>
              <div className="pl-4">print(<span className="text-green-400">"Hello, AarByte!"</span>)</div>
              <div className="text-blue-400">main()</div>
            </div>
            <div className="p-4 font-mono text-sm bg-gray-850 border-l border-gray-700 min-h-[200px]">
              <div className="text-green-400 mb-2">--- Execution completed ---</div>
              <div className="text-gray-300">Hello, AarByte!</div>
              <div className="text-gray-500 text-xs mt-3">Time: 0.42s | Memory: 18 MB</div>
            </div>
          </div>
        </div>
        <div className="text-center mt-6">
          <Button variant="secondary" onClick={() => navigate("compiler")}>
            Try it now <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}

function SupportedLanguagesSection() {
  return (
    <section className="py-16 lg:py-20 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Supported languages
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Write and run code in {LANGUAGES.length} popular programming languages.
          </p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {LANGUAGES.map((lang) => (
            <div
              key={lang.id}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all bg-white dark:bg-gray-900"
            >
              <Code2 size={24} className="text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{lang.name}</span>
              <span className="text-[10px] text-gray-400">.{lang.extension}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: Code2,
    title: "Monaco Editor",
    description: "Full syntax highlighting, autocomplete, bracket matching, and minimap powered by the VS Code engine.",
  },
  {
    icon: Zap,
    title: "Instant Execution",
    description: "Run your code with a single click and see output, errors, and execution metrics in real time.",
  },
  {
    icon: Shield,
    title: "Secure Sandbox",
    description: "Code runs in an isolated execution environment. Security is built into the architecture from day one.",
  },
  {
    icon: GitBranch,
    title: "Save & Manage",
    description: "Create, save, rename, duplicate, and organize your programs. Your work persists across sessions.",
  },
  {
    icon: Globe,
    title: "Share Code",
    description: "Generate shareable links to your code. Control visibility with public/private and read-only toggles.",
  },
  {
    icon: Keyboard,
    title: "Keyboard Shortcuts",
    description: "Ctrl+S to save, Ctrl+Enter to run. Built for developers who prefer to keep their hands on the keyboard.",
  },
];

function FeaturesSection() {
  return (
    <section className="py-16 lg:py-20 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Everything you need to code
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A complete toolkit for writing, running, and sharing code -- all in your browser.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                <feature.icon size={20} />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { icon: Code2, title: "Write code", description: "Open the compiler and start coding in your favorite language with full Monaco editor support." },
  { icon: Terminal, title: "Provide input", description: "Enter standard input in the console panel if your program reads from stdin." },
  { icon: Play, title: "Run", description: "Hit the Run button or press Ctrl+Enter to execute your code instantly." },
  { icon: Check, title: "See results", description: "View output, errors, execution time, and memory usage in the console panel." },
];

function HowItWorksSection() {
  return (
    <section className="py-16 lg:py-20 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">How it works</h2>
          <p className="text-gray-600 dark:text-gray-400">Four simple steps from code to output.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, idx) => (
            <div key={step.title} className="relative">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-4">
                <step.icon size={22} />
              </div>
              <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Step {idx + 1}</div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
              {idx < STEPS.length - 1 && (
                <ArrowRight size={20} className="hidden lg:block absolute top-6 -right-3 text-gray-300 dark:text-gray-700" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const REASONS = [
  { icon: Layers, title: "Built for everyone", description: "Whether you're a student learning to code, a developer testing a snippet, or an interviewer running a problem -- AarByte adapts to your workflow." },
  { icon: Cpu, title: "Real execution engine", description: "The architecture supports connecting a real secure sandbox backend. The mock executor is a placeholder for a production-grade execution service." },
  { icon: Shield, title: "Security first", description: "No arbitrary code execution on the client. The execution layer is fully modular and designed to connect to a hardened sandbox." },
];

function WhyAarByteSection() {
  return (
    <section className="py-16 lg:py-20 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Why {APP_NAME}</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A coding platform designed with the rigor and polish of modern developer tools.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {REASONS.map((reason) => (
            <div key={reason.title} className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <reason.icon size={24} className="text-blue-600 dark:text-blue-400 mb-3" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">{reason.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  { q: "What is AarByte?", a: `${APP_NAME} is an online code compiler and coding playground. You can write, run, and share code in multiple programming languages directly from your browser -- no installation required.` },
  { q: "Which languages are supported?", a: `Currently we support Python, JavaScript, TypeScript, Java, C, C++, Go, Rust, and PHP. More languages will be added as the execution backend evolves.` },
  { q: "Is my code executed securely?", a: "Yes. The architecture uses a modular execution layer that connects to a secure sandbox backend. No arbitrary code runs on the client or without isolation." },
  { q: "Do I need an account?", a: "No. You can start coding immediately without signing up. An account system is planned for saving and sharing code across devices." },
  { q: "Can I share my code?", a: "Yes. The Share dialog lets you generate a link and control visibility. Full sharing functionality will be available after account integration." },
  { q: "Is AarByte free?", a: "The core compiler is free to use. Premium features and pricing plans will be announced soon." },
];

function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <section className="py-16 lg:py-20 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">FAQ</h2>
          <p className="text-gray-600 dark:text-gray-400">Frequently asked questions.</p>
        </div>
        <div className="space-y-2">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                aria-expanded={openIdx === idx}
              >
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={cn(
                    "text-gray-400 transition-transform flex-shrink-0",
                    openIdx === idx && "rotate-180"
                  )}
                />
              </button>
              {openIdx === idx && (
                <div className="px-4 pb-3 text-sm text-gray-600 dark:text-gray-400">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection({ navigate }: { navigate: (to: Route) => void }) {
  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Ready to start coding?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Open the compiler and run your first program in seconds.
        </p>
        <Button variant="primary" size="lg" onClick={() => navigate("compiler")}>
          <Play size={18} /> Open Compiler
        </Button>
      </div>
    </section>
  );
}
