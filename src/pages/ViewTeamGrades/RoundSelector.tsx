import React from "react";

interface RoundSelectorProps {
  currentRound: number;
  handleRoundChange: (roundIndex: number) => void;
  roundsData?: any[] | null;
}

// RoundSelector component to display buttons for selecting rounds
const RoundSelector: React.FC<RoundSelectorProps> = ({ currentRound, handleRoundChange, roundsData }) => {
  const rounds = roundsData || [];
  
  if (rounds.length === 0) {
    return null; // Don't render if no rounds available
  }

  return (
    <div className="round-selector">
      <div className="flex items-center">
        <button
          className={`round-button mr-4 ${currentRound === -1 ? "current" : ""}`}
          onClick={() => handleRoundChange(-1)}
          style={{ borderRadius: '0.375rem' }}
        >
          All Rounds
        </button>

        {rounds.map((round, index) => (
          <button
            key={index}
            className={`round-button mr-4 ${currentRound === index ? "current" : ""}`}
            onClick={() => handleRoundChange(index)}
            style={{ borderRadius: '0.375rem' }}
          >
            Round {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoundSelector;
