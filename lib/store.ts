import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { databaseUrl, loadPostgresStore, savePostgresStore } from "./db/postgres";
import type { StoreData, User } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "store.json");
let queue: Promise<unknown> = Promise.resolve();

function emptyStore(): StoreData {
  return { users: [], submissions: [], withdrawals: [] };
}

export function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

export function makeReferralCode() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
}

export function normalizeUser(raw: Partial<User> & Pick<User, "id" | "email" | "passwordHash">): User {
  const { referralCode, referredBy, ...rest } = raw;
  return {
    role: "participant",
    accountStatus: "active",
    createdAt: raw.createdAt ?? new Date().toISOString(),
    profile: raw.profile ?? null,
    englishPassed: raw.englishPassed ?? false,
    englishWriting: raw.englishWriting ?? "",
    identityStatus: raw.identityStatus ?? "not_started",
    identityNote: raw.identityNote ?? "",
    onboardingStep: raw.onboardingStep ?? "profile",
    available: raw.available ?? 0,
    pending: raw.pending ?? 0,
    withdrawn: raw.withdrawn ?? 0,
    payout: raw.payout ?? { network: "usdt_trc20", address: "", addressChangedAt: null },
    lastWithdrawalAt: raw.lastWithdrawalAt ?? null,
    ...rest,
    referredBy: referredBy ?? null,
    referralCode: referralCode || makeReferralCode(),
  };
}

function normalizeStore(data: StoreData): StoreData {
  return {
    users: (data.users ?? []).map((user) => normalizeUser(user)),
    submissions: data.submissions ?? [],
    withdrawals: (data.withdrawals ?? []).map((w) => ({
      ...w,
      reviewedAt: w.reviewedAt ?? null,
      adminNote: w.adminNote ?? null,
    })),
  };
}

async function verifiedShell(overrides: Partial<User> & Pick<User, "id" | "email" | "passwordHash">): Promise<User> {
  return normalizeUser({
    onboardingStep: "complete",
    englishPassed: true,
    identityStatus: "approved",
    identityNote: "Seeded account.",
    ...overrides,
  });
}

async function seedIfNeeded(data: StoreData): Promise<{ data: StoreData; seeded: boolean }> {
  data = normalizeStore(data);
  let seeded = false;
  const needsAdmin = !data.users.some((u) => u.email === "admin@opinly.local");
  const needsDemo = !data.users.some((u) => u.email === "demo@opinly.local");
  const existingDemo = data.users.find((u) => u.email === "demo@opinly.local");
  const demoReferralCount = existingDemo ? data.users.filter((u) => u.referredBy === existingDemo.id).length : 0;
  const needsReferrals = Boolean(existingDemo) && demoReferralCount < 15;
  if (!needsAdmin && !needsDemo && !needsReferrals) return { data, seeded: false };

  const participantPassword = await bcrypt.hash(process.env.DEMO_USER_PASSWORD ?? "demo-dev-only", 10);
  const adminPassword = await bcrypt.hash(process.env.DEMO_ADMIN_PASSWORD ?? "admin-dev-only", 10);

  if (!data.users.some((u) => u.email === "admin@opinly.local")) {
    data.users.push(
      await verifiedShell({
        id: "usr_admin",
        email: "admin@opinly.local",
        passwordHash: adminPassword,
        role: "admin",
        referralCode: "OPINADMN",
        profile: {
          legalName: "Opinly Admin",
          dateOfBirth: "1990-01-01",
          gender: "Prefer not to say",
          country: "United States",
          city: "Portland",
          region: "Oregon",
          postalCode: "97201",
          languages: ["English"],
          occupation: "Operations",
        },
      }),
    );
    seeded = true;
  }

  if (!data.users.some((u) => u.email === "demo@opinly.local")) {
    data.users.push(
      await verifiedShell({
        id: "usr_demo",
        email: "demo@opinly.local",
        passwordHash: participantPassword,
        referralCode: "OPINDEMO",
        available: 62.75,
        pending: 8.25,
        withdrawn: 140,
        profile: {
          legalName: "Alex Rivera",
          dateOfBirth: "1994-03-12",
          gender: "Prefer not to say",
          country: "United States",
          city: "Portland",
          region: "Oregon",
          postalCode: "97201",
          languages: ["English"],
          occupation: "Retail",
        },
        englishWriting: "I enjoy answering research questions in my spare time.",
        identityNote: "Demo account, pre-verified.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
      }),
    );
    seeded = true;
  }

  const demo = data.users.find((u) => u.email === "demo@opinly.local");
  if (demo) {
    const existing = data.users.filter((u) => u.referredBy === demo.id).length;
    for (let i = existing + 1; i <= 15; i += 1) {
      const id = `usr_ref${String(i).padStart(2, "0")}`;
      if (data.users.some((u) => u.id === id || u.email === `referral${i}@opinly.local`)) continue;
      data.users.push(
        await verifiedShell({
          id,
          email: `referral${i}@opinly.local`,
          passwordHash: participantPassword,
          referredBy: demo.id,
          referralCode: `REF${String(i).padStart(5, "0")}`,
          available: 0,
          identityNote: "Seeded qualified referral for the demo account.",
        }),
      );
      seeded = true;
    }
  }

  return { data, seeded };
}

async function readFileStore(): Promise<StoreData> {
  try {
    const raw = await readFile(DATA_PATH, "utf8");
    return normalizeStore(JSON.parse(raw) as StoreData);
  } catch {
    return emptyStore();
  }
}

async function writeFileStore(data: StoreData) {
  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  await writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

async function readStore(): Promise<StoreData> {
  if (databaseUrl()) {
    return normalizeStore((await loadPostgresStore()) ?? emptyStore());
  }
  return readFileStore();
}

async function persistStore(data: StoreData) {
  if (databaseUrl()) {
    await savePostgresStore(data);
    return;
  }
  await writeFileStore(data);
}

async function withStore<T>(fn: (data: StoreData) => Promise<T> | T, write: boolean): Promise<T> {
  let result!: T;
  const run = async () => {
    const loaded = await seedIfNeeded(await readStore());
    result = await fn(loaded.data);
    if (write || loaded.seeded) await persistStore(loaded.data);
  };
  queue = queue.then(run, run);
  await queue;
  return result;
}

export async function mutateStore<T>(fn: (data: StoreData) => Promise<T> | T): Promise<T> {
  return withStore(fn, true);
}

export async function readStoreSnapshot(): Promise<StoreData> {
  return withStore((data) => structuredClone(data), false);
}
