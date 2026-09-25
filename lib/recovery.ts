import { createHash, randomBytes } from "node:crypto";

export const RECOVERY_CODE_COUNT = 8;

/** Seeded only on the local/demo participant so forgot-password can be tried without signing in first. */
export const DEMO_RECOVERY_CODES = [
  "SAVE-K7M2",
  "SAVE-P9N4",
  "SAVE-Q3W8",
  "SAVE-T5H6",
  "SAVE-R2J9",
  "SAVE-X4C7",
  "SAVE-B8D3",
  "SAVE-F6G2",
];

function secret() {
  return process.env.APP_SECRET ?? "opinly-dev-secret-change-me";
}

export function normalizeRecoveryCode(raw: string) {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function formatRecoveryCode(raw: string) {
  const compact = normalizeRecoveryCode(raw);
  if (compact.length !== 8) return compact;
  return `${compact.slice(0, 4)}-${compact.slice(4)}`;
}

export function hashRecoveryCode(code: string) {
  return createHash("sha256").update(`${secret()}:${normalizeRecoveryCode(code)}`).digest("hex");
}

export function generateRecoveryCodes(count = RECOVERY_CODE_COUNT) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const codes: string[] = [];
  while (codes.length < count) {
    let compact = "";
    const bytes = randomBytes(8);
    for (let i = 0; i < 8; i += 1) compact += alphabet[bytes[i]! % alphabet.length];
    const formatted = formatRecoveryCode(compact);
    if (!codes.includes(formatted)) codes.push(formatted);
  }
  return {
    codes,
    hashes: codes.map((code) => hashRecoveryCode(code)),
  };
}

export function matchRecoveryCode(hashes: string[], raw: string) {
  const digest = hashRecoveryCode(raw);
  const index = hashes.indexOf(digest);
  return index;
}
