import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { Settings } from "@/types";
import { RotateCcw } from "lucide-react";

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdate: (patch: Partial<Settings>) => void;
  onReset: () => void;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"}`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : ""}`}
        />
      </button>
    </label>
  );
}

function NumberRow({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 px-2 py-1 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  );
}

function ThemeRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: "light" | "dark" | "system";
  onChange: (v: "light" | "dark" | "system") => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5">
        {(["light", "dark", "system"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => onChange(mode)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
              value === mode
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SettingsModal({ open, onClose, settings, onUpdate, onReset }: SettingsModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Settings" width="lg">
      <Section title="Editor">
        <NumberRow label="Font size" value={settings.fontSize} onChange={(v) => onUpdate({ fontSize: v })} min={10} max={32} />
        <NumberRow label="Tab size" value={settings.tabSize} onChange={(v) => onUpdate({ tabSize: v })} min={1} max={8} />
        <ToggleRow label="Word wrap" checked={settings.wordWrap} onChange={(v) => onUpdate({ wordWrap: v })} />
        <ToggleRow label="Minimap" checked={settings.minimap} onChange={(v) => onUpdate({ minimap: v })} />
        <ToggleRow label="Line numbers" checked={settings.lineNumbers} onChange={(v) => onUpdate({ lineNumbers: v })} />
      </Section>

      <Section title="Appearance">
        <ThemeRow label="Theme" value={settings.theme} onChange={(v) => onUpdate({ theme: v })} />
      </Section>

      <Section title="Execution">
        <ToggleRow label="Show execution time" checked={settings.showExecutionTime} onChange={(v) => onUpdate({ showExecutionTime: v })} />
        <ToggleRow label="Show memory usage" checked={settings.showMemoryUsage} onChange={(v) => onUpdate({ showMemoryUsage: v })} />
      </Section>

      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="ghost" onClick={onReset} size="sm">
          <RotateCcw size={14} /> Reset to defaults
        </Button>
        <Button variant="primary" onClick={onClose} size="sm">
          Done
        </Button>
      </div>
    </Modal>
  );
}
