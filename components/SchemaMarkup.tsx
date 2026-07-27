type SchemaType =
  | "BlogPosting"
  | "WebSite"
  | "Organization"
  | "BreadcrumbList"
  | "CollectionPage"
  | "FAQPage"
  | "Quiz"
  | "WebPage"
  | "Article";

interface SchemaMarkupProps {
  type: SchemaType;
  data: Record<string, unknown>;
  id?: string;
}

export default function SchemaMarkup({ type, data, id }: SchemaMarkupProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": type,
    ...(id ? { "@id": id } : {}),
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
