import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import type { StoreData, User } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "store.json");

let writeQueue: Promise<void> = Promise.resolve();

function emptyStore(): StoreData {
  return { users: [], submissions: [], withdrawals: [] };
}

async function seedIfNeeded(data: StoreData): Promise<StoreData> {
  if (data.users.length > 0) return data;
  const password = process.env.DEMO_USER_PASSWORD ?? "demo-dev-only";
  const demo: User = {
    id: "usr_demo",
    email: "demo@opinly.local",
    passwordHash: await bcrypt.hash(password, 10),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
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
    englishPassed: true,
    englishWriting: "I enjoy answering research questions in my spare time.",
    identityStatus: "approved",
    identityNote: "Demo account, pre-verified.",
    onboardingStep: "complete",
    available: 62.75,
    pending: 8.25,
    withdrawn: 140,
    payout: {
      network: "usdt_trc20",
      address: "",
      addressChangedAt: null,
    },
    lastWithdrawalAt: null,
  };
  data.users.push(demo);
  return data;
}

async function readStore(): Promise<StoreData> {
  try {
    const raw = await readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as StoreData;
    return {
      users: parsed.users ?? [],
      submissions: parsed.submissions ?? [],
      withdrawals: parsed.withdrawals ?? [],
    };
  } catch {
    return emptyStore();
  }
}

async function writeStore(data: StoreData) {
  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  await writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

export async function mutateStore<T>(fn: (data: StoreData) => Promise<T> | T): Promise<T> {
  let result!: T;
  writeQueue = writeQueue.then(async () => {
    const data = await seedIfNeeded(await readStore());
    result = await fn(data);
    await writeStore(data);
  });
  await writeQueue;
  return result;
}

export async function readFreshStore() {
  return mutateStore(async (data) => structuredClone(data));
}

export function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}
