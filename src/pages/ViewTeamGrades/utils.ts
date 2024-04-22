import { ReviewData } from './App';

// Function to get color class based on score and maxScore
export const getColorClass = (score: number, maxScore: number) => {
  let scoreColor = score;
 
  scoreColor = ((maxScore - scoreColor) / maxScore) * 100;
  if (scoreColor >= 80) return 'c1';
  else if (scoreColor >= 60 && scoreColor < 80) return 'c2';
  else if (scoreColor >= 40 && scoreColor < 60) return 'c3';
  else if (scoreColor >= 20 && scoreColor < 40) return 'c4';
  else if (scoreColor >= 0 && scoreColor < 20) return 'c5';
  else return 'cf';
};

// Function to get count of reviews with more than 10 words
export const getWordCount10 = (row: ReviewData) => {
  return row.reviews.filter(
    (review) => review.comment && review.comment.trim().split(' ').length > 10
  ).length;
};

// Function to get count of reviews with more than 20 words
export const getWordCount20 = (row: ReviewData) => {
  return row.reviews.filter(
    (review) => review.comment && review.comment.trim().split(' ').length > 20
  ).length;
};


// Function to calculate averages for rows and columns, handling multiple rounds
export const calculateAverages = (
  roundsData: ReviewData[][],
  sortOrderRow: 'asc' | 'desc' | 'none'
): { averagePeerReviewScore: string; columnAverages: number[]; sortedData: ReviewData[] } => {
  let totalAvg = 0;
  let totalMaxScore = 0;
  let totalQuestions = 0;

  roundsData.forEach((currentRoundData) => {
    currentRoundData.forEach((row) => {
      const sum = row.reviews.reduce((acc, val) => acc + val.score, 0);
      row.RowAvg = sum / row.reviews.length;
      totalAvg += row.RowAvg;
      totalMaxScore += row.maxScore;
      totalQuestions++;
    });
  });

  const averagePeerReviewScore = totalQuestions > 0
    ? (((totalAvg / totalMaxScore) * 100).toFixed(2))
    : '0.00';

  let columnAverages: number[] = [];

  if (roundsData.length > 0 && roundsData[0].length > 0) {
    columnAverages = Array.from({ length: roundsData[0][0].reviews.length }, () => 0);
    roundsData.forEach(currentRoundData => {
      currentRoundData.forEach(row => {
        row.reviews.forEach((val, index) => {
          columnAverages[index] += val.score;
        });
      });
    });

    columnAverages = columnAverages.map(sum => parseFloat((sum / totalQuestions).toFixed(2)));
  }

  // Sorting data if necessary
  let sortedData = roundsData.flat();

  if (sortOrderRow === 'asc') {
    sortedData.sort((a, b) => a.RowAvg - b.RowAvg);
  } else if (sortOrderRow === 'desc') {
    sortedData.sort((a, b) => b.RowAvg - a.RowAvg);
  }

  return { averagePeerReviewScore, columnAverages, sortedData };
};