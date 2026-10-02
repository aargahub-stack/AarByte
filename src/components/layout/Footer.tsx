import { Github, Twitter, Linkedin, Code2 } from "lucide-react";
import type { Route } from "@/types";

type FooterProps = {
  navigate: (to: Route | string) => void;
};

export function Footer({ navigate }: FooterProps) {
  return (
    <footer className="font-urbanist bg-[#090D16] text-slate-400 border-t border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-[#1E293B]">
          {/* Brand Logo & Tagline */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              onClick={() => navigate("landing")}
              className="flex items-center gap-3 group focus:outline-none text-left"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 p-1.5 group-hover:scale-105 transition-transform">
                <img
                  src="/AarCode.png"
                  alt="AarCode Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">
                AarCode
              </span>
            </button>
            <span className="hidden sm:inline text-slate-700">|</span>
            <p className="text-sm text-slate-400 font-medium max-w-md">
              Next-Gen Developer Platform — Master DSA, execute code in real-time, and scale your engineering skills.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="flex flex-wrap items-center gap-6 text-sm font-semibold">
            <button
              onClick={() => navigate("courses")}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Courses
            </button>
            <button
              onClick={() => navigate("problems")}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Practice Arena
            </button>
            <button
              onClick={() => navigate("compiler")}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Compiler
            </button>
            <button
              onClick={() => {
                navigate("landing");
                setTimeout(() => {
                  document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Pricing
            </button>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Terms, Privacy, Social/GitHub Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm font-medium text-slate-500">
            <span>© {new Date().getFullYear()} AarCode. All rights reserved.</span>
            <button
              onClick={() => navigate("terms")}
              className="hover:text-slate-300 transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigate("privacy")}
              className="hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </button>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#0F172A] border border-[#1E293B] text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all"
              aria-label="GitHub"
            >
              <Github size={17} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#0F172A] border border-[#1E293B] text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all"
              aria-label="Twitter"
            >
              <Twitter size={17} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#0F172A] border border-[#1E293B] text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all"
              aria-label="LinkedIn"
            >
              <Linkedin size={17} />
            </a>
            <button
              onClick={() => navigate("compiler")}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#0F172A] border border-[#1E293B] text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all"
              aria-label="Compiler"
            >
              <Code2 size={17} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
