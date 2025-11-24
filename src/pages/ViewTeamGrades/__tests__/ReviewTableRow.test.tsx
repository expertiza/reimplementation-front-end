import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReviewTableRow from '../ReviewTableRow';
import '@testing-library/jest-dom';

const sampleRow = {
  itemNumber: '1',
  itemText: 'This is the item prompt that is a little long',
  itemType: 'TextArea',
  reviews: [
    { name: 'Alice', textResponse: 'This is a longer response that should be truncated in the table cell' },
    { name: 'Bob', textResponse: 'Short' }
  ],
  RowAvg: 4.5,
  maxScore: 5
};

describe('ReviewTableRow', () => {
  // Suppress specific deprecation warning from react-dom test utils about act
  const originalConsoleError = console.error;
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation((...args: any[]) => {
      const msg = args?.[0] ? String(args[0]) : '';
      if (msg.includes('ReactDOMTestUtils.act') || msg.includes('is deprecated in favor of `React.act`')) {
        return;
      }
      originalConsoleError(...args);
    });
  });
  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('renders truncated text and expands on click of dots', () => {
    render(<table><tbody><ReviewTableRow row={sampleRow as any} showToggleQuestion={true} /></tbody></table>);

    // item prompt truncated
    const promptCell = screen.getByText(/This is the item prompt/);
    expect(promptCell).toBeInTheDocument();

    // truncated response should show ellipses
    const dots = screen.getAllByText('...')[0];
    expect(dots).toBeInTheDocument();
    fireEvent.click(dots);
    // after click, it should show [show less]
    expect(screen.getByText('[show less]')).toBeInTheDocument();
  });

  it('sets data-question attribute on review cells for tooltip use and clicks call handler', () => {
    const onClick = jest.fn();
    render(<table><tbody><ReviewTableRow row={sampleRow as any} showToggleQuestion={false} onReviewClick={(i) => onClick(i)} /></tbody></table>);
    const cells = screen.getAllByRole('cell');
    // verify there is at least one cell with data-question attribute
    const hasDataQuestion = cells.some((c) => c.getAttribute('data-question') !== null);
    expect(hasDataQuestion).toBe(true);

    // With showToggleQuestion=false, cell ordering is: item-number (0), review0 (1), review1 (2), ..., average (n)
    // click the second review (index 1)
    const secondReviewCell = cells[1 + 1]; // offset by 1 for item-number
    fireEvent.click(secondReviewCell);
    expect(onClick).toHaveBeenCalledWith(1);
  });
});
