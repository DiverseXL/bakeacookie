/**
 * On-chain bytecode verification — ported from the CLI's
 * src/lib/deployPipeline.ts (fetchOnChainBytecodeHash).
 *
 * This went through three real bugs before landing on the correct approach:
 * 1. Wrong ProgramData header byte count
 * 2. Flawed trailing-zero-stripping heuristic
 * 3. Incorrectly computing ELF size by iterating section headers and
 *    taking max(sh_offset + sh_size) — this excluded the section header
 *    table itself, producing a hash mismatch.
 *
 * The correct (final) approach — must remain byte-for-byte identical to
 * the CLI's deployPipeline.ts:
 * - Skip EXACTLY the UpgradeableLoaderState::ProgramData header (13 or 45 bytes)
 * - Parse ELF64 header fields e_shoff, e_shentsize, e_shnum
 * - Compute ELF size as: e_shoff + e_shentsize * e_shnum
 * - SHA-256 hash those bytes (covers the entire ELF including the
 *   section header table — no guessing, no heuristic)
 *
 * CRITICAL: Do NOT reimplement with a section-iteration heuristic or
 * any other approach. "is the account executable" is NOT the same as
 * "bytecode matches the recorded hash."
 */

import { createHash } from "crypto";
import { Connection, PublicKey } from "@solana/web3.js";

/** BPFLoaderUpgradeab1e — the only loader that stores ProgramData accounts */
const BPF_LOADER_UPGRADEABLE = new PublicKey(
  "BPFLoaderUpgradeab1e11111111111111111111111"
);

/**
 * Derive the ProgramData PDA for an upgradeable program.
 * Seeds: [programId] — owned by BPFLoaderUpgradeab1e.
 */
function getProgramDataPda(programId: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [programId.toBuffer()],
    BPF_LOADER_UPGRADEABLE
  );
  return pda;
}

/**
 * Fetch the on-chain program's bytecode and compute its SHA-256 hash.
 *
 * This is the EXACT logic from the CLI's deployPipeline.ts:
 * 1. Derive ProgramData PDA from the program address
 * 2. Fetch its account data
 * 3. Parse UpgradeableLoaderState::ProgramData header:
 *    - 4 bytes: variant tag (u32 LE, value 3 for ProgramData)
 *    - 8 bytes: slot (u64 LE)
 *    - 1 byte: option discriminant (1 = Some, 0 = None)
 *    - 32 bytes: upgrade authority pubkey (only if Some)
 *    Total: 45 bytes when authority present, 13 bytes when absent
 * 4. The ELF binary starts right after the header (at headerLen)
 * 5. Parse ELF64 header fields:
 *    - e_shoff (offset 40, u64 LE): section header table offset from ELF start
 *    - e_shentsize (offset 58, u16 LE): byte size of each section header entry
 *    - e_shnum (offset 60, u16 LE): number of section header entries
 * 6. ELF size = e_shoff + e_shentsize * e_shnum
 *    (This includes the section header table itself — the earlier bug where we
 *     iterated section headers to find max end offset excluded this table.)
 * 7. SHA-256 hash of ELF bytes [0, elfSize)
 *
 * @returns 64-char lowercase hex SHA-256 string, or null if the program
 *          is not found or is not an upgradeable BPF program.
 */
export async function fetchOnChainBytecodeHash(
  connection: Connection,
  programId: PublicKey
): Promise<string | null> {
  const programDataPda = getProgramDataPda(programId);
  const accountInfo = await connection.getAccountInfo(programDataPda);

  if (!accountInfo || !accountInfo.data || accountInfo.data.length === 0) {
    return null;
  }

  const data = accountInfo.data;

  // --- Step 3: Parse UpgradeableLoaderState::ProgramData header ---
  const variant = data.readUInt32LE(0);
  if (variant !== 3) {
    // Not a ProgramData variant — unexpected for an upgradeable program
    return null;
  }

  const hasAuthority = data[12] === 1;
  const headerLen = 4 + 8 + 1 + (hasAuthority ? 32 : 0); // 45 or 13

  // --- Step 4: ELF binary starts at headerLen ---
  const elfData = data.subarray(headerLen);

  if (elfData.length < 64) {
    // Too small to contain an ELF64 header
    return null;
  }

  // Verify ELF magic bytes
  if (
    elfData[0] !== 0x7f ||
    elfData[1] !== 0x45 || // 'E'
    elfData[2] !== 0x4c || // 'L'
    elfData[3] !== 0x46 // 'F'
  ) {
    return null;
  }

  // --- Step 5: Parse ELF64 header & compute exact ELF size ---
  // ELF size = e_shoff + e_shentsize * e_shnum
  // This is the EXACT formula from the CLI's deployPipeline.ts.
  // DO NOT replace with section-iteration (max sh_offset+sh_size) — that
  // excludes the section header table itself and produces wrong hashes.
  const e_shoff = Number(elfData.readBigUInt64LE(40));
  const e_shentsize = elfData.readUInt16LE(58);
  const e_shnum = elfData.readUInt16LE(60);
  const elfSize = e_shoff + e_shentsize * e_shnum;

  const elfToHash = elfData.subarray(0, elfSize);
  return sha256Hex(elfToHash);
}

/**
 * Compare the recorded build hash against the live on-chain bytecode hash.
 * Centralised here so the "untracked deploy" logic is consistent everywhere.
 */
export function isHeadInSync(
  recordedHash: string,
  onChainHash: string
): boolean {
  return recordedHash === onChainHash;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function sha256Hex(data: Buffer | Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}
