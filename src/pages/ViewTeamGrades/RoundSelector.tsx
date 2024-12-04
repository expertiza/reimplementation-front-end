import React, { useState, useEffect } from 'react';
import dummyDataRounds from './Data/heatMapData.json';

interface RoundSelectorProps {
  currentRound: number;
  handleRoundChange: (roundIndex: number) => void;
}

// RoundSelector component to display buttons for selecting rounds
const RoundSelector: React.FC<RoundSelectorProps> = ({ currentRound, handleRoundChange }) => {

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
      </div>
    </div>
  );
};

export default RoundSelector;

