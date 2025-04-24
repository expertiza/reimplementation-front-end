import React from "react";

interface RoundSelectorProps {
  currentRound: number;
  handleRoundChange: (roundIndex: number) => void;
  totalRounds: number; // The number of rounds to display
}

// RoundSelector component to display buttons for selecting rounds
const RoundSelector: React.FC<RoundSelectorProps> = ({ currentRound, handleRoundChange, totalRounds }) => {
  return (
    <div className="round-selector">
      <div className="flex items-center">

        {/* Button for All Rounds */}
        <button
          className={`round-button mr-4 ${currentRound === -1 ? "current" : ""}`}
          onClick={() => handleRoundChange(-1)}
        >
          All Rounds
        </button>

        {/* Buttons for specific rounds */}
        {Array.from({ length: totalRounds }).map((_, index) => (
          <button
            key={index}
            className={`round-button mr-4 ${currentRound === index ? "current" : ""}`}
            onClick={() => handleRoundChange(index)}
          >
            Round {index + 1}
          </button>
        ))}

      </div>
    </div>
  );
};

export default RoundSelector;
