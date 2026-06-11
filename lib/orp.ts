export function getOrpIndex(word: string): number {
  const letters = word.replace(/[^a-zA-Z0-9]/g, "");
  if (letters.length <= 1) return 0;

  return Math.floor(letters.length * 0.35);
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

  const orpIdx = Math.floor(letters.length * 0.35);
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
