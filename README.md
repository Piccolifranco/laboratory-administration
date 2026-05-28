# Laboratory Administration

Next.js + Supabase app for tracking patients and generating PDF medical reports for a pathology clinic.

## Requirements

- Node.js ≥22.0.0
- pnpm — installed automatically via corepack on first use (no global install needed)

## Getting started

Enable corepack once per machine (run a PowerShell as Administrator on Windows the first time):

```bash
corepack enable
```

Install dependencies:

```bash
pnpm install
```

Run the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command       | What it does                           |
| ------------- | -------------------------------------- |
| `pnpm dev`    | Start the Next.js dev server           |
| `pnpm build`  | Build the production bundle            |
| `pnpm start`  | Run the production build               |
| `pnpm lint`   | Run ESLint                             |
| `pnpm audit`  | Check dependencies for vulnerabilities |

## Deploy

Deployed on Vercel. The Vercel project auto-detects pnpm via the `pnpm-lock.yaml` and `packageManager` field in `package.json`.

- `master` is the production branch.
- `development` is the integration branch; PRs land here first, then promote to `master` at release points.