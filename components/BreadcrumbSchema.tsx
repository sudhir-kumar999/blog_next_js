interface Crumb {
  name: string;
  url: string;
}

export function buildBreadcrumbJsonLd(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function StaticBreadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="border-b border-zinc-100 bg-zinc-50/50 py-3">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <ol className="flex items-center gap-2 text-sm text-zinc-600">
          {items.map((item, i) => (
            <li key={item.url} className="flex items-center gap-2">
              {i > 0 && <span>/</span>}
              {i < items.length - 1 ? (
                <a href={item.url} className="text-blue-600 hover:underline">
                  {item.name}
                </a>
              ) : (
                <span className="text-zinc-800 font-medium">{item.name}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
