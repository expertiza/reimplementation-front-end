import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SubmissionHistoryView from './SubmissionHistoryView';

const mockUseParams = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams()
}));

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SubmissionHistoryView', () => {
  beforeEach(() => {
    mockUseParams.mockReset();
    mockUseParams.mockReturnValue({ submissionId: '1' });
  });

  // Check if Submission ID is correct
  test('receives correct submission ID from URL parameters', () => {
    mockUseParams.mockReturnValue({ submissionId: '1' }); 
    renderWithRouter(<SubmissionHistoryView />);
    expect(mockUseParams).toHaveBeenCalled();
    const { submissionId } = mockUseParams();
    expect(submissionId).toBe('1');
  });

  test('renders submission record title', () => {
    renderWithRouter(<SubmissionHistoryView />);
    expect(screen.getByText('Submission Record')).toBeInTheDocument();
  });

  // Check if table renders properly
  test('renders table headers', () => {
    renderWithRouter(<SubmissionHistoryView />);

    expect(screen.getByText('Team Id')).toBeInTheDocument();
    expect(screen.getByText('Operation')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
  });

  // Check if data is displayed correctly
  test('displays data correctly', () => {
    renderWithRouter(<SubmissionHistoryView />);
    
    const rows = screen.getAllByRole('row').slice(2);
    const firstRow = rows[0];
    const cells = within(firstRow).getAllByRole('cell');
    
    expect(cells[0]).toHaveTextContent('12345');
    expect(cells[1]).toHaveTextContent('Submit Hyperlink');
    expect(cells[2]).toHaveTextContent('Test_User');
    expect(cells[3]).toHaveTextContent('https://github.ncsu.edu/masonhorne/reimplementation-front-end');
    expect(cells[4]).toHaveTextContent('2024-09-17 22:38:09');
  });

  // Check if rows are displayed correctly
  test('renders correct number of rows', () => {
    renderWithRouter(<SubmissionHistoryView />);
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(7);
  });
});