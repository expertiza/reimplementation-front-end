import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import BiddingPage from './BiddingPage';
import biddingData from './data.json';

// Mock the Chart.js implementation
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="mock-bar-chart">Chart Component</div>,
}));

// Mock the html2canvas module
jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({
    toDataURL: jest.fn(() => 'mock-image-data-url'),
  })),
}));

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    text: jest.fn(),
    addImage: jest.fn(),
    save: jest.fn(),
  }));
});

// Mock jspdf-autotable
jest.mock('jspdf-autotable', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('BiddingPage Component', () => {
  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();
  });

  test('renders the page title correctly', () => {
    render(<BiddingPage />);
    expect(screen.getByText('Assignment Bidding Summary by Priority')).toBeInTheDocument();
  });

  test('renders all topic cards from the data', () => {
    render(<BiddingPage />);
    
    // Check if all topic cards are rendered
    biddingData.topics.forEach(topic => {
      expect(screen.getByText(topic.topicName)).toBeInTheDocument();
      expect(screen.getByText(`ID: ${topic.topicId}`)).toBeInTheDocument();
    });
  });

  test('displays bid statistics in each card', () => {
    render(<BiddingPage />);
    
    // Check if each card has the bid statistics
    biddingData.topics.forEach(topic => {
      const card = screen.getByText(topic.topicName).closest('.bidding-card');
      expect(card).toBeInTheDocument();
      
      // Check if the card contains bid statistics
      const cardContent = card?.textContent;
      expect(cardContent).toContain('#1 Bids:');
      expect(cardContent).toContain('#2 Bids:');
      expect(cardContent).toContain('#3 Bids:');
      expect(cardContent).toContain('Total Bids:');
    });
  });

  test('PDF download button is present in the modal', async () => {
    render(<BiddingPage />);
    
    // Open the modal - use the first topic to avoid potential duplicate issues
    const firstTopicCard = screen.getAllByText(/Topic/)[0].closest('.bidding-card');
    fireEvent.click(firstTopicCard!);
    
    // Check if download button is present
    await waitFor(() => {
      expect(screen.getByText('Download as PDF')).toBeInTheDocument();
    });
  });
}); 