import { Terminal, Github, Twitter, Linkedin } from "lucide-react";
import { APP_NAME } from "@/config/constants";
import type { Route } from "@/types";

type FooterProps = {
  navigate: (to: Route) => void;
};

export function Footer({ navigate }: FooterProps) {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white">
                <Terminal size={18} />
              </div>
              <span className="font-bold text-lg">{APP_NAME}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              A fast, modern online coding environment for developers, students and learners.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Product</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate("compiler")} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                  Compiler
                </button>
              </li>
              <li>
                <button onClick={() => navigate("problems")} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                  Problems
                </button>
              </li>
              <li>
                <button onClick={() => navigate("playground")} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                  Playground
                </button>
              </li>
              <li>
                <button onClick={() => navigate("pricing")} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                  Pricing
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate("docs")} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                  Documentation
                </button>
              </li>
              <li>
                <span className="text-sm text-gray-400 dark:text-gray-600">API Reference</span>
              </li>
              <li>
                <span className="text-sm text-gray-400 dark:text-gray-600">Tutorials</span>
              </li>
              <li>
                <span className="text-sm text-gray-400 dark:text-gray-600">Blog</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Connect</h3>
            <div className="flex gap-3">
              <a href="#" className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" aria-label="GitHub">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            (c) {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 cursor-pointer">Privacy</span>
            <span className="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 cursor-pointer">Terms</span>
            <span className="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 cursor-pointer">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
