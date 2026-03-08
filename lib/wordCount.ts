const MIN_POST_WORDS = 1500;

/**
 * Strip markdown and count words (spaces separate words).
 */
export function countWords(text: string): number {
  if (!text || typeof text !== "string") return 0;
  const stripped = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_~`\[\]()!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return stripped ? stripped.split(" ").filter(Boolean).length : 0;
}

export function isMinWordCount(text: string, min = MIN_POST_WORDS): boolean {
  return countWords(text) >= min;
}

export { MIN_POST_WORDS };
