// CSV text to rows of trimmed fields. Quoted fields may hold commas, line breaks and
// "" (an escaped quote). A BOM and blank lines are dropped.
export const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const source = text.replace(/^\uFEFF/, "");

  const endField = (): void => {
    row.push(field.trim());
    field = "";
  };
  const endRow = (): void => {
    endField();
    if (row.some((value) => value !== "")) rows.push(row);
    row = [];
  };

  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (inQuotes) {
      if (ch === '"' && source[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      endField();
    } else if (ch === "\n") {
      endRow();
    } else {
      field += ch;
    }
  }
  endRow();

  return rows;
};
