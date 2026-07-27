import React from 'react';
import ReviewTable from './ReviewTable'; // Importing the ReviewTable component

// Interface defining the structure of a team member
export interface TeamMember {
  name: string;
  username: string;
}

// Sentinel type returned by the backend when a questionnaire item is a SectionHeader.
// The backend injects { type: "header", txt: "..." } at the correct positions in the
// per-round scores array so the frontend can render labelled section dividers between rows.
export interface SectionHeaderData {
  type: "header";
  txt: string;
}

// Interface defining the structure of ReviewData
export interface ReviewData {
  itemNumber: string;
  itemText: string;  // full rubric criterion/question text shown in the "Item" column
  itemType?: string; // Type of item (Scale, Criterion, TextArea, etc.)
  reviews: {
    name?: string; // reviewer name (populated by convertBackendRoundArray)
    score?: number;
    comment?: string;
    textResponse?: string; // For TextArea/TextField
    selections?: string[]; // For Checkbox/MultipleChoice
    selectedOption?: string; // For Dropdown/Radio
    fileName?: string; // For file uploads
    fileUrl?: string;
  }[];
  RowAvg: number; // Average score for the row
  maxScore: number; // Maximum possible score
}

// Functional component App, which renders the ReviewTable
const App: React.FC = () => {
  return (
    <div>
      <ReviewTable /> {/* Rendering the ReviewTable component */}
    </div>
  );
};

export default App; // Exporting the App component as default
