import { useCallback, useEffect, useState } from "react";
import type { Settings } from "@/types";
import { loadSettings, saveSettings } from "@/services/storage/settingsStorage";
import { DEFAULT_SETTINGS } from "@/config/defaultSettings";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSettings, resetSettings };
}
