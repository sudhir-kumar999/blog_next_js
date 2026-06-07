import type { MockQuestion, MockQuestionType, MockTestData } from "./types";

const MOCK_TEST_BLOCK = /```mock-test\s*\n([\s\S]*?)```/gi;

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : String(v ?? "").trim();
}

function normalizeQuestion(raw: unknown, index: number): MockQuestion | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const typeRaw = asString(o.type).toLowerCase();
  const text = asString(o.text ?? o.question);
  if (!text) return null;

  const id = asString(o.id) || `q${index + 1}`;
  const explanation = asString(o.explanation) || undefined;

  if (typeRaw === "mcq") {
    const options = Array.isArray(o.options)
      ? o.options.map((opt) => asString(opt)).filter(Boolean)
      : [];
    if (options.length < 2) return null;
    let correctIndex =
      typeof o.correctIndex === "number"
        ? o.correctIndex
        : typeof o.answerIndex === "number"
          ? o.answerIndex
          : 0;
    correctIndex = Math.max(0, Math.min(correctIndex, options.length - 1));
    return { id, type: "mcq", text, options, correctIndex, explanation };
  }

  if (typeRaw === "tf" || typeRaw === "truefalse" || typeRaw === "true-false") {
    const correct =
      typeof o.correct === "boolean"
        ? o.correct
        : /^(true|yes|sahi|सही|1)$/i.test(asString(o.correct ?? o.answer));
    return { id, type: "tf", text, correct, explanation };
  }

  if (typeRaw === "short" || typeRaw === "fill" || typeRaw === "text") {
    const acceptableAnswers = Array.isArray(o.acceptableAnswers)
      ? o.acceptableAnswers.map((a) => asString(a)).filter(Boolean)
      : o.answer
        ? [asString(o.answer)]
        : [];
    if (!acceptableAnswers.length) return null;
    return { id, type: "short", text, acceptableAnswers, explanation };
  }

  return null;
}

export function parseMockTestJson(raw: string): MockTestData | null {
  try {
    const parsed = JSON.parse(raw.trim()) as Record<string, unknown>;
    const title = asString(parsed.title) || "Mock Test";
    const durationMinutes =
      typeof parsed.durationMinutes === "number" ? parsed.durationMinutes : undefined;
    const rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];
    const questions = rawQuestions
      .map((q, i) => normalizeQuestion(q, i))
      .filter((q): q is MockQuestion => q !== null);

    if (questions.length === 0) return null;
    return { title, durationMinutes, questions };
  } catch {
    return null;
  }
}

/** Remove mock-test code blocks from markdown (for word count / plain export). */
export function stripMockTestBlocks(markdown: string): string {
  return markdown.replace(MOCK_TEST_BLOCK, "").trim();
}

export function extractMockTestsFromMarkdown(markdown: string): MockTestData[] {
  const tests: MockTestData[] = [];
  const re = new RegExp(MOCK_TEST_BLOCK.source, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) !== null) {
    const parsed = parseMockTestJson(m[1]);
    if (parsed) tests.push(parsed);
  }
  return tests;
}
