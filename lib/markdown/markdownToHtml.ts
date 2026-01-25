import { marked } from "marked";

// 🔹 Create renderer
const renderer = new marked.Renderer();

// ✅ HEADINGS (SEO friendly)
renderer.heading = ({ tokens, depth }) => {
  const text = tokens.map((t) => t.raw).join("");
  const slug = text
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `
    <h${depth} id="${slug}">
      ${text}
    </h${depth}>
  `;
};

// ✅ IMAGES (lazy loading)
renderer.image = ({ href, text }) => {
  return `
    <img
      src="${href}"
      alt="${text || ""}"
      loading="lazy"
      class="rounded-lg my-6"
    />
  `;
};

// ✅ LINKS (safe external links)
renderer.link = ({ href, tokens }) => {
  const text = tokens.map((t) => t.raw).join("");
  const isExternal = href?.startsWith("http");

  return `
    <a
      href="${href}"
      ${
        isExternal
          ? 'target="_blank" rel="noopener noreferrer nofollow"'
          : ""
      }
      class="text-blue-600 underline"
    >
      ${text}
    </a>
  `;
};

// 🔧 Marked config
marked.setOptions({
  gfm: true,
  breaks: true,
  renderer,
});

// 🔹 Helper
export function markdownToHtml(markdown: string): string {
  if (!markdown) return "";
  return marked.parse(markdown) as string;
}
