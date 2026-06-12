export function getOrpIndex(word: string): number {
  const letters = word.replace(/[^a-zA-Z0-9]/g, "");
  return getOrpIndexFromTable(letters.length);
}

function getOrpIndexFromTable(len: number): number {
  if (len <= 1) return 0;
  if (len <= 3) return 1;
  if (len <= 5) return 2;
  if (len <= 9) return 3;
  if (len <= 13) return 4;
  return Math.floor(len / 3); // Fallback for very long words
}

export function splitAtOrp(word: string): {
  before: string;
  pivot: string;
  after: string;
} {
  const letters = word.replace(/[^a-zA-Z0-9]/g, "");
  if (letters.length <= 1 || word.length <= 2) {
    return { before: "", pivot: word, after: "" };
  }

  const orpIdx = getOrpIndexFromTable(letters.length);
  let letterCount = 0;
  let splitIndex = 0;

  for (let i = 0; i < word.length; i++) {
    if (/[a-zA-Z0-9]/.test(word[i])) {
      if (letterCount === orpIdx) {
        splitIndex = i;
        break;
      }
      letterCount++;
    }
    splitIndex = i + 1;
  }

  return {
    before: word.slice(0, splitIndex),
    pivot: word[splitIndex] ?? word[word.length - 1],
    after: word.slice(splitIndex + 1),
  };
}

