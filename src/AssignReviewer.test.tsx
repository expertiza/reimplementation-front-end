import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AssignReviewer from 'pages/Assignments/AssignReviewer';
import { TopicWithReviewers } from 'utils/interfaces';

// Mock useLoaderData and useNavigate
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useLoaderData: () => ({ name: 'Mock Assignment' }),
    useParams: () => ({ id: '123' }),
    useNavigate: () => mockNavigate,
  };
});

// Sample mock topics
const mockTopics: TopicWithReviewers[] = [
  {
    topic_identifier: 'topic-1',
    topic_name: 'Topic One',
    contributors: [{
        name: 'Alice',
        id: 1,
        type: 'AssignmentTeam',
        users: [],
        reviewMappings: []
    }],
    reviewers: [
      {
        map_id: 1,
        reviewer: {
            name: 'Bob',
            email: '',
            full_name: '',
            role_id: 0,
            institution_id: 0
        },
        review_status: 'Submitted',
        metareview_mappings: []
      },
    ],
  },
  {
    topic_identifier: 'topic-2',
    topic_name: 'Topic Two',
    contributors: [{
        name: 'Charlie',
        id: 2,
        type: 'AssignmentTeam',
        users: [],
        reviewMappings: []
    }],
    reviewers: [],
  },
];

// Mock useReviewerContext
const mockAddReviewerToTopic = jest.fn();

jest.mock('context/ReviewerContext', () => ({
  useReviewerContext: () => ({
    topics: mockTopics,
    addReviewerToTopic: mockAddReviewerToTopic,
  }),
}));

// Render component with routing
const renderWithRouter = () =>
  render(
    <MemoryRouter initialEntries={['/assignments/edit/123']}>
      <Routes>
        <Route path="/assignments/edit/:id" element={<AssignReviewer />} />
      </Routes>
    </MemoryRouter>
  );

describe('AssignReviewer (with mocked context)', () => {
  test('renders assignment name and topics', () => {
    renderWithRouter();
    expect(screen.getByText('Topic One')).toBeInTheDocument();
    expect(screen.getByText('Topic Two')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  test('shows Add Reviewer button for topics with < 3 reviewers', () => {
    renderWithRouter();
    expect(screen.getAllByText('Add Reviewer').length).toBeGreaterThan(0);
  });

  test('renders Unsubmit and Delete buttons for submitted reviewers', () => {
    renderWithRouter();
    expect(screen.getByText(/Bob \(Submitted\)/)).toBeInTheDocument();
    expect(screen.getByText('Unsubmit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  test('deletes reviewer from topic on Delete click', () => {
    renderWithRouter();
    fireEvent.click(screen.getByText('Delete'));
    expect(screen.queryByText(/Bob \(Submitted\)/)).not.toBeInTheDocument();
  });

  test('changes review status to Pending on Unsubmit click', () => {
    renderWithRouter();
    fireEvent.click(screen.getByText('Unsubmit'));
    expect(screen.getByText(/Bob \(Pending\)/)).toBeInTheDocument();
  });

  test('calls navigate when Add Reviewer is clicked', () => {
    renderWithRouter();
    fireEvent.click(screen.getAllByText('Add Reviewer')[0]);
    expect(mockNavigate).toHaveBeenCalledWith(
      '/assignments/edit/123/add-reviewer?topic=topic-1'
    );
  });
});
