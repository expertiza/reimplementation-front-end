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
  txt: string | null; // null means end of section/table/column 
  itemType: ItemType;
  questionNumber?: string;
  maxScore?: number;
  minScore?: number;
  weight?: number;
  options?: string[]; // For dropdown, multiple choice
  scaleDescription?: string; // For scale items
  isRequired?: boolean;
}

export interface ReviewResponse {
  reviewerId: string;
  reviewerName: string;
  roundNumber: number;
  responses: {
    [itemId: string]: {
      score?: number;
      comment?: string;
      textResponse?: string;
      selectedOption?: string;
      selections?: string[]; // For checkboxes
      fileName?: string;
      fileUrl?: string;
    };
  };
}

export interface ReviewRound {
  roundNumber: number;
  roundName: string;
  reviews: ReviewResponse[];
}

export interface ReviewTableauData {
  rubric: RubricItem[];
  rounds: ReviewRound[];
  assignmentId?: string;
  participantId?: string;
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