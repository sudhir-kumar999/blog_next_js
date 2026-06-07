/**
 * Insert a sample interactive mock-test post (no Gemini needed).
 * Usage: npx tsx scripts/insert-sample-mock-test.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(path.join(root, ".env.local"));
loadEnvFile(path.join(root, ".env"));

const SLUG = "rrb-ntpc-interactive-mock-test-hindi-demo";

const MOCK_TEST_JSON = {
  title: "RRB NTPC सामान्य जागरूकता — डेमो मॉक टेस्ट",
  durationMinutes: 15,
  questions: [
    {
      id: "1",
      type: "mcq",
      text: "भारत का राष्ट्रीय पक्षी कौन सा है?",
      options: ["मोर", "तोता", "कबूतर", "गरुड़"],
      correctIndex: 0,
      explanation: "भारत का राष्ट्रीय पक्षी मोर (Indian Peafowl) है।",
    },
    {
      id: "2",
      type: "tf",
      text: "गंगा नदी भारत की सबसे लंबी नदी है।",
      correct: true,
      explanation: "हाँ, गंगा भारत की सबसे लंबी नदी है (लगभग 2525 किमी)।",
    },
    {
      id: "3",
      type: "mcq",
      text: "किस वर्ष में भारत को स्वतंत्रता मिली?",
      options: ["1945", "1947", "1950", "1942"],
      correctIndex: 1,
      explanation: "15 अगस्त 1947 को भारत स्वतंत्र हुआ।",
    },
    {
      id: "4",
      type: "short",
      text: "भारत की राजधानी का नाम लिखें।",
      acceptableAnswers: ["नई दिल्ली", "New Delhi", "दिल्ली", "Delhi"],
      explanation: "भारत की राजधानी नई दिल्ली है।",
    },
    {
      id: "5",
      type: "mcq",
      text: "CPU का पूरा नाम क्या है?",
      options: [
        "Central Processing Unit",
        "Computer Personal Unit",
        "Central Program Utility",
        "Control Processing Unit",
      ],
      correctIndex: 0,
      explanation: "CPU = Central Processing Unit — कंप्यूटर का मुख्य प्रोसेसर।",
    },
    {
      id: "6",
      type: "tf",
      text: "सूर्य पश्चिम से पूर्व की ओर उगता है।",
      correct: false,
      explanation: "सूर्य पूर्व से पश्चिम की ओर उगता है।",
    },
    {
      id: "7",
      type: "mcq",
      text: "विश्व का सबसे बड़ा महासागर कौन सा है?",
      options: ["अटलांटिक", "प्रशांत", "हिंद", "आर्कटिक"],
      correctIndex: 1,
      explanation: "प्रशांत महासागर (Pacific Ocean) सबसे बड़ा है।",
    },
    {
      id: "8",
      type: "short",
      text: "2 + 2 × 3 का मान क्या है? (संख्या में लिखें)",
      acceptableAnswers: ["8", "८"],
      explanation: "BODMAS: 2 + (2×3) = 2 + 6 = 8",
    },
    {
      id: "9",
      type: "mcq",
      text: "भारतीय संविधान कब लागू हुआ?",
      options: ["26 जनवरी 1950", "15 अगस्त 1947", "26 नवंबर 1949", "1 जनवरी 1951"],
      correctIndex: 0,
      explanation: "26 जनवरी 1950 को संविधान लागू हुआ — इसलिए गणतंत्र दिवस मनाया जाता है।",
    },
    {
      id: "10",
      type: "tf",
      text: "RRB NTPC परीक्षा में सामान्य जागरूकता (GK) सेक्शन शामिल होता है।",
      correct: true,
      explanation: "हाँ, CBT-1 में GK, रीजनिंग, मैथ और जनरल साइंस होता है।",
    },
  ],
};

const CONTENT = `## सीधा जवाब
यह RRB NTPC सामान्य जागरूकता का **इंटरैक्टिव ऑनलाइन मॉक टेस्ट** है। नीचे MCQ, True/False और छोटे उत्तर वाले प्रश्न दिए गए हैं — जवाब चुनें या टाइप करें, फिर **Score Check** पर क्लिक करके अपना स्कोर देखें।

## 📝 मॉक टेस्ट परिचय
Railway Recruitment Board (RRB) NTPC परीक्षा भारत की सबसे बड़ी भर्ती परीक्षाओं में से एक है। CBT-1 में **सामान्य जागरूकता (General Awareness)** महत्वपूर्ण सेक्शन है जिसमें स्टेटिक GK, करंट अफेयर्स, इतिहास, भूगोल, विज्ञान और कंप्यूटर से प्रश्न आते हैं।

StudyMitra पर यह **डेमो मॉक टेस्ट** आपको असली परीक्षा जैसा अनुभव देता है — लेकिन यहाँ आप तुरंत स्कोर और व्याख्या (explanation) देख सकते हैं। यह पोस्ट interactive quiz feature का परीक्षण (test) के लिए बनाई गई है।

## 🎯 कैसे करें
- सभी 10 प्रश्नों का उत्तर दें (MCQ में option चुनें, True/False में बटन दबाएँ, short answer में टाइप करें)
- समय की सीमा का सुझाव: **15 मिनट**
- सभी प्रश्न पूरे करने के बाद **Score Check** बटन दबाएँ
- गलत जवाब पर explanation पढ़ें और **Retry** से दोबारा प्रयास करें

## 🧪 इंटरैक्टिव मॉक टेस्ट
नीचे embedded quiz है — plain text answer key नहीं है; स्कोर check करने पर ही सही/गलत दिखेगा।

\`\`\`mock-test
${JSON.stringify(MOCK_TEST_JSON, null, 2)}
\`\`\`

## 📊 स्कोर के बाद
अगर 7 से कम सही हुए तो static GK की revision करें: राष्ट्रीय प्रतीक, महत्वपूर्ण तिथियाँ, भारत की नदियाँ, संविधान की मूल बातें। रोज 20 MCQ practice से NTPC GK में confidence बढ़ता है।

Current affairs के लिए पिछले 6 महीने की रेलवे, बजट, खेल और पुरस्कार related खबरें short notes में लिखें। Math और reasoning के साथ GK को equal time दें — many toppers CBT-1 में GK से rank बनाते हैं।

## 💬 लोग ये भी पूछते हैं (FAQ)

**प्रश्न:** RRB NTPC CBT-1 में कितने प्रश्न होते हैं?
**उत्तर:** CBT-1 में usually 100 प्रश्न होते हैं और 90 मिनट का समय मिलता है। GK, Reasoning, Math और General Science मिलाकर।

**प्रश्न:** Interactive mock test normal text MCQ से अलग कैसे है?
**उत्तर:** Interactive mock में आप page पर ही answer select/type करते हैं और Score Check से instant result मिलता है। Plain text post में सिर्फ सवाल-जवाब list होती है।

**प्रश्न:** True/False और short answer questions क्यों शामिल हैं?
**उत्तर:** Real exam pattern mix होता है; short answers vocabulary और facts याद रखने में मदद करते हैं। True/False quick conceptual check के लिए अच्छे हैं।

**प्रश्न:** क्या negative marking होती है?
**उत्तर:** RRB NTPC CBT-1 में generally 1/3 negative marking होती है — official notification हमेशा check करें।

**प्रश्न:** यह demo mock test किस exam के लिए है?
**उत्तर:** यह RRB NTPC General Awareness practice के लिए demo है; SSC, Banking mock tests भी StudyMitra पर similar interactive format में आते हैं।

**प्रश्न:** Score Check के बाद explanation क्यों दिखता है?
**उत्तर:** गलत answer पर explanation से concept clear होता है — यही self-study का फायदा है online mock test में।

## निष्कर्ष
RRB NTPC GK के लिए रोज interactive mock test लगाएँ। इस demo post पर quiz try करके StudyMitra का नया mock test feature check करें।`;

async function main() {
  const { getCategoryIdForMaterialType } = await import("../lib/category-for-material");
  const { supabaseServer } = await import("../lib/supabase/server");
  const { extractMockTestsFromMarkdown } = await import("../lib/mock-test/parse");

  const mockTests = extractMockTestsFromMarkdown(CONTENT);
  if (mockTests.length === 0) {
    console.error("Content has no parseable mock-test block");
    process.exit(1);
  }

  const { data: existing } = await supabaseServer
    .from("posts")
    .select("id, slug")
    .eq("slug", SLUG)
    .maybeSingle();

  const post = {
    title: "RRB NTPC Interactive Mock Test Hindi — Demo Quiz (Score Check)",
    slug: SLUG,
    excerpt:
      "RRB NTPC GK का interactive online mock test — MCQ, True/False, short answer. Score Check करें और explanation देखें।",
    content: CONTENT,
    seo_title: "RRB NTPC Online Mock Test Hindi 2026 — Interactive Demo",
    seo_description:
      "Free RRB NTPC interactive mock test in Hindi. Answer MCQ, True/False, type short answers and check score instantly on StudyMitra.",
    featured_image: null,
    published: true,
    published_at: new Date().toISOString(),
  };

  const categoryId = await getCategoryIdForMaterialType("mock-test");

  if (existing) {
    const { error } = await supabaseServer
      .from("posts")
      .update({ ...post, category_id: categoryId })
      .eq("id", existing.id);
    if (error) {
      console.error("Update failed:", error.message);
      process.exit(1);
    }
    console.log("Updated existing demo post.");
  } else {
    const { error } = await supabaseServer.from("posts").insert({
      ...post,
      category_id: categoryId,
    });
    if (error) {
      console.error("Insert failed:", error.message);
      process.exit(1);
    }
    console.log("Inserted new demo post.");
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  console.log("\nDemo mock test ready!");
  console.log(`Quiz: ${mockTests[0].questions.length} questions`);
  console.log("Open:", `${siteUrl}/blog/${SLUG}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
