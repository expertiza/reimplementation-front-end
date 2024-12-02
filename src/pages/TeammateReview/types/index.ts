// src/pages/TeammateReview/types/index.ts

export interface Review {
    name: string;
    score: number;
    comment: string;  // Changed from string? to string to match the utils implementation
  }
  
  export interface QuestionReview {
    questionNumber: string;
    questionText: string;
    reviews: Review[];
    maxScore: number;
  }
  
  export type ReviewRound = QuestionReview[];
  export type RoundReviews = ReviewRound[];
  
  export interface HeatmapProps {
    data: QuestionReview[];
    showQuestions: boolean;
    isAnonymous: boolean;
  }
  
  export interface CompositeScoreProps {
    reviewsGiven: RoundReviews;
    reviewsReceived: RoundReviews;
  }
  
  export interface ReviewToggleProps {
    viewMode: 'given' | 'received';
    onToggle: (mode: 'given' | 'received') => void;
    showTeammateReviews: boolean;
    isInstructor: boolean;
  }
  
  export interface RoundSelectorProps {
    currentRound: number;
    totalRounds: number;
    onRoundChange: (round: number) => void;
  }