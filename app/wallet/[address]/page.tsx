import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicKey } from "@solana/web3.js";
import { getConnection } from "@/lib/connection";
import { getEntriesByDeployer, getRecipeBookByPda } from "@/lib/recipeBook";
import CopyCommandButton from "@/components/CopyCommandButton";

interface Props {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  const short = `${address.slice(0, 6)}…${address.slice(-4)}`;
  return {
    title: `Wallet ${short} — bakeacookie`,
    description: `Programs and deploy history for wallet ${address} on the Recipe Book`,
  };
}

export default async function WalletPage({ params }: Props) {
  const { address } = await params;

  /* ── Validate address ── */
  let walletId: PublicKey;
  try {
    walletId = new PublicKey(address);
  } catch {
    return (
      <div className="flex flex-col items-center gap-10 px-4 py-16 max-w-4xl mx-auto">
        <nav className="w-full flex items-center gap-2 text-sm font-body text-ink/50" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-navy transition-colors">Home</Link><span>/</span>
          <span className="text-navy font-semibold">Wallet</span><span>/</span>
          <code className="font-mono text-xs">{address}</code>
        </nav>
        <div className="card-chunky w-full px-8 py-10 flex flex-col items-center gap-4 text-center">
          <span className="text-3xl">⚠️</span>
          <p className="font-display font-bold text-lg text-navy">Invalid wallet address</p>
          <p className="font-body text-sm text-ink/60">
            <code className="font-mono text-xs">{address}</code> is not a valid Solana public key.
          </p>
        </div>
      </div>
    );
  }

  const short = `${address.slice(0, 6)}…${address.slice(-4)}`;

  /* ── Fetch entries by deployer ── */
  const connection = getConnection(process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com");

  let groupedEntries: Map<string, Array<{
    recipeBook: PublicKey;
    index: bigint;
    repo: string;
    commit: string;
    buildHash: Uint8Array;
    buffer: PublicKey;
    deployer: PublicKey;
    timestamp: bigint;
    bump: number;
  }>> | null = null;
  try {
    groupedEntries = await getEntriesByDeployer(connection, walletId);
  } catch {
    groupedEntries = null;
  }

  /* ── Resolve RecipeBook PDAs to target program IDs ── */
  const programMap = new Map<string, PublicKey>(); // recipeBookPda -> targetProgramId
  if (groupedEntries && groupedEntries.size > 0) {
    const rbPdas = Array.from(groupedEntries.keys()).map((k) => new PublicKey(k));
    const recipeBooks = await Promise.all(
      rbPdas.map((pda) => getRecipeBookByPda(connection, pda))
    );
    for (let i = 0; i < rbPdas.length; i++) {
      const rb = recipeBooks[i];
      if (rb) {
        programMap.set(rbPdas[i].toBase58(), rb.targetProgramId);
      }
    }
  }

  /* ── Aggregate stats ── */
  const totalEntries = groupedEntries
    ? Array.from(groupedEntries.values()).reduce((sum, arr) => sum + arr.length, 0)
    : 0;
  const programCount = groupedEntries ? groupedEntries.size : 0;

  /* ── Serialize groups for rendering ── */
  const serializedGroups: Array<{
    recipeBookPda: string;
    targetProgramId: string | null;
    entries: Array<{
      index: string;
      repo: string;
      commit: string;
      buildHash: string;
      deployer: string;
      timestamp: number;
      date: string;
      relativeTime: string;
      isRollback: boolean;
    }>;
  }> = [];

  if (groupedEntries) {
    for (const [rbPda, entries] of groupedEntries) {
      const targetProgramId = programMap.get(rbPda)?.toBase58() ?? null;
      const seenHashes = new Set<string>();
      const serialized = entries.map((entry, i) => {
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
      serializedGroups.push({ recipeBookPda: rbPda, targetProgramId, entries: serialized });
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8 px-4 py-10 sm:py-16 max-w-4xl mx-auto">
      {/* ── Breadcrumb ── */}
      <nav className="w-full flex items-center gap-2 text-sm font-body text-ink/50" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-navy transition-colors">Home</Link>
        <span>/</span>
        <span className="text-navy font-semibold">Wallet</span>
        <span>/</span>
        <code className="font-mono text-xs">{short}</code>
      </nav>

      {/* ── Wallet Address Card ── */}
      <section className="card-chunky w-full px-5 py-6 sm:px-8 sm:py-8 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label="wallet">👛</span>
          <div className="min-w-0 flex-1">
            <p className="font-body text-xs text-ink/50 font-medium uppercase tracking-widest mb-0.5">Wallet address</p>
            <h1 className="font-display font-bold text-xl text-navy break-all">{address}</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <a href={`https://explorer.solana.com/address/${address}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="btn-cream text-xs">
            <ExternalIcon /> Solana Explorer
          </a>
          <a href={`https://cookiescan.io/address/${address}`} target="_blank" rel="noopener noreferrer" className="btn-navy text-xs">
            <ExternalIcon /> CookieScan
          </a>
        </div>
      </section>

      {/* ── No entries state ── */}
      {groupedEntries && groupedEntries.size === 0 && (
        <div className="card-chunky w-full px-8 py-10 flex flex-col items-center gap-4 text-center">
          <span className="text-3xl">📭</span>
          <p className="font-display font-bold text-lg text-navy">No recipes found</p>
          <p className="font-body text-sm text-ink/60 max-w-md">
            This wallet has not deployed any programs tracked by the Recipe Book yet.
            Run <code className="rounded bg-navy/10 px-1.5 py-0.5 font-mono text-xs text-navy">bake deploy</code> to create the first entry.
          </p>
        </div>
      )}

      {/* ── Error / no data state ── */}
      {groupedEntries === null && (
        <div className="card-chunky w-full px-8 py-10 flex flex-col items-center gap-4 text-center">
          <span className="text-3xl">⚠️</span>
          <p className="font-display font-bold text-lg text-navy">Could not load data</p>
          <p className="font-body text-sm text-ink/60 max-w-md">
            Failed to fetch Recipe Book entries for this wallet. The RPC may be temporarily unavailable.
          </p>
        </div>
      )}

      {/* ── Deployments by this wallet ── */}
      {groupedEntries && groupedEntries.size > 0 && (
        <>
          {/* Stats strip */}
          <section className="w-full" aria-label="Wallet stats">
            <div className="grid grid-cols-2 gap-4">
              <div className="card-chunky-sm px-4 py-4 sm:px-6 sm:py-5 flex flex-col gap-1">
                <span className="font-display text-2xl sm:text-3xl font-extrabold leading-none text-navy">{totalEntries}</span>
                <span className="font-display text-sm font-semibold text-navy">
                  {totalEntries === 1 ? "Recipe entry" : "Recipe entries"}
                </span>
                <span className="mt-0.5 font-body text-xs text-ink/45">across all programs</span>
              </div>
              <div className="card-chunky-sm px-4 py-4 sm:px-6 sm:py-5 flex flex-col gap-1">
                <span className="font-display text-2xl sm:text-3xl font-extrabold leading-none text-navy">{programCount}</span>
                <span className="font-display text-sm font-semibold text-navy">
                  {programCount === 1 ? "Program" : "Programs"}
                </span>
                <span className="mt-0.5 font-body text-xs text-ink/45">deployed to</span>
              </div>
            </div>
          </section>

          {/* Per-program groups */}
          <section className="w-full flex flex-col gap-10" aria-label="Programs deployed by this wallet">
            {serializedGroups.map((group) => {
              const programShort = group.targetProgramId
                ? `${group.targetProgramId.slice(0, 6)}…${group.targetProgramId.slice(-4)}`
                : "unknown";
              return (
                <div key={group.recipeBookPda}>
                  {/* Program header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-lg" role="img" aria-label="program">📦</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-0.5">Program</p>
                      {group.targetProgramId ? (
                        <Link
                          href={`/program/${group.targetProgramId}`}
                          className="font-display text-sm font-bold text-navy hover:text-sky-deep transition-colors break-all"
                        >
                          {group.targetProgramId}
                        </Link>
                      ) : (
                        <span className="font-display text-sm font-bold text-navy/40">{programShort}</span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill border border-navy/20 bg-navy/5 text-xs font-body text-ink/60">
                      {group.entries.length} {group.entries.length === 1 ? "entry" : "entries"}
                    </span>
                  </div>

                  {/* Timeline */}
                  <div className="relative">
                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-navy/15" aria-hidden="true" />
                    <div className="flex flex-col gap-5">
                      {group.entries.map((entry, i) => {
                        const isLatest = i === 0;
                        return (
                          <div key={`${group.recipeBookPda}-${entry.index}`} className="relative flex gap-4">
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
                                    ● Latest
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
                                <DetailRow label="Timestamp" value={entry.date} />
                                <DetailRow label="Build hash" value={`${entry.buildHash.slice(0, 12)}…${entry.buildHash.slice(-4)}`} mono />
                              </div>

                              {/* Copy-paste command buttons */}
                              <div className="flex flex-wrap gap-2 pt-2 border-t border-navy/8">
                                {group.targetProgramId && (
                                  <>
                                    <CopyCommandButton command={`bake rollback --to ${entry.index}`} label="rollback" />
                                    <CopyCommandButton command={`bake logs --program ${group.targetProgramId}`} label="logs" />
                                    <CopyCommandButton command={`bake stats ${group.targetProgramId}`} label="stats" />
                                    <CopyCommandButton command={`bake prove ${group.targetProgramId}`} label="prove" />
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
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
