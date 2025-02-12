import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Questionnaire from './Questionnaire';
import '@testing-library/jest-dom';

describe('Questionnaire Component', () => {
  test('renders questionnaire title', () => {
    render(<Questionnaire />);
    expect(screen.getByText('Edit Teammate Review')).toBeInTheDocument();
  });

  test('displays min and max item score inputs with default values', () => {
    render(<Questionnaire />);
    
    // Adjusting selectors to ensure they match the rendered input fields in Questionnaire component
    const minScoreInput = screen.getByDisplayValue('0'); // Default minScore value is 0
    const maxScoreInput = screen.getByDisplayValue('5'); // Default maxScore value is 5

    expect(minScoreInput).toBeInTheDocument();
    expect(maxScoreInput).toBeInTheDocument();
  });

  test('toggles privacy setting', () => {
    render(<Questionnaire />);
    const privacyCheckbox = screen.getByLabelText(/Is this Teammate review private:/i);
    
    expect(privacyCheckbox).not.toBeChecked(); // Confirm initial state is unchecked
    fireEvent.click(privacyCheckbox);
    expect(privacyCheckbox).toBeChecked(); // After click, checkbox should be checked
  });

  test('updates min and max item scores', () => {
    render(<Questionnaire />);
    
    // Query by placeholder text instead if labels are not accessible
    const minInput = screen.getByDisplayValue('0');
    const maxInput = screen.getByDisplayValue('5');

    // Change min and max score values
    fireEvent.change(minInput, { target: { value: '1' } });
    fireEvent.change(maxInput, { target: { value: '10' } });

    expect(minInput).toHaveValue(1); // New min score should be 1
    expect(maxInput).toHaveValue(10); // New max score should be 10
  });

  test('renders questionnaire items with default data', () => {
    render(<Questionnaire />);
    
    const questionElements = screen.getAllByRole('textbox');
    expect(questionElements.length).toBeGreaterThan(0); // Check if at least one question is rendered
    expect(questionElements[0]).toHaveValue('How many times was this person late to meetings?');
  });

  test('allows editing of question fields', () => {
    render(<Questionnaire />);
    const questionInput = screen.getAllByRole('textbox')[0];
    
    // Edit the first question text
    fireEvent.change(questionInput, { target: { value: 'Updated Question Text' } });
    expect(questionInput).toHaveValue('Updated Question Text');
  });

  test('adds a new question', () => {
    render(<Questionnaire />);
    const addButton = screen.getByRole('button', { name: /Add Question/i });
    
    // Simulate adding a question
    fireEvent.click(addButton);

    const questionInputs = screen.getAllByRole('textbox');
    expect(questionInputs.length).toBeGreaterThan(1); // Check for an additional question input
  });

  test('exports questionnaire data as JSON', () => {
    render(<Questionnaire />);
    const exportLink = screen.getByText(/Export Questionnaire/i);

    // Mock the URL.createObjectURL function
    const createObjectURL = jest.fn();
    global.URL.createObjectURL = createObjectURL;

    fireEvent.click(exportLink);

    expect(createObjectURL).toHaveBeenCalled(); // Verify that createObjectURL was triggered for export
  });

  test('opens import modal and handles import data', () => {
    render(<Questionnaire />);
    const importLink = screen.getByText(/Import Questionnaire/i);
    fireEvent.click(importLink);

    // Verify if import modal opens
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test("renders title and main controls", () => {
    render(<Questionnaire />);

    expect(screen.getByText("Edit Teammate Review")).toBeInTheDocument();
    expect(screen.getByLabelText(/Min item score:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Max item score:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Is this Teammate review private:/i)).toBeInTheDocument();
  });

  test("renders initial items", () => {
    render(<Questionnaire />);

    // Check for specific question text
    expect(screen.getByText("How many times was this person late to meetings?")).toBeInTheDocument();
    expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0); // Ensure textboxes for questions are rendered
  });

  test("removes a question", () => {
    render(<Questionnaire />);
    const removeButton = screen.getAllByRole("button", { name: /Remove/i })[0];

    fireEvent.click(removeButton);

    const questions = screen.getAllByRole("textbox");
    expect(questions.length).toBeLessThan(11); // Assuming initially 11 questions
  });

  test("opens and closes import modal", () => {
    render(<Questionnaire />);
    const importButton = screen.getByRole("button", { name: /Import Questionnaire/i });

    fireEvent.click(importButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument(); // Check modal visibility

    const closeButton = screen.getByRole("button", { name: /Close/i });
    fireEvent.click(closeButton);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(); // Modal should disappear
  });

  test("opens and closes export modal", () => {
    render(<Questionnaire />);
    const exportButton = screen.getByRole("button", { name: /Export Questionnaire/i });

    fireEvent.click(exportButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument(); // Check modal visibility

    const closeButton = screen.getByRole("button", { name: /Close/i });
    fireEvent.click(closeButton);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(); // Modal should disappear
  });

  test("updates question details", () => {
    render(<Questionnaire />);
    const questionTextarea = screen.getAllByRole("textbox")[0];

    fireEvent.change(questionTextarea, { target: { value: "Updated Question Text" } });
    expect(questionTextarea).toHaveValue("Updated Question Text");
  });

  test("updates item type dropdown", () => {
    render(<Questionnaire />);
    const dropdown = screen.getAllByRole("combobox")[0];

    fireEvent.change(dropdown, { target: { value: "Dropdown" } });
    expect(dropdown).toHaveValue("Dropdown");
  });

  test("renders correctly with empty questionnaire data", () => {
    render(<Questionnaire />);
    // Mock an empty questionnaire
    const emptyData = { title: "", data: [] };
    fireEvent.change(screen.getByRole("textbox", { name: /Title/i }), { target: { value: emptyData.title } });
  
    expect(screen.queryAllByRole("textbox").length).toBe(1); // Only title input should be visible
  });

  test("removes all questions and displays appropriate message", () => {
    render(<Questionnaire />);
  
    const removeButtons = screen.getAllByRole("button", { name: /Remove/i });
    removeButtons.forEach((btn) => fireEvent.click(btn));
  
    expect(screen.getByText(/No questions available/i)).toBeInTheDocument(); // Assuming a placeholder is displayed for empty state
  });

  test("detects duplicate sequence numbers when adding a question", () => {
    render(<Questionnaire />);
  
    const addButton = screen.getByRole("button", { name: /Add Question/i });
    fireEvent.click(addButton);
  
    const sequenceInput = screen.getAllByRole("textbox")[0]; // Assume the sequence field
    fireEvent.change(sequenceInput, { target: { value: "1.0" } }); // Duplicate sequence
  
    fireEvent.click(addButton);
  
    expect(screen.getByText(/Duplicate sequence number detected/i)).toBeInTheDocument(); // Error message for duplicates
  });
  

});
