import { Connection } from "@solana/web3.js";

/**
 * Default RPC endpoint for Cookie Chain.
 * NOT api.cookiescan.io — that's the separate DAS/REST API.
 */
const DEFAULT_RPC =
  process.env.NEXT_PUBLIC_RPC_URL ?? "https://rpc.cookiescan.io";

let _cached: Connection | null = null;

/**
 * Returns a shared Connection instance pointed at Cookie Chain's RPC.
 * Overridable via NEXT_PUBLIC_RPC_URL env var for local dev testing.
 */
export function getConnection(rpcUrl?: string): Connection {
  const url = rpcUrl ?? DEFAULT_RPC;
  // Only cache the default; explicit overrides always create fresh connections
  if (!rpcUrl && _cached) return _cached;
  const conn = new Connection(url, "confirmed");
  if (!rpcUrl) _cached = conn;
  return conn;
}
