export const EVENTS = {
  DUTIES_CHANGED: "duties:changed",
} as const;

// convenience helpers (optional)
export const emit = (name: string, detail?: unknown) =>
  window.dispatchEvent(new CustomEvent(name, { detail }));
export const on = (name: string, handler: EventListener) => {
  window.addEventListener(name, handler);
  return () => window.removeEventListener(name, handler);
};