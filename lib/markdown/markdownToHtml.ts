import { marked } from "marked";

const renderer = new marked.Renderer();

/* ---------------- HEADINGS ---------------- */
renderer.heading = ({ tokens, depth }) => {
  const text = tokens.map((t) => t.raw).join("");
  const slug = text
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `<h${depth} id="${slug}" class="scroll-mt-24">${text}</h${depth}>`;
};

/* ---------------- PARAGRAPH ---------------- */
renderer.paragraph = ({ tokens }) => {
  const text = tokens.map((t) => t.raw).join("");
  return `<p class="my-5 leading-8">${text}</p>`;
};

/* ---------------- LIST ---------------- */
renderer.list = ({ items, ordered }) => {
  const tag = ordered ? "ol" : "ul";
  const body = items.map((item) => renderer.listitem!(item)).join("");

  return `<${tag} class="my-5 pl-6 list-disc">${body}</${tag}>`;
};

renderer.listitem = ({ tokens }) => {
  const text = tokens.map((t) => t.raw).join("");
  return `<li class="mb-2">${text}</li>`;
};

/* ---------------- TABLE ---------------- */
renderer.table = ({ header, rows }) => {
  const thead = header
    .map(
      (cell) =>
        `<th class="border px-4 py-2 bg-zinc-100">${cell.text}</th>`
    )
    .join("");

  const tbody = rows
    .map(
      (row) =>
        `<tr>${row
          .map(
            (cell) =>
              `<td class="border px-4 py-2">${cell.text}</td>`
          )
          .join("")}</tr>`
    )
    .join("");

  return `
    <div class="overflow-x-auto my-8">
      <table class="w-full border border-zinc-300 border-collapse">
        <thead><tr>${thead}</tr></thead>
        <tbody>${tbody}</tbody>
      </table>
    </div>
  `;
};

/* ---------------- CODE BLOCK ---------------- */
renderer.code = ({ text, lang }) => {
  return `
    <pre class="my-6 rounded-xl bg-zinc-900 p-4 overflow-x-auto">
      <code class="language-${lang || "text"} text-zinc-100">
${text}
      </code>
    </pre>
  `;
};

/* ---------------- IMAGE ---------------- */
renderer.image = ({ href, text }) => {
  return `<img src="${href}" alt="${text || ""}" loading="lazy" class="rounded-lg my-6" />`;
};

/* ---------------- LINK ---------------- */
renderer.link = ({ href, tokens }) => {
  const text = tokens.map((t) => t.raw).join("");
  const external = href?.startsWith("http");

  return `<a href="${href}" ${
    external ? 'target="_blank" rel="noopener noreferrer nofollow"' : ""
  } class="text-blue-600 underline">${text}</a>`;
};

/* ---------------- MARKED CONFIG ---------------- */
marked.setOptions({
  gfm: true,
  breaks: false,
  renderer,
});

/* ---------------- EXPORT ---------------- */
export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown || "") as string;
}
