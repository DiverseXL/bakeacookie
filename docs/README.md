# bake Documentation

Documentation site for [bake](https://github.com/DiverseXL/bake) — the Vercel CLI for Cookie Chain.

## Tech stack

- **Framework:** Next.js (App Router)
- **Docs:** Fumadocs (MDX)
- **Theme:** Dark-first
- **Search:** Local full-text (Ctrl+K)

## Setup

```bash
cd docs
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

```
docs/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Redirects to /docs
│   └── docs/
│       ├── layout.tsx          # Docs layout with sidebar
│       └── [[...slug]]/page.tsx # Dynamic docs pages
├── content/
│   └── docs/
│       ├── get-started/        # Welcome, Install, Quickstart, etc.
│       ├── guides/             # Deploy, Rollback, Prove, MCP, etc.
│       ├── recipe-book/        # On-chain data model
│       ├── reference/          # Commands, Config, Env vars
│       ├── troubleshooting/    # Known failure signatures
│       └── about/              # Why bake, Security, Changelog
├── lib/
│   └── source.ts               # Fumadocs source config
└── source.config.ts            # MDX source definition
```

## Writing docs

Content lives in `content/docs/` as MDX files. Each section has a `meta.json` for sidebar ordering.

### Frontmatter

```mdx
---
title: Page Title
description: Short description.
---

## Content here
```

### Callouts

```mdx
<callout type="warning">
Important warning text.
</callout>

<callout type="info">
Informational text.
</callout>
```

## Build

```bash
npm run build
```

Output goes to `.next/` — deployable to Vercel, Netlify, or any static host.
