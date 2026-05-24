import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  ...sanitizeHtml.defaults.allowedTags,
  "img",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "pre",
  "code",
  "div",
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  ...sanitizeHtml.defaults.allowedAttributes,
  a: ["href", "name", "target", "rel", "class"],
  img: ["src", "alt", "loading", "class"],
  code: ["class"],
  pre: ["class"],
  th: ["class"],
  td: ["class"],
  div: ["class"],
  h1: ["id", "class"],
  h2: ["id", "class"],
  h3: ["id", "class"],
  h4: ["id", "class"],
  h5: ["id", "class"],
  h6: ["id", "class"],
  "*": ["class", "id"],
};

/** Strip XSS vectors from rendered blog HTML before dangerouslySetInnerHTML. */
export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https"],
      a: ["http", "https", "mailto"],
    },
    disallowedTagsMode: "discard",
  });
}
