import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // Import jest-dom for custom assertions
import ReviewTableRow from './ReviewTableRow'; // Import the component to test

// Mocked ReviewData
const mockReviewData = {
  questionText: 'How do you like the product?',
  questionNumber: 'Q1',
  maxScore: 5,
  RowAvg: 4.2,
  reviews: [
    { score: 5, comment: 'Great product!' },
    { score: 4, comment: 'Good product.' },
    { score: 3, comment: 'Average product.' }
  ]
};

describe('ReviewTableRow', () => {
  test('renders question number by default', () => {
    render(<ReviewTableRow row={mockReviewData} showWordCount10={true} showWordCount20={true} showFullQuestion={false} />);
    expect(screen.getByText('Q1')).toBeInTheDocument();
  });

  test('renders full question text when showFullQuestion is true', () => {
    render(<ReviewTableRow row={mockReviewData} showWordCount10={true} showWordCount20={true} showFullQuestion={true} />);
    expect(screen.getByText('How do you like the product?')).toBeInTheDocument();
  });

  test('renders reviews with correct scores and comments', () => {
    render(<ReviewTableRow row={mockReviewData} showWordCount10={true} showWordCount20={true} showFullQuestion={false} />);
  
    // Find the score within the circle span
    const circleScoreElement = screen.getByRole('cell', { name: '5' });
  
    // Find the scores within the underlined spans
    const underlinedScoreElements = screen.getAllByRole('cell', { name: /5/ });
  
    // Assert that the elements are present
    expect(circleScoreElement).toBeInTheDocument();
    expect(underlinedScoreElements.length).toBe(2); // Assuming all scores are underlined
    // Add assertions for comments if needed
  });  
});
