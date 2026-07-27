'use client';

import { useState } from "react";
import SchemaMarkup from "@/components/SchemaMarkup";

interface FaqItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  items: FaqItem[];
  pageUrl?: string;
  title?: string;
}

function PlusIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-zinc-500 transition-transform duration-200 ${open ? "rotate-45" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

export default function FAQSection({ items, pageUrl, title }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!items.length) return null;

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="my-12">
      <SchemaMarkup
        type="FAQPage"
        data={{
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
          ...(pageUrl ? { url: pageUrl } : {}),
        }}
      />

      <h2 className="text-2xl font-bold text-zinc-900 mb-6">
        {title || "Frequently Asked Questions"}
      </h2>

      <div className="divide-y divide-zinc-200 border-y border-zinc-200">
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="py-3">
              <button
                onClick={() => toggle(i)}
                className="flex w-full items-start gap-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2 -mx-2"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${i}`}
              >
                <PlusIcon open={isOpen} />
                <span className="font-semibold text-zinc-900 text-base leading-relaxed">
                  {item.question}
                </span>
              </button>
              <div
                id={`faq-answer-${i}`}
                role="region"
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
                }`}
              >
                <p className="pl-8 pr-4 pb-3 text-zinc-600 leading-relaxed text-sm">
                  {item.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
