// src/utils/reviewCalculations.ts

export interface Review {
    name: string;
    score: number;
    comment?: string;
  }
  
  export interface ReviewQuestion {
    questionNumber: string;
    questionText: string;
    reviews: Review[];
    maxScore: number;
  }
  
  export type ReviewRound = ReviewQuestion[];
  
  // Function to calculate row average
  export const calculateRowAverage = (reviews: Review[]): number => {
    const sum = reviews.reduce((acc, review) => acc + review.score, 0);
    return Number((sum / reviews.length).toFixed(2));
  };
  
  // Function to calculate composite score from all reviews
  export const calculateCompositeScore = (rounds: ReviewRound[]): number => {
    let totalScore = 0;
    let totalReviews = 0;
  
    rounds.forEach(round => {
      round.forEach(question => {
        if (question.maxScore === 5) { // Only include 5-point scale questions
          question.reviews.forEach(review => {
            totalScore += review.score;
            totalReviews++;
          });
        }
      });
    });
  
    return totalReviews > 0 ? Number((totalScore / totalReviews).toFixed(2)) : 0;
  };
  
  // Function to get color based on score
  export const getScoreColor = (score: number, maxScore: number): string => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return '#2DE636'; // Green
    if (percentage >= 80) return '#BCED91'; // Light Green
    if (percentage >= 70) return '#FFEC8B'; // Yellow
    if (percentage >= 60) return '#FD992D'; // Orange
    return '#ff8080'; // Red
  };
  
  export const anonymizeReviewer = (name: string, index: number): string => {
    return `Student ${100 + index}`;
  };
  
  // Export an empty object as default to ensure file is treated as a module
  export default {};