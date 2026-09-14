"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

/**
 * Small cream pill button that copies a CLI command to the clipboard.
 * Follows the same copy pattern as CopyInstall but for individual commands.
 */
export default function CopyCommandButton({
  command,
  label,
}: {
  command: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      return;
    }
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [command]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied!" : `Copy: ${label}`}
      className={`inline-flex items-center gap-1.5 rounded-pill border-2 border-navy px-3 py-1 text-[11px] font-bold transition-all duration-150 ${
        copied
          ? "bg-navy text-white shadow-none"
          : "bg-cream text-navy shadow-[0_3px_0_0_rgba(11,31,58,0.6)] hover:translate-y-[1px] hover:shadow-[0_1px_0_0_rgba(11,31,58,0.6)]"
      }`}
    >
      {copied ? (
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="13" height="13" x="9" y="9" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      {copied ? "Copied!" : label}
    </button>
  );
}
