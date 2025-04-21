import React from "react";

interface RoundSelectorProps {
  currentRound: number;
  handleRoundChange: (round: number) => void;
  roundsOfReviews: number;
}

const RoundSelector: React.FC<RoundSelectorProps> = ({ currentRound, handleRoundChange, roundsOfReviews }) => {
  const rounds = ["All Rounds", ...Array.from({ length: roundsOfReviews }, (_, i) => `Round ${i + 1}`)];

  return (
    <div className="round-selector">
      <h4 className="text-xl font-semibold">Select Round</h4>
      <select
        value={currentRound}
        onChange={(e) => handleRoundChange(Number(e.target.value))}
        className="border p-2 rounded"
      >
        {rounds.map((round, index) => (
          <option key={index} value={index - 1}>
            {round}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoundSelector;