import { useCallback, useEffect, useState } from "react";

export type Theme = "dark" | "light";

function getInitial(): Theme {
  if (typeof document === "undefined") return "dark";
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
}

/** Theme state synced to <html data-theme> and localStorage. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitial);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // Keep the mobile browser UI (address bar) in sync with the toggle.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "light" ? "#f7f8fa" : "#13161c");
    }
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* storage may be unavailable */
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggle };
}
