import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary caught an unhandled error]:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0C0D0E] text-[#ECEDEE] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#151718] border border-[#202425] rounded-2xl p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-400 mb-6">
              An unexpected error occurred while rendering this page.
            </p>
            {this.state.error && (
              <pre className="text-xs bg-black/40 text-rose-300 p-3 rounded-lg overflow-x-auto text-left mb-6 font-mono border border-white/5">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                <RefreshCw size={15} />
                <span>Reload Page</span>
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.hash = "#/";
                  window.location.reload();
                }}
                className="px-4 py-2.5 rounded-xl bg-[#202425] hover:bg-[#2b3031] text-slate-200 font-medium text-sm flex items-center gap-2 transition-all border border-white/5"
              >
                <Home size={15} />
                <span>Go Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
