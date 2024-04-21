import React, { useState, useEffect } from 'react';
import dummyDataRounds from './Data/heatMapData.json';
import teamData from './Data/dummyData.json';

interface RoundSelectorProps {
  currentRound: number;
  handleRoundChange: (roundIndex: number) => void;
}

// RoundSelector component to display buttons for selecting rounds
const RoundSelector: React.FC<RoundSelectorProps> = ({ currentRound, handleRoundChange }) => {
  const [teamMembers, setTeamMembers] = useState<string[]>([]);

  // Fetch team members from the teamData.json file on component mount
  useEffect(() => {
    setTeamMembers(teamData.members);
  }, []); // Empty dependency array means it runs only once on component mount

  return (
    <div className="round-selector">
      <div className="flex items-center">
        {/* Mapping over dummyDataRounds to render round buttons */}
        {dummyDataRounds.map((round, index) => (
          <button
            key={index}
            className={`round-button mr-4 ${currentRound === index ? "current" : ""}`}
            onClick={() => handleRoundChange(index)}
          >
            Round {index + 1}
          </button>
        ))}
        {/* Displaying team members */}
        <span className="ml-4">
          Team members: {teamMembers.map((member, index) => (
          <span key={index}>
              ({member})
            {index !== teamMembers.length - 1 && ' '}
            </span>
        ))}
        </span>
      </div>
    </div>
  );
};

export default RoundSelector;
