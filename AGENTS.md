# AGENTS.md — Rules for AI coding agents working on bakeacookie (dashboard)

This is the companion web dashboard for `bake`, a CLI dev tool for Cookie Chain
(github.com/DiverseXL/bake, npm package `bakeacookie`, command `bake`). This
repo is **separate** from the CLI codebase — cross-referenced, not merged.
Read this fully before touching design tokens, wallet code, or on-chain data
fetching.

---

## 1. What this is, in one line

A read-mostly dashboard that visualizes the CLI's on-chain "Recipe Book" —
a permanent, public ledger of every `bake deploy`. It is NOT a second deploy
tool. It never signs or sends transactions that mutate program state.

---

## 2. CRITICAL RULES

### 2.1 Never reuse Cookie Chain's actual mascot/character art
Cookie Chain's site (cookiechain.wtf) uses a Cookie-Monster-style mascot —
that's their IP. We inherit their **design system** (chunky neo-brutalism,
navy/sky/cream/gold, the shadow/border language) but use bake's **own**
original character (a developer-coded cookie, still being designed — use
simple geometric cookie iconography as a placeholder until final art
exists, never a full illustrated mascot in the meantime).

### 2.2 No deploy/sign/write actions, ever
This dashboard only ever READS on-chain data and, optionally, connects a
wallet to filter "my programs." It must never construct or send a
transaction that deploys, upgrades, or mutates a program. If a feature
request implies writing to chain from the browser, that's out of scope —
flag it, don't build it. The CLI is the executor; this dashboard is the
viewer/picker (see §4).

### 2.3 Wallet connection is standard Wallet Adapter — NOT Nightly Connect
Use `@solana/wallet-adapter-react` + `@solana/wallet-adapter-react-ui` +
`@solana/wallet-adapter-base`. Nightly is Wallet Standard-compliant and
should auto-detect without a dedicated adapter package. Do NOT use
`@nightlylabs/nightly-connect-*` packages here — those are for the CLI's
QR-based cross-device flow (a different, deprecated-upstream mechanism)
and are irrelevant to a browser wallet-adapter connection.

### 2.4 No shared session/login with the CLI
There is no private-key export, no session bridge, no "login" between the
CLI and this dashboard. They are connected only by reading the same public
on-chain data. A user's CLI wallet and dashboard-connected wallet are the
same identity ONLY if they happen to use the same wallet in both places —
never assume otherwise, never build a mechanism to force them to match.

### 2.5 The IDL is a copy of a hand-verified source — do not regenerate it
`src/idl/recipe_book.json` is copied from the CLI repo's
`src/idl/recipe_book.json`, which was hand-written and live-validated
against the deployed program after Anchor's IDL auto-generation proved
unreliable during CLI development. If the Recipe Book program's on-chain
shape ever changes, update this file by copying the CLI repo's IDL again
(the CLI repo is the source of truth), not by attempting to auto-generate
a fresh one here.

### 2.6 On-chain bytecode verification must reuse the CLI's exact logic
The "live status strip" (does the on-chain program match its Recipe Book
head?) requires comparing on-chain ProgramData bytes against a recorded
hash. This exact computation (skip the ProgramData account's header,
correctly parse the ELF64 header to determine exact binary length, hash
with sha256) was hard-won in the CLI — it went through three real bugs
before landing on the correct approach:

1. Wrong ProgramData header byte count
2. Flawed trailing-zero-stripping heuristic
3. **Incorrectly computing ELF size by iterating section headers and
   taking `max(sh_offset + sh_size)`** — this excluded the section header
   table itself (which lives at the end of the ELF, after all program
   sections), producing a hash mismatch against the CLI's reference hash.
   The fix: use `e_shoff + e_shentsize * e_shnum` instead, which exactly
   accounts for the full ELF binary including the SHT.

Port that exact logic from the CLI's `src/lib/deployPipeline.ts`
(`fetchOnChainBytecodeHash`) — do not reimplement a simpler/shallower
version (e.g. "is the account executable" is NOT the same claim as
"bytecode matches the recorded hash"). The formula must remain
`e_shoff + e_shentsize * e_shnum` — do NOT substitute a section-iteration
heuristic.

---

## 3. Design system (Cookie Chain-inherited, bake-original character)

Concept: "soft neo-brutalism" — playful but credible. Culture first,
product-grade chrome underneath.

### Tokens (CSS custom properties, see globals.css)
```
--bg: #EAF4FB;
--ink: #040E1B;
--navy: #0B1F3A;
--sky: #7EC8F0;
--sky-deep: #5BB8E8;
--cream: #FFF9F0;
--gold: #F5C84B;
--gold-deep: #E8B84A;
--live: #22C55E;
--radius-card: 1.75rem;
--radius-pill: 9999px;
```

### Fonts
- **Bricolage Grotesque** (`next/font/google`) — headlines, weight 600-800,
  tight tracking
- **Inter** — body, nav, stats, UI chrome

### The "chunky card" — core visual signature
Every card, the hero panel, and stat blocks use this recipe:
- cream/white fill
- 3px solid navy border (`rgba(11,31,58,0.9)`)
- hard offset shadow: `0 8px 0 0 rgba(11,31,58,0.78)`
- soft depth shadow: `0 24px 60px rgba(11,31,58,0.18)`
- inset top highlight: `inset 0 3px 0 rgba(255,255,255,0.9)`
- large radius (~28-32px)

Keep this as a single reusable Tailwind utility/component
(`.chunky-card` or a `<ChunkyCard>` component) — don't hand-roll the
shadow stack differently in different places.

### Buttons/nav
- Capsule nav: frosted light blue, navy border, active item filled navy
- Primary CTA: solid navy pill, white text
- Secondary CTA: outlined/cream pill, navy text
- **Gold is reserved for "sweet" actions only** — install command, deploy
  history highlights, featured/buy-style CTAs. Don't use gold decoratively
  elsewhere or it loses meaning.

### Copy voice
Playful headline → one concrete, credible fact immediately after. Mirrors
Cookie Chain's own "joke then substance" rhythm. Don't let the whole page
stay in joke mode — stats and real data are what keep this feeling like a
real dev tool, not just a meme site.

### What NOT to do
- No dark cyberpunk / pure glassmorphism — fights this system entirely
- No decorative charts without real data behind them
- No blog, changelog-as-homepage, token price ticker, or ecosystem gallery
  (explicitly scoped out — see §4)

---

## 4. Locked v1 scope — don't relitigate without the human

### Routes
- `/` — homepage (hero, install CTA, search, why-bake strip)
- `/program/[address]` — timeline of Recipe entries for a program, deploy
  vs rollback badges, live status strip (head-sync check), copy-paste
  `bake` command buttons per entry
- `/wallet/[address]` — programs this wallet has Recipe entries for
  ("My recipes" when the connected wallet matches)

### Must-have (v1)
- Vertical timeline (not a flat table) — deploy vs rollback visually
  distinct, current-head pin, "untracked deploy" warning if on-chain
  bytecode doesn't match any Recipe entry
- Live status strip: one line, e.g. "Live: executable · matches Recipe
  head a1b2c3d · last deploy 2h ago" (or "Untracked" if mismatched) — see
  §2.6 for the required verification logic
- Copy-paste command buttons per timeline entry: `bake rollback --to
  <entry>`, `bake logs --program <id>`, `bake stats <id>`, `bake prove
  <id>` — this dashboard is the picker, the CLI remains the executor
- Public read access, no login required to view anything
- Optional wallet connect unlocks only: "My recipes" filter, and
  (optionally, v1-or-v2) a local-only pinned/watchlist feature
  (localStorage, no backend)
- Search by program or wallet address on the homepage

### Explicitly deferred to v2 — do not build without being asked
- Deploy frequency sparkline
- Field-level diff comparison between two entries
- localStorage watchlist (nice-to-have, not blocking)
- Network-wide recent-deploys feed
- `bake top`-style leaderboard
- Multisig/authority annotations
- IDL-aware account summaries beyond the Recipe Book itself
- Rich analytics (invocation counts, error rates) — that's `bake stats`'s
  job in the CLI; don't rebuild it here

---

## 5. Relationship to the CLI repo

- CLI repo: github.com/DiverseXL/bake (npm: `bakeacookie`, command: `bake`)
- This repo cross-links back to it (README, footer, "why bake" section)
- After a successful `bake deploy`, the CLI prints a deep link to
  `/program/<address>` here — that link must always resolve cleanly, even
  for a program with zero prior Recipe entries (show a "no history yet"
  state, not an error)
- The CLI command `bake dashboard [address]` opens this site directly in
  the browser (live at https://bakeacookie.vercel.app). `bake dashboard`
  (no arg) opens the homepage; `bake dashboard <addr>` opens
  `/program/<addr>`; `--ci` prints the URL instead of launching a browser.
  The base URL is overridable via `BAKE_DASHBOARD_URL` env var

---

## 6. Stack

Next.js (App Router) + TypeScript + Tailwind CSS. Deployed via
Vercel/Netlify (repo root IS the app — no monorepo path config needed,
that's exactly why this is a separate repo from the CLI).