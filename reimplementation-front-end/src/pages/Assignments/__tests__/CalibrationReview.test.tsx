import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CalibrationReview from '../CalibrationReview';
import { useAPI } from '../../../hooks/useAPI';
import { vi } from 'vitest';

// Mock useAPI hook
vi.mock('../../../hooks/useAPI', () => ({
  useAPI: vi.fn(),
}));

const mockData = {
  assignment_id: 1,
  team_id: 10,
  team_name: 'Calibration Team A',
  rubric: [
    { id: 101, txt: 'Question 1', weight: 1, seq: 1, question_type: 'Criterion' },
    { id: 102, txt: 'Question 2', weight: 1, seq: 2, question_type: 'TextArea' },
  ],
  instructor_response: {
    response_id: 500,
    additional_comment: 'Overall instructor comment',
    answers: [
      { item_id: 101, answer: 5, comments: 'Good job on Q1' },
      { item_id: 102, answer: 0, comments: 'Good text on Q2' },
    ],
  },
  student_responses: [
    {
      reviewer_name: 'Student X',
      response_id: 601,
      is_submitted: true,
      updated_at: '2026-03-26T10:00:00Z',
      additional_comment: 'Student overall comment',
      answers: [
        { item_id: 101, answer: 4, comments: 'Student X Q1' },
        { item_id: 102, answer: 0, comments: 'Student X Q2' },
      ],
    },
  ],
  summary: {
    '101': {
      average: 4.0,
      distribution: { '4': 1 },
    },
  },
};

describe('CalibrationReview Component', () => {
  beforeEach(() => {
    (useAPI as any).mockReturnValue({
      sendRequest: vi.fn().mockResolvedValue(mockData),
      isLoading: false,
      error: null,
    });
  });

  test('renders team name and rubric items', async () => {
    render(
      <BrowserRouter>
        <CalibrationReview />
      </BrowserRouter>
    );

    expect(await screen.findByText(/Calibration Review Comparison: Calibration Team A/i)).toBeInTheDocument();
    expect(screen.getByText(/1. Question 1/i)).toBeInTheDocument();
    expect(screen.getByText(/2. Question 2/i)).toBeInTheDocument();
  });

  test('renders instructor comments and scores', async () => {
    render(
      <BrowserRouter>
        <CalibrationReview />
      </BrowserRouter>
    );

    expect(await screen.findByText(/Overall instructor comment/i)).toBeInTheDocument();
    expect(screen.getByText(/Good job on Q1/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Score:/i)[0].parentElement).toHaveTextContent('5');
  });

  test('displays student response when selected', async () => {
    render(
      <BrowserRouter>
        <CalibrationReview />
      </BrowserRouter>
    );

    // Initial state is Class Summary
    expect(await screen.findByText(/Class Summary/i)).toBeInTheDocument();
    
    // Click on student X
    const studentBtn = screen.getByRole('button', { name: /Student X/i });
    fireEvent.click(studentBtn);

    expect(screen.getByText(/Student overall comment/i)).toBeInTheDocument();
    expect(screen.getByText(/Student X Q1/i)).toBeInTheDocument();
    // In student view, the score should be 4
    expect(screen.getAllByText(/Score:/i)[1].parentElement).toHaveTextContent('4');
  });

  test('renders distribution summary in class summary view', async () => {
    render(
      <BrowserRouter>
        <CalibrationReview />
      </BrowserRouter>
    );

    expect(await screen.findByText(/Score Distribution \(Average: 4\)/i)).toBeInTheDocument();
    // Check if the distribution bar for score 4 exists
    const scoreBar4 = screen.getByTitle(/Score 4: 1 students/i);
    expect(scoreBar4).toBeInTheDocument();
  });
});
