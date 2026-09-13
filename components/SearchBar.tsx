"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const BASE58_CHARS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function looksLikePubkey(s: string): boolean {
  return BASE58_CHARS.test(s.trim());
}

export default function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const addr = value.trim();
    if (!addr) return;

    if (!looksLikePubkey(addr)) {
      setError("Looks like that's not a valid Solana address — 32–44 base58 chars.");
      return;
    }
    setError("");

    // Naive heuristic: program addresses tend to end in specific suffixes,
    // but we can't reliably distinguish without an RPC call.
    // Default to /program — wallet route will be a follow-up.
    router.push(`/program/${addr}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto"
      aria-label="Address search"
    >
      <div
        className="card-chunky flex items-stretch gap-0 p-1.5 overflow-hidden"
        style={{ borderRadius: "calc(var(--radius-card) + 2px)" }}
      >
        {/* Input */}
        <input
          id="address-search-input"
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(""); }}
          placeholder="Paste a program or wallet address…"
          className="flex-1 bg-transparent px-4 py-3 text-ink placeholder-ink/40 font-body text-sm outline-none"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />

        {/* Submit */}
        <button
          id="address-search-btn"
          type="submit"
          className="btn-navy shrink-0 text-sm"
          style={{ borderRadius: "calc(var(--radius-card) - 4px)" }}
        >
          <SearchIcon />
          Explore
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium px-2">{error}</p>
      )}

      <p className="mt-2 text-xs text-ink/50 font-body text-center">
        Paste any program address → view its on-chain Recipe Book &nbsp;·&nbsp; Wallet address → deployment history
      </p>
    </form>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
