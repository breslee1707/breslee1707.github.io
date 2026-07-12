import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";

/**
 * Build-time prerender entry (see scripts/prerender.mjs).
 * Renders the full page to static HTML so crawlers that don't execute
 * JavaScript (GPTBot, ClaudeBot, PerplexityBot, ...) still see all content.
 */
export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
