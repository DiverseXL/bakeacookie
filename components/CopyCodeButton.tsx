"use client";

import React, { useState, useCallback } from "react";

/**
 * Tiny copy button that sits in the top-right corner of a code block.
 * Copies the provided text to clipboard and shows a brief ✓ confirmation.
 */
export default function CopyCodeButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy command"}
      className="inline-flex items-center gap-1 rounded-pill border-2 border-navy/30 bg-cream px-2 py-0.5 text-[10px] font-bold text-navy/70 transition-all duration-150 shadow-[0_2px_0_0_rgba(11,31,58,0.25)] hover:border-navy/50 hover:text-navy hover:translate-y-[1px] hover:shadow-[0_1px_0_0_rgba(11,31,58,0.25)] active:translate-y-[2px] active:shadow-none"
    >
      {copied ? (
        <>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="13" height="13" x="9" y="9" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}
