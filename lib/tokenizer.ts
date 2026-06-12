export function tokenize(text: string): string[] {
  let normalized = text
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\t/g, " ")
    .replace(/\r\n/g, "\n")
    .trim();

  if (!normalized) return [];

  // Protect double newlines, convert single newlines to spaces, then restore double newlines
  normalized = normalized.replace(/\n{2,}/g, " __PARAGRAPH__ ");
  normalized = normalized.replace(/\n/g, " ");
  normalized = normalized.replace(/__PARAGRAPH__/g, "\n\n");

  // Split by spaces only, so "\n\n" remains intact
  return normalized.split(/ +/).filter((w) => w.length > 0);
}

