// src/pages/TeammateReview/utils.ts
import { Review, QuestionReview } from './types';

const REVIEWERS = ['Alice Johnson', 'Bob Smith', 'Carol Davis'];
const QUESTIONS = [
  'How many times was this person late to meetings?',
  'How much did this person contribute to the project?',
  'Did this person complete assigned tasks?'
];

// Color configuration for the heatmap
export interface HeatmapColorConfig {
  backgroundColor: string;
  textColor: string;
}

// Score ranges and their corresponding colors for 5-point scale (0-5)
export const HEATMAP_COLORS: Record<string, HeatmapColorConfig> = {
  'score-5': { backgroundColor: '#2DE636', textColor: '#000' }, // Green
  'score-4': { backgroundColor: '#BCED91', textColor: '#000' }, // Light green
  'score-3': { backgroundColor: '#FFEC8B', textColor: '#000' }, // Yellow
  'score-2': { backgroundColor: '#FD992D', textColor: '#000' }, // Orange
  'score-1': { backgroundColor: '#FF6B6B', textColor: '#000' }, // Light red
  'score-0': { backgroundColor: '#FF0000', textColor: '#fff' }  // Red
};

/**
 * Get the color class for a score on the 5-point scale (0-5)
 * @param score - The score value (0-5)
 * @returns The CSS class name for the score's color
 */
export const getScoreColorClass = (score: number): string => {
  // Ensure score is within valid bounds (0-5)
  const validScore = Math.max(0, Math.min(5, Math.round(score)));
  return `score-${validScore}`;
};

/**
 * Get the color configuration for a specific score
 * @param score - The score value (0-5)
 * @returns The color configuration object containing background and text colors
 */
export const getScoreColors = (score: number): HeatmapColorConfig => {
  const colorClass = getScoreColorClass(score);
  return HEATMAP_COLORS[colorClass];
};

/**
 * Calculate the average score for an array of reviews
 * @param reviews - Array of reviews containing scores
 * @returns The calculated average score
 */
export const calculateAverageScore = (reviews: Review[]): number => {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.score, 0);
  return Number((sum / reviews.length).toFixed(2));
};

export const generateReviews = (): Review[] => {
  return REVIEWERS.map(name => {
    const score = Math.floor(Math.random() * 6);
    return {
      name,
      score,
      comment: generateComment(score)
    };
  });
};

export const generateQuestionReviews = (): QuestionReview[] => {
  return QUESTIONS.map((text, index) => {
    return {
      questionNumber: (index + 1).toString(),
      questionText: text,
      reviews: generateReviews(),
      maxScore: 5
    };
  });
};

export const generateAllReviews = () => {
  return {
    given: generateQuestionReviews(),
    received: generateQuestionReviews()
  };
};

export const generateComment = (score: number): string => {
  const commentMap = new Map([
    [5, ['Excellent performance', 'Outstanding work', 'Exceptional contribution']],
    [4, ['Good work overall', 'Solid performance', 'Consistent effort']],
    [3, ['Average performance', 'Meets expectations', 'Room for improvement']],
    [2, ['Below expectations', 'Needs significant improvement', 'Inconsistent performance']],
    [1, ['Poor performance', 'Significant issues', 'Major concerns']],
    [0, ['No contribution', 'Completely absent', 'Failed to participate']]
  ]);

  const comments = commentMap.get(score) || [];
  return comments[Math.floor(Math.random() * comments.length)] || 'No comment provided';
};

export const calculateCompositeScore = (reviews: QuestionReview[]): number => {
  let totalScore = 0;
  let totalReviews = 0;

  reviews.forEach(question => {
    question.reviews.forEach(review => {
      totalScore += review.score;
      totalReviews++;
    });
  });

  return totalReviews > 0 ? Number((totalScore / totalReviews).toFixed(2)) : 0;
};