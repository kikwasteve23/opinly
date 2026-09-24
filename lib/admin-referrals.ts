import { hasFinishedSurvey } from "./referrals";
import { findStudy } from "./studies-data";
import { newId } from "./ids";
import { normalizeUser } from "./normalize-user";
import type { StoreData, Submission, User } from "./types";

function fillerAnswers(study: { questions: { id: string; type: string; options?: string[]; correct?: string }[] }) {
  const answers: Record<string, string | string[]> = {};
  for (const question of study.questions) {
    if (question.type === "multi") answers[question.id] = question.options?.slice(0, 1) ?? ["Yes"];
    else if (question.type === "text") answers[question.id] = "I finished this starter survey after joining with a referral.";
    else if (question.type === "attention" && question.correct) answers[question.id] = question.correct;
    else answers[question.id] = question.options?.[0] ?? "Yes";
  }
  return answers;
}

export function addQualifiedReferrals(data: StoreData, sponsorId: string, count: number, now = Date.now()) {
  const sponsor = data.users.find((u) => u.id === sponsorId && u.role === "participant");
  if (!sponsor) return { error: "Person not found." };
  if (!Number.isInteger(count) || count < 1 || count > 100) return { error: "Add between 1 and 100 referrals." };
  const sampleStudy = data.studies.find((s) => s.published) ?? data.studies[0];
  if (!sampleStudy) return { error: "Publish a study first so referrals can complete one." };

  const added: User[] = [];
  for (let i = 0; i < count; i += 1) {
    const id = newId("usr");
    const recruit = normalizeUser({
      id,
      email: `admin.ref.${sponsorId}.${id.slice(-8)}@opinly.local`,
      passwordHash: "admin-added-referral",
      referredBy: sponsor.id,
      onboardingStep: "complete",
      englishPassed: true,
      identityStatus: "approved",
      identityNote: `Added by admin for ${sponsor.email}.`,
      englishWriting: "I joined Opinly from a referral and completed a survey.",
      profile: {
        legalName: `Referral ${id.slice(-4)}`,
        dateOfBirth: "1992-06-15",
        gender: "Prefer not to say",
        country: sponsor.profile?.country ?? "United States",
        city: sponsor.profile?.city ?? "Nairobi",
        region: sponsor.profile?.region ?? "Nairobi",
        postalCode: sponsor.profile?.postalCode ?? "00100",
        languages: ["English"],
        occupation: "Participant",
      },
    });
    data.users.push(recruit);
    const submission: Submission = {
      id: newId("sub"),
      userId: id,
      studyId: sampleStudy.id,
      status: "approved",
      answers: fillerAnswers(sampleStudy),
      startedAt: new Date(now - 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now).toISOString(),
      submittedAt: new Date(now - 40 * 60 * 1000).toISOString(),
      reviewedAt: new Date(now).toISOString(),
      rejectionReason: null,
      autoApproveAt: null,
    };
    data.submissions.push(submission);
    added.push(recruit);
  }
  return { ok: `Added ${added.length} active referral${added.length === 1 ? "" : "s"}.`, added };
}

export function attachExistingReferral(data: StoreData, sponsorId: string, email: string) {
  const sponsor = data.users.find((u) => u.id === sponsorId && u.role === "participant");
  if (!sponsor) return { error: "Person not found." };
  const key = email.trim().toLowerCase();
  if (!key.includes("@")) return { error: "Enter the person’s email." };
  const recruit = data.users.find((u) => u.email === key && u.role === "participant");
  if (!recruit) return { error: "No participant with that email." };
  if (recruit.id === sponsor.id) return { error: "A person cannot refer themselves." };
  recruit.referredBy = sponsor.id;
  return { ok: `Linked ${recruit.email} as a referral.`, recruit };
}

export function unlinkReferral(data: StoreData, sponsorId: string, referralId: string) {
  const recruit = data.users.find((u) => u.id === referralId && u.referredBy === sponsorId);
  if (!recruit) return { error: "That referral is not on this account." };
  recruit.referredBy = null;
  return { ok: `Removed ${recruit.email} from this account’s referrals.` };
}

export function referralStatusLabel(data: Pick<StoreData, "submissions">, person: User) {
  const finished = hasFinishedSurvey(data.submissions, person.id);
  if (person.accountStatus !== "active") return "suspended";
  if (person.identityStatus !== "approved") return "not counting (ID)";
  if (!finished) return "not counting (no survey)";
  return "active";
}