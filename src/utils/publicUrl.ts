/**
 * Absolute URL for a file under `public/`.
 * Use instead of Create React App's `process.env.PUBLIC_URL`, which is undefined in Vite's browser bundle.
 */
export function publicUrl(path: string): string {
  const base = import.meta.env.BASE_URL;
  const suffix = path.replace(/^\//, "");
  return `${base}${suffix}`;
}
