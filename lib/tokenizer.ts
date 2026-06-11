export function tokenize(text: string): string[] {
  const normalized = text
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\t/g, " ")
    .replace(/\r\n/g, "\n")
    .trim();

  if (!normalized) return [];

  return normalized.split(/\s+/).filter((w) => w.length > 0);
}
