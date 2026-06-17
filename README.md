# breslee1707.github.io

Personal portfolio of **Le Ngoc Gia Huy** — AI Engineer at Intel, co-founder of Code4life®.

Live: https://breslee1707.github.io/

## Stack

- **Vite + React + TypeScript**
- **Tailwind CSS v4** (CSS-first tokens in `src/index.css`)
- Self-hosted fonts via `@fontsource` — Bricolage Grotesque (display), Spectral (body), JetBrains Mono (labels)
- `lucide-react` icons

Design direction: *"precision-instrument editorial"* — deep-ink surfaces with a single warm amber signal, day/night themes, and purposeful reveal motion. Light + dark both meet WCAG AA contrast.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build
```

## Edit content

All copy lives in **`src/data/content.ts`** — name, intro, experience, projects, toolkit, and contact links. Edit that one file to update the site; components read from it.

The hero portrait is `public/assets/profile-photo.jpg` (swap for a higher-resolution image when available).

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages.

> One-time setup: **Settings → Pages → Build and deployment → Source = "GitHub Actions"**.

Static content (the `edge-ai-projects/` notes, images) lives in `public/` and is served from the site root, e.g. `/edge-ai-projects/`.

## Notes

Content is drafted from public-safe CV highlights; sensitive personal details (phone, home address, date of birth) are intentionally omitted.
