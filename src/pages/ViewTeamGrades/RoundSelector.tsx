import React, { useState, useEffect } from 'react';
import dummyDataRounds from './Data/heatMapData.json';
import teamData from './Data/dummyData.json';

interface RoundSelectorProps {
  currentRound: number;
  handleRoundChange: (roundIndex: number) => void;
  showAllRounds: () => void;  // Added for showing all rounds
}

const RoundSelector: React.FC<RoundSelectorProps> = ({ currentRound, handleRoundChange, showAllRounds }) => {
  const [teamMembers, setTeamMembers] = useState<string[]>([]);

  useEffect(() => {
    setTeamMembers(teamData.members);
  }, []);

  return (
    <div className="round-selector">
      <div className="flex items-center">
        {dummyDataRounds.map((round, index) => (
          <button
            key={index}
            className={`round-button mr-4 ${currentRound === index ? "current" : ""}`}
            onClick={() => handleRoundChange(index)}
          >
            Round {index + 1}
          </button>
        ))}
        <button className="round-button mr-4" onClick={showAllRounds}>
          Show All
        </button>
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
