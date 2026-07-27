import { ReviewData, SectionHeaderData } from './App';

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
// Each element in a round may be either an array of reviewer answers (a scored item) or a
// { type: "header", txt: "..." } sentinel injected by the backend for SectionHeader items.
// Sentinel objects are passed through as-is; scored items are converted to ReviewData.
export const convertBackendRoundArray = (backendRounds: any[][]): RoundRow[][] => {
  if (!Array.isArray(backendRounds)) return [];
  return backendRounds.map((backendRound) => {
    if (!Array.isArray(backendRound)) return [];
    let scoredItemCount = 0;
    return backendRound.map((answersArray: any) => {
      // Pass SectionHeader sentinels through unchanged — do NOT increment the counter
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

        // Handle different item types
        if (ans.answer !== undefined) {
          if (typeof ans.answer === 'number') {
            review.score = ans.answer;
          } else if (typeof ans.answer === 'string') {
            // Could be text response or selection
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

      // Heuristic for maxScore: if all scores are 0/1 then treat as binary (maxScore=1), else default to 5
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

// Function to get color class based on score and maxScore
export const getColorClass = (score: number, maxScore: number) => {
  let scoreColor = score;
 
  // Calculate the percentage of how far from max score (inverted so lower scores = higher percentage)
  scoreColor = ((maxScore - scoreColor) / maxScore) * 100;
  
  // Use dynamic intervals that work for any scale (1-3, 1-5, 1-10, etc.)
  const interval = 100 / 5; // 20% intervals for 5 color gradients
  
  if (scoreColor >= interval * 4) return 'c1';        // Bottom quintile (worst 20%)
  else if (scoreColor >= interval * 3) return 'c2';   // 4th quintile (60-80% from max)
  else if (scoreColor >= interval * 2) return 'c3';   // Middle quintile (40-60% from max)
  else if (scoreColor >= interval * 1) return 'c4';   // 2nd quintile (20-40% from max)
  else if (scoreColor >= 0) return 'c5';              // Top quintile (best 20%)
  else return 'cf';
};

// Calculate row/column averages. Accepts a mixed RoundRow[] (which may include
// SectionHeaderData sentinels) — headers are skipped so they don't skew the averages.
// sortedData in the return value preserves header positions when sortOrderRow === 'none'.
export const calculateAverages = (
  currentRoundData: RoundRow[],
  sortOrderRow: 'asc' | 'desc' | 'none'
) => {
  // Work only on scored rows for numeric calculations
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

  // When sorting, headers stay in place (only scored rows are reordered).
  // For 'none' the full mixed array (with headers) is returned as-is.
  let sortedData: RoundRow[];
  if (sortOrderRow === 'none') {
    sortedData = [...currentRoundData];
  } else {
    const sorted = scoredRows.slice().sort((a, b) =>
      sortOrderRow === 'asc' ? a.RowAvg - b.RowAvg : b.RowAvg - a.RowAvg
    );
    // Re-insert headers at their original positions
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
