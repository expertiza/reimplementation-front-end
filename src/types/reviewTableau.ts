// Types for Review Tableau component

export type ItemType = 
  | 'Section_header' 
  | 'Table_header' 
  | 'Column_header' 
  | 'Criterion' 
  | 'TextField' 
  | 'TextArea' 
  | 'Dropdown' 
  | 'MultipleChoice' 
  | 'Scale' 
  | 'Grid' 
  | 'Checkbox' 
  | 'UploadFile';

export interface RubricItem {
  id: string;
  txt: string | null;
  itemType: ItemType;
  questionType?: string;
  questionNumber?: string;
  maxScore?: number;
  minScore?: number;
  weight?: number;
  options?: string[]; // For dropdown, multiple choice
  scaleDescription?: string; // For scale items
  isRequired?: boolean;
  topicName?: string; // For grouping items by topic
}

export interface ReviewResponse {
  reviewerId: string;
  reviewerName: string;
  roundNumber: number;
  submissionTime?: string;
  responses: {
    [itemId: string]: {
      score?: number;
      comment?: string;
      textResponse?: string;
      selectedOption?: string;
      selections?: string[];
      fileName?: string;
      fileUrl?: string;
      checkValue?: boolean;
    };
  };
}

export interface ReviewRound {
  roundNumber: number;
  roundName: string;
  reviews: ReviewResponse[];
  rubricId?: string; // Which rubric this round uses
}

export interface Rubric {
  id: string;
  name: string;
  items: RubricItem[];
}

export interface ReviewTableauData {
  studentId?: string; // Actually the reviewer's name/ID
  course?: string;
  assignment?: string;
  rubrics: Rubric[]; // Multiple rubrics instead of single rubric
  rounds: ReviewRound[];
  assignmentId?: string;
  participantId?: string; // The reviewer's participant ID
}

export interface ScoreWidgetProps {
  score: number;
  maxScore: number;
  comment?: string;
  hasComment?: boolean;
}

export interface RubricItemDisplayProps {
  item: RubricItem;
  isHeader?: boolean;
}

export interface ReviewCellProps {
  item: RubricItem;
  response?: ReviewResponse['responses'][string];
  reviewerName?: string;
}