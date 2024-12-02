// src/pages/TeammateReview/components/RoundSelector.tsx
import React from 'react';
import './RoundSelector.scss';

interface RoundSelectorProps {
  currentRound: number;
  totalRounds: number;
  onRoundChange: (round: number) => void;
}

const RoundSelector: React.FC<RoundSelectorProps> = ({
  currentRound,
  totalRounds,
  onRoundChange,
}) => {
  return (
    <div className="round-selector">
      <div className="rounds-container">
        {Array.from({ length: totalRounds }).map((_, index) => (
          <button
            key={index}
            className={`round-button ${currentRound === index ? 'current' : ''}`}
            onClick={() => onRoundChange(index)}
          >
            Round {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoundSelector;