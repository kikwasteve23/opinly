import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { databaseUrl, loadPostgresStore, savePostgresStore } from "./db/postgres";
import type { StoreData, Study, StudyTier, Submission, User } from "./types";
import { DEFAULT_STUDIES } from "./studies-data";
import { newId } from "./ids";
import { normalizeUser } from "./normalize-user";
import { processDueWork } from "./progression";
import { STARTER_EARNINGS_CAP, studyEarningsUsd } from "./referrals";

export { newId } from "./ids";
export { normalizeUser } from "./normalize-user";
export { makeReferralCode } from "./ids";

const DATA_PATH = path.join(process.cwd(), "data", "store.json");
let queue: Promise<unknown> = Promise.resolve();

function emptyStore(): StoreData {
  return { users: [], submissions: [], withdrawals: [], studies: [], ledger: [], marketerJobs: [], chat: [], deposits: [] };
}

function inferTier(study: Study): StudyTier {
  if (study.tier === 1 || study.tier === 2 || study.tier === 3 || study.tier === 4) return study.tier;
  if (study.reward >= 50) return 4;
  if (study.reward >= 20) return 3;
  if (study.reward >= 8) return 2;
  return 1;
}

function normalizeStore(data: StoreData): StoreData {
  return {
    users: (data.users ?? []).map((user) => normalizeUser(user)),
    submissions: (data.submissions ?? []).map((s) => ({
      ...s,
      autoApproveAt: s.autoApproveAt ?? null,
    })),
    withdrawals: (data.withdrawals ?? []).map((w) => ({
      ...w,
      reviewedAt: w.reviewedAt ?? null,
      adminNote: w.adminNote ?? null,
    })),
    studies: (data.studies ?? []).map((study) => ({
      ...study,
      published: study.published ?? true,
      tier: inferTier(study),
    })),
    ledger: data.ledger ?? [],
    marketerJobs: data.marketerJobs ?? [],
    chat: data.chat ?? [],
    deposits: data.deposits ?? [],
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

function seedReferralSubmission(userId: string, studyId: string): Submission {
  const now = new Date().toISOString();
  return {
    id: newId("sub"),
    userId,
    studyId,
    status: "approved",
    answers: { q1: "Yes", q3: "I completed this starter survey after joining with a referral link." },
    startedAt: now,
    updatedAt: now,
    submittedAt: now,
    reviewedAt: now,
    rejectionReason: null,
    autoApproveAt: null,
  };
}

async function seedIfNeeded(data: StoreData): Promise<{ data: StoreData; seeded: boolean }> {
  data = normalizeStore(data);
  let seeded = false;
  if (data.studies.length === 0) {
    data.studies = DEFAULT_STUDIES.map((study) => ({ ...study }));
    seeded = true;
  } else {
    for (const extra of DEFAULT_STUDIES) {
      if (!data.studies.some((s) => s.id === extra.id)) {
        data.studies.push({ ...extra });
        seeded = true;
      }
    }
  }
  const needsAdmin = !data.users.some((u) => u.email === "admin@opinly.local");
  const needsDemo = !data.users.some((u) => u.email === "demo@opinly.local");
  const existingDemo = data.users.find((u) => u.email === "demo@opinly.local");
  const demoReferralCount = existingDemo ? data.users.filter((u) => u.referredBy === existingDemo.id).length : 0;
  const needsReferrals = Boolean(existingDemo) && demoReferralCount < 20;
  const needsDemoCap =
    Boolean(existingDemo) &&
    studyEarningsUsd(data.studies, data.submissions, existingDemo.id) < STARTER_EARNINGS_CAP;
  if (!needsAdmin && !needsDemo && !needsReferrals && !needsDemoCap && !seeded) return { data, seeded: false };

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
        available: 512.4,
        pending: 8.25,
        withdrawn: 140,
        walletActivated: false,
        detectedCountry: "US",
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
    const sampleId = data.studies.find((s) => s.tier === 1)?.id ?? data.studies[0]?.id ?? "news-trust";
    for (let i = existing + 1; i <= 20; i += 1) {
      const id = `usr_ref${String(i).padStart(2, "0")}`;
      if (data.users.some((u) => u.id === id || u.email === `referral${i}@opinly.local`)) continue;
      data.users.push(
        await verifiedShell({
          id,
          email: `referral${i}@opinly.local`,
          passwordHash: participantPassword,
          referredBy: demo.id,
          referralCode: `REF${String(i).padStart(5, "0")}`,
          available: 4.5,
          identityNote: "Seeded active referral: approved and completed a survey.",
        }),
      );
      if (!data.submissions.some((s) => s.userId === id)) {
        data.submissions.push(seedReferralSubmission(id, sampleId));
      }
      seeded = true;
    }
    for (const referral of data.users.filter((u) => u.referredBy === demo.id)) {
      if (!data.submissions.some((s) => s.userId === referral.id && s.status === "approved")) {
        data.submissions.push(seedReferralSubmission(referral.id, sampleId));
        seeded = true;
      }
    }
    if (studyEarningsUsd(data.studies, data.submissions, demo.id) < STARTER_EARNINGS_CAP) {
      for (const study of data.studies.filter((s) => s.published && s.tier === 1)) {
        if (studyEarningsUsd(data.studies, data.submissions, demo.id) >= STARTER_EARNINGS_CAP) break;
        if (data.submissions.some((s) => s.userId === demo.id && s.studyId === study.id && (s.status === "approved" || s.status === "pending_review"))) {
          continue;
        }
        data.submissions.push(seedReferralSubmission(demo.id, study.id));
        seeded = true;
      }
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
    const due = await processDueWork(loaded.data);
    result = await fn(loaded.data);
    if (write || loaded.seeded || due) await persistStore(loaded.data);
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
