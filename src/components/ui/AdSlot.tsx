import { cn } from "@/utils/cn";

type AdSlotProps = {
  className?: string;
  label?: string;
};

export function AdSlot({ className, label = "Advertisement" }: AdSlotProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-600 text-xs py-3 px-4",
        className
      )}
      aria-label="Advertisement slot"
    >
      {label}
    </div>
  );
}
