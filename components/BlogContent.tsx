// components/BlogContent.tsx

interface BlogContentProps {
  html: string;
}

export default function BlogContent({ html }: BlogContentProps) {
  return (
    <div
      className="
        prose 
        prose-zinc 
        max-w-none
        prose-headings:scroll-mt-24
        prose-a:text-blue-600
        prose-a:no-underline
        hover:prose-a:underline
        dark:prose-invert
      "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
