import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ShowReviews from '../ShowReviews';
import '@testing-library/jest-dom';

// Mock axios client to avoid importing ESM axios during tests
jest.mock('../../utils/axios_client', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

// Mock react-redux hooks so we don't need redux-mock-store
jest.mock('react-redux', () => ({
  useSelector: () => ({ user: { role: 'Instructor', id: 1 }, isAuthenticated: true }),
  useDispatch: () => () => {},
}));

const sampleData = [
  [
    { questionText: 'Q1', reviews: [{ score: 4, comment: 'ok' }, { score: 3 }] , maxScore: 5 },
    { questionText: 'Q2', reviews: [{ textResponse: 'long response from a student here' }, { textResponse: 'short' }], maxScore: 1 }
  ],
  [
    { questionText: 'Q1', reviews: [{ score: 5 }, { score: 4 }], maxScore: 5 }
  ]
];

describe('ShowReviews', () => {
  it('toggles expand all and individual review expansion', async () => {
    render(<ShowReviews data={sampleData as any} roundSelected={-1} />);

    // Show all reviews button present
    const button = screen.getByRole('button', { name: /Show all reviews|Hide all reviews/ });
    expect(button).toBeInTheDocument();
  fireEvent.click(button);
  // After clicking, button text toggles
  expect(button.textContent?.toLowerCase()).toContain('hide');

  // Click to expand first round (button contains 'Round 1')
  const roundToggle = await screen.findByText(/Round 1/);
  fireEvent.click(roundToggle);
  // After expansion, review 1 button should be visible
  expect(await screen.findByText(/Review 1/)).toBeInTheDocument();
  });

  it('auto-expands target review when provided', async () => {
    render(<ShowReviews data={sampleData as any} roundSelected={-1} targetReview={{ roundIndex: 0, reviewIndex: 1 }} />);

  // The target review should auto expand its round and review
  expect(await screen.findByText(/Review 2/)).toBeInTheDocument();
  });
});
