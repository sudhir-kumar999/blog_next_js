const fs = require("fs");
const path = require("path");

const geminiPath = path.join(__dirname, "..", "lib", "gemini.ts");
let t = fs.readFileSync(geminiPath, "utf8");

t = t.replace(
  /import \{ GOOGLE_SAFE_RULES, QUALITY_SEO_RULES \}/,
  "import { GOOGLE_SAFE_RULES, QUALITY_SEO_RULES, AEO_RULES }"
);

if (!t.includes("faq?: { question: string; answer: string }[]")) {
  t = t.replace(
    /content: string;\n\}/,
    "content: string;\n  faq?: { question: string; answer: string }[];\n}"
  );
}

const aeoBlock = `
## सीधा जवाब
45-70 words — seedha jawab jo Google / AI overview mein kaam aaye.`;

const injectAeo = (structure) =>
  structure.replace(
    /CONTENT STRUCTURE \([^)]+\) — use these ## headings\):/,
    (m) => `${m}\n${aeoBlock}`
  );

const start = t.indexOf("function buildContentStructure(");
const end = t.indexOf("function buildPrompt(");
if (start < 0 || end < 0) throw new Error("buildContentStructure not found");

let block = t.slice(start, end);
block = injectAeo(block);
block = block.replace(
  /## 💬 FAQ\n4-5 short Q&A\./g,
  "## 💬 लोग ये भी पूछते हैं (FAQ)\nMinimum 6 pairs — **प्रश्न:** ... **उत्तर:** ..."
);
block = block.replace(
  /## 💬 FAQ\n4-5 doubts\./g,
  "## 💬 लोग ये भी पूझते हैं (FAQ)\nMinimum 6 pairs — **प्रश्न:** ... **उत्तर:** ..."
);
block = block.replace(
  /## 💬 FAQ\n4-5 Q&A\./g,
  "## 💬 लोग ये भी पूछते हैं (FAQ)\nMinimum 6 pairs — **प्रश्न:** ... **उत्तर:** ..."
);
block = block.replace(
  /## 💬 FAQ\n4-5 real student doubts\./g,
  "## 💬 लोग ये भी पूछते हैं (FAQ)\nMinimum 6 pairs — **प्रश्न:** ... **उत्तर:** ..."
);

t = t.slice(0, start) + block + t.slice(end);

t = t.replace(
  /Return ONLY valid JSON: title, slug, excerpt, seo_title, seo_description, content\./,
  `Return ONLY valid JSON: title, slug, excerpt, seo_title, seo_description, content, faq (array of 6-8 {question, answer} in Hindi).`
);

t = t.replace(
  /\$\{QUALITY_SEO_RULES\}\n\n\$\{buildContentStructure/,
  "${QUALITY_SEO_RULES}\n${AEO_RULES}\n\n${buildContentStructure"
);

t = t.replace(
  /required: \["title", "slug", "excerpt", "seo_title", "seo_description", "content"\]/,
  'required: ["title", "slug", "excerpt", "seo_title", "seo_description", "content", "faq"]'
);

if (!t.includes('faq: { type: "array"')) {
  t = t.replace(
    /content: \{ type: "string" \},\n        \},/,
    `content: { type: "string" },
          faq: {
            type: "array",
            minItems: 6,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["question", "answer"],
              properties: {
                question: { type: "string" },
                answer: { type: "string" },
              },
            },
          },
        },`
  );
}

const parseReturn = `  const content = String(parsed.content ?? "").trim();
  const faqRaw = parsed.faq;
  let faq: { question: string; answer: string }[] | undefined;
  if (Array.isArray(faqRaw)) {
    faq = faqRaw
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const q = String(item.question ?? "").trim();
        const a = String(item.answer ?? "").trim();
        return q && a ? { question: q, answer: a } : null;
      })
      .filter((x) => x !== null);
    if (faq.length === 0) faq = undefined;
  }
  if (!title || !content) return null;
  return {
    title,
    slug: slug || "post-" + Date.now(),
    excerpt: excerpt || title,
    seo_title: seo_title || title,
    seo_description: seo_description || excerpt || title,
    content,
    faq,
  };`;

t = t.replace(
  /const content = String\(parsed\.content[\s\S]*?content,\n  \};/,
  parseReturn
);

fs.writeFileSync(geminiPath, t);
console.log("patched AEO in gemini.ts");
