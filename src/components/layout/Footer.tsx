import { Github, Twitter, Linkedin, Code2 } from "lucide-react";
import type { Route } from "@/types";

type FooterProps = {
  navigate: (to: Route | string) => void;
};

export function Footer({ navigate }: FooterProps) {
  return (
    <footer className="font-urbanist bg-[#0C0D0E] text-[#8A9099] border-t border-[#202425]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-[#202425]">
          {/* Brand Logo & Tagline */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              onClick={() => navigate("landing")}
              className="flex items-center gap-3 group focus:outline-none text-left cursor-pointer"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#151718] border border-[#202425] p-1.5 group-hover:scale-105 group-hover:border-[#00F076]/40 transition-all">
                <img
                  src="/AarCode.png"
                  alt="AarCode Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-2xl tracking-tight text-[#ECEDEE]">
                AarCode
              </span>
            </button>
            <span className="hidden sm:inline text-[#202425]">|</span>
            <div className="flex flex-col text-xs sm:text-sm text-[#8A9099] max-w-md">
              <span className="font-bold text-[#ECEDEE] tracking-tight">Logic First.</span>
              <span className="text-xs text-[#5B626A] mt-0.5">An AarGa Hub Software Production.</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
            <button
              onClick={() => navigate("courses")}
              className="text-[#8A9099] hover:text-[#ECEDEE] transition-colors cursor-pointer"
            >
              Courses
            </button>
            <button
              onClick={() => navigate("problems")}
              className="text-[#8A9099] hover:text-[#ECEDEE] transition-colors cursor-pointer"
            >
              Practice Arena
            </button>
            <button
              onClick={() => navigate("compiler")}
              className="text-[#8A9099] hover:text-[#ECEDEE] transition-colors cursor-pointer"
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
              className="text-[#8A9099] hover:text-[#ECEDEE] transition-colors cursor-pointer"
            >
              Pricing
            </button>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Terms, Privacy, Social/GitHub Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-normal text-[#5B626A]">
            <span>© {new Date().getFullYear()} AarCode. Logic First. An AarGa Hub Software Production.</span>
            <button
              onClick={() => navigate("terms")}
              className="hover:text-[#ECEDEE] transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigate("privacy")}
              className="hover:text-[#ECEDEE] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#151718] border border-[#202425] text-[#8A9099] hover:text-[#ECEDEE] hover:border-[#00F076]/50 transition-all cursor-pointer"
              aria-label="GitHub"
            >
              <Github size={15} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#151718] border border-[#202425] text-[#8A9099] hover:text-[#ECEDEE] hover:border-[#00F076]/50 transition-all cursor-pointer"
              aria-label="Twitter"
            >
              <Twitter size={15} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#151718] border border-[#202425] text-[#8A9099] hover:text-[#ECEDEE] hover:border-[#00F076]/50 transition-all cursor-pointer"
              aria-label="LinkedIn"
            >
              <Linkedin size={15} />
            </a>
            <button
              onClick={() => navigate("compiler")}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#151718] border border-[#202425] text-[#8A9099] hover:text-[#00F076] hover:border-[#00F076]/50 transition-all cursor-pointer"
              aria-label="Compiler"
            >
              <Code2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
