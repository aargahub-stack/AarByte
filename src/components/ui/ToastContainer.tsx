import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils/cn";
import type { ToastType } from "@/types";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors: Record<ToastType, string> = {
  success: "text-green-500",
  error: "text-red-500",
  info: "text-blue-500",
  warning: "text-yellow-500",
};

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-center gap-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg px-4 py-3 min-w-[260px] max-w-[400px] animate-in"
            )}
            role="alert"
          >
            <Icon className={cn("flex-shrink-0", colors[toast.type])} size={18} />
            <span className="text-sm text-gray-800 dark:text-gray-200 flex-1">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex-shrink-0"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
