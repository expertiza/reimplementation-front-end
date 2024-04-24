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

  const active = (clickedButton: HTMLElement) => {
    // Remove 'current' class from all buttons
    const buttons = document.querySelectorAll('.round-button');
    buttons.forEach(btn => {
      btn.classList.remove('current');
    });

    // Check if 'current' class is already applied to any button
    const currentButton = document.querySelector('.round-button.current');

    // If 'current' class is not applied to any button, add it to the clicked button
    if (!currentButton) {
      clickedButton.classList.add('current');
    } else {
      // If 'current' class is applied to a button, remove it from that button and add it to the clicked button
      currentButton.classList.remove('current');
      clickedButton.classList.add('current');
    }
  };


  return (
    <div className="round-selector">
      <div className="flex items-center">
        {dummyDataRounds.map((round, index) => (
          <button
            key={index}
            className={`round-button mr-4 ${currentRound === index ? "current" : ""}`}
            onClick={(e) => {handleRoundChange(index); active(e.currentTarget)}}
          >
            Round {index + 1}
          </button>
        ))}
        <button className="round-button mr-4 show-all-rounds" onClick={(e) => { showAllRounds(); active(e.currentTarget); }}>
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