import React from 'react';
import TeamGrades from './TeamGrades';

export type { ReviewData, SectionHeaderData } from '../../utils/reviewTypes';

// Interface defining the structure of a team member
export interface TeamMember {
  name: string;
  username: string;
}

// Functional component App, which renders the TeamGrades
const App: React.FC = () => {
  return (
    <div>
      <TeamGrades /> {/* Rendering the TeamGrades component */}
    </div>
  );
};

export default App; // Exporting the App component as default
