/**
 * Best-effort filename for UI when the API may still send a full filesystem path (legacy rows).
 */
export function fileDisplayName(pathOrName: string): string {
  if (!pathOrName) return '';
  const s = pathOrName.replace(/\\/g, '/');
  const idx = s.lastIndexOf('/');
  return idx >= 0 ? s.slice(idx + 1) : s;
}
