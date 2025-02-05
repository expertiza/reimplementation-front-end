export interface Review {
  name: string;
  score: number;
  comment: string;
}

export interface QuestionReview {
  questionNumber: string;
  questionText: string;
  reviews: Review[];
  maxScore: number;
}

export interface CompositeScoreProps {
  reviewsGiven: QuestionReview[];
  reviewsReceived: QuestionReview[];
}

export interface HeatmapProps {
  data: QuestionReview[];
  showQuestions: boolean;
  isAnonymous: boolean;
  columnAverages: number[];
}

export interface ShowReviewsProps {
  data: QuestionReview[];
  isAnonymous: boolean;
}