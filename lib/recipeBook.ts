import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import IDL from "@/lib/idl/recipe_book.json";
import {
  RECIPE_BOOK_PROGRAM_ID,
  type RecipeBookAccount,
  type EntryAccount,
} from "./types";

/**
 * Get or create an Anchor Program instance for the Recipe Book.
 * Uses a read-only provider (no wallet needed).
 */
function getProgram(connection: Connection) {
  const provider = new AnchorProvider(
    connection,
    {
      publicKey: PublicKey.default,
      signTransaction: async (tx: never) => tx,
      signAllTransactions: async (txs: never) => txs,
    } as never,
    { commitment: "confirmed" }
  );
  return new Program(IDL as never, provider);
}

/**
 * Derive the RecipeBook PDA for a given target program.
 * Seeds: ["recipe_book", programId]
 */
export function getRecipeBookPda(
  programId: PublicKey
): PublicKey {
  const programIdKey =
    typeof programId === "string" ? new PublicKey(programId) : programId;
  const recipeBookProgram = new PublicKey(RECIPE_BOOK_PROGRAM_ID);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("recipe_book"), programIdKey.toBuffer()],
    recipeBookProgram
  );
  return pda;
}

/**
 * Fetch a RecipeBook account directly by its PDA (not by target program ID).
 * Used by the wallet page to resolve recipe book PDAs from getEntriesByDeployer.
 */
export async function getRecipeBookByPda(
  connection: Connection,
  recipeBookPda: PublicKey
): Promise<RecipeBookAccount | null> {
  const program = getProgram(connection);
  try {
    const account = await (program.account as any).recipeBook.fetch(recipeBookPda);
    return {
      targetProgramId: account.targetProgramId as PublicKey,
      authority: account.authority as PublicKey,
      entryCount: account.entryCount as bigint,
      bump: account.bump as number,
    };
  } catch {
    return null;
  }
}

/**
 * Derive an Entry PDA for a given RecipeBook and entry index.
 * Seeds: ["entry", recipeBookPda, index as u64 LE bytes]
 */
export function getEntryPda(
  recipeBookPda: PublicKey,
  index: number
): PublicKey {
  const recipeBookProgram = new PublicKey(RECIPE_BOOK_PROGRAM_ID);
  const indexBuf = Buffer.alloc(8);
  indexBuf.writeBigUInt64LE(BigInt(index));
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("entry"), recipeBookPda.toBuffer(), indexBuf],
    recipeBookProgram
  );
  return pda;
}

/**
 * Fetch and decode the RecipeBook account for a target program.
 * Returns null if the account doesn't exist (the "untracked" case, not an error).
 */
export async function getRecipeBook(
  connection: Connection,
  programId: PublicKey
): Promise<RecipeBookAccount | null> {
  const program = getProgram(connection);
  const rbPda = getRecipeBookPda(programId);

  try {
    const account = await (program.account as any).recipeBook.fetch(rbPda);
    return {
      targetProgramId: account.targetProgramId as PublicKey,
      authority: account.authority as PublicKey,
      entryCount: account.entryCount as bigint,
      bump: account.bump as number,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch the RecipeBook, read entry_count, then fetch and decode ALL Entry
 * accounts (0 to entry_count-1). Returns entries sorted newest-first by timestamp.
 *
 * If the RecipeBook doesn't exist, returns an empty array.
 */
export async function getEntries(
  connection: Connection,
  programId: PublicKey
): Promise<EntryAccount[]> {
  const recipeBook = await getRecipeBook(connection, programId);
  if (!recipeBook) return [];

  const recipeBookProgram = new PublicKey(RECIPE_BOOK_PROGRAM_ID);
  const rbPda = getRecipeBookPda(programId);
  const program = getProgram(connection);
  const count = Number(recipeBook.entryCount);

  if (count === 0) return [];

  // Fetch all entries in parallel
  const entries: EntryAccount[] = [];
  const batchSize = 10;

  for (let i = 0; i < count; i += batchSize) {
    const batch = Array.from(
      { length: Math.min(batchSize, count - i) },
      (_, j) => i + j
    );

    const results = await Promise.all(
      batch.map(async (idx) => {
        const [entryPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("entry"),
            rbPda.toBuffer(),
            (() => {
              const buf = Buffer.alloc(8);
              buf.writeBigUInt64LE(BigInt(idx));
              return buf;
            })(),
          ],
          recipeBookProgram
        );
        try {
          const raw = await (program.account as any).entry.fetch(entryPda);
          return {
            recipeBook: raw.recipeBook as PublicKey,
            index: raw.index as bigint,
            repo: raw.repo as string,
            commit: raw.commit as string,
            buildHash: new Uint8Array(raw.buildHash as number[]),
            buffer: raw.buffer as PublicKey,
            deployer: raw.deployer as PublicKey,
            timestamp: raw.timestamp as bigint,
            bump: raw.bump as number,
          } as EntryAccount;
        } catch {
          return null;
        }
      })
    );

    for (const entry of results) {
      if (entry) entries.push(entry);
    }
  }

  // Sort newest-first by timestamp
  entries.sort((a, b) => Number(b.timestamp - a.timestamp));
  return entries;
}

/**
 * Find all Entry accounts where the deployer matches a given public key.
 *
 * NOTE: The Entry account's deployer field is at a VARIABLE byte offset because
 * the preceding repo and commit fields are variable-length Borsh strings.
 * Therefore we cannot use a fixed-offset memcmp filter. Instead, we fetch all
 * Entry accounts (filtered by discriminator) and filter client-side.
 *
 * Returns entries grouped by their parent RecipeBook (target program),
 * sorted newest-first within each group.
 */
export async function getEntriesByDeployer(
  connection: Connection,
  deployerPubkey: PublicKey
): Promise<Map<string, EntryAccount[]>> {
  const program = getProgram(connection);
  const deployer =
    typeof deployerPubkey === "string"
      ? new PublicKey(deployerPubkey)
      : deployerPubkey;

  // Fetch all Entry accounts via getProgramAccounts
  const rawEntries = await (program.account as any).entry.all();

  // Filter by deployer and group by recipe_book
  const grouped = new Map<string, EntryAccount[]>();

  for (const raw of rawEntries) {
    if (!(raw.account.deployer as PublicKey).equals(deployer)) continue;

    const entry: EntryAccount = {
      recipeBook: raw.account.recipeBook as PublicKey,
      index: raw.account.index as bigint,
      repo: raw.account.repo as string,
      commit: raw.account.commit as string,
      buildHash: new Uint8Array(raw.account.buildHash as number[]),
      buffer: raw.account.buffer as PublicKey,
      deployer: raw.account.deployer as PublicKey,
      timestamp: raw.account.timestamp as bigint,
      bump: raw.account.bump as number,
    };

    const rbKey = entry.recipeBook.toBase58();
    if (!grouped.has(rbKey)) grouped.set(rbKey, []);
    grouped.get(rbKey)!.push(entry);
  }

  // Sort each group newest-first
  for (const [, entries] of grouped) {
    entries.sort((a, b) => Number(b.timestamp - a.timestamp));
  }

  return grouped;
}
