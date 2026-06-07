import type { ContentSegment } from "@/lib/markdown/renderContent";
import { renderMarkdownContent } from "@/lib/markdown/renderContent";
import MockTestQuiz from "@/components/MockTestQuiz";

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

function SegmentBlock({ segment, index }: { segment: ContentSegment; index: number }) {
  if (segment.type === "mock-test") {
    return <MockTestQuiz key={`mock-${index}-${segment.data.title}`} test={segment.data} />;
  }

  return (
    <div
      key={`html-${index}`}
      className={proseClass}
      dangerouslySetInnerHTML={{ __html: segment.html }}
    />
  );
}

/** Server-rendered article body: markdown HTML + interactive mock tests (SSR-friendly). */
export default function BlogArticleBody({ content }: { content: string }) {
  const segments = renderMarkdownContent(content || "");

  return (
    <div className="blog-content">
      {segments.map((segment, index) => (
        <SegmentBlock key={`seg-${index}-${segment.type}`} segment={segment} index={index} />
      ))}
    </div>
  );
}
