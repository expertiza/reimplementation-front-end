/**
 * RoundSelector — a styled <select> dropdown for choosing which round to display.
 *
 * Options are generated dynamically from `roundsData.length`, so the selector
 * automatically adapts to any number of rounds returned by the backend.
 *
 * Value encoding: -1 = "All Rounds", 0 = round index 0 (Round 1), 1 = round index 1 (Round 2), …
 * The native <select> is styled to match the Scores/Feedback toggle height (36 px) and
 * brand color (#b00404). `appearance: none` removes the OS-default dropdown arrow so
 * the custom ▼ caret can be positioned consistently across browsers.
 */
import React from "react";

interface RoundSelectorProps {
  currentRound: number;
  handleRoundChange: (roundIndex: number) => void;
  roundsData?: any[] | null;
}

const dropdownStyle: React.CSSProperties = {
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  padding: "6px 32px 6px 14px",
  fontWeight: "bold",
  fontSize: "14px",
  fontFamily: "verdana, arial, helvetica, sans-serif",
  border: "2px solid #b00404",
  borderRadius: "0.375rem",
  background: "#fff",
  color: "#b00404",
  cursor: "pointer",
  outline: "none",
  height: "36px",
  minWidth: "130px",
};

const wrapperStyle: React.CSSProperties = {
  position: "relative",
  display: "inline-block",
};

const caretStyle: React.CSSProperties = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  pointerEvents: "none",
  color: "#b00404",
  fontSize: "10px",
};

const RoundSelector: React.FC<RoundSelectorProps> = ({ currentRound, handleRoundChange, roundsData }) => {
  const rounds = roundsData || [];

  if (rounds.length === 0) {
    return null;
  }

  // value encoding: -1 = all rounds, 0 = round 1, 1 = round 2, ...
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleRoundChange(parseInt(e.target.value, 10));
  };

  return (
    <div style={wrapperStyle}>
      <select value={currentRound} onChange={handleChange} style={dropdownStyle}>
        <option value={-1}>All Rounds</option>
        {rounds.map((_, index) => (
          <option key={index} value={index}>
            Round {index + 1}
          </option>
        ))}
      </select>
      <span style={caretStyle}>▼</span>
    </div>
  );
};

export default RoundSelector;
