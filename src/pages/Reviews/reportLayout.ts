// Shared types and data-transform utilities for the review detail new-tab view.
// Both ReviewReportPage and TeammateReviewReportPage convert their API responses
// into RoundRow[][] here before passing them to openReviewDetail.

import { RoundRow } from "../../utils/heatgridUtils";
import { ReviewData as FeedbackReviewData } from "../ViewTeamGrades/App";

export interface SummaryScore {
  question: string;
  answer: number | null;
  comments: string | null;
}

export interface SummaryResponse {
  round: number;
  teamName: string;
  scores: SummaryScore[];
  additionalComment: string | null;
}

export interface ScoreEntry {
  id: number;
  answer: number;
  comments: string | null;
  item?: { id: number; txt: string; weight: number };
}

export interface RevieweeEntry {
  revieweeName: string;
  submitted: boolean;
  scores: ScoreEntry[];
}

// ReviewReport "summary": rows = rubric items, columns = team names, one table per round.
export function summaryResponsesToRoundRows(responses: SummaryResponse[]): RoundRow[][] {
  const byRound = new Map<number, SummaryResponse[]>();
  responses.forEach((r) => {
    const list = byRound.get(r.round) ?? [];
    list.push(r);
    byRound.set(r.round, list);
  });

  return Array.from(byRound.entries())
    .sort(([a], [b]) => a - b)
    .map(([, roundResps]) => {
      const numItems = roundResps[0]?.scores.length ?? 0;
      const rows: RoundRow[] = [];
      for (let idx = 0; idx < numItems; idx++) {
        const firstScore = roundResps[0]?.scores[idx];
        rows.push({
          itemNumber: String(idx + 1),
          itemText: firstScore?.question ?? `Item ${idx + 1}`,
          reviews: roundResps.map((resp) => {
            const s = resp.scores[idx];
            return {
              name: resp.teamName,
              score: s?.answer ?? undefined,
              comment: s?.comments ?? undefined,
            };
          }),
          RowAvg: 0,
          maxScore: 5,
        } as FeedbackReviewData);
      }
      return rows;
    });
}

// TeammateReviewReport "view": rows = rubric items, columns = reviewee names, single table.
export function revieweesToRoundRows(reviewees: RevieweeEntry[]): RoundRow[][] {
  const submitted = reviewees.filter((r) => r.submitted);
  if (!submitted.length) return [];

  const numItems = submitted[0]?.scores.length ?? 0;
  const rows: RoundRow[] = [];

  for (let idx = 0; idx < numItems; idx++) {
    const firstScore = submitted[0]?.scores[idx];
    rows.push({
      itemNumber: String(idx + 1),
      itemText: firstScore?.item?.txt ?? `Item ${idx + 1}`,
      reviews: submitted.map((reviewee) => {
        const s = reviewee.scores[idx];
        return {
          name: reviewee.revieweeName,
          score: s?.answer ?? undefined,
          comment: s?.comments ?? undefined,
        };
      }),
      RowAvg: 0,
      maxScore: 5,
    } as FeedbackReviewData);
  }

  return [rows];
}
