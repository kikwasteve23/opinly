import type { Question, Study, StudyKind } from "./types";
import { newId } from "./ids";

type Draft = Omit<Study, "id" | "published"> & { id?: string };

function mockSurvey(topic: string, count: number, reward: number, minutes: number, kind: StudyKind): Study {
  const focus = topic.trim() || "everyday products";
  const questions: Question[] = [
    {
      id: "q1",
      type: "single",
      prompt: `How often do you think about ${focus}?`,
      options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"],
      required: true,
    },
    {
      id: "q2",
      type: "multi",
      prompt: `Which of these matter most when you judge ${focus}? Select all that apply.`,
      options: ["Price", "Quality", "Trust", "Convenience", "What friends say", "None of these"],
      required: true,
    },
    {
      id: "attn1",
      type: "attention",
      prompt: "To confirm you are reading, select “I am paying attention”.",
      options: ["Skip this", "I am paying attention", "Not sure"],
      correct: "I am paying attention",
      required: true,
    },
    {
      id: "q3",
      type: "scale",
      prompt: `How satisfied are you with your current experience of ${focus}?`,
      options: ["1 — Not at all", "2", "3", "4", "5 — Completely"],
      required: true,
    },
    {
      id: "q4",
      type: "text",
      prompt: `In your own words, what would you change about ${focus}?`,
      required: true,
    },
  ];
  questions.splice(Math.max(3, Math.min(count, 8)));

  return {
    id: newId("std"),
    title: `Opinions on ${focus}`,
    summary: `A short study about how people think about ${focus}.`,
    kind,
    reward,
    minutes,
    format: "Survey",
    device: "Desktop or phone",
    published: true,
    tier: reward >= 50 ? 4 : reward >= 20 ? 3 : reward >= 8 ? 2 : 1,
    questions,
  };
}

function parseModelJson(text: string): Draft | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as Draft;
  } catch {
    return null;
  }
}

export async function generateSurveyDraft(input: {
  topic: string;
  questionCount: number;
  reward: number;
  minutes: number;
  kind: StudyKind;
}): Promise<{ study: Study; source: "openai" | "mock" }> {
  const count = Math.max(3, Math.min(10, input.questionCount || 5));
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return { study: mockSurvey(input.topic, count, input.reward, input.minutes, input.kind), source: "mock" };
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You write paid research surveys. Reply with JSON only, no markdown. Shape: {title, summary, kind, format, device, questions:[{id,type,prompt,options,required,correct}]}. Types: single, multi, text, scale, attention. Include one attention check with a known correct option.",
        },
        {
          role: "user",
          content: `Topic: ${input.topic}. Kind: ${input.kind}. About ${count} questions. Reward $${input.reward}, ~${input.minutes} minutes.`,
        },
      ],
    }),
  });
  if (!res.ok) {
    return { study: mockSurvey(input.topic, count, input.reward, input.minutes, input.kind), source: "mock" };
  }
  const payload = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const parsed = parseModelJson(payload.choices?.[0]?.message?.content ?? "");
  if (!parsed?.title || !parsed.questions?.length) {
    return { study: mockSurvey(input.topic, count, input.reward, input.minutes, input.kind), source: "mock" };
  }
  return {
    source: "openai",
    study: {
      id: newId("std"),
      title: parsed.title,
      summary: parsed.summary || `A study about ${input.topic}.`,
      kind: input.kind,
      reward: input.reward,
      minutes: input.minutes,
      format: parsed.format || "Survey",
      device: parsed.device || "Desktop or phone",
      published: true,
      tier: input.reward >= 20 ? 3 : input.reward >= 8 ? 2 : 1,
      questions: parsed.questions,
    },
  };
}
