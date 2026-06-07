"use client";

import { useMemo, useState } from "react";
import type { MockQuestion, MockTestData } from "@/lib/mock-test/types";

type UserAnswer = string | number | boolean | null;

function normalizeShortAnswer(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function isShortCorrect(input: string, acceptable: string[]): boolean {
  const n = normalizeShortAnswer(input);
  if (!n) return false;
  return acceptable.some((a) => normalizeShortAnswer(a) === n);
}

function checkAnswer(q: MockQuestion, answer: UserAnswer): boolean {
  if (answer === null || answer === undefined) return false;
  if (q.type === "mcq") return answer === q.correctIndex;
  if (q.type === "tf") return answer === q.correct;
  if (q.type === "short" && typeof answer === "string") {
    return isShortCorrect(answer, q.acceptableAnswers ?? []);
  }
  return false;
}

export default function MockTestQuiz({ test }: { test: MockTestData }) {
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    if (!submitted) return null;
    let correct = 0;
    for (const q of test.questions) {
      if (checkAnswer(q, answers[q.id] ?? null)) correct++;
    }
    return { correct, total: test.questions.length };
  }, [submitted, answers, test.questions]);

  function setAnswer(id: string, value: UserAnswer) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  function handleRetry() {
    setAnswers({});
    setSubmitted(false);
  }

  const pct =
    score && score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <section
      className="not-prose my-10 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50/80 to-white shadow-sm"
      aria-label={test.title}
    >
      <header className="border-b border-blue-100 bg-blue-600 px-4 py-4 text-white sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
          Interactive Mock Test
        </p>
        <h3 className="mt-1 text-lg font-bold sm:text-xl">{test.title}</h3>
        <p className="mt-2 text-sm text-blue-100">
          {test.questions.length} प्रश्न
          {test.durationMinutes ? ` · ${test.durationMinutes} मिनट (सुझाव)` : ""}
        </p>
      </header>

      <div className="space-y-6 px-4 py-6 sm:px-6">
        {test.questions.map((q, idx) => {
          const userAns = answers[q.id] ?? null;
          const isCorrect = submitted ? checkAnswer(q, userAns) : null;

          return (
            <div
              key={q.id}
              className={`rounded-xl border p-4 sm:p-5 ${
                submitted
                  ? isCorrect
                    ? "border-green-200 bg-green-50/50"
                    : "border-red-200 bg-red-50/40"
                  : "border-zinc-200 bg-white"
              }`}
            >
              <p className="font-semibold text-zinc-900">
                <span className="mr-2 text-blue-600">Q{idx + 1}.</span>
                {q.text}
              </p>

              {q.type === "mcq" && q.options && (
                <ul className="mt-4 space-y-2">
                  {q.options.map((opt, oi) => (
                    <li key={oi}>
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${
                          submitted
                            ? oi === q.correctIndex
                              ? "border-green-400 bg-green-50"
                              : userAns === oi
                                ? "border-red-300 bg-red-50"
                                : "border-zinc-100"
                            : userAns === oi
                              ? "border-blue-400 bg-blue-50"
                              : "border-zinc-200 hover:border-zinc-300"
                        } ${submitted ? "cursor-default" : ""}`}
                      >
                        <input
                          type="radio"
                          name={`mock-${q.id}`}
                          checked={userAns === oi}
                          disabled={submitted}
                          onChange={() => setAnswer(q.id, oi)}
                          className="mt-1 shrink-0"
                        />
                        <span>
                          <span className="font-medium text-zinc-500">
                            ({String.fromCharCode(65 + oi)})
                          </span>{" "}
                          {opt}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}

              {q.type === "tf" && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {[
                    { label: "सही (True)", value: true },
                    { label: "गलत (False)", value: false },
                  ].map(({ label, value }) => (
                    <button
                      key={label}
                      type="button"
                      disabled={submitted}
                      onClick={() => setAnswer(q.id, value)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        submitted
                          ? value === q.correct
                            ? "border-green-400 bg-green-100 text-green-900"
                            : userAns === value
                              ? "border-red-300 bg-red-100 text-red-900"
                              : "border-zinc-200 text-zinc-500"
                          : userAns === value
                            ? "border-blue-500 bg-blue-100 text-blue-900"
                            : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {q.type === "short" && (
                <div className="mt-4">
                  <input
                    type="text"
                    disabled={submitted}
                    value={typeof userAns === "string" ? userAns : ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    placeholder="अपना उत्तर यहाँ लिखें..."
                    className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-zinc-50"
                  />
                  {submitted && !isCorrect && q.acceptableAnswers?.[0] && (
                    <p className="mt-2 text-sm text-green-800">
                      सही उत्तर: <strong>{q.acceptableAnswers[0]}</strong>
                    </p>
                  )}
                </div>
              )}

              {submitted && q.explanation && (
                <p className="mt-3 rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
                  💡 {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <footer className="border-t border-zinc-200 bg-zinc-50 px-4 py-4 sm:px-6">
        {!submitted ? (
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700 sm:w-auto sm:px-8"
          >
            उत्तर जांचें / Score Check
          </button>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-bold text-zinc-900">
                स्कोर: {score?.correct}/{score?.total} ({pct}%)
              </p>
              <p className="text-sm text-zinc-600">
                {pct >= 80
                  ? "बहुत बढ़िया! 🎉"
                  : pct >= 50
                    ? "अच्छा प्रयास — कमज़ोर टॉपिक दोबारा पढ़ें।"
                    : "फिर से प्रयास करें — नोट्स दोहराएँ।"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-xl border border-zinc-300 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-100"
            >
              दोबारा करें
            </button>
          </div>
        )}
      </footer>
    </section>
  );
}
