"use client";

import dynamic from "next/dynamic";
import type { ContentSegment } from "@/lib/markdown/renderContent";

const MockTestQuiz = dynamic(() => import("@/components/MockTestQuiz"), {
  ssr: false,
  loading: () => (
    <div className="my-8 rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
      Mock test loading…
    </div>
  ),
});

const proseClass = `
  prose prose-lg prose-zinc max-w-none
  prose-h1:text-4xl prose-h1:font-bold
  prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-10
  prose-h3:text-xl prose-h3:font-semibold
  prose-p:leading-8 prose-p:text-zinc-700
  prose-ul:pl-6 prose-li:marker:text-zinc-400
  prose-a:text-blue-600 prose-a:font-medium hover:prose-a:underline
  prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-pre:rounded-xl prose-pre:p-4
  prose-code:text-pink-600
  prose-table:border prose-th:bg-zinc-100 prose-th:p-2 prose-td:p-2
  prose-table:block prose-table:max-w-full prose-table:overflow-x-auto
  prose-img:max-w-full prose-img:h-auto
`;

interface BlogContentRendererProps {
  segments: ContentSegment[];
}

export default function BlogContentRenderer({ segments }: BlogContentRendererProps) {
  return (
    <div className="blog-content">
      {segments.map((seg, i) =>
        seg.type === "html" ? (
          <div
            key={`html-${i}`}
            className={proseClass}
            dangerouslySetInnerHTML={{ __html: seg.html }}
          />
        ) : (
          <MockTestQuiz key={`mock-${i}-${seg.data.title}`} test={seg.data} />
        )
      )}
    </div>
  );
}
