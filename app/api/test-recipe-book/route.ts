/**
 * Test route — proves the Recipe Book data layer works against real devnet data.
 *
 * GET /api/test-recipe-book
 *
 * Tests:
 * 1. getRecipeBook() — fetch and decode the RecipeBook account
 * 2. getEntries() — fetch all entries for the program
 * 3. fetchOnChainBytecodeHash() — compute the ELF hash
 * 4. isHeadInSync() — compare recorded hash against on-chain
 */

import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  getRecipeBook,
  getEntries,
  getEntriesByDeployer,
} from "@/lib/recipeBook";
import {
  fetchOnChainBytecodeHash,
  isHeadInSync,
} from "@/lib/verify";
import { RECIPE_BOOK_PROGRAM_ID } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, unknown> = {};
  const errors: string[] = [];

  // Use devnet for testing — the real Recipe Book program lives there
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );

  const programId = new PublicKey(RECIPE_BOOK_PROGRAM_ID);

  // --- Test 1: getRecipeBook ---
  try {
    const recipeBook = await getRecipeBook(connection, programId);
    results.recipeBook = recipeBook
      ? {
          targetProgramId: recipeBook.targetProgramId.toBase58(),
          authority: recipeBook.authority.toBase58(),
          entryCount: recipeBook.entryCount.toString(),
          bump: recipeBook.bump,
        }
      : null;
  } catch (e) {
    errors.push(`getRecipeBook: ${e}`);
  }

  // --- Test 2: getEntries ---
  try {
    const entries = await getEntries(connection, programId);
    results.entries = entries.map((e) => ({
      index: e.index.toString(),
      repo: e.repo,
      commit: e.commit,
      deployer: e.deployer.toBase58(),
      timestamp: e.timestamp.toString(),
      date: new Date(Number(e.timestamp) * 1000).toISOString(),
      buildHash: Buffer.from(e.buildHash).toString("hex"),
    }));
    results.entryCount = entries.length;
  } catch (e) {
    errors.push(`getEntries: ${e}`);
  }

  // --- Test 3: fetchOnChainBytecodeHash ---
  try {
    const onChainHash = await fetchOnChainBytecodeHash(connection, programId);
    results.onChainHash = onChainHash;
    results.onChainHashLength = onChainHash?.length ?? 0;
    results.onChainHashIsValid =
      onChainHash !== null && /^[0-9a-f]{64}$/.test(onChainHash);
  } catch (e) {
    errors.push(`fetchOnChainBytecodeHash: ${e}`);
  }

  // --- Test 4: isHeadInSync ---
  try {
    const entries = results.entries as Array<{ buildHash: string }> | undefined;
    const onChainHash = results.onChainHash as string | null;
    if (entries?.length && onChainHash) {
      const headHash = entries[entries.length - 1].buildHash;
      results.headRecordedHash = headHash;
      results.isHeadInSync = isHeadInSync(headHash, onChainHash);
    } else {
      results.isHeadInSync = "N/A — no entries or no on-chain hash";
    }
  } catch (e) {
    errors.push(`isHeadInSync: ${e}`);
  }

  // --- Test 5: getEntriesByDeployer ---
  try {
    // Use the authority from the RecipeBook as a test deployer
    const rb = results.recipeBook as { authority: string } | null;
    if (rb) {
      const deployer = new PublicKey(rb.authority);
      const grouped = await getEntriesByDeployer(connection, deployer);
      const groupedResult: Record<string, unknown[]> = {};
      for (const [rbKey, entries] of grouped) {
        groupedResult[rbKey] = entries.map((e) => ({
          index: e.index.toString(),
          repo: e.repo,
          commit: e.commit,
          timestamp: e.timestamp.toString(),
          date: new Date(Number(e.timestamp) * 1000).toISOString(),
        }));
      }
      results.entriesByDeployer = groupedResult;
      results.deployerEntryCount = [...grouped.values()].reduce(
        (sum, arr) => sum + arr.length,
        0
      );
    }
  } catch (e) {
    errors.push(`getEntriesByDeployer: ${e}`);
  }

  results.errors = errors;
  results.network = "devnet";
  results.rpcUrl = "https://api.devnet.solana.com";

  return NextResponse.json(results);
}
