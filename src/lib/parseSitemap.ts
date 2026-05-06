export interface Volume {
  order: number;
  volume: string;
  date: string;
  coverUrl: string;
  contentsUrl: string;
  pdfUrl: string;
}

export function parseSitemap(text: string): Volume[] {
  const volumes: Volume[] = [];
  const lines = text.split(/\r?\n/);
  let current: Partial<Volume> | null = null;

  const pushCurrent = () => {
    if (current && current.volume) {
      volumes.push({
        order: current.order ?? 9999,
        volume: current.volume,
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
      current = {};
      continue;
    }

    if (!current) continue;

    const fieldMatch = line.match(/^-\s*([^:]+):\s*(.*)$/);
    if (!fieldMatch) continue;

    const key = fieldMatch[1].trim().toLowerCase();
    const value = fieldMatch[2].trim();

    if (key === "order" || key === "order number") current.order = Number(value);
    else if (key === "volume") current.volume = value;
    else if (key === "date") current.date = value;
    else if (key.includes("small cover")) current.coverUrl = value;
    else if (key.includes("contents")) current.contentsUrl = value;
    else if (key.includes("pdf")) current.pdfUrl = value;
  }

  pushCurrent();

  return volumes
    .filter((v) => v.volume.trim().length > 0)
    .sort((a, b) => b.order - a.order);
}
