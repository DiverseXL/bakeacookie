"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

const INSTALL_COMMAND = "npm install -g bakeacookie";
const RECIPE_BOOK_ID =
  process.env.NEXT_PUBLIC_RECIPE_BOOK_PROGRAM_ID ??
  "56Vj61zFW4hHV6wdjnisrHtVwWDqyjixjpBgnoRJvzxL";

/* ─────────────────────────────────────────────────────────────────
   Footer — large, structured site footer

   Cream fill, 3px navy top border, max-w-6xl content.
   4-column responsive grid on desktop, stacked on mobile.

   Column layout:
   1. Brand blurb + gold install CTA
   2. Product links
   3. Docs & chain
   4. CLI cheat sheet (mono)
───────────────────────────────────────────────────────────────── */
export default function Footer() {
  return (
    <footer
      id="site-footer"
      className="w-full bg-cream border-t-[3px] border-navy"
      role="contentinfo"
    >
      {/* ── Main content grid ── */}
      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">

          {/* ── Column 1: Brand blurb + install CTA ── */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-lg font-extrabold tracking-tight text-navy">
                bake <span aria-hidden="true">🍪</span>
              </h3>
              <p className="font-body text-sm leading-relaxed text-ink/65">
                The read-only companion to the{" "}
                <a
                  href="https://www.npmjs.com/package/bakeacookie"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy font-semibold underline underline-offset-2 hover:text-sky-deep transition-colors"
                >
                  bake CLI
                </a>
                .
              </p>
              <p className="font-body text-sm leading-relaxed text-ink/65">
                Every deploy writes a permanent, on-chain entry to the Recipe Book. This dashboard reads it all.
              </p>
            </div>

            {/* Gold install CTA — "sweet" action only */}
            <div>
              <FooterInstallPill />
            </div>
          </div>

          {/* ── Column 2: Product links ── */}
          <div className="flex flex-col gap-3">
            <FooterColumnTitle>Product</FooterColumnTitle>
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="/#search">Search</FooterLink>
            <FooterLink href="/docs">Docs</FooterLink>
            <FooterLink
              href="https://github.com/DiverseXL/bake"
              external
            >
              CLI on GitHub
            </FooterLink>
            <FooterLink
              href="https://www.npmjs.com/package/bakeacookie"
              external
            >
              npm package
            </FooterLink>
          </div>

          {/* ── Column 3: Docs & chain ── */}
          <div className="flex flex-col gap-3">
            <FooterColumnTitle>Docs & Chain</FooterColumnTitle>
            <FooterLink
              href="https://docs.cookiechain.wtf"
              external
            >
              Cookie Chain docs
            </FooterLink>
            <FooterLink
              href="https://cookiescan.io/address/56Vj61zFW4hHV6wdjnisrHtVwWDqyjixjpBgnoRJvzxL"
              external
            >
              Recipe Book on CookieScan
            </FooterLink>
            <FooterLink
              href="https://github.com/DiverseXL/bakeacookie"
              external
            >
              Dashboard source
            </FooterLink>
            <FooterLink
              href="https://rpc.cookiescan.io"
              external
            >
              RPC endpoint
            </FooterLink>
          </div>

          {/* ── Column 4: CLI cheat sheet ── */}
          <div className="flex flex-col gap-3">
            <FooterColumnTitle>CLI Cheat Sheet</FooterColumnTitle>
            <div
              className="rounded-xl border-2 border-navy/15 bg-navy/[0.03] px-4 py-3.5 overflow-hidden"
            >
              <pre
                className="text-xs leading-[1.9] text-ink/70 whitespace-pre-wrap break-words"
                style={{
                  fontFamily:
                    "var(--font-mono, 'JetBrains Mono', 'Fira Code', ui-monospace, monospace)",
                  margin: 0,
                  overflowWrap: "break-word",
                  wordBreak: "break-all",
                }}
              >
                <span className="text-navy font-semibold">bake deploy</span>
                {"\n"}
                <span className="text-navy font-semibold">bake rollback</span>
                {"\n"}
                <span className="text-navy font-semibold">bake prove</span>
                {"\n"}
                <span className="text-navy font-semibold">bake logs</span>
                {"\n"}
                <span className="text-ink/40">{"─".repeat(20)}</span>
                {"\n"}
                <span className="text-ink/50">Recipe Book:</span>
                {"\n"}
                <span className="text-ink/50">
                  {RECIPE_BOOK_ID}
                </span>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* ── Large wordmark ── */}
      <div className="w-full border-t border-navy/10">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14 flex justify-center">
          <span
            className="font-display font-extrabold tracking-tight text-navy/10 select-none"
            aria-hidden="true"
            style={{
              fontSize: "clamp(3rem, 8vw, 8.5rem)",
              lineHeight: 1,
              textShadow: "0 2px 24px rgba(126, 200, 240, 0.18)",
            }}
          >
            bakeacookie
          </span>
        </div>
      </div>

      {/* ── Bottom meta bar ── */}
      <div className="w-full border-t border-navy/8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-[11px] sm:text-xs text-ink/45 text-center sm:text-left">
            Built for Cookie Chain · companion to bake · read-only · public on-chain data
          </p>
          <p className="font-body text-[11px] sm:text-xs text-ink/35 whitespace-nowrap">
            Recipe Book:{" "}
            <code className="font-mono text-[11px] sm:text-xs text-ink/50">
              {RECIPE_BOOK_ID.slice(0, 6)}…{RECIPE_BOOK_ID.slice(-4)}
            </code>
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────────────── */

function FooterColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="font-display text-xs font-bold uppercase tracking-[0.12em] text-navy/40 mb-1">
      {children}
    </h4>
  );
}

function FooterLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="font-body text-sm text-ink/65 hover:text-navy transition-colors leading-relaxed"
    >
      {children}
      {external && (
        <ExternalDot />
      )}
    </a>
  );
}

function ExternalDot() {
  return (
    <span
      className="inline-block ml-1 w-1 h-1 rounded-full bg-navy/30 align-middle"
      aria-hidden="true"
    />
  );
}

/* ── Gold install pill with copy button ── */
function FooterInstallPill() {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
    } catch {
      // Fallback: select text
      const el = codeRef.current;
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      return;
    }
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="flex items-center gap-2 w-full max-w-full">
      <div
        className="inline-flex items-center gap-2 rounded-pill border-[2.5px] border-navy bg-gold py-1.5 pl-3 sm:pl-4 pr-1.5 flex-1 min-w-0 overflow-hidden"
        style={{
          boxShadow:
            "0 3px 0 0 rgba(11, 31, 58, 0.7), inset 0 1.5px 0 rgba(255, 255, 255, 0.55)",
        }}
      >
        <code
          ref={codeRef}
          className="select-all whitespace-nowrap font-mono text-[10px] sm:text-xs font-semibold text-navy min-w-0 truncate"
        >
          {INSTALL_COMMAND}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied!" : "Copy install command"}
          className={`inline-flex shrink-0 items-center gap-1 rounded-pill border-2 border-navy px-2.5 py-1 text-[10px] font-bold transition-all duration-150 ${
            copied
              ? "bg-navy text-white shadow-none"
              : "bg-cream text-navy shadow-[0_2px_0_0_rgba(11,31,58,0.6)] hover:translate-y-[1px] hover:shadow-[0_1px_0_0_rgba(11,31,58,0.6)]"
          }`}
        >
          {copied ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="13" height="13" x="9" y="9" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
