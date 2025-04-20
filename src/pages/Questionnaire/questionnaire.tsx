import React, { useState } from 'react';
import './Questionnaire.css';
import { Button } from "react-bootstrap";
import { BsPlusSquareFill } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for making API requests
import dummyData from './dummyData.json';

function Questionnaire() {
  const [showOnlyMyItems, setShowOnlyMyItems] = useState(true);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'default' | null>(null);

  const [questionnaireItems, setQuestionnaireItems] = useState(dummyData); // Use dummy data for items
  const navigate = useNavigate(); // Initialize navigation

  const handleNavigateToEditPage = (itemName: string) => {
    navigate(`/edit-questionnaire#${encodeURIComponent(itemName)}`);
  };

  const handleItemClick = (index: number) => {
    if (expandedItem === index) {
      setExpandedItem(null);
    } else {
      setExpandedItem(index);
    }
  };

  const handleDelete = (item: any) => {
    const updatedItems = questionnaireItems.filter((q) => q.name !== item.name);
    setQuestionnaireItems(updatedItems);
  };

  const handleSortByName = () => {
    if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder('asc');
    }
  };

  const handleSaveChanges = async () => {
    try {
      const response = await axios.post('/api/save-dummy-data', { data: questionnaireItems });
      if (response.status === 200) {
        alert('Changes saved successfully!');
      } else {
        alert('Failed to save changes.');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('An error occurred while saving changes.');
    }
  };

  const sortedQuestionnaireItems = [...questionnaireItems];

  if (sortOrder === 'asc') {
    sortedQuestionnaireItems.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOrder === 'desc') {
    sortedQuestionnaireItems.sort((a, b) => b.name.localeCompare(a.name));
  }

  return (
    <div className="questionnaire-container">
      <h1>Questionnaire List</h1>
      <button onClick={() => console.log('Global Add Button Clicked')}>Add</button>
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
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => handleNavigateToEditPage(item.name)}
                  >
                    <BsPlusSquareFill />
                  </Button>
                </td>
              </tr>
              {expandedItem === index && (
                <tr className="expanded-row">
                  <td colSpan={4}>
                    <table className="expanded-row centered-table">
                      <tbody>
                        <tr>
                          <th><strong>Name:</strong></th>
                          <th><strong>Creation Date:</strong></th>
                          <th><strong>Updated Date:</strong></th>
                          <th><strong>Actions:</strong></th>
                        </tr>
                        <tr>
                          <td>{item.name}</td>
                          <td>{item.creationDate}</td>
                          <td>{item.updatedDate}</td>
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="ms-sm-2"
                              onClick={() => handleDelete(item)}
                            >
                              Delete
                            </Button>
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