# PawPico Website

The official product website for **PawPico**, a private and expressive pixel-cat companion for Windows.

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

This builds the Vinext/Cloudflare Worker output and verifies the rendered product story, feature films, animated hero, branding, pricing, and responsive breakpoints.

## Deploy with GitHub Actions

The workflow at `.github/workflows/deploy.yml` deploys the site to Cloudflare Workers whenever `main` is updated. It can also be started manually from the repository's **Actions** tab.

Add these GitHub Actions repository secrets before the first deployment:

- `CLOUDFLARE_API_TOKEN` — a Cloudflare API token with Workers Scripts edit permission.
- `CLOUDFLARE_ACCOUNT_ID` — the Cloudflare account ID that should own the Worker.

The workflow installs locked dependencies, runs the full test/build, and deploys the generated Worker and static media together.
