export const prettyName = (full: string) => {
  const parts = full.split(",").map((s) => s.trim());
  if (parts.length >= 2) return `${parts[1]} ${parts[0]}`;
  return full;
};

export const parseCSV = (text: string) => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  let start = 0;
  const header = lines[0].toLowerCase();
  if (header.includes("username") || header.includes("email")) start = 1;

  const rows = [];
  for (let i = start; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    rows.push(cols);
  }

  return rows;
};

export const exportToCSV = (data: any[], headers: string[], filename: string) => {
  const csvRows = [headers.join(","), ...data];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
