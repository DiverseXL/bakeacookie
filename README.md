# bakeacookie 🍪

> The companion web dashboard for the [bake CLI](https://github.com/DiverseXL/bake).

Every `bake deploy` writes a permanent on-chain entry to the **Recipe Book** Anchor program on Cookie Chain. `bakeacookie` is the public explorer for that history.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.local.example` to `.env.local` and set your RPC:

```bash
cp .env.local.example .env.local
```

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_RPC_URL` | `https://rpc.cookiescan.io` | Solana/Cookie Chain RPC endpoint |
| `NEXT_PUBLIC_RECIPE_BOOK_PROGRAM_ID` | `56Vj61zFW4hHV6wdjnisrHtVwWDqyjixjpBgnoRJvzxL` | Recipe Book program address |

For local validator: set `NEXT_PUBLIC_RPC_URL=http://localhost:8899`

## Tech stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** — design tokens in `globals.css` `@theme` block
- **Solana Wallet Adapter** — standard packages, Wallet Standard auto-detection
- **@coral-xyz/anchor** — IDL types for the Recipe Book program

## Design system

Soft neo-brutalism (Cookie Chain aesthetic):

- **Fonts**: Bricolage Grotesque (headlines) + Inter (body)
- **Chunky cards**: cream fill, 3px navy border, hard offset shadow
- **Pill buttons**: gold (install), navy (primary), cream (secondary)
- **Colors**: navy `#0B1F3A`, sky `#7EC8F0`, gold `#F5C84B`, cream `#FFF9F0`

## Routes

| Route | Status |
|---|---|
| `/` | ✅ Homepage |
| `/program/[address]` | 🚧 Scaffold (data-fetching TBD) |
| `/wallet/[address]` | 🚧 Scaffold (data-fetching TBD) |

## Recipe Book IDL

Located at `lib/idl/recipe_book.json` — copied as-is from the bake CLI repo (hand-verified, do not regenerate). TypeScript types in `lib/types.ts`.

**Program**: `56Vj61zFW4hHV6wdjnisrHtVwWDqyjixjpBgnoRJvzxL`

Accounts:
- `RecipeBook` — one per deployed program (`target_program_id`, `authority`, `entry_count`)
- `Entry` — one per deploy (`repo`, `commit`, `build_hash`, `buffer`, `deployer`, `timestamp`)

## Wallet connection

Nightly, Phantom, Backpack, and any other Wallet Standard-compliant wallet auto-detect without a dedicated adapter. The connect button in the nav shows the truncated address once connected.

## CLI integration

The `bake dashboard` command opens this site in your default browser:

```bash
bake dashboard                            # opens the homepage
bake dashboard <programId>                # opens /program/<programId>
bake dashboard --ci <programId>           # prints URL instead of opening browser
```

After a successful `bake deploy`, the CLI also prints a dashboard link to the deployed program's page. The base URL is overridable via `BAKE_DASHBOARD_URL` env var.
