import React, { useState, useEffect } from "react";
import dummyDataRounds from "./Data/heatMapData.json";
import teamData from "./Data/dummyData.json";

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
        <button
          className={`round-button mr-4 ${currentRound === -1 ? "current" : ""}`}
          onClick={() => handleRoundChange(-1)}
        >
          All Rounds
        </button>

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
      </div>
    </div>
  );
};

export default RoundSelector;
