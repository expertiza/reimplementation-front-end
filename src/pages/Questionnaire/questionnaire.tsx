import React, { useState } from 'react';
import './Questionnaire.css'; // Import the CSS file for styles

function Questionnaire() {
  const [showOnlyMyItems, setShowOnlyMyItems] = useState(true);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  const questionnaireItems = [
    'Review',
    'Metareview',
    'Author Feedback',
    'Teammate Review',
    'Assignment Survey',
    'Global Survey',
    'Course Survey',
    'Bookmark Rating',
  ];

  const handleAddButtonClick = () => {
    console.log('Add button clicked');
    // Add your logic for adding questionnaire items here
  };

  const handleItemClick = (index: number) => {
    if (expandedItem === index) {
      setExpandedItem(null);
    } else {
      setExpandedItem(index);
    }
  };

  const handleExpandButtonClick = (index: number) => {
    console.log(`Expand button clicked for item ${index}`);
    // Add your logic for expanding questionnaire items here
  };

  return (
    <div className="questionnaire-container">
      <h1>Questionnaire List</h1>
      <button onClick={handleAddButtonClick}>Add</button>

      <br />

      <label>
        <input
          type="checkbox"
          checked={showOnlyMyItems}
          onChange={() => setShowOnlyMyItems(!showOnlyMyItems)}
        />
        Display my items only
      </label>

      <table className="questionnaire-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {questionnaireItems.map((item, index) => (
            <tr key={index}>
              <td onClick={() => handleItemClick(index)}>{item}</td>
              <td>
                <button onClick={() => handleExpandButtonClick(index)}>+</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Questionnaire;
