import '@testing-library/jest-dom/extend-expect'; // Import jest-dom for custom assertions
import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import ReviewTable from './ReviewTable';

describe('ReviewTable component', () => {
    test('renders without crashing', () => {
        render(
          <Router> {/* Wrap your component with Router */}
            <ReviewTable />
          </Router>
        );
      });

});


describe('ReviewTable Toggle Menu', () => {
  test('toggle menu name changes when clicked', () => {
    render(
      <Router>
        <ReviewTable />
      </Router>
    )
    const menuTitleOpen = screen.getByText('▼ Open Heatmap Options ▼');
    // when rendered it should ask to open
    expect(menuTitleOpen).toBeInTheDocument()
    
    fireEvent.click(menuTitleOpen)

    const menuTitleClose = screen.getByText('▲ Close Heatmap Options ▲');
    // state will change to true, so title should ask to be closed now
    expect(menuTitleClose).toBeInTheDocument()

    // closing menu should make it go back to to open  
    fireEvent.click(menuTitleClose)
    expect(menuTitleOpen).toBeInTheDocument()

  })


  test('toggle menu does not show when not clicked', () => {
    render(
      <Router>
        <ReviewTable />
      </Router>
    )
    
    const menuTitleOpen = screen.getByText('▼ Open Heatmap Options ▼')
    expect(menuTitleOpen).toBeInTheDocument()
    
    const divForMenu = screen.queryByTestId('toggle-pannel')
    expect(divForMenu).not.toBeInTheDocument()
  })


  test('toggles each checkbox and updates the state', async () => {
    render(
      <Router>
        <ReviewTable />
      </Router>
    )
  
    const toggleButton = screen.getByText('▼ Open Heatmap Options ▼')
    fireEvent.click(toggleButton)
  
    // toggleQuestion checkbox
    const toggleQuestion = await screen.findByLabelText('Toggle Question List')
    expect(toggleQuestion).toBeInTheDocument()
    fireEvent.click(toggleQuestion)
    expect(toggleQuestion).toBeChecked()
  
    // wordCount10 checkbox
    const wordCount10 = screen.getByLabelText('Toggle comments over 10 words')
    expect(wordCount10).toBeInTheDocument()
    fireEvent.click(wordCount10)
    expect(wordCount10).toBeChecked()
  
    // customWordCount checkbox
    const customWordCount = screen.getByLabelText('Toggle for custom feature')
    expect(customWordCount).toBeInTheDocument()
    fireEvent.click(customWordCount)
    expect(customWordCount).toBeChecked()
  });
  

})
