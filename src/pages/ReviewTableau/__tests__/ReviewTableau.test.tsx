import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

import ReviewTableau from '../ReviewTableau';
import * as gradesService from '../../../services/gradesService';

// Mock the grades service
vi.mock('../../../services/gradesService');
const mockGradesService = gradesService as any;

// Mock components
vi.mock('../ScoreWidgets', () => ({
  ScoreWidget: ({ score, maxScore, comment }: any) => (
    <div data-testid="score-widget">
      Score: {score}/{maxScore} {comment && <span title={comment}>💬</span>}
    </div>
  ),
}));

vi.mock('../../../components/Table/Table', () => ({
  default: function MockTable({ data, columns }: any) {
    return (
      <div data-testid="mock-table">
        <div data-testid="table-data">{JSON.stringify(data)}</div>
        <div data-testid="table-columns-count">{columns.length}</div>
      </div>
    );
  },
}));

const mockApiResponse = {
  responses_by_round: {
    "1": {
      "1": {
        description: "Rate the overall quality",
        question_type: "Scale",
        answers: { values: [4, 5], comments: ["Good work", "Excellent"] }
      }
    }
  },
  participant: {
    id: 1, user_id: 3, user_name: "student1", 
    full_name: "Student One", handle: "student1"
  },
  assignment: { id: 1, name: "Test Assignment" }
};

const renderWithRouter = (searchParams: string = '') => {
  const url = `/review-tableau${searchParams}`;
  window.history.pushState({}, 'Test page', url);
  return render(<BrowserRouter><ReviewTableau /></BrowserRouter>);
};

describe('ReviewTableau Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TEST 1: Parameter Validation
  test('should show error when required parameters are missing', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText(/unauthorized: missing required parameters/i)).toBeInTheDocument();
    });
    
    expect(mockGradesService.getReviewTableauData).not.toHaveBeenCalled();
  });

  // TEST 2: Successful Data Loading
  test('should load and display review data successfully', async () => {
    mockGradesService.getReviewTableauData.mockResolvedValue(mockApiResponse);
    mockGradesService.transformReviewTableauData.mockReturnValue({
      studentId: 'student1',
      course: 'Course Information', 
      assignment: 'Test Assignment',
      rubrics: [{ id: 'rubric_1', name: 'Review Rubric - Round 1', items: [] }],
      rounds: [{ roundNumber: 1, roundName: 'Review Round 1', rubricId: 'rubric_1', reviews: [] }],
      assignmentId: '1', participantId: '1'
    });

    renderWithRouter('?assignmentId=1&participantId=1');

    await waitFor(() => {
      expect(screen.getByText('Reviews By student1')).toBeInTheDocument();
    });

    expect(screen.getByText('Course :')).toBeInTheDocument();
    expect(screen.getByText('Course Information')).toBeInTheDocument();
    expect(screen.getByText('Assignment:')).toBeInTheDocument();
    expect(screen.getByText('Test Assignment')).toBeInTheDocument();
    expect(screen.getByText('Review Round 1')).toBeInTheDocument();
    expect(mockGradesService.getReviewTableauData).toHaveBeenCalledWith({
      assignmentId: '1', participantId: '1'
    });
  });

  // TEST 3: API Error Handling  
  test('should handle API errors gracefully', async () => {
    const errorMessage = 'Failed to fetch review data';
    mockGradesService.getReviewTableauData.mockRejectedValue({
      response: { data: { error: errorMessage } }
    });

    renderWithRouter('?assignmentId=1&participantId=1');

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(screen.queryByText('Reviews By')).not.toBeInTheDocument();
  });

  // TEST 4: Loading State
  test('should show loading state during data fetch', async () => {
    let resolvePromise: (value: any) => void;
    const controlledPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockGradesService.getReviewTableauData.mockReturnValue(controlledPromise);
    renderWithRouter('?assignmentId=1&participantId=1');

    expect(screen.getByText('Loading review tableau...')).toBeInTheDocument();

    resolvePromise!(mockApiResponse);
    mockGradesService.transformReviewTableauData.mockReturnValue({
      studentId: 'student1', course: 'Course Information', assignment: 'Test Assignment',
      rubrics: [], rounds: [], assignmentId: '1', participantId: '1'
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading review tableau...')).not.toBeInTheDocument();
    });
  });

  // TEST 5: Different Question Types
  test('should handle different question types correctly', async () => {
    const mixedApiResponse = {
      responses_by_round: {
        "1": {
          "1": {
            description: "Rate quality",
            question_type: "Scale",
            answers: { values: [4], comments: ["Good"] }
          },
          "2": {
            description: "Technical accuracy", 
            question_type: "Criterion",
            answers: { values: [3], comments: ["Needs work"] }
          },
          "3": {
            description: "Choose option",
            question_type: "Dropdown", 
            answers: { values: [1], comments: ["Option A"] }
          }
        }
      },
      participant: mockApiResponse.participant,
      assignment: mockApiResponse.assignment
    };

    mockGradesService.getReviewTableauData.mockResolvedValue(mixedApiResponse);
    mockGradesService.transformReviewTableauData.mockReturnValue({
      studentId: 'student1', course: 'Course Information', assignment: 'Test Assignment',
      rubrics: [{ 
        id: 'rubric_1', name: 'Mixed Question Types Rubric',
        items: [
          { id: '1', txt: 'Rate quality', itemType: 'Scale', questionType: 'Scale', maxScore: 5 },
          { id: '2', txt: 'Technical accuracy', itemType: 'Criterion', questionType: 'Criterion', maxScore: 5 },
          { id: '3', txt: 'Choose option', itemType: 'Dropdown', questionType: 'Dropdown' }
        ]
      }],
      rounds: [{ 
        roundNumber: 1, roundName: 'Review Round 1', rubricId: 'rubric_1',
        reviews: [{ 
          reviewerId: 'reviewer_1', reviewerName: 'Reviewer 1', roundNumber: 1,
          responses: {
            '1': { score: 4, comment: 'Good' },
            '2': { score: 3, comment: 'Needs work' },  
            '3': { selectedOption: 'Option A', comment: 'Best choice' }
          }
        }]
      }],
      assignmentId: '1', participantId: '1'
    });

    renderWithRouter('?assignmentId=1&participantId=1&studentId=student1');

    await waitFor(() => {
      expect(screen.getByText('Reviews By student1')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Mixed Question Types Rubric')).toBeInTheDocument();
    
    expect(screen.getByTestId('mock-table')).toBeInTheDocument();
    
    // Verify API calls
    expect(mockGradesService.getReviewTableauData).toHaveBeenCalledWith({
      assignmentId: '1', participantId: '1'
    });
    
    expect(mockGradesService.transformReviewTableauData).toHaveBeenCalledWith(
      mixedApiResponse, 'student1'
    );
  });
});