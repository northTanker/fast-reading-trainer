import { useSyncExternalStore } from "react";
import { getLibrary } from "@/lib/library";
import type { SavedText } from "@/types";

const emptyServerSnapshot: SavedText[] = [];
let cachedLibrary: SavedText[] = [];
let cachedRaw: string | null = null;

function getServerSnapshot() {
  return emptyServerSnapshot;
}

function getLibrarySnapshot(): SavedText[] {
  if (typeof window === "undefined") return emptyServerSnapshot;
  
  const raw = localStorage.getItem("reading-library");
  if (!raw) {
    cachedRaw = null;
    return emptyServerSnapshot;
  }

  if (cachedRaw === raw) {
    return cachedLibrary;
  }

  cachedRaw = raw;
  cachedLibrary = getLibrary();
  return cachedLibrary;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  // Also listen for custom events if we dispatch them
  return () => {
    window.removeEventListener("storage", callback);
  };
}

export function useLibrary() {
  return useSyncExternalStore(subscribe, getLibrarySnapshot, getServerSnapshot);
}
