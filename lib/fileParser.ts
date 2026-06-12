export async function parseTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

export async function parseDocxFile(file: File): Promise<string> {
  // Gunakan dynamic import agar tidak error di server saat proses build (Next.js SSR)
  const mammoth = (await import("mammoth")).default || await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export async function parsePdfFile(file: File): Promise<string> {
  // Gunakan dynamic import agar tidak error di server saat proses build (Next.js SSR)
  const pdfjsLib = await import("pdfjs-dist");
  
  if (typeof window !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ""))
      .join(" ");
    fullText += pageText + "\n\n";
  }
  
  return fullText;
}

export async function parseFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'txt':
    case 'md':
    case 'csv':
      return parseTextFile(file);
    case 'docx':
      return parseDocxFile(file);
    case 'pdf':
      return parsePdfFile(file);
    default:
      throw new Error(`Format file .${extension} tidak didukung`);
  }
}
