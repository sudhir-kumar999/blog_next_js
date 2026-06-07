import type { MockQuestion, MockTestData } from "./types";

/** Fenced mock-test blocks (AI / manual posts). */
export const MOCK_TEST_FENCE_RE = /```(?:mock-test|mocktest)[^\n]*\r?\n([\s\S]*?)```/gi;

/** Some Gemini outputs use ```json instead of ```mock-test. */
export const MOCK_JSON_FENCE_RE = /```json[^\n]*\r?\n([\s\S]*?)```/gi;

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : String(v ?? "").trim();
}

export function looksLikeMockTestJson(raw: string): boolean {
  return /"questions"\s*:\s*\[/i.test(raw);
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

type EmbeddedBlock = {
  index: number;
  length: number;
  full: string;
  body: string;
  kind: "mock-test" | "json";
};

/** Find mock-test / mock-like json fences in document order. */
export function findEmbeddedMockTestBlocks(markdown: string): EmbeddedBlock[] {
  const found: EmbeddedBlock[] = [];

  for (const re of [MOCK_TEST_FENCE_RE, MOCK_JSON_FENCE_RE]) {
    const regex = new RegExp(re.source, re.flags);
    let m: RegExpExecArray | null;
    while ((m = regex.exec(markdown)) !== null) {
      const body = m[1] ?? "";
      const kind = re === MOCK_TEST_FENCE_RE ? "mock-test" : "json";
      if (kind === "json" && !looksLikeMockTestJson(body)) continue;
      found.push({
        index: m.index,
        length: m[0].length,
        full: m[0],
        body,
        kind,
      });
    }
  }

  found.sort((a, b) => a.index - b.index);

  // Drop overlapping duplicates (same start index)
  const unique: EmbeddedBlock[] = [];
  for (const block of found) {
    if (unique.some((u) => u.index === block.index)) continue;
    unique.push(block);
  }
  return unique;
}

/** Remove mock-test code blocks from markdown (for word count / plain export). */
export function stripMockTestBlocks(markdown: string): string {
  return markdown
    .replace(MOCK_TEST_FENCE_RE, "")
    .replace(MOCK_JSON_FENCE_RE, (full, body: string) =>
      looksLikeMockTestJson(body) ? "" : full
    )
    .trim();
}

export function extractMockTestsFromMarkdown(markdown: string): MockTestData[] {
  return findEmbeddedMockTestBlocks(markdown)
    .map((b) => parseMockTestJson(b.body))
    .filter((t): t is MockTestData => t !== null);
}
