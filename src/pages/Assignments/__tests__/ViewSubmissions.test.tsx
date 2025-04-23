import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ViewSubmissions from '../ViewSubmissions';

// Mock the useLoaderData hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLoaderData: () => [{
    id: 1,
    topic: 'Test Assignment',
    name: 'Tennessee wolves',
    team_id: 1,
    members: [
      { id: 9183, name: 'belva' },
      { id: 9173, name: 'sydney_daugherty' }
    ]
  }],
  useParams: () => ({ id: '1' })
}));

describe('ViewSubmissions Component', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ViewSubmissions />
      </BrowserRouter>
    );
  };

  test('renders the assignment name', () => {
    renderComponent();
    expect(screen.getByText('View Submissions - Test Assignment')).toBeInTheDocument();
  });

  test('renders team names with correct styling', () => {
    renderComponent();
    const teamName = screen.getByText('Tennessee wolves');
    expect(teamName).toBeInTheDocument();
    expect(teamName.closest('div')).toHaveStyle({
      color: '#3399ff',
      fontWeight: 'normal'
    });
  });

  test('renders team members with correct styling', () => {
    renderComponent();
    const memberLinks = [
      screen.getByText('belva'),
      screen.getByText('sydney_daugherty')
    ];
    
    memberLinks.forEach(link => {
      expect(link).toBeInTheDocument();
      expect(link).toHaveStyle({
        color: '#a67c52',
        textDecoration: 'none'
      });
    });
  });

  test('renders action links with correct styling', () => {
    renderComponent();
    const assignGradeLink = screen.getByText('Assign Grade');
    const historyLink = screen.getByText('History');

    expect(assignGradeLink).toBeInTheDocument();
    expect(historyLink).toBeInTheDocument();
    expect(assignGradeLink).toHaveStyle({
      color: '#a67c52',
      marginBottom: '4px'
    });
    expect(historyLink).toHaveStyle({
      color: '#a67c52'
    });
  });

  test('links have correct navigation paths', () => {
    renderComponent();
    
    // Check Assign Grade link
    const assignGradeLink = screen.getByText('Assign Grade').closest('a');
    expect(assignGradeLink).toHaveAttribute(
      'href',
      '/assignments/edit/1/teams/1/assign_grade'
    );
    
    // Check History link
    const historyLink = screen.getByText('History').closest('a');
    expect(historyLink).toHaveAttribute('href', '/history/1');
    
    // Check student links
    const studentLink = screen.getByText('belva').closest('a');
    expect(studentLink).toHaveAttribute('href', '/students/9183');
  });

  test('table headers are rendered correctly', () => {
    renderComponent();
    expect(screen.getByText('Topic Name')).toBeInTheDocument();
    expect(screen.getByText('Team Name')).toBeInTheDocument();
    expect(screen.getByText('Team Member(s)')).toBeInTheDocument();
    expect(screen.getByText('Links')).toBeInTheDocument();
  });
}); 