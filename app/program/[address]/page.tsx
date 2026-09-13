import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

interface Props {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  const short = `${address.slice(0, 6)}…${address.slice(-4)}`;
  return {
    title: `Program ${short} — bakeacookie`,
    description: `On-chain Recipe Book deploy history for program ${address}`,
  };
}

export default async function ProgramPage({ params }: Props) {
  const { address } = await params;
  const short = `${address.slice(0, 6)}…${address.slice(-4)}`;

  return (
    <div className="flex flex-col items-center gap-10 px-4 py-16 max-w-4xl mx-auto">

      {/* Breadcrumb */}
      <nav className="w-full flex items-center gap-2 text-sm font-body text-ink/50" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-navy transition-colors">Home</Link>
        <span>/</span>
        <span className="text-navy font-semibold">Program</span>
        <span>/</span>
        <code className="font-mono text-xs">{short}</code>
      </nav>

      {/* Address card */}
      <section id="program-address-card" className="card-chunky w-full px-8 py-8 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label="program">📦</span>
          <div>
            <p className="font-body text-xs text-ink/50 font-medium uppercase tracking-widest mb-0.5">Program address</p>
            <h1 className="font-display font-bold text-xl text-navy break-all">{address}</h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href={`https://explorer.solana.com/address/${address}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            id="solana-explorer-link"
            className="btn-cream text-xs"
          >
            <ExternalIcon />
            Solana Explorer
          </a>
          <a
            href={`https://cookiescan.io/account/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            id="cookiescan-link"
            className="btn-navy text-xs"
          >
            <ExternalIcon />
            CookieScan
          </a>
        </div>
      </section>

      {/* Loading skeleton — deploy history */}
      <section className="w-full" aria-label="Deploy history">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-navy">Deploy History</h2>
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-pill border border-navy/20 bg-navy/5 text-xs font-body text-ink/60"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block animate-pulse" />
            Loading history…
          </span>
        </div>

        {/* Skeleton rows */}
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              id={`skeleton-entry-${i}`}
              className="card-chunky px-6 py-5 flex flex-col gap-3"
              style={{ opacity: 1 - i * 0.12 }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-4 w-32 rounded" />
              </div>
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-3/4 rounded" />
              <div className="flex gap-2 mt-1">
                <div className="skeleton h-6 w-20 rounded-pill" />
                <div className="skeleton h-6 w-28 rounded-pill" />
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-6 card-chunky px-6 py-5 flex items-start gap-4"
          id="construction-notice"
          style={{ borderStyle: "dashed" }}
        >
          <span className="text-2xl mt-0.5" role="img" aria-label="construction">🚧</span>
          <div>
            <p className="font-display font-semibold text-navy text-sm">Under construction</p>
            <p className="font-body text-xs text-ink/60 mt-1 leading-relaxed">
              Real data-fetching from the Recipe Book program{" "}
              <code className="font-mono text-xs">56Vj61z…vzxL</code> is the next sprint.
              This scaffold shows the address, links out to explorers, and renders the layout.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
