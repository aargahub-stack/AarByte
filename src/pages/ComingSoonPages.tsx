import type { ReactNode } from "react";
import { Construction, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { APP_NAME } from "@/config/constants";
import type { Route } from "@/types";

type ComingSoonPageProps = {
  title: string;
  description: string;
  icon: ReactNode;
  navigate: (to: Route) => void;
  features?: string[];
};

export function ComingSoonPage({ title, description, icon, navigate, features }: ComingSoonPageProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-lg text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-6 mx-auto">
          {icon}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">{title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-2">{description}</p>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium mb-8">
          <Construction size={12} /> Coming soon
        </div>
        {features && features.length > 0 && (
          <div className="text-left mb-8 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Planned features:</h3>
            <ul className="space-y-1">
              {features.map((f, i) => (
                <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {f}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button variant="secondary" onClick={() => navigate("landing")}>
          <ArrowLeft size={16} /> Back to home
        </Button>
      </div>
    </div>
  );
}

export function ProblemsPage({ navigate }: { navigate: (to: Route) => void }) {
  return (
    <ComingSoonPage
      title="Problems"
      description="A curated collection of programming problems to practice and sharpen your skills."
      icon={<span className="text-2xl font-bold">P</span>}
      navigate={navigate}
      features={["Algorithms and data structures", "Difficulty levels from easy to hard", "Built-in code editor and test runner", "Progress tracking and streaks"]}
    />
  );
}

export function PlaygroundPage({ navigate }: { navigate: (to: Route) => void }) {
  return (
    <ComingSoonPage
      title="Playground"
      description="Experiment with HTML, CSS, and JavaScript in a live, interactive sandbox."
      icon={<span className="text-2xl font-bold">PL</span>}
      navigate={navigate}
      features={["Live HTML/CSS/JS preview", "Real-time updates", "Shareable playgrounds", "Template gallery"]}
    />
  );
}

export function DocsPage({ navigate }: { navigate: (to: Route) => void }) {
  return (
    <ComingSoonPage
      title="Documentation"
      description={`Learn how to use ${APP_NAME}, integrate the API, and get the most out of the platform.`}
      icon={<span className="text-2xl font-bold">D</span>}
      navigate={navigate}
      features={["Getting started guides", "API reference", "Language setup guides", "Integration tutorials"]}
    />
  );
}

export function PricingPage({ navigate }: { navigate: (to: Route) => void }) {
  return (
    <ComingSoonPage
      title="Pricing"
      description="Simple, transparent pricing for individuals and teams."
      icon={<span className="text-2xl font-bold">$</span>}
      navigate={navigate}
      features={["Free tier with unlimited public code", "Pro plan with private programs", "Team plan with collaboration", "Custom enterprise pricing"]}
    />
  );
}
