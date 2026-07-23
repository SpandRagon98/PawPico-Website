# PawPico Website

The official product website for **PawPico**, an expressive Windows desktop cat with Work mode, opt-in Gmail and Calendar connectors, smart reminders, tactile desktop physics, focus tools, and 87 defined animation states.

## Local development

Requires Node.js 22 or newer.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validate a production build

```bash
npm test
```

This builds the Vinext output and verifies the rendered product story, primary feature films, full source-verified directory, branding, end-only pricing, privacy wording, and responsive breakpoints.

For the static GitHub Pages export:

```bash
npm run build:pages
```

## Deploy with GitHub Actions

The workflow at `.github/workflows/deploy.yml` validates, exports, and deploys the site to GitHub Pages whenever `main` is updated. It can also be started manually from the repository's **Actions** tab.

The production site is:

<https://spandragon98.github.io/PawPico-Website/>

The deployment job publishes its final Pages URL in the GitHub Actions environment and run summary. No Cloudflare account or deployment secret is required.

## Product-film provenance

The Gmail, Calendar, and notification films are generated in two stages:

1. `scripts/render-app-motion-clips.mjs` imports PawPico's animation renderer from a read-only application source directory and records the exact `wave`, `alarmClap`, `panic`, `stretch`, `happy`, and `sit` motion.
2. `scripts/generate-connector-films.py` places those exact motions in product stories that match the current connector and reminder logic.

The checked-in MP4 files are ready to deploy; these scripts are only needed when the application's motion system changes. They never write to the application repository.
