import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // Import jest-dom for custom assertions
import Statistics from './Statistics'; // Import the component to test

describe('Statistics', () => {
  test('renders the correct labels', () => {
    render(<Statistics average={''} />);
    // Find the scores within the underlined spans
    const element_1 = screen.getByRole('columnheader', { name: 'Submitted Work' });
    const element_2 = screen.getByRole('columnheader', { name: 'Author Feedback' });
    const element_3 = screen.getByRole('columnheader', { name: 'Teammate Review' });
    const element_4 = screen.getByRole('columnheader', { name: 'Contributor' });
    
    const element_5 = screen.getAllByText(/Average/i);
    const element_6 = screen.getAllByText(/Range/i);
    const element_7 = screen.getByRole('columnheader', { name: 'Final Score' });

    // Assert that the elements are present
    expect(element_1).toBeInTheDocument();
    expect(element_2).toBeInTheDocument();
    expect(element_3).toBeInTheDocument();
    expect(element_4).toBeInTheDocument();
    expect(element_5[0]).toBeInTheDocument();
    expect(element_6[0]).toBeInTheDocument();
    expect(element_7).toBeInTheDocument();

  });

  test('renders correct statistical information for each label', () => {
    render(<Statistics average={''} />);
    // Find the scores within the underlined spans
    const element_1 = screen.getByRole('cell', { name: 'ssshah26 (Siddharth Shah)' });
    const element_2 = screen.getByRole('cell', { name: 'Show Reviews (20)' });
    const element_3 = screen.getByRole('cell', { name: '99.99% - 100%' });
    const element_4 = screen.getByRole('cell', { name: '96.67 Show Author Feedback (10)' });
    const element_5 = screen.getByRole('cell', { name: '87% - 100%' });
    const element_6 = screen.getByRole('cell', { name: '4.64' });
    const element_7 = screen.getByRole('cell', { name: '90% - 100%' });
    const element_8 = screen.getByRole('cell', { name: '75% (in Finished)' });
    
    // Assert that the elements are present
    expect(element_1).toBeInTheDocument();
    expect(element_2).toBeInTheDocument();
    expect(element_3).toBeInTheDocument();
    expect(element_4).toBeInTheDocument();
    expect(element_5).toBeInTheDocument();
    expect(element_6).toBeInTheDocument();
    expect(element_7).toBeInTheDocument();
    expect(element_8).toBeInTheDocument();
  });

  test('renders correct links', () => {
    render(<Statistics average={''} />);
    // Find the scores within the underlined spans
    const element_1 = screen.getByRole('link', { name: 'show stats' });
    const element_2 = screen.getByRole('link', { name: 'ssshah26' });
    const element_3 = screen.getByRole('link', { name: 'Show Reviews' });
    const element_4 = screen.getByRole('link', { name: 'Show Author Feedback' });
    
    // Assert that the elements are present
    expect(element_1).toBeInTheDocument();
    expect(element_2).toBeInTheDocument();
    expect(element_3).toBeInTheDocument();
    expect(element_4).toBeInTheDocument();

  });
});