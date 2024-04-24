import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoundSelector from './RoundSelector';
import dummyDataRounds from './Data/heatMapData.json';

describe('RoundSelector', () => {
  const handleRoundChangeMock = jest.fn();
  const showAllRoundsMock = jest.fn();

  beforeEach(() => {
    render(<RoundSelector currentRound={0} handleRoundChange={handleRoundChangeMock} showAllRounds={showAllRoundsMock} />);
  });

  test('renders without crashing', () => {
    expect(screen.getByText(/Team members:/)).toBeInTheDocument();
  });

  test('renders the correct number of round buttons', () => {
    expect(screen.getAllByRole('button')).toHaveLength(dummyDataRounds.length + 1); // +1 for the 'Show All' button
  });

  test('calls handleRoundChange with correct index when a round button is clicked', () => {
    const roundButtons = screen.getAllByRole('button');
    fireEvent.click(roundButtons[1]); // Click on "Round 2"
    expect(handleRoundChangeMock).toHaveBeenCalledWith(1);
  });

  test('toggles current class correctly when a round button is clicked', () => {
    const firstButton = screen.getAllByRole('button')[0];
    fireEvent.click(firstButton);
    expect(firstButton).toHaveClass('current');
    const secondButton = screen.getAllByRole('button')[1];
    fireEvent.click(secondButton);
    expect(secondButton).toHaveClass('current');
    expect(firstButton).not.toHaveClass('current');
  });

  test('calls showAllRounds and toggles current class when "Show All" button is clicked', () => {
    const showAllButton = screen.getByText('Show All');
    fireEvent.click(showAllButton);
    expect(showAllRoundsMock).toHaveBeenCalled();
    expect(showAllButton).toHaveClass('current');
  });
});
