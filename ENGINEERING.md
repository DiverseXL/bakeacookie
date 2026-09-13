# ENGINEERING.md — bakeacookie Dashboard

> **Single source of truth** for anyone (human or AI) working on this codebase.
> Read this before writing code, fixing bugs, or adding features.

---

## Table of Contents

1. [What This Project Is](#1-what-this-project-is)
2. [Relationship to the CLI](#2-relationship-to-the-cli)
3. [Tech Stack](#3-tech-stack)
4. [Project Structure](#4-project-structure)
5. [Design System](#5-design-system)
6. [On-Chain Data Model](#6-on-chain-data-model)
7. [Wallet Integration](#7-wallet-integration)
8. [Routes & Pages](#8-routes--pages)
9. [Key Components](#9-key-components)
10. [Environment Variables](#10-environment-variables)
11. [Build & Run](#11-build--run)
12. [Hard Rules](#12-hard-rules)
13. [Current Status & What's Built](#13-current-status--whats-built)
14. [V1 Scope (Locked)](#14-v1-scope-locked)
15. [V2 Backlog (Do Not Build Without Asking)](#15-v2-backlog-do-not-build-without-asking)
16. [Common Tasks](#16-common-tasks)
17. [Gotchas & Known Issues](#17-gotchas--known-issues)

---

## 1. What This Project Is

**bakeacookie** is the **companion web dashboard** for the `bake` CLI — a deploy tool for [Cookie Chain](https://cookiechain.wtf), a Solana fork.

It is a **read-mostly explorer** for the on-chain **Recipe Book** — a permanent, public ledger of every `bake deploy`. It visualizes deploy history, rollbacks, and bytecode verification status for any program deployed via `bake`.

**It is NOT:**
- A second deploy tool
- A wallet-connected signer
- A backend/server app (it's a static Next.js site)
- A Cookie Chain "frontend" (Cookie Chain has its own site)

---

## 2. Relationship to the CLI

| | CLI (`bake`) | Dashboard (`bakeacookie`) |
|---|---|---|
| **Repo** | [github.com/DiverseXL/bake](https://github.com/DiverseXL/bake) | This repo |
| **npm** | `bakeacookie` (command: `bake`) | `bakeacookie` (web app) |
| **What it does** | Builds, deploys, registers on-chain, rolls back | **Reads** on-chain data, displays it |
| **Wallet** | Signs transactions | Read-only (or connects wallet for "my recipes" filter) |
| **Data source** | Writes to Recipe Book | Reads from Recipe Book |

After `bake deploy`, the CLI prints a deep link to `/program/<address>` on this dashboard. That link must always resolve — even for a program with zero prior entries (show "no history yet", not an error).

---

## 3. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | v4 (theme in `globals.css` `@theme`) |
| Fonts | Bricolage Grotesque + Inter + JetBrains Mono | `next/font/google` |
| Solana | `@solana/web3.js` | 1.x |
| Anchor | `@coral-xyz/anchor` | 0.32.x |
| Wallet | `@solana/wallet-adapter-react` + `@solana/wallet-adapter-react-ui` | Latest |

**No backend, no database, no API routes.** This is a static client-side app that reads from a public Solana RPC endpoint.

---

## 4. Project Structure

```
bakeacookie/
├── app/
│   ├── layout.tsx              # Root layout — fonts, Nav, wallet provider, footer
│   ├── page.tsx                # Homepage — hero, features, command showcase, stats
│   ├── globals.css             # Tailwind v4 theme, design tokens, utility classes
│   ├── program/[address]/
│   │   └── page.tsx            # Program detail page (scaffold — data-fetching TBD)
│   └── wallet/[address]/
│       └── page.tsx            # Wallet detail page (scaffold — data-fetching TBD)
├── components/
│   ├── Nav.tsx                 # Sticky capsule nav — wordmark, GitHub, wallet button
│   ├── TerminalWindow.tsx      # Animated light-themed terminal (sequential playback)
│   ├── CommandShowcase.tsx     # Section wrapper for the terminal component
│   ├── CopyInstall.tsx         # Gold pill with copy-to-clipboard install command
│   ├── SearchBar.tsx           # Address search (program or wallet)
│   ├── CookieParticles.tsx     # Floating cookie SVGs in hero background
│   ├── WhyBake.tsx             # "Why bake?" section (3 feature cards)
│   └── providers/
│       └── WalletProvider.tsx  # Solana wallet adapter context provider
├── lib/
│   ├── types.ts                # TypeScript types derived from the Recipe Book IDL
│   └── idl/
│       └── recipe_book.json    # Hand-verified IDL (copied from CLI repo — do NOT regenerate)
├── AGENTS.md                   # AI agent rules (design system, hard constraints)
├── ENGINEERING.md              # This file
├── README.md                   # Project overview
├── next.config.ts              # Webpack config for Solana browser compatibility
├── tailwind.config.ts          # Tailwind v3 config (legacy — tokens are in globals.css)
├── package.json
└── tsconfig.json
```

---

## 5. Design System

### Visual Identity: "Soft Neo-Brutalism"

Playful but credible. Cookie Chain's design DNA (chunky borders, hard shadows, navy/sky/cream/gold palette) but with bake's own geometric cookie iconography — never Cookie Chain's mascot (that's their IP).

### Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#EAF4FB` | Page background |
| `--ink` | `#040E1B` | Primary text |
| `--navy` | `#0B1F3A` | Borders, shadows, dark UI |
| `--sky` | `#7EC8F0` | Hero gradient, light accents |
| `--sky-deep` | `#5BB8E8` | Hero highlight, links |
| `--cream` | `#FFF9F0` | Card fills, secondary surfaces |
| `--gold` | `#F5C84B` | "Sweet" CTAs only (install, featured) |
| `--gold-deep` | `#E8B84A` | Gold hover states |
| `--live` | `#22C55E` | Success indicators |

### Fonts

| Font | Variable | Usage |
|---|---|---|
| Bricolage Grotesque | `--font-bricolage` | Headlines (600-800 weight) |
| Inter | `--font-inter` | Body, nav, stats, UI |
| JetBrains Mono | `--font-mono` | Code, terminal output |

### The Chunky Card (`.card-chunky`)

The core visual signature — used for every card, hero panel, stat block:

```css
background: #FFF9F0;
border: 3px solid rgba(11, 31, 58, 0.9);
border-radius: 1.75rem;
box-shadow:
  0 8px 0 0 rgba(11, 31, 58, 0.78),    /* hard offset */
  0 24px 60px rgba(11, 31, 58, 0.18),   /* soft depth */
  inset 0 3px 0 rgba(255, 255, 255, 0.9); /* top highlight */
```

**Never hand-roll this stack.** Use `.card-chunky` or the smaller `.card-chunky-sm` variant.

### Button Variants

| Class | Look | Use For |
|---|---|---|
| `.btn-gold` | Gold fill, navy text | Install command, featured CTAs only |
| `.btn-navy` | Navy fill, white text | Primary actions (Explore, etc.) |
| `.btn-cream` | Cream fill, navy outline | Secondary actions (GitHub, etc.) |

**Gold is reserved for "sweet" actions.** Don't use it decoratively — it loses meaning.

### Copy Voice

Playful headline → one concrete fact immediately after. "Joke then substance." Never pure meme — stats and real data keep it feeling like a real dev tool.

---

## 6. On-Chain Data Model

### Program Address

```
56Vj61zFW4hHV6wdjnisrHtVwWDqyjixjpBgnoRJvzxL
```

### Accounts (from IDL)

#### RecipeBook (one per deployed program)

| Field | Type | Seeds | Description |
|---|---|---|---|
| `target_program_id` | `pubkey` | `["recipe_book", target_program_id]` | The program this tracks |
| `authority` | `pubkey` | — | Who initialized it |
| `entry_count` | `u64` | — | Total deploy entries |
| `bump` | `u8` | — | PDA bump |

#### Entry (one per deploy)

| Field | Type | Seeds | Description |
|---|---|---|---|
| `recipe_book` | `pubkey` | `["entry", recipe_book, index]` | Parent RecipeBook |
| `index` | `u64` | — | 0-indexed deploy number |
| `repo` | `string` | — | Git remote URL or short name |
| `commit` | `string` | — | Git commit SHA |
| `build_hash` | `[u8; 32]` | — | SHA-256 of compiled `.so` |
| `buffer` | `pubkey` | — | Buffer program account |
| `deployer` | `pubkey` | — | Wallet that deployed |
| `timestamp` | `i64` | — | Unix timestamp of deploy |
| `bump` | `u8` | — | PDA bump |

### PDA Derivation (in `lib/types.ts`)

```typescript
// RecipeBook PDA
findRecipeBookPDA(targetProgramId, RECIPE_BOOK_PROGRAM_ID)
// Seeds: ["recipe_book", target_program_id.toBuffer()]

// Entry PDA
findEntryPDA(recipeBookPubkey, index, RECIPE_BOOK_PROGRAM_ID)
// Seeds: ["entry", recipe_book.toBuffer(), index.toBigUint64LE()]
```

### IDL Location

`lib/idl/recipe_book.json` — **copied as-is from the CLI repo**. Hand-verified against the deployed program. Do NOT auto-generate a replacement. If the on-chain program changes, copy the updated IDL from the CLI repo.

---

## 7. Wallet Integration

### Packages Used

- `@solana/wallet-adapter-react` — core wallet context
- `@solana/wallet-adapter-react-ui` — modal UI
- `@solana/wallet-adapter-base` — base types

### What's NOT Used

- `@nightlylabs/nightly-connect-*` — those are for the CLI's QR-based cross-device flow, irrelevant here
- No custom wallet adapters — Wallet Standard auto-detects Nightly, Phantom, Backpack, etc.

### Provider Setup (`components/providers/WalletProvider.tsx`)

```typescript
// RPC endpoint
const endpoint = process.env.NEXT_PUBLIC_RPC_URL ?? "https://rpc.cookiescan.io";

// Empty wallets array — Wallet Standard handles auto-detection
const wallets = useMemo(() => [], []);
```

### What Wallet Connect Enables

- "My recipes" filter (when connected wallet matches deployer)
- Nothing else — **no transactions are ever signed from the browser**

---

## 8. Routes & Pages

| Route | Status | Description |
|---|---|---|
| `/` | ✅ **Complete** | Hero, feature grid, animated command showcase, stats strip |
| `/program/[address]` | 🚧 **Scaffold** | Address card, explorer links, skeleton rows (data-fetching TBD) |
| `/wallet/[address]` | 🚧 **Scaffold** | Address card, explorer links, skeleton rows (data-fetching TBD) |

### Homepage Sections (top to bottom)

1. **Hero** — sky gradient, headline ("Ship on Cookie Chain. Never lose the recipe."), install CTA, search bar, GitHub link, cookie mosaic
2. **Features** — 4 chunky cards (on-chain history, Windows-native, AI agents, fork mainnet)
3. **Command Showcase** — animated terminal showing real `bake deploy` / `bake rollback` / `bake prove` output
4. **Stats Strip** — 3 stat cards (Recipe Book program, avg deploy time, history retention)

### Program Page Sections

1. Breadcrumb navigation
2. Address card with program address + Solana Explorer / CookieScan links
3. Deploy History (skeleton loading state)
4. Construction notice (data-fetching coming next sprint)

### Wallet Page Sections

1. Breadcrumb navigation
2. Address card with wallet address + Solana Explorer / CookieScan links
3. Deployments by this wallet (skeleton loading state)
4. Construction notice (filtering by deployer coming next sprint)

---

## 9. Key Components

### TerminalWindow (`components/TerminalWindow.tsx`)

**"use client"** — animated, single large terminal with light theme.

- **Light theme**: `#F4F4F0` background (distinct from cream chunky cards)
- **Dark text**: `#1E293B` charcoal
- **Gold prompts**: `#B8860B` (`$ bake deploy`)
- **Green success**: `#16A34A` (✔ checkmarks)
- **Blue accents**: `#1D4ED8` (program IDs)
- **Gray muted**: `#6B7280` (secondary info)

Animation behavior:
1. Shows DEPLOY output line-by-line (120ms stagger)
2. Pauses 2.5s with blinking cursor
3. Fades out (300ms), switches to ROLLBACK output
4. Same for VERIFY
5. Loops indefinitely

**`prefers-reduced-motion`**: Shows static first command, no animation.

Tab row (DEPLOY / ROLLBACK / VERIFY) above terminal shows which is active.

### CommandShowcase (`components/CommandShowcase.tsx`)

Wraps TerminalWindow with section header ("See it in action") and footer caption.

### CopyInstall (`components/CopyInstall.tsx`)

Gold pill showing `npm install -g bakeacookie` with clipboard copy button. Falls back to text selection if clipboard API fails.

### SearchBar (`components/SearchBar.tsx`)

Client component. Validates base58 addresses (32-44 chars), routes to `/program/[address]`. Placeholder: "Paste a program or wallet address…"

### Nav (`components/Nav.tsx`)

Sticky capsule nav with frosted glass effect. Wordmark (home link), GitHub pill, wallet connect button.

### CookieParticles (`components/CookieParticles.tsx`)

Floating geometric cookie SVGs in the hero background. Purely decorative, `pointer-events: none`.

### WalletProvider (`components/providers/WalletProvider.tsx`)

Wraps the app in Solana wallet adapter context. RPC defaults to `https://rpc.cookiescan.io`, overridable via `NEXT_PUBLIC_RPC_URL`.

---

## 10. Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_RPC_URL` | `https://rpc.cookiescan.io` | Solana/Cookie Chain RPC endpoint |
| `NEXT_PUBLIC_RECIPE_BOOK_PROGRAM_ID` | `56Vj61zFW4hHV6wdjnisrHtVwWDqyjixjpBgnoRJvzxL` | Recipe Book program address |

For local development:
```bash
NEXT_PUBLIC_RPC_URL=http://localhost:8899
```

---

## 11. Build & Run

```bash
# Install dependencies
npm install

# Development (uses --webpack flag for Solana browser compatibility)
npm run dev

# Production build (uses --webpack flag)
npx next build --webpack

# Type-check only
npx tsc --noEmit
```

### Important Build Note

Next.js 16 defaults to Turbopack, but this project uses webpack-specific `resolve.fallback` config for Solana browser compatibility. Always use `--webpack` flag with `next dev` or `next build`. The `package.json` dev script already includes `--webpack`.

---

## 12. Hard Rules

### 12.1 No Deploy/Sign/Write Actions — Ever

This dashboard **only reads** on-chain data. It never constructs or sends transactions. If a feature request implies writing to chain from the browser, **flag it, don't build it**.

### 12.2 Never Reuse Cookie Chain's Mascot

Cookie Chain's Cookie-Monster mascot is their IP. We use **geometric cookie iconography** (SVG cookies in `CookieParticles.tsx` and `CookieMosaic`) as a placeholder until bake's own character art exists.

### 12.3 No Shared Session with CLI

No private-key export, no session bridge, no "login." The CLI and dashboard are connected only by reading the same public on-chain data.

### 12.4 IDL Is Source-of-Truth from CLI

`lib/idl/recipe_book.json` is copied from the CLI repo. Do NOT auto-generate. If the on-chain program changes, copy the updated IDL from the CLI repo.

### 12.5 Bytecode Verification Must Use CLI's Exact Logic

The live status strip comparing on-chain bytecode to Recipe Book entries requires the **exact** computation from the CLI's `fetchOnChainBytecodeHash` — skip ProgramData header, parse ELF64 header, hash with sha256. Do not reimplement a simpler version.

### 12.6 Gold = "Sweet" Actions Only

Gold buttons/accents are reserved for the install command, deploy history highlights, and featured CTAs. Don't use gold decoratively elsewhere.

---

## 13. Current Status & What's Built

### ✅ Complete

- **Homepage**: Hero with gradient, search bar, install CTA, cookie particles, feature grid, animated terminal showcase, stats strip
- **Design system**: Full Tailwind v4 theme with chunky card, button variants, fonts
- **Wallet connection**: Standard adapter integration, auto-detect, modal
- **Terminal animation**: Single light-themed terminal with sequential playback, prefers-reduced-motion support
- **Navigation**: Sticky capsule nav with wordmark, GitHub, wallet button
- **Footer**: Brand, CLI link, Recipe Book address

### 🚧 Scaffolded (Layout Only, No Data-Fetching)

- **`/program/[address]`**: Address card, explorer links, skeleton rows, construction notice
- **`/wallet/[address]`**: Address card, explorer links, skeleton rows, construction notice

### ❌ Not Built

- On-chain data fetching (getProgramAccounts, etc.)
- Timeline visualization (deploy vs rollback badges, current-head pin)
- Live status strip (bytecode verification)
- Copy-paste command buttons per entry
- "My recipes" wallet-based filtering
- Search routing to wallet page (currently always routes to program page)

---

## 14. V1 Scope (Locked)

### Must-Have

- Vertical timeline (not flat table) — deploy vs rollback visually distinct
- Current-head pin on latest matching entry
- "Untracked deploy" warning if on-chain bytecode doesn't match any entry
- Live status strip: "Live: executable · matches Recipe head a1b2c3d · last deploy 2h ago"
- Copy-paste commands: `bake rollback --to <entry>`, `bake logs --program <id>`, `bake stats <id>`, `bake prove <id>`
- Public read access, no login required
- Optional wallet connect: "My recipes" filter only

### Explicitly Deferred to V2

- Deploy frequency sparkline
- Field-level diff between two entries
- localStorage watchlist
- Network-wide recent-deploys feed
- `bake top` leaderboard
- Multisig/authority annotations
- IDL-aware account summaries
- Rich analytics (invocation counts, error rates) — that's `bake stats` in the CLI

---

## 15. V2 Backlog (Do Not Build Without Asking)

- Deploy frequency sparkline
- Field-level diff comparison between two entries
- localStorage watchlist (nice-to-have, not blocking)
- Network-wide recent-deploys feed
- `bake top`-style leaderboard
- Multisig/authority annotations
- IDL-aware account summaries beyond the Recipe Book
- Rich analytics (invocation counts, error rates)

---

## 16. Common Tasks

### Adding a New Section to Homepage

1. Define data (if static) at the top of `app/page.tsx`
2. Add the section JSX after the last section (follow the `═══` comment pattern)
3. Use `.card-chunky` for cards, `.btn-navy` / `.btn-cream` for buttons
4. Follow the copy voice: playful headline → concrete fact

### Adding a New Route

1. Create `app/[route]/[param]/page.tsx`
2. Export `generateMetadata` for dynamic titles
3. Use `params: Promise<{ param: string }>` (Next.js 16 async params)
4. Follow the existing scaffold pattern: breadcrumb → address card → content → construction notice

### Modifying the Terminal Animation

Edit `components/TerminalWindow.tsx`:
- `LINE_STAGGER` (120ms) — delay between lines
- `PAUSE_AFTER` (2500ms) — hold time after all lines shown
- `CLEAR_DURATION` (300ms) — fade-out duration
- `COMMANDS` array — add/modify command sequences
- Colors in `LIGHT_COLORS` — adjust for contrast on light background

### Adding a New Feature Card

Edit the `FEATURES` array in `app/page.tsx`:
```typescript
{
  id: "feat-new",
  icon: <NewIcon />,
  eyebrow: "Short label",
  headline: "Punchy title",
  body: <>Description with <code>inline code</code> and <strong>emphasis</strong></>,
}
```

---

## 17. Gotchas & Known Issues

### Turbopack vs Webpack

Next.js 16 defaults to Turbopack, but this project needs webpack for Solana's Node.js built-in polyfills (`fs`, `os`, `path`, `crypto`, `stream`, `buffer`). Always use `--webpack` flag. The dev script in `package.json` already includes it.

### Tailwind v4 + v3 Config Coexistence

The project uses Tailwind v4 with `@theme` in `globals.css` for design tokens, but still has a `tailwind.config.ts` (v3 style) for content paths. Both coexist — the `@theme` block takes precedence for tokens.

### program/[address] Page Routes to Explorer with `?cluster=devnet`

The scaffold pages link to Solana Explorer with `?cluster=devnet`. When moving to mainnet, update these to `?cluster=mainnet` or remove the cluster param (defaults to mainnet).

### No `tmp-verify.mjs` in Source

There's a `tmp-verify.mjs` file in the project root — it's a one-off verification script, not part of the app. Safe to ignore.

### Wallet Button Styling

The wallet adapter button has extensive CSS overrides in `globals.css` (`.wallet-adapter-button`, `.wallet-adapter-modal-wrapper`). These override the default wallet-adapter styles to match the chunky design system. If wallet UI looks broken, check these overrides first.

---

## Quick Reference Card

```
Program ID:     56Vj61zFW4hHV6wdjnisrHtVwWDqyjixjpBgnoRJvzxL
RPC:            https://rpc.cookiescan.io
CLI:            github.com/DiverseXL/bake
npm:            npmjs.com/package/bakeacookie
Command:        bake deploy / bake rollback / bake prove
Network:        Cookie Chain mainnet
```
