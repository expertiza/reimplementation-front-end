import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SubmissionView from './SubmissionsView';

describe('SubmissionsView', () => {
    it('renders the title and filter', () => {
        render(
          <BrowserRouter>
            <SubmissionView />
          </BrowserRouter>
        );
    
        const title = screen.getByText('Submissions');
        const filter = screen.getByLabelText('Filter by Assignment');
    
        expect(title).toBeTruthy();
        expect(filter).toBeTruthy();
      });

      it('filters submissions based on selected assignment', async () => {
        render(
          <BrowserRouter>
            <SubmissionView />
          </BrowserRouter>
        );
    
        // Select an assignment to filter
        const select = screen.getByLabelText('Filter by Assignment');
        fireEvent.change(select, { target: { value: 'Assignment 1' } });
    
        // Check if the filtered submission is displayed
        expect(await screen.findByText('Anonymized_Team_38121')).toBeTruthy();
        expect(screen.queryByText('Anonymized_Team_38122')).toBeFalsy();
      });
    
      it('shows all submissions when no filter is applied', async () => {
        render(
          <BrowserRouter>
            <SubmissionView />
          </BrowserRouter>
        );
    
        // Select an assignment to filter
        const select = screen.getByLabelText('Filter by Assignment');
        fireEvent.change(select, { target: { value: 'Assignment 1' } });
    
        // Reset filter
        fireEvent.change(select, { target: { value: '' } });
    
        // Check if all submissions are displayed
        expect(await screen.findByText('Anonymized_Team_38121')).toBeTruthy();
        expect(await screen.findByText('Anonymized_Team_38122')).toBeTruthy();
      });
});
