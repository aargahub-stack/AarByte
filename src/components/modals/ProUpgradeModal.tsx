import React from "react";
import {
  Sparkles,
  Lock,
  CheckCircle2,
  Zap,
  ShieldCheck,
  X,
  ArrowRight,
} from "lucide-react";
import { planStorage } from "@/services/storage/planStorage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  onSuccess?: () => void;
}

export function ProUpgradeModal({
  isOpen,
  onClose,
  title = "Unlock Pro Coder Tier",
  subtitle = "Upgrade to Pro Coder for ₹49/month to unlock all advanced DSA tracks, hidden test cases, and company roadmaps.",
  onSuccess,
}: ProUpgradeModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    planStorage.upgradeToPro(user?.id);
    showToast("success", "Welcome to AarCode Pro Coder! All advanced modules and hidden tests are now unlocked.");
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0C0D0E] border border-emerald-500/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,240,118,0.18)] overflow-hidden">
        {/* Glow backdrop decorative effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00F076]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#00F076] text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles size={13} className="text-[#00F076]" />
          <span>AarCode Pro Exclusive</span>
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          {subtitle}
        </p>

        {/* Pricing Pill */}
        <div className="mt-5 p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Membership Plan
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              ₹49 <span className="text-xs font-normal text-slate-400">/ month</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-[#00F076] text-xs font-medium border border-emerald-500/30">
            Cancel anytime
          </span>
        </div>

        {/* Feature List */}
        <div className="mt-5 space-y-2.5 text-xs sm:text-sm text-slate-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-[#00F076] shrink-0" />
            <span>Modules 5 through 9: Strings, Recursion, LL, Trees &amp; Dynamic Programming</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-[#00F076] shrink-0" />
            <span>Run against 100% of hidden test cases &amp; edge diagnostics</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-[#00F076] shrink-0" />
            <span>Advanced Machine Coding &amp; Algorithmic Assessment Tracks</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-[#00F076] shrink-0" />
            <span>Optimal reference solutions and algorithmic complexity breakdowns</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-7 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleUpgrade}
            className="w-full sm:flex-1 py-3 px-5 rounded-full bg-[#00F076] hover:bg-[#00D96A] text-[#0C0D0E] font-bold text-sm shadow-[0_0_25px_rgba(0,240,118,0.28)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap size={16} className="fill-[#0C0D0E]" />
            <span>Upgrade to Pro Coder (₹49)</span>
            <ArrowRight size={16} />
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 rounded-full bg-transparent hover:bg-white/5 border border-white/10 text-slate-300 font-medium text-sm transition-all cursor-pointer"
          >
            Continue on Starter
          </button>
        </div>
      </div>
    </div>
  );
}
