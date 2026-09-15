import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicKey } from "@solana/web3.js";
import { getConnection } from "@/lib/connection";
import { getRecipeBook, getEntries } from "@/lib/recipeBook";
import { fetchOnChainBytecodeHash, isHeadInSync } from "@/lib/verify";
import CopyCommandButton from "@/components/CopyCommandButton";

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

  /* ── Validate address ── */
  let programId: PublicKey;
  try {
    programId = new PublicKey(address);
  } catch {
    return (
      <div className="flex flex-col items-center gap-10 px-4 py-16 max-w-4xl mx-auto">
        <nav className="w-full flex items-center gap-2 text-sm font-body text-ink/50" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-navy transition-colors">Home</Link><span>/</span>
          <span className="text-navy font-semibold">Program</span><span>/</span>
          <code className="font-mono text-xs">{address}</code>
        </nav>
        <div className="card-chunky w-full px-8 py-10 flex flex-col items-center gap-4 text-center">
          <span className="text-3xl">⚠️</span>
          <p className="font-display font-bold text-lg text-navy">Invalid program address</p>
          <p className="font-body text-sm text-ink/60">
            <code className="font-mono text-xs">{address}</code> is not a valid Solana public key.
          </p>
        </div>
      </div>
    );
  }

  const short = `${address.slice(0, 6)}…${address.slice(-4)}`;

  /* ── Fetch data from Recipe Book (devnet for now) ── */
  const connection = getConnection(process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com");
  let recipeBook: Awaited<ReturnType<typeof getRecipeBook>> = null;
  let entries: Awaited<ReturnType<typeof getEntries>> = [];
  let onChainHash: Awaited<ReturnType<typeof fetchOnChainBytecodeHash>> = null;
  try {
    [recipeBook, entries, onChainHash] = await Promise.all([
      getRecipeBook(connection, programId),
      getEntries(connection, programId),
      fetchOnChainBytecodeHash(connection, programId),
    ]);
  } catch (e) {
    recipeBook = null;
    entries = [];
    onChainHash = null;
  }

  /* ── Compute sync status ── */
  let isHeadSynced = false;
  let headRecordedHash = "";
  if (entries.length > 0 && onChainHash) {
    headRecordedHash = Buffer.from(entries[entries.length - 1].buildHash).toString("hex");
    isHeadSynced = isHeadInSync(headRecordedHash, onChainHash);
  }

  /* ── Serialize entries for rendering ── */
  const seenHashes = new Set<string>();
  const serializedEntries = entries.map((entry, i) => {
    const hashHex = Buffer.from(entry.buildHash).toString("hex");
    const isRollback = i > 0 && seenHashes.has(hashHex);
    seenHashes.add(hashHex);
    const ts = Number(entry.timestamp);
    return {
      index: entry.index.toString(),
      repo: entry.repo,
      commit: entry.commit,
      buildHash: hashHex,
      deployer: entry.deployer.toBase58(),
      timestamp: ts,
      date: new Date(ts * 1000).toISOString(),
      relativeTime: timeAgo(ts),
      isRollback,
    };
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8 px-4 py-10 sm:py-16 max-w-4xl mx-auto">
      {/* ── Breadcrumb ── */}
      <nav className="w-full flex items-center gap-2 text-sm font-body text-ink/50" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-navy transition-colors">Home</Link>
        <span>/</span>
        <span className="text-navy font-semibold">Program</span>
        <span>/</span>
        <code className="font-mono text-xs">{short}</code>
      </nav>

      {/* ── Address Card ── */}
      <section className="card-chunky w-full px-5 py-6 sm:px-8 sm:py-8 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label="program">📦</span>
          <div className="min-w-0 flex-1">
            <p className="font-body text-xs text-ink/50 font-medium uppercase tracking-widest mb-0.5">Program address</p>
            <h1 className="font-display font-bold text-xl text-navy break-all">{address}</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <a href={`https://explorer.solana.com/address/${address}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="btn-cream text-xs">
            <ExternalIcon /> Solana Explorer
          </a>
          <a href={`https://cookiescan.io/account/${address}`} target="_blank" rel="noopener noreferrer" className="btn-navy text-xs">
            <ExternalIcon /> CookieScan
          </a>
        </div>
      </section>

      {/* ── No Recipe Book state ── */}
      {!recipeBook && (
        <div className="card-chunky w-full px-8 py-10 flex flex-col items-center gap-4 text-center">
          <span className="text-3xl">📭</span>
          <p className="font-display font-bold text-lg text-navy">No Recipe Book found</p>
          <p className="font-body text-sm text-ink/60 max-w-md">
            This program has not been registered in the Recipe Book yet.
            Run <code className="rounded bg-navy/10 px-1.5 py-0.5 font-mono text-xs text-navy">bake deploy</code> to create the first entry.
          </p>
        </div>
      )}

      {/* ── Recipe Book exists ── */}
      {recipeBook && (
        <>
          {/* ── Live Status Strip ── */}
          <section className="card-chunky w-full px-4 py-4 sm:px-6 sm:py-5 flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${entries.length > 0 && onChainHash ? (isHeadSynced ? "bg-live" : "bg-gold") : "bg-ink/20"}`} />
              <span className="font-display text-sm font-bold text-navy">
                {entries.length === 0
                  ? "No entries yet"
                  : isHeadSynced
                    ? "Live"
                    : "Untracked"}
              </span>
            </div>
            <div className="h-4 w-px bg-navy/15 hidden sm:block" />
            <span className="font-body text-xs text-ink/55">
              Authority: <code className="font-mono text-[11px]">{recipeBook.authority.toBase58().slice(0, 6)}…{recipeBook.authority.toBase58().slice(-4)}</code>
            </span>
            <span className="font-body text-xs text-ink/55">
              {recipeBook.entryCount.toString()} {recipeBook.entryCount.toString() === "1" ? "entry" : "entries"}
            </span>
            {onChainHash && (
              <span className="font-body text-xs text-ink/40">
                on-chain: <code className="font-mono text-[10px]">{onChainHash.slice(0, 8)}…</code>
              </span>
            )}
          </section>

          {/* ── Untracked Deploy Warning ── */}
          {entries.length > 0 && !isHeadSynced && onChainHash && (
            <div className="w-full card-chunky-sm px-6 py-4 flex items-start gap-3" style={{ borderColor: "#E8B84A" }}>
              <span className="text-xl mt-0.5">⚠️</span>
              <div>
                <p className="font-display font-semibold text-sm" style={{ color: "#E8B84A" }}>Untracked deploy detected</p>
                <p className="font-body text-xs text-ink/60 mt-1 leading-relaxed">
                  The on-chain bytecode (<code className="font-mono text-[10px]">{onChainHash.slice(0, 12)}…</code>) does not
                  match the recorded build hash of the latest Recipe Book entry
                  (<code className="font-mono text-[10px]">{headRecordedHash.slice(0, 12)}…</code>).
                  This program was likely deployed outside of <code className="font-mono text-xs">bake</code>.
                </p>
              </div>
            </div>
          )}

          {/* ── Deploy History ── */}
          <section className="w-full" aria-label="Deploy history">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-lg text-navy">Deploy History</h2>
              {entries.length > 0 && (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-pill border border-navy/20 bg-navy/5 text-xs font-body text-ink/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-live inline-block" />
                  {entries.length} {entries.length === 1 ? "entry" : "entries"}
                </span>
              )}
            </div>

            {serializedEntries.length === 0 ? (
              <div className="card-chunky px-8 py-10 flex flex-col items-center gap-3 text-center">
                <span className="text-2xl">📋</span>
                <p className="font-display font-semibold text-sm text-navy">No deploy entries yet</p>
                <p className="font-body text-xs text-ink/55">
                  Entries will appear here after the first <code className="rounded bg-navy/10 px-1 py-0.5 font-mono text-[11px] text-navy">bake deploy</code>.
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-navy/15" aria-hidden="true" />

                <div className="flex flex-col gap-6">
                  {serializedEntries.map((entry, i) => {
                    const isLatest = i === 0;
                    return (
                      <div key={entry.index} className="relative flex gap-4">
                        {/* Timeline dot */}
                        <div className="relative z-10 mt-3 flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden="true">
                          <span className={`block h-3 w-3 rounded-full border-2 border-navy ${
                            entry.isRollback ? "bg-gold" : "bg-cream"
                          } ${isLatest ? "ring-2 ring-live/40" : ""}`} />
                        </div>

                        {/* Entry card */}
                        <div className="card-chunky flex-1 px-4 py-4 sm:px-6 sm:py-5">
                          {/* Header row */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="font-display text-xs font-bold text-navy/40">#{entry.index}</span>
                            <span className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[11px] font-bold border ${
                              entry.isRollback
                                ? "border-gold-deep bg-gold/30 text-navy"
                                : "border-live/40 bg-live/10 text-navy"
                            }`}>
                              {entry.isRollback ? "↩ Rollback" : "🚀 Deploy"}
                            </span>
                            {isLatest && (
                              <span className="inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[11px] font-bold border border-live/40 bg-live/10 text-navy">
                                ● Current
                              </span>
                            )}
                            <span className="ml-auto font-body text-[11px] text-ink/45" title={entry.date}>
                              {entry.relativeTime}
                            </span>
                          </div>

                          {/* Details grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-4">
                            <DetailRow label="Repo" value={entry.repo} mono />
                            <DetailRow label="Commit" value={entry.commit} mono />
                            <DetailRow label="Deployer" value={entry.deployer} mono />
                            <DetailRow label="Timestamp" value={entry.date} />
                            <DetailRow label="Build hash" value={`${entry.buildHash.slice(0, 12)}…${entry.buildHash.slice(-4)}`} mono />
                          </div>

                          {/* Copy-paste command buttons */}
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-navy/8">
                            <CopyCommandButton command={`bake rollback ${entry.index} --program ${address}`} label="rollback" />
                            <CopyCommandButton command={`bake logs ${address}`} label="logs" />
                            <CopyCommandButton command={`bake stats ${address}`} label="stats" />
                            <CopyCommandButton command={`bake prove ${entry.index} --program ${address}`} label="prove" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

/* ─── Helper sub-components ─── */

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-body text-[10px] font-bold uppercase tracking-widest text-ink/40">{label}</span>
      <span className={`text-xs text-navy/80 break-all leading-relaxed ${mono ? "font-mono text-[11px]" : ""}`}>{value}</span>
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

function timeAgo(unix: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - unix;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}
