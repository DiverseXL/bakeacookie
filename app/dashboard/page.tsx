"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import SearchBar from "@/components/SearchBar";

/**
 * /dashboard — the main app entry point.
 *
 * - Wallet connected  → redirect to /wallet/<address>
 * - Wallet disconnected → show SearchBar + connect prompt
 */
export default function DashboardPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (connected && publicKey) {
      router.replace(`/wallet/${publicKey.toBase58()}`);
    }
  }, [connected, publicKey, router]);

  // ── Connected: show a skeleton preview of the wallet page while redirect happens ──
  if (connected && publicKey) {
    const short = `${publicKey.toBase58().slice(0, 6)}\u2026${publicKey.toBase58().slice(-4)}`;
    return (
      <div className="flex flex-col items-center gap-8 px-4 py-16 max-w-4xl mx-auto animate-in fade-in duration-300">
        {/* Breadcrumb skeleton */}
        <div className="w-full flex items-center gap-2">
          <div className="skeleton h-3 w-8 rounded" />
          <div className="skeleton h-3 w-2 rounded" />
          <div className="skeleton h-3 w-12 rounded" />
          <div className="skeleton h-3 w-2 rounded" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>

        {/* Wallet address card skeleton */}
        <div className="card-chunky w-full px-8 py-8 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="skeleton h-8 w-8 rounded-lg shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="skeleton h-2.5 w-24 rounded" />
              <div className="skeleton h-5 w-full max-w-md rounded" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <div className="skeleton h-8 w-32 rounded-pill" />
            <div className="skeleton h-8 w-28 rounded-pill" />
          </div>
        </div>

        {/* Stats strip skeleton */}
        <div className="w-full grid grid-cols-2 gap-4">
          <div className="card-chunky-sm px-6 py-5 flex flex-col gap-2">
            <div className="skeleton h-8 w-12 rounded" />
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-2 w-28 rounded" />
          </div>
          <div className="card-chunky-sm px-6 py-5 flex flex-col gap-2">
            <div className="skeleton h-8 w-8 rounded" />
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton h-2 w-20 rounded" />
          </div>
        </div>

        {/* Timeline skeleton — 2 entry cards */}
        <div className="w-full relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-navy/10" />
          <div className="flex flex-col gap-5">
            {[0, 1].map((i) => (
              <div key={i} className="relative flex gap-4">
                <div className="relative z-10 mt-3 flex h-4 w-4 shrink-0 items-center justify-center">
                  <span className="block h-3 w-3 rounded-full border-2 border-navy bg-cream" />
                </div>
                <div className="card-chunky flex-1 px-6 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="skeleton h-3 w-6 rounded" />
                    <div className="skeleton h-5 w-16 rounded-pill" />
                    <div className="ml-auto skeleton h-3 w-14 rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <div className="flex flex-col gap-1">
                      <div className="skeleton h-2 w-8 rounded" />
                      <div className="skeleton h-3 w-full max-w-[140px] rounded" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="skeleton h-2 w-12 rounded" />
                      <div className="skeleton h-3 w-full max-w-[120px] rounded" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="skeleton h-2 w-16 rounded" />
                      <div className="skeleton h-3 w-full max-w-[100px] rounded" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="skeleton h-2 w-14 rounded" />
                      <div className="skeleton h-3 w-full max-w-[90px] rounded" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 mt-3 border-t border-navy/8">
                    <div className="skeleton h-7 w-20 rounded-pill" />
                    <div className="skeleton h-7 w-16 rounded-pill" />
                    <div className="skeleton h-7 w-14 rounded-pill" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status message */}
        <p className="font-body text-sm text-navy/40 animate-pulse">
          Loading your recipes\u2026
        </p>
      </div>
    );
  }

  // ── Disconnected: search + connect prompt ──
  return (
    <div className="flex flex-col items-center gap-10 px-4 py-16 max-w-4xl mx-auto">
      {/* Hero prompt */}
      <section className="flex flex-col items-center gap-6 text-center">
        <div className="card-chunky-sm px-6 py-4 inline-flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-navy/40 animate-pulse" />
          <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy/50">
            Recipe Book Dashboard
          </span>
        </div>

        <h1 className="font-display text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">
          Your deploy history,
          <br />
          <span className="text-sky-deep">on-chain and permanent.</span>
        </h1>

        <p className="max-w-lg font-body text-base leading-relaxed text-navy/70">
          Connect your wallet to see your deploys, or search any program or
          wallet address to explore its Recipe Book entries.
        </p>
      </section>

      {/* Search bar — prominent, centered */}
      <SearchBar />

      {/* Connect wallet CTA — emphasized */}
      <section className="flex flex-col items-center gap-4 text-center">
        <p className="font-body text-sm text-navy/50">
          Or connect your wallet to see your programs
        </p>
        <WalletMultiButton />
      </section>

      {/* Quick links */}
      <section className="w-full max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-1 bg-navy/10" />
          <span className="font-body text-xs font-bold uppercase tracking-widest text-navy/35">
            Quick access
          </span>
          <div className="h-px flex-1 bg-navy/10" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="/program/56Vj61zFW4hHV6wdjnisrHtVwWDqyjixjpBgnoRJvzxL"
            className="card-chunky-sm px-6 py-5 flex flex-col gap-1 no-underline transition-all duration-150 hover:translate-y-[2px]"
          >
            <span className="font-body text-[10px] font-bold uppercase tracking-widest text-ink/40">
              Recipe Book
            </span>
            <span className="font-display text-sm font-bold text-navy">
              View all entries
            </span>
            <span className="font-mono text-[11px] text-navy/50 break-all">
              56Vj61z…vzxL
            </span>
          </a>

          <a
            href="https://github.com/DiverseXL/bake"
            target="_blank"
            rel="noopener noreferrer"
            className="card-chunky-sm px-6 py-5 flex flex-col gap-1 no-underline transition-all duration-150 hover:translate-y-[2px]"
          >
            <span className="font-body text-[10px] font-bold uppercase tracking-widest text-ink/40">
              CLI
            </span>
            <span className="font-display text-sm font-bold text-navy">
              bake on GitHub
            </span>
            <span className="font-mono text-[11px] text-navy/50">
              npm i -g bakeacookie
            </span>
          </a>
        </div>
      </section>
    </div>
  );
}
