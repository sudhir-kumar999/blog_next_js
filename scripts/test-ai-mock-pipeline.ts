/**
 * Unit test: AI mock-test pipeline (no Gemini API needed).
 * Usage: npx tsx scripts/test-ai-mock-pipeline.ts
 */
import { validatePostQuality, enrichPostForSeo } from "../lib/post-quality";
import { renderMarkdownContent } from "../lib/markdown/renderContent";
import { buildPrompt } from "../lib/gemini-prompts";
import type { GeneratedPost } from "../lib/gemini";

const GOOD_MOCK_BLOCK = `\`\`\`mock-test
{"title":"SSC GK Mock","durationMinutes":20,"questions":[
{"id":"1","type":"mcq","text":"Q1?","options":["A","B","C","D"],"correctIndex":0},
{"id":"2","type":"mcq","text":"Q2?","options":["A","B","C","D"],"correctIndex":1},
{"id":"3","type":"mcq","text":"Q3?","options":["A","B","C","D"],"correctIndex":2},
{"id":"4","type":"mcq","text":"Q4?","options":["A","B","C","D"],"correctIndex":3},
{"id":"5","type":"mcq","text":"Q5?","options":["A","B","C","D"],"correctIndex":0},
{"id":"6","type":"mcq","text":"Q6?","options":["A","B","C","D"],"correctIndex":1},
{"id":"7","type":"mcq","text":"Q7?","options":["A","B","C","D"],"correctIndex":2},
{"id":"8","type":"tf","text":"TF?","correct":true}
]}
\`\`\``;

function fillerWords(n: number): string {
  return Array(n).fill("hindi exam preparation study material useful notes").join(" ");
}

function basePost(content: string): GeneratedPost {
  return {
    title: "RRB NTPC Online Mock Test Hindi 2026",
    slug: "rrb-ntpc-online-mock-test-hindi-2026",
    excerpt: "Interactive online mock test Hindi for RRB NTPC with score check.",
    seo_title: "RRB NTPC Online Mock Test Hindi 2026",
    seo_description: "Free interactive mock test Hindi — MCQ, score check, RRB NTPC practice.",
    content,
    faq: Array.from({ length: 6 }, (_, i) => ({
      question: `प्रश्न ${i + 1}?`,
      answer: "उत्तर विस्तार से यहाँ।",
    })),
  };
}

let passed = 0;
let failed = 0;

function assert(name: string, ok: boolean) {
  if (ok) {
    passed++;
    console.log(`PASS | ${name}`);
  } else {
    failed++;
    console.log(`FAIL | ${name}`);
  }
}

// 1. Prompt must mention ```mock-test fence
const prompt = buildPrompt(false, 0, "mock-test");
assert("prompt requires mock-test fence", prompt.includes("```mock-test"));
assert("prompt rejects plain MCQ list", /plain-text|Never output plain/i.test(prompt));

// 2. Good post passes validation
const goodContent = `## सीधा जवाब
${fillerWords(80)}

## Intro
${fillerWords(200)}

${GOOD_MOCK_BLOCK}

## FAQ
${fillerWords(100)}`;

const good = enrichPostForSeo(basePost(goodContent), { materialType: "mock-test" });
assert(
  "good mock post passes quality",
  validatePostQuality(good, { materialType: "mock-test" }) === null
);

// 3. Plain MCQ post rejected (simulates old AI output)
const badContent = `## सीधा जवाब
${fillerWords(80)}

## MCQ
1. Question one? A) a B) b Answer: a
2. Question two? A) a B) b Answer: b
${fillerWords(200)}`;

const bad = basePost(badContent);
const badIssue = validatePostQuality(bad, { materialType: "mock-test" });
assert("plain MCQ post rejected", badIssue?.kind === "missing_mock_test");

// 4. Render pipeline produces quiz segment
const segments = renderMarkdownContent(good.content);
assert(
  "render produces mock-test segment",
  segments.some((s) => s.type === "mock-test")
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
console.log("\nAI pipeline OK — new cron posts will require ```mock-test block before publish.");
