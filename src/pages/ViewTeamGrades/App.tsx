import React from 'react';
import TeamPeerGrades from './TeamPeerGrades';

export type { ReviewData, SectionHeaderData } from '../../utils/reviewTypes';

// Interface defining the structure of a team member
export interface TeamMember {
  name: string;
  username: string;
}

const App: React.FC = () => {
  return (
    <div>
      <TeamPeerGrades />
    </div>
  );
};

export default App; // Exporting the App component as default
