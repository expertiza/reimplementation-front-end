import { QuestionFeedback } from './Review';

// Function to determine color class based on review score and maximum score
export const getColorClass = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100;

  if (percentage <= 20) return 'c1';
  else if (percentage <= 40) return 'c2';
  else if (percentage <= 60) return 'c3';
  else if (percentage <= 80) return 'c4';
  else if (percentage <= 100) return 'c5';
  return 'cf'; // Default color for scores out of bounds
};

// Function to calculate averages for rows and columns in a round of review data
export const calculateAverages = (
  currentRoundData: QuestionFeedback[],
  sortOrderRow: 'asc' | 'desc' | 'none'
) => {
  let totalAvg = 0;
  let totalMaxScore = 0;

  // Calculate row averages and accumulate scores for overall average calculation
  currentRoundData.forEach((row) => {
    const sum = row.reviews.reduce((acc, review) => acc + review.score, 0);
    row.RowAvg = sum / row.reviews.length;
    totalAvg += row.RowAvg * row.maxScore;
    totalMaxScore += row.maxScore;
  });

  const averagePeerReviewScore = totalMaxScore
    ? ((totalAvg / totalMaxScore) * 100).toFixed(2)
    : '0.00';

  // Initialize column averages array for each review column
  const columnAverages: number[] = Array(currentRoundData[0].reviews.length).fill(0);

  // Sum scores for each column
  currentRoundData.forEach((row) => {
    row.reviews.forEach((review, index) => {
      columnAverages[index] += review.score;
    });
  });

  // Normalize column averages to a scale of 0 to 5 based on the number of rows
  columnAverages.forEach((sum, index) => {
    columnAverages[index] = currentRoundData.length
      ? (sum / (currentRoundData.length * currentRoundData[0].maxScore)) * 5
      : 0;
  });

  // Sort data based on row averages according to the specified order
  const sortedData = [...currentRoundData].sort((a, b) =>
    sortOrderRow === 'asc' ? a.RowAvg - b.RowAvg : sortOrderRow === 'desc' ? b.RowAvg - a.RowAvg : 0
  );

  return { averagePeerReviewScore, columnAverages, sortedData };
};

// Utility function to toggle visibility, used for UI elements with state toggles
export const toggleVisibility = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
  setter((prevState) => !prevState);
};
