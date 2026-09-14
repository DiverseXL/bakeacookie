"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

export const INSTALL_COMMAND = "npm install -g bakeacookie";

/**
 * Gold "sweet action" capsule (AGENTS.md reserves gold for actions like
 * install). Shows the npm install command in monospace with a copy button
 * backed by the Clipboard API — no external dependency. On failure
 * (permissions / insecure context) it falls back to selecting the text
 * so the user can copy manually.
 */
export default function CopyInstall() {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const selectFallback = useCallback(() => {
    const el = codeRef.current;
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
    } catch {
      selectFallback();
      return;
    }
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [selectFallback]);

  return (
    /* w-full + overflow-x-auto lets the pill scroll sideways on narrow
       viewports without clipping the command text */
    <div id="install-cta" className="w-full max-w-full overflow-x-auto pb-1">
      <div className="flex w-max items-center gap-3">
        <div
          className="inline-flex items-center gap-2 sm:gap-3 rounded-pill border-[3px] border-navy bg-gold py-1.5 sm:py-2 pl-3 sm:pl-5 pr-1.5 sm:pr-2"
          style={{
            boxShadow:
              "0 4px 0 0 rgba(11, 31, 58, 0.7), inset 0 2px 0 rgba(255, 255, 255, 0.55)",
          }}
        >
          <code
            ref={codeRef}
            id="install-command"
            className="select-all whitespace-nowrap font-mono text-sm sm:text-base font-semibold text-navy lg:text-lg"
          >
            {INSTALL_COMMAND}
          </code>
          <button
            type="button"
            id="install-copy-btn"
            onClick={handleCopy}
            aria-label={copied ? "Copied!" : "Copy install command"}
            className={`inline-flex shrink-0 items-center gap-1 sm:gap-1.5 rounded-pill border-2 border-navy px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold transition-all duration-150 ${
              copied
                ? "bg-navy text-white shadow-none"
                : "bg-cream text-navy shadow-[0_2px_0_0_rgba(11,31,58,0.6)] hover:translate-y-[1px] hover:shadow-[0_1px_0_0_rgba(11,31,58,0.6)]"
            }`}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Aria live confirmation */}
        <span
          aria-live="polite"
          className="whitespace-nowrap font-body text-xs font-semibold text-navy/60"
        >
          {copied ? "Copied to clipboard ✓" : ""}
        </span>
      </div>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="13" height="13" x="9" y="9" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
