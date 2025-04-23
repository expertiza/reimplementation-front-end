import React from 'react';
import ReviewTable from './ReviewTable'; // Importing the ReviewTable component

// Interface defining the structure of ReviewData
export interface ReviewData {
  questionNumber: string;
  questionText: string;
  reviews: { score: number; comment?: string }[]; // Array of objects with score and optional comment
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
