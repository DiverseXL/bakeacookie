import React from "react";
import type { Metadata } from "next";
import CookieParticles from "@/components/CookieParticles";
import CopyInstall from "@/components/CopyInstall";
import CommandShowcase from "@/components/CommandShowcase";

export const metadata: Metadata = {
  title: "bakeacookie — The Vercel CLI for Cookie Chain",
  description:
    "bake is the deploy CLI for Cookie Chain. Every deploy leaves a permanent, on-chain history in the Recipe Book. Rollbacks, logs, and MCP tools included.",
};

/* ─────────────────────────────────────────────────────────────────
   Feature cards data
   Each card gets: an icon (small inline SVG), headline, body copy,
   and an optional code snippet.
───────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    id: "feat-history",
    icon: <ChainIcon />,
    eyebrow: "On-chain deploy history",
    headline: "Every deploy, permanently recorded",
    body: (
      <>
        Every{" "}
        <code className="rounded bg-navy/10 px-1 py-0.5 font-mono text-xs text-navy">
          bake deploy
        </code>{" "}
        writes a permanent entry to an on-chain{" "}
        <strong>Recipe Book</strong> — commit SHA, build hash, deployer
        address, timestamp. Nothing else in the Cookie Chain ecosystem does
        this. No database, no server, no trust required.
      </>
    ),
  },
  {
    id: "feat-windows",
    icon: <WindowsIcon />,
    eyebrow: "Windows-native by design",
    headline: "Works on Windows. Actually works.",
    body: (
      <>
        Solana's build toolchain barely runs on native Windows — even the
        official Anchor CLI requires WSL. bake auto-detects Windows and
        transparently relays build and deploy commands through WSL, so you just
        run{" "}
        <code className="rounded bg-navy/10 px-1 py-0.5 font-mono text-xs text-navy">
          bake deploy
        </code>{" "}
        in plain PowerShell. No extra setup.
      </>
    ),
  },
  {
    id: "feat-mcp",
    icon: <AgentIcon />,
    eyebrow: "Built for AI agents",
    headline: "Agent-native from day one",
    body: (
      <>
        <code className="rounded bg-navy/10 px-1 py-0.5 font-mono text-xs text-navy">
          bake mcp
        </code>{" "}
        exposes deploy, rollback, logs, and stats as tools any MCP-compatible
        AI assistant can call. Write access is{" "}
        <strong>completely invisible to an agent</strong> unless you explicitly
        enable it via policy — safe to give to any coding agent.
      </>
    ),
  },
  {
    id: "feat-fork",
    icon: <ForkIcon />,
    eyebrow: "Local mainnet rehearsals",
    headline: "Fork Solana mainnet, for pennies",
    body: (
      <>
        <code className="rounded bg-navy/10 px-1 py-0.5 font-mono text-xs text-navy">
          bake fork {"<program>"}
        </code>{" "}
        clones a real Solana mainnet program and its account state into a
        local Cookie Chain sandbox. Test risky upgrades against real data
        without touching mainnet or paying real fees.
      </>
    ),
  },
] as const;

/* ─────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="flex flex-col items-center gap-16 sm:gap-24 pb-16 sm:pb-28">

      {/* ══════════════════════════════════════════════════════════
          HERO — full-bleed sky panel, centered max-w-6xl container,
          2-col card at lg+ (text | cookie mosaic)
      ══════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        aria-labelledby="hero-headline"
        className="relative w-full overflow-hidden border-y-[3px] border-navy"
        style={{ background: "linear-gradient(155deg, #7ec8f0 0%, #5bb8e8 100%)" }}
      >
        {/* Blueprint grid overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(11,31,58,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(11,31,58,0.05) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <CookieParticles />

        {/* Soft cream glow behind the card */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[90%] w-[85%] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"
          style={{ background: "rgba(255,249,240,0.5)" }}
        />

        {/* Inner container — always centered */}
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-10 sm:px-8 sm:py-16 lg:py-24">

          {/* Badge — own line, clearly above card */}
          <div className="mb-5 flex justify-center lg:justify-start">
            <span
              className="inline-flex items-center gap-2 rounded-pill border-[2.5px] border-navy bg-sky px-4 py-1.5 font-body text-xs font-bold tracking-wide text-navy"
              style={{ boxShadow: "0 2px 0 0 rgba(11,31,58,0.55)" }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-navy" />
              Now on Cookie Chain mainnet
            </span>
          </div>

          {/* Hero card — 2 cols at lg+ */}
          <div
            id="hero-card"
            className="card-chunky grid w-full grid-cols-1 overflow-hidden lg:grid-cols-[1fr_300px]"
          >
            {/* LEFT: text */}
            <div className="flex flex-col gap-5 sm:gap-6 px-5 py-8 sm:px-8 sm:py-11 lg:px-12 lg:py-12">
              <h1
                id="hero-headline"
                className="font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.035em] text-navy sm:text-[2.6rem] sm:leading-[1.02] lg:text-5xl xl:text-6xl"
              >
                Ship on Cookie Chain.{" "}
                <br className="hidden sm:block" />
                <span style={{ color: "#5bb8e8" }}>Never lose the recipe.</span>
              </h1>

              <p className="max-w-lg font-body text-base leading-relaxed text-navy/80 sm:text-lg">
                <strong>bake</strong> is the deploy CLI for Cookie Chain. Every{" "}
                <code className="rounded bg-navy/10 px-1.5 py-0.5 font-mono text-sm text-navy">
                  bake deploy
                </code>{" "}
                writes a permanent, on-chain entry to the{" "}
                <strong>Recipe Book</strong> — commit, build hash, deployer,
                timestamp. Rollbacks cost cents.
              </p>

              {/* Gold install CTA */}
              <div className="max-w-full">
                <CopyInstall />
              </div>

              {/* Hint line */}
              <p className="font-body text-xs sm:text-sm text-navy/65 leading-relaxed">
                Then:{" "}
                <code className="rounded bg-navy/10 px-1 sm:px-1.5 py-0.5 font-mono text-[11px] sm:text-xs text-navy">bake deploy</code>
                {" · "}
                <code className="rounded bg-navy/10 px-1 sm:px-1.5 py-0.5 font-mono text-[11px] sm:text-xs text-navy">bake rollback</code>
                {" · "}
                <code className="rounded bg-navy/10 px-1 sm:px-1.5 py-0.5 font-mono text-[11px] sm:text-xs text-navy">bake logs</code>
              </p>

              <div className="pt-1">
                <a
                  href="https://github.com/DiverseXL/bake"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="github-cta"
                  className="btn-cream text-sm"
                >
                  <GitHubIcon />
                  GitHub
                </a>
              </div>
            </div>

            {/* RIGHT: cookie mosaic — fills the visual void at desktop */}
            <div
              className="relative hidden flex-col items-center justify-center lg:flex"
              style={{
                background:
                  "linear-gradient(180deg, rgba(11,31,58,0.04) 0%, rgba(11,31,58,0.09) 100%)",
                borderLeft: "3px solid rgba(11,31,58,0.12)",
              }}
              aria-hidden="true"
            >
              <CookieMosaic />
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] font-semibold tracking-widest text-navy/35">
                EVERY DEPLOY, RECORDED
              </span>
            </div>
          </div>

          {/* Program address — subtle, below card */}
          <div className="mt-4 flex justify-center px-4">
            <span className="font-body text-[11px] sm:text-xs text-navy/50 text-center break-all">
              Recipe Book:{" "}
              <code className="font-mono text-[11px] sm:text-xs text-navy/60">
                56Vj61zFW4hHV6wdjnisrHtVwWDqyjixjpBgnoRJvzxL
              </code>
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURE HIGHLIGHTS — 4 chunky cards, 2×2 grid at md+
      ══════════════════════════════════════════════════════════ */}
      <section
        id="features"
        aria-labelledby="features-heading"
        className="w-full max-w-6xl px-4 sm:px-5"
      >
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          <h2
            id="features-heading"
            className="font-display text-3xl font-extrabold tracking-[-0.03em] text-navy sm:text-4xl"
          >
            What makes bake different
          </h2>
          <p className="max-w-xl font-body text-base text-ink/60">
            Not just a deploy wrapper. A permanent, verifiable, agent-ready
            deployment pipeline for Cookie Chain.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {FEATURES.map((f) => (
            <article
              key={f.id}
              id={f.id}
              className="card-chunky flex flex-col gap-4 p-5 sm:p-8 lg:p-10"
            >
              {/* Icon + eyebrow row */}
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-navy/20 bg-sky/20"
                >
                  {f.icon}
                </div>
                <span className="font-body text-xs font-bold uppercase tracking-widest text-navy/50">
                  {f.eyebrow}
                </span>
              </div>

              {/* Headline */}
              <h3 className="font-display text-xl font-bold leading-snug tracking-tight text-navy sm:text-2xl">
                {f.headline}
              </h3>

              {/* Body */}
              <p className="font-body text-sm leading-relaxed text-ink/75 sm:text-base">
                {f.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          COMMAND SHOWCASE — animated terminal, single window
      ══════════════════════════════════════════════════════════ */}
      <CommandShowcase />

      {/* ══════════════════════════════════════════════════════════
          STATS STRIP — 3 cards
      ══════════════════════════════════════════════════════════ */}
      <section
        id="stats-strip"
        aria-label="Key stats"
        className="w-full max-w-6xl px-4 sm:px-5"
      >
        {/* Divider label */}
        <div className="mb-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-navy/10" />
          <span className="font-body text-xs font-bold uppercase tracking-widest text-navy/35">
            By the numbers
          </span>
          <div className="h-px flex-1 bg-navy/10" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            { value: "1", label: "Recipe Book program", sublabel: "56Vj61z…vzxL" },
            { value: "<1s", label: "Avg deploy time", sublabel: "local validator" },
            { value: "∞", label: "History retention", sublabel: "on-chain, permanent" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card-chunky flex flex-col gap-1 px-5 py-5 sm:px-8 sm:py-7"
            >
              <span className="font-display text-4xl font-extrabold leading-none text-navy">
                {stat.value}
              </span>
              <span className="font-display text-sm font-semibold text-navy">
                {stat.label}
              </span>
              <span className="mt-0.5 font-body text-xs text-ink/45">
                {stat.sublabel}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}


function CookieMosaic() {
  const COOKIES: Array<{ size: number; opacity: number; rotate: number }> = [
    { size: 52, opacity: 0.9, rotate: -8 },
    { size: 38, opacity: 0.6, rotate: 12 },
    { size: 60, opacity: 0.8, rotate: 3 },
    { size: 44, opacity: 0.7, rotate: -15 },
    { size: 36, opacity: 0.5, rotate: 20 },
    { size: 56, opacity: 0.85, rotate: -5 },
    { size: 48, opacity: 0.65, rotate: 8 },
    { size: 40, opacity: 0.55, rotate: -18 },
    { size: 64, opacity: 0.9, rotate: 2 },
    { size: 42, opacity: 0.6, rotate: -10 },
    { size: 50, opacity: 0.75, rotate: 15 },
    { size: 36, opacity: 0.5, rotate: -4 },
  ];
  return (
    <div className="grid grid-cols-3 gap-4 p-10">
      {COOKIES.map((c, i) => (
        <div
          key={i}
          style={{ opacity: c.opacity, transform: `rotate(${c.rotate}deg)` }}
          className="flex items-center justify-center"
        >
          <MiniCookie size={c.size} />
        </div>
      ))}
    </div>
  );
}

function MiniCookie({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#0B1F3A" />
      <circle cx="32" cy="32" r="27" fill="#E8B84A" />
      <ellipse cx="24" cy="22" rx="7" ry="5" fill="#F5C84B" opacity="0.55" transform="rotate(-20 24 22)" />
      <ellipse cx="20" cy="26" rx="4" ry="3.5" fill="#3D1C02" transform="rotate(-15 20 26)" />
      <ellipse cx="38" cy="22" rx="3.5" ry="3" fill="#3D1C02" transform="rotate(10 38 22)" />
      <ellipse cx="30" cy="38" rx="4" ry="3.5" fill="#3D1C02" transform="rotate(-5 30 38)" />
      <ellipse cx="44" cy="36" rx="3" ry="2.5" fill="#3D1C02" transform="rotate(20 44 36)" />
      <ellipse cx="18" cy="41" rx="3" ry="2.5" fill="#3D1C02" transform="rotate(-10 18 41)" />
      <circle cx="32" cy="32" r="27" stroke="#C89830" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.4" />
    </svg>
  );
}

/* ─── Feature card icons ─── */
function ChainIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B1F3A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function WindowsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0B1F3A" aria-hidden="true">
      <path d="M3 5.557 9.875 4.5v6.875H3V5.557zM3 18.443 9.875 19.5v-6.875H3v5.918zM10.625 4.375 21 2.75V11.375H10.625V4.375zM10.625 12.625H21v8.625L10.625 19.625v-7z" />
    </svg>
  );
}

function AgentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B1F3A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1" fill="#0B1F3A" />
    </svg>
  );
}

function ForkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B1F3A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M13 6h3a2 2 0 0 1 2 2v7" />
      <path d="M6 9v12" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
