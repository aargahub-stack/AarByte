import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Copy, Check, Link2, Globe, Lock, Eye } from "lucide-react";
import { cn } from "@/utils/cn";

type ShareModalProps = {
  open: boolean;
  onClose: () => void;
  onCopyLink: () => void;
};

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <span className="text-gray-400">{icon}</span>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-10 h-5 rounded-full transition-colors flex-shrink-0",
          checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
        )}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform",
            checked ? "translate-x-5" : ""
          )}
        />
      </button>
    </label>
  );
}

export function ShareModal({ open, onClose, onCopyLink }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [readOnly, setReadOnly] = useState(false);

  const handleCopy = () => {
    onCopyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal open={open} onClose={onClose} title="Share" width="md">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Share link
          </label>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400 truncate">
              <Link2 size={14} className="flex-shrink-0" />
              <span className="truncate">https://codeforge.io/share/demo-link</span>
            </div>
            <Button variant="primary" size="sm" onClick={handleCopy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <ToggleRow
            icon={<Globe size={16} />}
            label="Public"
            description="Anyone with the link can view this code"
            checked={isPublic}
            onChange={setIsPublic}
          />
          <ToggleRow
            icon={<Eye size={16} />}
            label="Read-only"
            description="Prevent others from editing your code"
            checked={readOnly}
            onChange={setReadOnly}
          />
          <ToggleRow
            icon={<Lock size={16} />}
            label="Require login"
            description="Only logged-in users can access"
            checked={false}
            onChange={() => {}}
          />
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-600 pt-2">
          Sharing is currently a preview feature. Full sharing will be available after account integration.
        </p>
      </div>
    </Modal>
  );
}
