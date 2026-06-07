import { parseMockTestJson } from "@/lib/mock-test/parse";
import type { MockTestData } from "@/lib/mock-test/types";
import { markdownToHtml } from "./markdownToHtml";

export type ContentSegment =
  | { type: "html"; html: string }
  | { type: "mock-test"; data: MockTestData };

const MOCK_TEST_BLOCK = /```mock-test\s*\n([\s\S]*?)```/gi;

/**
 * Split markdown into HTML segments and interactive mock-test blocks.
 * Posts without ```mock-test fences render exactly as before (single HTML segment).
 */
export function renderMarkdownContent(markdown: string): ContentSegment[] {
  const source = markdown || "";
  const segments: ContentSegment[] = [];
  const re = new RegExp(MOCK_TEST_BLOCK.source, "gi");
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(source)) !== null) {
    if (match.index > lastIndex) {
      const chunk = source.slice(lastIndex, match.index);
      if (chunk.trim()) {
        segments.push({ type: "html", html: markdownToHtml(chunk) });
      }
    }
    const parsed = parseMockTestJson(match[1]);
    if (parsed) {
      segments.push({ type: "mock-test", data: parsed });
    } else {
      segments.push({ type: "html", html: markdownToHtml(match[0]) });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < source.length) {
    const tail = source.slice(lastIndex);
    if (tail.trim()) {
      segments.push({ type: "html", html: markdownToHtml(tail) });
    }
  }

  if (segments.length === 0) {
    return [{ type: "html", html: markdownToHtml(source) }];
  }

  return segments;
}
