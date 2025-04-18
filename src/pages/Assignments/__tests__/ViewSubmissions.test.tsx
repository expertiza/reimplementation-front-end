import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ViewSubmissions from '../ViewSubmissions';

// Mock the useLoaderData hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLoaderData: () => ({ name: 'Test Assignment' }),
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

  test('renders team names', () => {
    renderComponent();
    expect(screen.getByText('Hornets')).toBeInTheDocument();
    expect(screen.getByText('rubywolf')).toBeInTheDocument();
  });

  test('renders team members', () => {
    renderComponent();
    expect(screen.getByText('student9183')).toBeInTheDocument();
    expect(screen.getByText('student9173')).toBeInTheDocument();
    expect(screen.getByText('student9180')).toBeInTheDocument();
    expect(screen.getByText('student9164')).toBeInTheDocument();
  });

  test('renders action links', () => {
    renderComponent();
    expect(screen.getAllByText('Assign Grade')).toHaveLength(2);
    expect(screen.getAllByText('History')).toHaveLength(2);
  });

  test('links navigate to correct URLs', () => {
    renderComponent();
    
    // Check Assign Grade links
    const assignGradeLinks = screen.getAllByText('Assign Grade');
    expect(assignGradeLinks[0].getAttribute('href')).toBe('/assign_grade/1');
    expect(assignGradeLinks[1].getAttribute('href')).toBe('/assign_grade/2');
    
    // Check History links
    const historyLinks = screen.getAllByText('History');
    expect(historyLinks[0].getAttribute('href')).toBe('/history/1');
    expect(historyLinks[1].getAttribute('href')).toBe('/history/2');
    
    // Check student links
    const studentLinks = screen.getAllByText('student9183');
    expect(studentLinks[0].getAttribute('href')).toBe('/students/9183');
  });
}); 