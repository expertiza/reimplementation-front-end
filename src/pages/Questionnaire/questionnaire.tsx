import React, { useState } from 'react';
import './Questionnaire.css';
import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencilAlt, faEye } from '@fortawesome/free-solid-svg-icons';
import dummyData from './dummyData.json';
import { BsPencilFill, BsPersonXFill } from "react-icons/bs";
import { BiCopy } from "react-icons/bi";
import { BsPlusSquareFill } from "react-icons/bs";

function Questionnaire() {
  const [showOnlyMyItems, setShowOnlyMyItems] = useState(true);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'default' | null>(null);

  const questionnaireItems = dummyData; // Use dummy data for items

  const handleAddButtonClick = (index: number) => {
    console.log(`Add button clicked for item at index ${index}`);
    // Add your logic for handling the dropdown actions here
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
                  <DropdownButton
                    id={`dropdown-${index}`}
                    title={<BsPlusSquareFill />}
                    variant="outline-success"
                  >
                    <Dropdown.Item onClick={() => console.log(`Adding field for ${item.name}`)}>
                      Add Field
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => console.log(`Adding sub-item for ${item.name}`)}>
                      Add Sub-Item
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => console.log(`Adding comment for ${item.name}`)}>
                      Add Comment
                    </Dropdown.Item>
                  </DropdownButton>
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
                              <BsPersonXFill />
                            </Button>
                            <span className="icon-space"></span>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <BsPencilFill />
                            </Button>
                            <span className="icon-space"></span>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleShow(item)}
                            >
                              <BiCopy />
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