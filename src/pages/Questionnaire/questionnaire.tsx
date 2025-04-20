import React, { useState, useEffect } from 'react';
import './Questionnaire.css';
import { Button, Modal } from "react-bootstrap"; // Import Modal for confirmation dialog
import { BsPlusSquareFill, BsDashSquareFill } from "react-icons/bs"; // Add red minus icon
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthToken } from "../../utils/auth";

function Questionnaire() {
  const [showOnlyMyItems, setShowOnlyMyItems] = useState(true);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'default' | null>(null);
  const [questionnaireItems, setQuestionnaireItems] = useState<any[]>([]); // Initialize with an empty array
  const [newQuestionnaireName, setNewQuestionnaireName] = useState(""); // State for new questionnaire name
  const [newQuestionnaireType, setNewQuestionnaireType] = useState(""); // State for new questionnaire type
  const [triggerEffect, setTriggerEffect] = useState(false); // State to trigger useEffect
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State to control delete confirmation modal
  const [itemToDelete, setItemToDelete] = useState<any>(null); // State to track the item to delete
  const navigate = useNavigate(); // Initialize navigation

  // Fetch questionnaire items from the API
  const fetchQuestionnaireItems = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3002/api/v1/questionnaires",
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`, // Retrieve the authentication token
          },
        }
      );

      if (response.status === 200) {
        setQuestionnaireItems(response.data); // Set the fetched items
      } else {
        console.error('Failed to fetch questionnaire items.');
      }
    } catch (error) {
      console.error('Error fetching questionnaire items:', error);
    }
  };

  useEffect(() => {
    fetchQuestionnaireItems(); // Fetch items when the component mounts
  }, []);

  useEffect(() => {
    if (triggerEffect) {
      console.log(`Triggered useEffect with new questionnaire name: ${newQuestionnaireName} and type: ${newQuestionnaireType}`);
      setTriggerEffect(false); // Reset the trigger

      const createNewQuestionnaire = async () => {
        const newQuestionnaire = {
          name: newQuestionnaireName,
          questionnaire_type: newQuestionnaireType, // Add the questionnaire type
          instructor_id: 1,
          min_question_score: 0, // Default values for creation
          max_question_score: 5,
          private: false, // Default value for visibility
          data: [], // Empty data for a new questionnaire
        };

        try {
          const token = getAuthToken();
          const response = await axios.post(
            `http://localhost:3002/api/v1/questionnaires`,
            newQuestionnaire,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          console.log("Creation successful:", response.data);
          alert("New questionnaire created successfully!");

          // Reload the list of questionnaire items after successful creation
          fetchQuestionnaireItems();
        } catch (error) {
          if (axios.isAxiosError(error)) {
            alert(`Failed to create questionnaire. ${error.response?.data?.message || error.message}`);
          } else {
            alert(`Failed to create questionnaire. ${String(error)}`);
          }
        }
      };

      createNewQuestionnaire();
    }
  }, [triggerEffect, newQuestionnaireName, newQuestionnaireType]); // Triggered when triggerEffect or inputs change

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

  const handleDeleteConfirmation = (item: any) => {
    setItemToDelete(item); // Set the item to delete
    setShowDeleteModal(true); // Show the confirmation modal
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
  
    try {
      // Send DELETE request to the API
      const token = getAuthToken();
      await axios.delete(`/questionnaires/${itemToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include authorization token
        },
      });
  
      // Update the state to remove the deleted item from the list
      const updatedItems = questionnaireItems.filter((q) => q.id !== itemToDelete.id);
      setQuestionnaireItems(updatedItems);
  
      // Close the delete confirmation modal
      setShowDeleteModal(false);
  
      // Reset the item to delete
      setItemToDelete(null);
  
      // Optional: Show success message
      alert('Questionnaire successfully deleted.');
    } catch (error) {
      console.error('Error deleting questionnaire item:', error);
  
      // Display error message to the user
      alert('Failed to delete the questionnaire item.');
    }
  };

  const handleSortByName = () => {
    if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder('asc');
    }
  };

  const handleAdd = () => {
    if (newQuestionnaireName.trim() === "" || newQuestionnaireType.trim() === "") {
      alert("Please enter both a name and a type before adding.");
      return;
    }
    setTriggerEffect(true); // Trigger the creation effect
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
      <div className="add-section">
        <input
          type="text"
          placeholder="Enter questionnaire name"
          value={newQuestionnaireName}
          onChange={(e) => setNewQuestionnaireName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter questionnaire type"
          value={newQuestionnaireType}
          onChange={(e) => setNewQuestionnaireType(e.target.value)}
        />
        <button onClick={handleAdd}>Add</button>
      </div>
      <br />
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
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="ms-2"
                    onClick={() => handleDeleteConfirmation(item)}
                  >
                    <BsDashSquareFill />
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
                              onClick={() => handleDeleteConfirmation(item)}
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

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this questionnaire?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Questionnaire;