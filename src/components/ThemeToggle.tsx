import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="grid size-10 place-items-center rounded-full border border-line text-muted transition-colors duration-300 hover:border-accent hover:text-ink focus-visible:text-ink"
    >
      {theme === "dark" ? (
        <Sun size={17} strokeWidth={1.75} aria-hidden />
      ) : (
        <Moon size={17} strokeWidth={1.75} aria-hidden />
      )}
    </button>
  );
}
