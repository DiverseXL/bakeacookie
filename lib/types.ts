/**
 * TypeScript types derived from the Recipe Book IDL.
 * Program address: 56Vj61zFW4hHV6wdjnisrHtVwWDqyjixjpBgnoRJvzxL
 *
 * These mirror the on-chain account layouts exactly — do NOT modify
 * the field names or types without updating the IDL as well.
 */

import { PublicKey } from "@solana/web3.js";

export const RECIPE_BOOK_PROGRAM_ID =
  process.env.NEXT_PUBLIC_RECIPE_BOOK_PROGRAM_ID ??
  "56Vj61zFW4hHV6wdjnisrHtVwWDqyjixjpBgnoRJvzxL";

/** Seeds: ["recipe_book", target_program_id] */
export interface RecipeBookAccount {
  targetProgramId: PublicKey;
  authority: PublicKey;
  /** u64 — total number of deploy entries */
  entryCount: bigint;
  bump: number;
}

/** Seeds: ["entry", recipe_book_pubkey, entry_index (u64 le)] */
export interface EntryAccount {
  recipeBook: PublicKey;
  /** u64 — 0-indexed deploy number */
  index: bigint;
  /** Git remote URL or short name */
  repo: string;
  /** Git commit SHA */
  commit: string;
  /** SHA-256 of the compiled .so before upload, stored as [u8; 32] */
  buildHash: Uint8Array;
  /** Buffer program account address written to before bpf-loader finalise */
  buffer: PublicKey;
  deployer: PublicKey;
  /** Unix timestamp (i64) of the register_deploy transaction */
  timestamp: bigint;
  bump: number;
}

/**
 * Derive the RecipeBook PDA for a given target program.
 * Matches the IDL seed: ["recipe_book", target_program_id]
 */
export async function findRecipeBookPDA(
  targetProgramId: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("recipe_book"), targetProgramId.toBuffer()],
    programId
  );
}

/**
 * Derive an Entry PDA for a given RecipeBook and entry index.
 * Matches the IDL seed: ["entry", recipe_book, entry_count (u64 le)]
 */
export async function findEntryPDA(
  recipeBookPubkey: PublicKey,
  index: bigint,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  const indexBuf = Buffer.alloc(8);
  indexBuf.writeBigUInt64LE(index);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("entry"), recipeBookPubkey.toBuffer(), indexBuf],
    programId
  );
}
