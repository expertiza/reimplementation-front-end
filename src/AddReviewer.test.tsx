import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import AddReviewer from 'pages/Assignments/AddReviewer';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TopicWithReviewers } from 'utils/interfaces';

// Mock useNavigate and useReviewerContext
const mockNavigate = jest.fn();
const mockAddReviewerToTopic = jest.fn();

const mockTopics: TopicWithReviewers[] = [
  {
    topic_identifier: 'topic-123',
    topic_name: 'Cool Topic',
    contributors: [{
        name: 'Alice',
        id: 0,
        type: 'AssignmentTeam',
        users: [],
        reviewMappings: []
    }],
    reviewers: [],
  },
];

// Mock the ReviewerContext
jest.mock('context/ReviewerContext', () => ({
  useReviewerContext: () => ({
    topics: mockTopics,
    addReviewerToTopic: mockAddReviewerToTopic,
  }),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '999' }),
  };
});

// Utility to render component with query params
const renderWithSearchParams = (params: Record<string, string>) => {
  const queryString = new URLSearchParams(params).toString();
  const path = `/assignments/edit/999/add-reviewer?${queryString}`;

  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/assignments/edit/:id/add-reviewer" element={<AddReviewer />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('AddReviewer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders contributor and assignment from query params', () => {
    renderWithSearchParams({
      contributor: 'Alice',
      assignment: 'Math Assignment',
      topic: 'Cool Topic',
      contributor_id: '42',
    });

    expect(screen.getByText('Contributor: Alice')).toBeInTheDocument();
    expect(screen.getByText('Assignment: Math Assignment')).toBeInTheDocument();
  });

  test('adds a reviewer and calls context + navigation', () => {
    renderWithSearchParams({
      contributor: 'Alice',
      assignment: 'Math Assignment',
      topic: 'Cool Topic',
      contributor_id: '42',
    });

    fireEvent.change(screen.getByLabelText(/user login/i), {
      target: { value: 'newuser' },
    });

    fireEvent.click(screen.getByRole('button', { name: /add reviewer/i }));

    expect(mockAddReviewerToTopic).toHaveBeenCalledWith('Cool Topic', expect.objectContaining({
      reviewer: expect.objectContaining({ name: 'newuser' }),
      review_status: 'Pending',
    }));

    expect(mockNavigate).toHaveBeenCalledWith('/assignments/edit/999/assignreviewer');
  });

  test('does not submit if topic is missing', () => {
    renderWithSearchParams({
      contributor: 'Alice',
      assignment: 'Math Assignment',
      contributor_id: '42',
      // topic is intentionally missing
    });

    fireEvent.change(screen.getByLabelText(/user login/i), {
      target: { value: 'userX' },
    });

    fireEvent.click(screen.getByRole('button', { name: /add reviewer/i }));

    expect(mockAddReviewerToTopic).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
