export interface Volume {
  number: number;
  date: string;
  coverUrl: string;
  contentsUrl: string;
  pdfUrl: string;
}

/**
 * Parses a sitemap.txt file with the structure:
 *   *Volume N
 *   -Date : ...
 *   -url small cover : ...
 *   -url of page with contents of volume : ...
 *   -url pdf of journal : ...
 */
export function parseSitemap(text: string): Volume[] {
  const volumes: Volume[] = [];
  const lines = text.split(/\r?\n/);
  let current: Partial<Volume> | null = null;

  const pushCurrent = () => {
    if (current && typeof current.number === "number") {
      volumes.push({
        number: current.number,
        date: current.date ?? "",
        coverUrl: current.coverUrl ?? "",
        contentsUrl: current.contentsUrl ?? "",
        pdfUrl: current.pdfUrl ?? "",
      });
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("*")) {
      pushCurrent();
      const match = line.match(/\*\s*Volume\s+(\d+)/i);
      current = { number: match ? parseInt(match[1], 10) : NaN };
      continue;
    }

    if (!current) continue;

    const fieldMatch = line.match(/^-\s*([^:]+):\s*(.*)$/);
    if (!fieldMatch) continue;

    const key = fieldMatch[1].trim().toLowerCase();
    const value = fieldMatch[2].trim();

    if (key === "date") current.date = value;
    else if (key.includes("small cover")) current.coverUrl = value;
    else if (key.includes("contents")) current.contentsUrl = value;
    else if (key.includes("pdf")) current.pdfUrl = value;
  }
  pushCurrent();

  return volumes.filter((v) => !Number.isNaN(v.number));
}
