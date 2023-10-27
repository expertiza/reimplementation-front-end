import React, { useState } from 'react';
import './Questionnaire.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencilAlt, faEye } from '@fortawesome/free-solid-svg-icons';
import dummyData from './dummyData.json';

function Questionnaire() {
  const [showOnlyMyItems, setShowOnlyMyItems] = useState(true);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'default' | null>(null);

  const questionnaireItems = dummyData; // Use dummy data for items

  const handleAddButtonClick = () => {
    console.log('Add button clicked');
    // Add your logic for adding questionnaire items here
  };
  type QuestionnaireItem = {
    name: string;
    creationDate: string;
    updatedDate: string;
    };
  

  const handleItemClick = (index: number) => {
    if (expandedItem === index) {
      setExpandedItem(null);
    } else {
      setExpandedItem(index);
    }
  };

  const handleDelete = (item: QuestionnaireItem) => {
    console.log(`Delete button clicked for item:`, item);
    // Add your logic for deleting the item here
  };

  const handleEdit = (item: QuestionnaireItem) => {
    console.log(`Edit button clicked for item:`, item);
    // Add your logic for editing the item here
  };

  const handleShow = (item: QuestionnaireItem) => {
    console.log(`Show button clicked for item:`, item);
    // Add your logic for showing the item here
  };

  const handleSortByName = () => {
    if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder('asc');
    }
  };

  const sortedQuestionnaireItems = [...questionnaireItems];

  if (sortOrder === 'asc') {
    sortedQuestionnaireItems.sort();
  } else if (sortOrder === 'desc') {
    sortedQuestionnaireItems.sort().reverse();
  }

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
            <th onClick={handleSortByName}>
              Name {sortOrder === 'asc' && '↑'} {sortOrder === 'desc' && '↓'} {sortOrder === null && '↑↓'}
            </th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedQuestionnaireItems.map((item, index) => (
            <React.Fragment key={index}>
              <tr>
                <td onClick={() => handleItemClick(index)}>{item.name}</td>
                <td>
                  <FontAwesomeIcon icon={faTrash} onClick={() => handleDelete(item)} />
                  <span className="icon-space"></span>
                  <FontAwesomeIcon icon={faPencilAlt} onClick={() => handleEdit(item)} />
                  <span className="icon-space"></span>
                  <FontAwesomeIcon icon={faEye} onClick={() => handleShow(item)} />
                </td>
              </tr>
              {expandedItem === index && (
  <tr className="expanded-row">
    <td colSpan={4}>
      <table className='expanded-row centered-table'>
        <tbody>
          <tr>
            <th><strong>Name:</strong></th>
            
           
          
            <th><strong>Creation Date:</strong></th>
           
          
            <th><strong>Updated Date:</strong></th>
            
          
            <th><strong>Actions:</strong></th>
            
            
          </tr>
          <tr> <td>{item.name}</td>
            <td>{item.creationDate}</td>
            <td>{item.updatedDate}</td>
            <td>
              <FontAwesomeIcon icon={faTrash} onClick={() => handleDelete(item)} />
              <span className="icon-space"></span>
              <FontAwesomeIcon icon={faPencilAlt} onClick={() => handleEdit(item)} />
              <span className="icon-space"></span>
              <FontAwesomeIcon icon={faEye} onClick={() => handleShow(item)} />
            </td>

          </tr>
        </tbody>
      </table>
    </td>
  </tr>
)}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Questionnaire;