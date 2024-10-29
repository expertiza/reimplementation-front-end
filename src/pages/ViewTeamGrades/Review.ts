export interface QuestionFeedback {
  questionNumber: string;
  questionText: string;
  reviews: Review[];
  RowAvg: number;
  maxScore: number;
}

export interface Review {
  score: number;
  comment?: string;
}
