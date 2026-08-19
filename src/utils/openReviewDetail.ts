import { RoundRow } from "./heatgridUtils";

export function openReviewDetail(title: string, data: RoundRow[][]): void {
  const key = `review_detail_${Date.now()}`;
  sessionStorage.setItem(key, JSON.stringify({ title, data }));
  window.open(`/review-detail?key=${key}`, "_blank");
}
