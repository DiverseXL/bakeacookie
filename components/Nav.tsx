"use client";

import React from "react";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

/**
 * Capsule nav — one frosted light-blue pill, thick navy stroke, chunky
 * offset shadow. Left: wordmark (home link). Right: GitHub pill + wallet
 * connect (styled via the .wallet-adapter-button overrides in globals.css).
 */
export default function Nav() {
  return (
    <div className="sticky top-0 z-50 w-full px-2 sm:px-4 pt-3 sm:pt-4">
      <header
        id="nav-capsule"
        className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 sm:gap-3 rounded-pill border-[3px] border-navy py-1.5 sm:py-2 pl-3 sm:pl-5 pr-1.5 sm:pr-2"
        style={{
          background: "rgba(196, 231, 249, 0.78)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow:
            "0 4px 0 0 rgba(11, 31, 58, 0.5), 0 16px 40px rgba(11, 31, 58, 0.14), inset 0 2px 0 rgba(255, 255, 255, 0.7)",
        }}
      >
        {/* Wordmark → home */}
        <Link
          href="/"
          id="nav-logo"
          className="font-display text-xl font-extrabold tracking-tight text-navy no-underline transition-opacity hover:opacity-75"
        >
          bake <span aria-hidden="true">🍪</span>
        </Link>

        {/* Right cluster */}
        <nav className="flex items-center gap-2" aria-label="Primary">
          <a
            href="/docs"
            id="nav-docs"
            aria-label="Documentation"
            className="inline-flex items-center gap-1 sm:gap-1.5 rounded-pill border-2 border-navy bg-cream px-2 sm:px-3.5 py-1.5 sm:py-2 text-sm font-bold text-navy no-underline transition-all duration-150 shadow-[0_3px_0_0_rgba(11,31,58,0.6)] hover:translate-y-[2px] hover:shadow-[0_1px_0_0_rgba(11,31,58,0.6)]"
          >
            <DocsIcon />
            <span className="hidden sm:inline">Docs</span>
          </a>

          <a
            href="https://github.com/DiverseXL/bake"
            target="_blank"
            rel="noopener noreferrer"
            id="nav-github"
            aria-label="bake on GitHub"
            className="inline-flex items-center gap-1 sm:gap-1.5 rounded-pill border-2 border-navy bg-cream px-2 sm:px-3.5 py-1.5 sm:py-2 text-sm font-bold text-navy no-underline transition-all duration-150 shadow-[0_3px_0_0_rgba(11,31,58,0.6)] hover:translate-y-[2px] hover:shadow-[0_1px_0_0_rgba(11,31,58,0.6)]"
          >
            <GitHubIcon />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          <Link
            href="/dashboard"
            id="nav-dashboard"
            className="inline-flex items-center gap-1 sm:gap-1.5 rounded-pill border-2 border-navy bg-navy px-2 sm:px-3.5 py-1.5 sm:py-2 text-sm font-bold text-white no-underline transition-all duration-150 shadow-[0_3px_0_0_rgba(11,31,58,0.55)] hover:translate-y-[2px] hover:shadow-[0_1px_0_0_rgba(11,31,58,0.55)]"
          >
            <DashboardIcon />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <div id="wallet-connect-area">
            <WalletMultiButton />
          </div>
        </nav>
      </header>
    </div>
  );
}

function DocsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
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

function DashboardIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}
