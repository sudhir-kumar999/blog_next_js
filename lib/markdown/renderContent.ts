import { findEmbeddedMockTestBlocks, parseMockTestJson } from "@/lib/mock-test/parse";
import type { MockTestData } from "@/lib/mock-test/types";
import { markdownToHtml } from "./markdownToHtml";

export type ContentSegment =
  | { type: "html"; html: string }
  | { type: "mock-test"; data: MockTestData };

/**
 * Split markdown into HTML segments and interactive mock-test blocks.
 * Posts without ```mock-test fences render exactly as before (single HTML segment).
 */
export function renderMarkdownContent(markdown: string): ContentSegment[] {
  const source = markdown || "";
  const blocks = findEmbeddedMockTestBlocks(source);

  if (blocks.length === 0) {
    return [{ type: "html", html: markdownToHtml(source) }];
  }

  const segments: ContentSegment[] = [];
  let lastIndex = 0;

  for (const block of blocks) {
    if (block.index > lastIndex) {
      const chunk = source.slice(lastIndex, block.index);
      if (chunk.trim()) {
        segments.push({ type: "html", html: markdownToHtml(chunk) });
      }
    }

    const parsed = parseMockTestJson(block.body);
    if (parsed) {
      segments.push({ type: "mock-test", data: parsed });
    } else {
      segments.push({ type: "html", html: markdownToHtml(block.full) });
    }

    lastIndex = block.index + block.length;
  }

  if (lastIndex < source.length) {
    const tail = source.slice(lastIndex);
    if (tail.trim()) {
      segments.push({ type: "html", html: markdownToHtml(tail) });
    }
  }

  return segments;
}
