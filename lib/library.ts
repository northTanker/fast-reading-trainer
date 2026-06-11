import { z } from "zod";
import type { SavedText } from "@/types";

const LIBRARY_KEY = "reading-library";

export const savedTextSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: z.string(),
});

export function getLibrary(): SavedText[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const result = z.array(savedTextSchema).safeParse(parsed);
    if (result.success) {
      return result.data;
    }
    console.error("Failed to parse library data", result.error);
    return [];
  } catch {
    return [];
  }
}

export function saveTextToLibrary(title: string, content: string): SavedText {
  const library = getLibrary();
  
  const newText: SavedText = {
    id: crypto.randomUUID(),
    title,
    content,
    createdAt: new Date().toISOString(),
  };

  library.unshift(newText); // Add to the beginning
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
  
  // Dispatch a storage event so useSyncExternalStore can pick it up
  window.dispatchEvent(new Event("storage"));

  return newText;
}

export function removeTextFromLibrary(id: string): void {
  const library = getLibrary();
  const updated = library.filter((t) => t.id !== id);
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(updated));
  
  window.dispatchEvent(new Event("storage"));
}
