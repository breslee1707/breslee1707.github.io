import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export function ThemeToggle() {
  const { toggle } = useTheme();

  // Both icons are rendered and CSS picks one via [data-theme], so the
  // prerendered markup never depends on the visitor's stored theme
  // (which the head script applies before hydration).
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      title="Toggle color theme"
      className="grid size-10 place-items-center rounded-full border border-line text-muted transition-colors duration-300 hover:border-accent hover:text-ink focus-visible:text-ink"
    >
      <Sun size={17} strokeWidth={1.75} aria-hidden className="theme-icon-sun" />
      <Moon size={17} strokeWidth={1.75} aria-hidden className="theme-icon-moon" />
    </button>
  );
}
