// src/pages/TeammateReview/utils.ts
import { Review, QuestionReview, RoundReviews } from './types';

const REVIEWERS = ['Alice Johnson', 'Bob Smith', 'Carol Davis'];
const QUESTIONS = [
  'How many times was this person late to meetings?',
  'How much did this person contribute to the project?',
  'Did this person complete assigned tasks?'
];

export const generateReviewScore = (round: number, isCheckbox: boolean): number => {
  if (isCheckbox) return 1;
  const baseScore = Math.floor(Math.random() * 6); 
  const roundBonus = round === 1 ? Math.random() > 0.5 ? 1 : 0 : 0;
  return Math.min(baseScore + roundBonus, 5);
};

export const generateComment = (score: number, isCheckbox: boolean): string => {
  if (isCheckbox) return 'Yes';
  
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

export const generateReviews = (round: number, isCheckbox: boolean): Review[] => {
  return REVIEWERS.map(name => {
    const score = generateReviewScore(round, isCheckbox);
    return {
      name,
      score,
      comment: generateComment(score, isCheckbox)
    };
  });
};

export const generateQuestionReviews = (round: number): QuestionReview[] => {
  return QUESTIONS.map((text, index) => {
    const isCheckbox = index === 2;
    return {
      questionNumber: (index + 1).toString(),
      questionText: text,
      reviews: generateReviews(round, isCheckbox),
      maxScore: isCheckbox ? 1 : 5
    };
  });
};

export const generateAllReviews = (): { given: RoundReviews; received: RoundReviews } => {
  return {
    given: [generateQuestionReviews(0), generateQuestionReviews(1)],
    received: [generateQuestionReviews(0), generateQuestionReviews(1)]
  };
};

export const calculateCompositeScore = (rounds: RoundReviews): number => {
  let totalScore = 0;
  let totalReviews = 0;

  rounds.forEach(round => {
    round.forEach(question => {
      if (question.maxScore === 5) {
        question.reviews.forEach(review => {
          totalScore += review.score;
          totalReviews++;
        });
      }
    });
  });

  return totalReviews > 0 ? Number((totalScore / totalReviews).toFixed(2)) : 0;
};