import { QuestionFeedback } from './Review';

// Function to determine color class based on review score and maximum score
export const getColorClass = (score: number, maxScore: number) => {
  // Calculate percentage score for determining color intensity
  let scoreColor = ((maxScore - score) / maxScore) * 100;

  // Assign color class based on score ranges
  if (scoreColor >= 80) return 'c1';
  else if (scoreColor >= 60 && scoreColor < 80) return 'c2';
  else if (scoreColor >= 40 && scoreColor < 60) return 'c3';
  else if (scoreColor >= 20 && scoreColor < 40) return 'c4';
  else if (scoreColor >= 0 && scoreColor < 20) return 'c5';
  else return 'cf'; // Default color for invalid scores
};

// Function to calculate averages for rows and columns in a round of review data
export const calculateAverages = (
  currentRoundData: QuestionFeedback[],
  sortOrderRow: 'asc' | 'desc' | 'none'
) => {
  let totalAvg = 0;
  let questionCount = 0;
  let totalMaxScore = 0;

  // Calculate row averages and total average score
  currentRoundData.forEach((row) => {
    const sum = row.reviews.reduce((acc, val) => acc + val.score, 0);
    row.RowAvg = sum / row.reviews.length; // Average score for each question row
    totalAvg += row.RowAvg; // Accumulate total average score
    totalMaxScore += row.maxScore; // Accumulate max possible score
    questionCount++;
  });

  // Calculate the overall average peer review score as a percentage
  const averagePeerReviewScore = questionCount > 0
    ? (((totalAvg / totalMaxScore) * 100) > 0 ? ((totalAvg / totalMaxScore) * 100).toFixed(2) : '0.00')
    : '0.00';

  // Initialize column averages array to store averages for each review column
  const columnAverages: number[] = Array.from({ length: currentRoundData[0].reviews.length }, () => 0);

  // Accumulate scores for each column to calculate column averages
  currentRoundData.forEach((row) => {
    row.reviews.forEach((val, index) => {
      columnAverages[index] += val.score;
    });
  });

  // Calculate final column averages as a percentage of the max score and normalize to a scale of 0 to 5
  columnAverages.forEach((sum, index) => {
    columnAverages[index] = (sum / totalMaxScore) * 5;
  });

  // Sort data based on row average in ascending, descending, or default order
  let sortedData = [...currentRoundData];
  if (sortOrderRow === 'asc') {
    sortedData = currentRoundData.slice().sort((a, b) => a.RowAvg - b.RowAvg);
  } else if (sortOrderRow === 'desc') {
    sortedData = currentRoundData.slice().sort((a, b) => b.RowAvg - a.RowAvg);
  }

  // Return calculated values for overall average, column averages, and sorted data
  return { averagePeerReviewScore, columnAverages, sortedData };
};

// Utility function to toggle visibility, used for UI elements with state toggles
export const toggleVisibility = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
  setter(prevState => !prevState);
};
