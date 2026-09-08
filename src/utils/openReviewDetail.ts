import { RoundRow } from "./heatgridUtils";

/**
 * Opens a review-detail page in a new browser tab showing the full rubric text,
 * per-reviewer scores, and comments for every round in `data`.
 *
 * `data` is a RoundRow[][] — one RoundRow[] per review round, where each RoundRow
 * is either a rubric-item row (score + comment per reviewer) or a section-header
 * sentinel. The array is serialized into sessionStorage so the new tab can read it
 * without a round-trip to the server.
 */
export function openReviewDetail(title: string, data: RoundRow[][]): void {
  const key = `review_detail_${Date.now()}`;
  sessionStorage.setItem(key, JSON.stringify({ title, data }));
  window.open(`/review-detail?key=${key}`, "_blank");
}
