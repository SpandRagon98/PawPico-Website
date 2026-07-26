# MewMuze Website

The official product website for **MewMuze**, an expressive Windows desktop cat with Work mode, opt-in Gmail and Calendar connectors, smart reminders, tactile desktop physics, focus tools, and a customizable personality.

The landing page follows one connected companionship story with a cursor-aware
flower-band MewMuze hero, a keyboard- and touch-accessible Feature Theatre, a
complete verified feature directory, accurate Appearance Studio choices, and a
local-first privacy explanation. The Wardrobe route is a Coming Soon preview of
original concepts only; no order or download flow is active.

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

This builds the Vinext output and verifies the rendered product story, Feature Theatre, full source-verified directory, authentic flower-band cat asset, privacy wording, Coming Soon Wardrobe, and responsive behavior.

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

1. `scripts/render-app-motion-clips.mjs` imports MewMuze's animation renderer from a read-only application source directory and records the exact `wave`, `alarmClap`, `panic`, `stretch`, `happy`, and `sit` motion.
2. `scripts/generate-connector-films.py` places those exact motions in product stories that match the current connector and reminder logic.

The checked-in MP4 files are ready to deploy; these scripts are only needed when the application's motion system changes. They never write to the application repository.
