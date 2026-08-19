import { ReviewData, SectionHeaderData } from './reviewTypes';

export type { ReviewData, SectionHeaderData };

// Type alias for a mixed array that may contain scored rows or section heading sentinels
export type RoundRow = ReviewData | SectionHeaderData;

/** Returns true when a RoundRow is a SectionHeaderData sentinel (not a scored row) */
export const isHeader = (row: RoundRow): row is SectionHeaderData =>
  (row as SectionHeaderData).type === "header";

// Compatibility shim: accepts data in either the old shape (questionNumber/questionText/questionType)
// or the new shape (itemNumber/itemText/itemType) and returns a ReviewData using the current field names,
// so the rest of the code only needs to handle one shape.
export const normalizeReviewData = (data: any): ReviewData => {
  return {
    itemNumber: data.itemNumber || data.questionNumber || '',
    itemText: data.itemText || data.questionText || '',
    itemType: data.itemType || data.questionType,
    reviews: data.reviews || [],
    RowAvg: data.RowAvg || 0,
    maxScore: data.maxScore || 5
  };
};

// Same shim as normalizeReviewData applied to an array; SectionHeader sentinels are passed through unchanged.
export const normalizeReviewDataArray = (dataArray: any[]): RoundRow[] => {
  return dataArray.map(item => {
    if (item && item.type === "header") return item as SectionHeaderData;
    return normalizeReviewData(item);
  });
};

// Convert backend rounds array (array of arrays of answer objects) to frontend round format.
export const convertBackendRoundArray = (backendRounds: any[][]): RoundRow[][] => {
  if (!Array.isArray(backendRounds)) return [];
  return backendRounds.map((backendRound) => {
    if (!Array.isArray(backendRound)) return [];
    let scoredItemCount = 0;
    return backendRound.map((answersArray: any) => {
      if (answersArray && !Array.isArray(answersArray) && answersArray.type === "header") {
        return answersArray as SectionHeaderData;
      }
      scoredItemCount += 1;
      const firstAnswer = answersArray?.[0];
      const itemType = firstAnswer?.item_type || firstAnswer?.itemType;

      const reviews = (answersArray || []).map((ans: any) => {
        const review: any = {
          name: ans.reviewer_name || ans.name || '',
        };

        if (ans.answer !== undefined) {
          if (typeof ans.answer === 'number') {
            review.score = ans.answer;
          } else if (typeof ans.answer === 'string') {
            if (itemType === 'TextArea' || itemType === 'TextField') {
              review.textResponse = ans.answer;
            } else if (itemType === 'Dropdown' || itemType === 'MultipleChoiceRadio') {
              review.selectedOption = ans.answer;
            } else {
              review.score = Number(ans.answer) || 0;
            }
          } else if (Array.isArray(ans.answer)) {
            review.selections = ans.answer;
          }
        }

        if (ans.comments) review.comment = ans.comments;
        if (ans.comment) review.comment = ans.comment;
        if (ans.textResponse) review.textResponse = ans.textResponse;
        if (ans.fileName || ans.file_name) review.fileName = ans.fileName || ans.file_name;
        if (ans.fileUrl || ans.file_url) review.fileUrl = ans.fileUrl || ans.file_url;
        if (ans.selectedOption) review.selectedOption = ans.selectedOption;
        if (ans.selections) review.selections = ans.selections;

        return review;
      });

      const sum = reviews.reduce((acc: number, r: any) => acc + (r.score || 0), 0);
      const rowAvg = reviews.length ? sum / reviews.length : 0;
      const maxScore = reviews.every((r: any) => r.score === 0 || r.score === 1) ? 1 : 5;

      return {
        itemNumber: String(scoredItemCount),
        itemText: (answersArray && answersArray[0] && answersArray[0].txt) || '',
        itemType,
        reviews,
        RowAvg: rowAvg,
        maxScore,
      } as ReviewData;
    });
  });
};

// Returns an HSL background-color string for a rubric score.
// k = min(maxScore − minScore, 10) distinct bands; hue goes 0° (red) → 120° (green).
// Pass dataMin/dataMax to normalize relative to the actual observed data range so the
// highest score in the dataset maps to green, not just the rubric's absolute maximum.
export const scoreToColor = (
  score: number,
  maxScore: number,
  minScore = 0,
  dataMin?: number,
  dataMax?: number,
): string => {
  const lo = dataMin ?? minScore;
  const hi = dataMax ?? maxScore;
  if (hi <= lo) return '#ffffff';
  const range = maxScore - minScore;
  const k = Math.min(Math.max(range, 1), 10);
  const clamped = Math.max(lo, Math.min(hi, score));
  const t = (clamped - lo) / (hi - lo);          // 0 = worst, 1 = best
  const level = Math.min(Math.round(t * k), k);
  const bt = k === 0 ? 1 : level / k;            // 0 = red, 1 = green
  const hue   = Math.round(bt * 120);
  const sat   = Math.round(85 - bt * 20);         // 85% → 65%
  const light = Math.round(70 - bt * 20);         // 70% → 50%
  return `hsl(${hue}, ${sat}%, ${light}%)`;
};

// Returns a heat color class (c1–c5) based on score vs maxScore.
// Cutoffs follow the standard A/B/C/D grading scale: ≥90 → c5, ≥80 → c4, ≥70 → c3, ≥60 → c2, <60 → c1.
export const getColorClass = (score: number, maxScore: number): string => {
  if (maxScore <= 0) return 'cf';
  const pct = (score / maxScore) * 100;
  if (pct >= 90) return 'c5';
  if (pct >= 80) return 'c4';
  if (pct >= 70) return 'c3';
  if (pct >= 60) return 'c2';
  return 'c1';
};

// Returns a heat color class from a 0–100 percentage (e.g. a normalized score).
// Used by course report tables where scores are already percentages.
// Accepts optional dataMin/dataMax to spread colors across the actual data range
// rather than the full 0–100 scale. Cutoffs match the A/B/C/D grading scale.
export const getHeatColorClass = (
  value: number,
  dataMin = 0,
  dataMax = 100
): string => {
  const normalized = dataMax === dataMin
    ? 1
    : (value - dataMin) / (dataMax - dataMin);
  const pct = normalized * 100;
  if (pct >= 90) return 'c5';
  if (pct >= 80) return 'c4';
  if (pct >= 70) return 'c3';
  if (pct >= 60) return 'c2';
  return 'c1';
};

// Calculate row/column averages.
export const calculateAverages = (
  currentRoundData: RoundRow[],
  sortOrderRow: 'asc' | 'desc' | 'none'
) => {
  const scoredRows = currentRoundData.filter(r => !isHeader(r)) as ReviewData[];

  let totalAvg = 0;
  let itemCount = 0;
  let totalMaxScore = 0;
  scoredRows.forEach((row) => {
    const sum = row.reviews.reduce((acc, val) => acc + (val.score || 0), 0);
    row.RowAvg = sum / row.reviews.length;
    totalAvg = row.RowAvg + totalAvg;
    totalMaxScore = totalMaxScore + row.maxScore;
    itemCount++;
  });

  const averagePeerReviewScore =
    itemCount > 0
      ? (((totalAvg / totalMaxScore) * 100) > 0 ? ((totalAvg / totalMaxScore) * 100).toFixed(2) : '0.00')
      : '0.00';

  const firstScored = scoredRows[0];
  const columnAverages: number[] = firstScored
    ? Array.from({ length: firstScored.reviews.length }, () => 0)
    : [];

  scoredRows.forEach((row) => {
    row.reviews.forEach((val, index) => {
      columnAverages[index] += (val.score || 0);
    });
  });

  columnAverages.forEach((sum, index) => {
    columnAverages[index] = (sum / totalMaxScore) * 5;
  });

  let sortedData: RoundRow[];
  if (sortOrderRow === 'none') {
    sortedData = [...currentRoundData];
  } else {
    const sorted = scoredRows.slice().sort((a, b) =>
      sortOrderRow === 'asc' ? a.RowAvg - b.RowAvg : b.RowAvg - a.RowAvg
    );
    sortedData = [];
    let scoredIdx = 0;
    currentRoundData.forEach(row => {
      if (isHeader(row)) {
        sortedData.push(row);
      } else {
        sortedData.push(sorted[scoredIdx++]);
      }
    });
  }

  return { averagePeerReviewScore, columnAverages, sortedData };
};
