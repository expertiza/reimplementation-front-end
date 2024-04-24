import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // Import jest-dom for custom assertions
import ShowSubmission from './ShowSubmission'; // Import the component to test

describe('ShowSubmission', () => {
  test('renders button with correct text', () => {
    render(<ShowSubmission />);
    expect(screen.getByRole('button', { name: 'Show Submission' })).toBeInTheDocument();
  });

  test('collapsible content is initially hidden', () => {
    render(<ShowSubmission />);
    const collapsibleContent = screen.queryByTestId('example-collapse-text'); // Update test ID here
    expect(collapsibleContent).toBeNull(); // Check if the collapsible content is initially null
  });
  

  test('renders links when collapsible content is open', () => {
    render(<ShowSubmission />);
    const button = screen.getByRole('button', { name: 'Show Submission' });
    fireEvent.click(button);
    expect(screen.getByText('https://github.ncsu.edu/Program-2-Ruby-on-Rails/WolfEvents')).toBeInTheDocument();
    expect(screen.getByText('http://152.7.177.44:8080/')).toBeInTheDocument();
  });
});
