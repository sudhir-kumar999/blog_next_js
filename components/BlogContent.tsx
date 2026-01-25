// components/BlogContent.tsx

interface BlogContentProps {
  html: string;
}

export default function BlogContent({ html }: BlogContentProps) {
  return (
    <div
      className="
        prose
        prose-lg
        prose-zinc
        max-w-none

        /* Headings */
        prose-h1:text-4xl
        prose-h1:font-bold
        prose-h2:text-2xl
        prose-h2:font-semibold
        prose-h2:mt-10
        prose-h3:text-xl
        prose-h3:font-semibold

        /* Paragraphs */
        prose-p:leading-8
        prose-p:text-zinc-700

        /* Lists */
        prose-ul:pl-6
        prose-li:marker:text-zinc-400

        /* Links */
        prose-a:text-blue-600
        prose-a:font-medium
        hover:prose-a:underline

        /* Code blocks */
        prose-pre:bg-zinc-900
        prose-pre:text-zinc-100
        prose-pre:rounded-xl
        prose-pre:p-4
        prose-code:text-pink-600

        /* Tables */
        prose-table:border
        prose-th:bg-zinc-100
        prose-th:p-2
        prose-td:p-2

        /* Dark mode */
        dark:prose-invert
        dark:prose-p:text-zinc-300
        dark:prose-pre:bg-zinc-950
      "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
