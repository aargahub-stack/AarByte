import React, { useState } from "react";
import { ShieldCheck, FileText, ArrowLeft, Mail, Lock, CheckCircle2, Globe } from "lucide-react";
import type { Route } from "@/types";

interface LegalPageProps {
  initialTab?: "privacy" | "terms";
  navigate: (route: Route, params?: Record<string, string>) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ initialTab = "privacy", navigate }) => {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms">(initialTab);

  return (
    <div className="min-h-screen font-urbanist bg-[#F7F8FA] dark:bg-[#0C0D0E] text-[#121314] dark:text-[#ECEDEE] transition-colors">
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-[#E5E7EB] dark:border-[#202425] bg-white/70 dark:bg-[#151718]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("landing")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B7280] dark:text-[#8A9099] hover:text-emerald-500 dark:hover:text-[#00F076] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to AarCode
          </button>

          {/* Tab Switcher */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-[#0C0D0E] border border-slate-200 dark:border-[#202425]">
            <button
              onClick={() => setActiveTab("privacy")}
              className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "privacy"
                  ? "bg-[#00F076] text-[#0C0D0E] shadow-sm"
                  : "text-[#6B7280] dark:text-[#8A9099] hover:text-[#121314] dark:hover:text-[#ECEDEE]"
              }`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab("terms")}
              className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "terms"
                  ? "bg-[#00F076] text-[#0C0D0E] shadow-sm"
                  : "text-[#6B7280] dark:text-[#8A9099] hover:text-[#121314] dark:hover:text-[#ECEDEE]"
              }`}
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {activeTab === "privacy" ? (
          /* ================= PRIVACY POLICY ================= */
          <article className="space-y-8 animate-in fade-in duration-200">
            {/* Header */}
            <div className="space-y-3 border-b border-[#E5E7EB] dark:border-[#202425] pb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border border-emerald-500/20">
                <ShieldCheck size={14} />
                Official Privacy Disclosure
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE]">
                Privacy Policy for AarCode
              </h1>
              <p className="text-sm text-[#6B7280] dark:text-[#8A9099]">
                Last updated: October 2, 2026 • Effective immediately
              </p>
            </div>

            {/* Intro */}
            <div className="prose dark:prose-invert max-w-none text-[#6B7280] dark:text-[#8A9099] leading-relaxed space-y-4">
              <p>
                Welcome to <strong>AarCode</strong> (<a href="https://aarcode.aarga.org" className="text-emerald-600 dark:text-[#00F076] underline">https://aarcode.aarga.org</a>), developed and operated by <strong>Aarga</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). We are deeply committed to protecting your privacy and transparently handling your personal data.
              </p>
              <p>
                This Privacy Policy explains how we collect, use, store, and safeguard your information when you register, log in (including via Google OAuth), write code in our compiler, enroll in courses, or otherwise use AarCode.
              </p>
            </div>

            {/* Section 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] shadow-xs space-y-3">
              <h2 className="text-lg font-bold text-[#121314] dark:text-[#ECEDEE] flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#00F076]" />
                1. Information We Collect
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-sm text-[#6B7280] dark:text-[#8A9099]">
                <li>
                  <strong>Account &amp; Identity Data:</strong> When you register or sign in via Google OAuth, we receive your name, email address, and profile picture avatar. We do not receive or store your Google password.
                </li>
                <li>
                  <strong>Code &amp; Solution Submissions:</strong> Code snippets, programs, and problem solutions you submit to our online compiler or course modules are stored to provide your learning history, progress tracking, and leaderboard stats.
                </li>
                <li>
                  <strong>Telemetry &amp; Progress Metrics:</strong> We track your streak days, problem solve counts, time-spent telemetry, and enrolled course status to provide personalized roadmaps and recommendations.
                </li>
                <li>
                  <strong>Preferences &amp; Technical Data:</strong> Browser settings, theme choice (Dark/Light mode), editor font sizes, and standard HTTP logs (IP address, device type) for platform stability.
                </li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] shadow-xs space-y-3">
              <h2 className="text-lg font-bold text-[#121314] dark:text-[#ECEDEE] flex items-center gap-2">
                <Lock size={18} className="text-[#00F076]" />
                2. How We Use Your Information
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-sm text-[#6B7280] dark:text-[#8A9099]">
                <li>To authenticate your identity and maintain secure sessions via Supabase and Google OAuth.</li>
                <li>To compile, test, and validate your code solutions in a secure isolated compiler execution environment.</li>
                <li>To calculate your progress, XP, badges, and display your position on the AarCode Leaderboard.</li>
                <li>To maintain system reliability, prevent abuse (e.g. infinite loops or spam), and deliver platform updates.</li>
                <li><strong>We never sell, rent, or trade your personal information to third parties or advertising brokers.</strong></li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] shadow-xs space-y-3">
              <h2 className="text-lg font-bold text-[#121314] dark:text-[#ECEDEE] flex items-center gap-2">
                <Globe size={18} className="text-[#00F076]" />
                3. Third-Party Integrations &amp; Google User Data
              </h2>
              <p className="text-sm text-[#6B7280] dark:text-[#8A9099]">
                AarCode uses Google OAuth services for frictionless authentication. In adherence with Google API Services User Data Policy:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-[#6B7280] dark:text-[#8A9099]">
                <li>
                  We only request minimal public profile information: <code>email</code>, <code>profile</code>, and <code>openid</code>.
                </li>
                <li>
                  Your Google data is strictly used for account registration, sign-in, and displaying your profile name. It is never transferred or used for generalized machine learning models without consent.
                </li>
                <li>
                  Database and authentication records are securely managed through Supabase with Row Level Security (RLS) policies.
                </li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] shadow-xs space-y-3">
              <h2 className="text-lg font-bold text-[#121314] dark:text-[#ECEDEE]">
                4. Your Rights &amp; Data Deletion
              </h2>
              <p className="text-sm text-[#6B7280] dark:text-[#8A9099]">
                You retain complete control over your data. At any time, you can request an export or permanent deletion of your account, saved programs, and submission history by contacting our support team at <a href="mailto:hr.aargahub@gmail.com" className="text-emerald-600 dark:text-[#00F076] font-semibold underline">hr.aargahub@gmail.com</a>.
              </p>
            </div>

            {/* Section 5: Contact */}
            <div className="p-6 rounded-2xl bg-emerald-500/5 dark:bg-[#151718] border border-emerald-500/20 dark:border-[#202425] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#121314] dark:text-[#ECEDEE]">Have questions about our Privacy Policy?</h3>
                <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#8A9099]">Our engineering and administrative team is here to assist.</p>
              </div>
              <a
                href="mailto:hr.aargahub@gmail.com"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] transition-colors"
              >
                <Mail size={15} />
                hr.aargahub@gmail.com
              </a>
            </div>
          </article>
        ) : (
          /* ================= TERMS OF SERVICE ================= */
          <article className="space-y-8 animate-in fade-in duration-200">
            {/* Header */}
            <div className="space-y-3 border-b border-[#E5E7EB] dark:border-[#202425] pb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-[#00F076] border border-emerald-500/20">
                <FileText size={14} />
                User Agreement
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#121314] dark:text-[#ECEDEE]">
                Terms of Service
              </h1>
              <p className="text-sm text-[#6B7280] dark:text-[#8A9099]">
                Last updated: October 2, 2026 • Governing your use of AarCode
              </p>
            </div>

            {/* Intro */}
            <div className="prose dark:prose-invert max-w-none text-[#6B7280] dark:text-[#8A9099] leading-relaxed space-y-4">
              <p>
                By accessing or using <strong>AarCode</strong> (accessible at <a href="https://aarcode.aarga.org" className="text-emerald-600 dark:text-[#00F076] underline">https://aarcode.aarga.org</a>), you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.
              </p>
            </div>

            {/* Section 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] shadow-xs space-y-3">
              <h2 className="text-lg font-bold text-[#121314] dark:text-[#ECEDEE]">
                1. Acceptable Use of the Code Compiler &amp; Runtime Engine
              </h2>
              <p className="text-sm text-[#6B7280] dark:text-[#8A9099]">
                AarCode provides a high-performance multi-language execution engine for education, algorithm practice, and problem solving. You expressly agree <strong>not</strong> to:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-[#6B7280] dark:text-[#8A9099]">
                <li>Execute denial-of-service (DoS) attempts, network attacks, or port scans from our runtime containers.</li>
                <li>Run cryptocurrency miners, automated botnets, or malicious reverse shells.</li>
                <li>Attempt to breach or probe platform infrastructure, execution isolation, or other users&rsquo; private data.</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] shadow-xs space-y-3">
              <h2 className="text-lg font-bold text-[#121314] dark:text-[#ECEDEE]">
                2. Intellectual Property &amp; Ownership
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-sm text-[#6B7280] dark:text-[#8A9099]">
                <li>
                  <strong>Your Code:</strong> You own 100% of the code, algorithms, and project logic you write on AarCode.
                </li>
                <li>
                  <strong>Platform Content:</strong> Course materials, study guides, video curriculums, logos, and UI components are proprietary to AarCode / Aarga and protected by intellectual property laws.
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] shadow-xs space-y-3">
              <h2 className="text-lg font-bold text-[#121314] dark:text-[#ECEDEE]">
                3. Disclaimer of Warranties &amp; Limitation of Liability
              </h2>
              <p className="text-sm text-[#6B7280] dark:text-[#8A9099] leading-relaxed">
                AarCode is provided &ldquo;AS IS&rdquo; without warranties of any kind, whether express or implied. While we strive for 99.9% uptime and accurate execution metrics, we are not liable for any downtime, loss of unsaved code, or indirect damages resulting from platform usage.
              </p>
            </div>

            {/* Section 4 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#151718] border border-[#E5E7EB] dark:border-[#202425] shadow-xs space-y-3">
              <h2 className="text-lg font-bold text-[#121314] dark:text-[#ECEDEE]">
                4. Account Termination
              </h2>
              <p className="text-sm text-[#6B7280] dark:text-[#8A9099] leading-relaxed">
                We reserve the right to suspend or terminate accounts that violate our acceptable use policy or attempt malicious exploitation of computational resources.
              </p>
            </div>

            {/* Contact */}
            <div className="p-6 rounded-2xl bg-emerald-500/5 dark:bg-[#151718] border border-emerald-500/20 dark:border-[#202425] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#121314] dark:text-[#ECEDEE]">Contact &amp; Legal Inquiries</h3>
                <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#8A9099]">Questions regarding these terms may be directed to our administration.</p>
              </div>
              <a
                href="mailto:hr.aargahub@gmail.com"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] transition-colors"
              >
                <Mail size={15} />
                hr.aargahub@gmail.com
              </a>
            </div>
          </article>
        )}
      </div>
    </div>
  );
};
