import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api";
import { ENGLISH_QUESTIONS } from "@/lib/onboarding-data";
import { countryFromName } from "@/lib/geo";
import { mutateStore } from "@/lib/store";
import { publicUser } from "@/lib/session";

const profileSchema = z.object({
  step: z.literal("profile"),
  legalName: z.string().min(2),
  dateOfBirth: z.string().min(4),
  gender: z.string().min(1),
  country: z.string().min(1),
  city: z.string().min(1),
  region: z.string().min(1),
  postalCode: z.string().min(2),
  languages: z.array(z.string()).min(1),
  occupation: z.string().min(1),
});

const englishSchema = z.object({
  step: z.literal("english"),
  answers: z.record(z.string(), z.string()),
  writing: z.string().min(40),
});

const identitySchema = z.object({
  step: z.literal("identity"),
  documentType: z.string().min(1),
  issuingCountry: z.string().min(1),
  consent: z.literal(true),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const body = await request.json();

  if (body.step === "profile") {
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Fill in every profile field so we can match you to studies." }, { status: 400 });
    }
    const born = new Date(parsed.data.dateOfBirth);
    const age = (Date.now() - born.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (!Number.isFinite(age) || age < 18) {
      return NextResponse.json({ error: "You must be 18 or over to join Opinly." }, { status: 400 });
    }
    const user = await mutateStore((data) => {
      const current = data.users.find((u) => u.id === auth.user.id);
      if (!current) throw new Error("missing");
      current.profile = {
        legalName: parsed.data.legalName,
        dateOfBirth: parsed.data.dateOfBirth,
        gender: parsed.data.gender,
        country: parsed.data.country,
        city: parsed.data.city,
        region: parsed.data.region,
        postalCode: parsed.data.postalCode,
        languages: parsed.data.languages,
        occupation: parsed.data.occupation,
      };
      current.detectedCountry = countryFromName(parsed.data.country).code;
      current.onboardingStep = current.englishPassed ? current.onboardingStep : "english";
      return current;
    });
    return NextResponse.json({ user: publicUser(user) });
  }

  if (body.step === "english") {
    const parsed = englishSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Answer the grammar questions and write at least a few sentences." }, { status: 400 });
    }
    const correct = ENGLISH_QUESTIONS.filter((q) => parsed.data.answers[q.id] === q.correct).length;
    if (correct < 2) {
      return NextResponse.json(
        { error: "That score is below the bar. Read each question once more and try again." },
        { status: 400 },
      );
    }
    const user = await mutateStore((data) => {
      const current = data.users.find((u) => u.id === auth.user.id);
      if (!current) throw new Error("missing");
      current.englishPassed = true;
      current.englishWriting = parsed.data.writing;
      current.onboardingStep = "complete";
      return current;
    });
    return NextResponse.json({ user: publicUser(user) });
  }

  if (body.step === "identity") {
    const parsed = identitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Confirm the document type and that we may review it." }, { status: 400 });
    }
    const user = await mutateStore((data) => {
      const current = data.users.find((u) => u.id === auth.user.id);
      if (!current) throw new Error("missing");
      current.identityStatus = "pending";
      current.identityNote = `${parsed.data.documentType} · ${parsed.data.issuingCountry}. Waiting for an admin to review.`;
      current.onboardingStep = "complete";
      return current;
    });
    return NextResponse.json({ user: publicUser(user) });
  }

  return NextResponse.json({ error: "Unknown step." }, { status: 400 });
}
