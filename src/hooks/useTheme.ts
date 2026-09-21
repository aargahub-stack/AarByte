import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

export function useTheme(preference: "light" | "dark" | "system") {
  const [resolvedTheme, setResolvedTheme] = useState<ThemeMode>(() => {
    if (preference === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return preference;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      if (preference === "system") {
        setResolvedTheme(e.matches ? "dark" : "light");
      }
    };
    if (preference === "system") {
      setResolvedTheme(mq.matches ? "dark" : "light");
    } else {
      setResolvedTheme(preference);
    }
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference]);

  const toggle = useCallback(() => {
    setResolvedTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return { theme: resolvedTheme, toggleTheme: toggle };
}
