import { Pool } from "pg";
import type { StoreData } from "../types";

let pool: Pool | null = null;
let migrated = false;

export function databaseUrl() {
  return (
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    ""
  );
}

function getPool() {
  const url = databaseUrl();
  if (!url) return null;
  if (!pool) {
    const needsSsl = !/localhost|127\.0\.0\.1/.test(url);
    pool = new Pool({
      connectionString: url,
      max: 8,
      ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS app_state (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by TEXT,
  identity_status TEXT NOT NULL,
  account_status TEXT NOT NULL,
  available NUMERIC(12,2) NOT NULL,
  pending NUMERIC(12,2) NOT NULL,
  withdrawn NUMERIC(12,2) NOT NULL,
  body JSONB NOT NULL
);
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  study_id TEXT NOT NULL,
  status TEXT NOT NULL,
  body JSONB NOT NULL
);
CREATE TABLE IF NOT EXISTS withdrawals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  requested NUMERIC(12,2) NOT NULL,
  body JSONB NOT NULL
);
`;

export async function ensureSchema() {
  const db = getPool();
  if (!db || migrated) return db;
  await db.query(SCHEMA);
  migrated = true;
  return db;
}

export async function loadPostgresStore(): Promise<StoreData | null> {
  const db = await ensureSchema();
  if (!db) return null;
  const result = await db.query<{ data: StoreData }>("SELECT data FROM app_state WHERE id = $1", ["main"]);
  const row = result.rows[0];
  if (!row?.data) return { users: [], submissions: [], withdrawals: [] };
  return {
    users: row.data.users ?? [],
    submissions: row.data.submissions ?? [],
    withdrawals: row.data.withdrawals ?? [],
  };
}

export async function savePostgresStore(data: StoreData) {
  const db = await ensureSchema();
  if (!db) return;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO app_state (id, data, updated_at) VALUES ('main', $1::jsonb, now())
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
      [JSON.stringify(data)],
    );
    await client.query("DELETE FROM users");
    for (const user of data.users) {
      await client.query(
        `INSERT INTO users (id, email, role, referral_code, referred_by, identity_status, account_status, available, pending, withdrawn, body)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb)`,
        [
          user.id,
          user.email,
          user.role,
          user.referralCode,
          user.referredBy,
          user.identityStatus,
          user.accountStatus,
          user.available,
          user.pending,
          user.withdrawn,
          JSON.stringify(user),
        ],
      );
    }
    await client.query("DELETE FROM submissions");
    for (const submission of data.submissions) {
      await client.query(
        `INSERT INTO submissions (id, user_id, study_id, status, body) VALUES ($1,$2,$3,$4,$5::jsonb)`,
        [submission.id, submission.userId, submission.studyId, submission.status, JSON.stringify(submission)],
      );
    }
    await client.query("DELETE FROM withdrawals");
    for (const withdrawal of data.withdrawals) {
      await client.query(
        `INSERT INTO withdrawals (id, user_id, status, requested, body) VALUES ($1,$2,$3,$4,$5::jsonb)`,
        [withdrawal.id, withdrawal.userId, withdrawal.status, withdrawal.requested, JSON.stringify(withdrawal)],
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function pingDatabase() {
  const db = await ensureSchema();
  if (!db) return { connected: false as const };
  await db.query("SELECT 1");
  return { connected: true as const };
}
