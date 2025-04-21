import React, { useState, useEffect } from "react";
import "./Questionnaire.css";
import { Button } from "react-bootstrap";
import { BsPlusSquareFill, BsDashSquareFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthToken } from "../../utils/auth";

function Questionnaire() {
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [questionnaireItems, setQuestionnaireItems] = useState<any[]>([]); // Initialize with an empty array
  const [newQuestionnaireName, setNewQuestionnaireName] = useState(""); // State for new questionnaire name
  const [newQuestionnaireType, setNewQuestionnaireType] = useState(""); // State for new questionnaire type
  const [triggerEffect, setTriggerEffect] = useState(false); // State to trigger useEffect
  const navigate = useNavigate(); // Initialize navigation

  // Fetch questionnaire items from the API
  const fetchQuestionnaireItems = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/v1/questionnaires", {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`, // Retrieve the authentication token
        },
      });

      if (response.status === 200) {
        setQuestionnaireItems(response.data); // Set the fetched items
      } else {
        console.error("Failed to fetch questionnaire items.");
      }
    } catch (error) {
      console.error("Error fetching questionnaire items:", error);
    }
  };

  useEffect(() => {
    fetchQuestionnaireItems(); // Fetch items when the component mounts
  }, []);

  useEffect(() => {
    if (triggerEffect) {
      const createNewQuestionnaire = async () => {
        const newQuestionnaire = {
          name: newQuestionnaireName,
          questionnaire_type: newQuestionnaireType,
          instructor_id: 1,
          min_question_score: 0,
          max_question_score: 5,
          private: false,
          data: [],
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
          fetchQuestionnaireItems(); // Reload the list
        } catch (error) {
          if (axios.isAxiosError(error)) {
            alert(`Failed to create questionnaire. ${error.response?.data?.message || error.message}`);
          } else {
            alert(`Failed to create questionnaire. ${String(error)}`);
          }
        }
      };

      createNewQuestionnaire();
      setTriggerEffect(false); // Reset the trigger
    }
  }, [triggerEffect, newQuestionnaireName, newQuestionnaireType]);

  const handleNavigateToEditPage = (itemName: string) => {
    navigate(`/edit-questionnaire#${encodeURIComponent(itemName)}`);
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const token = getAuthToken();
      await axios.delete(`http://localhost:3002/api/v1/questionnaires/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Item deleted successfully!");
      fetchQuestionnaireItems(); // Reload the list
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete the item.");
    }
  };

  const handleToggleType = (type: string) => {
    setExpandedType(expandedType === type ? null : type);
  };

  const handleAdd = () => {
    if (newQuestionnaireName.trim() === "" || newQuestionnaireType.trim() === "") {
      alert("Please enter both a name and a type before adding.");
      return;
    }
    setTriggerEffect(true); // Trigger the creation effect
  };

  // Group questionnaires by type
  const groupedByType = questionnaireItems.reduce((acc: any, item: any) => {
    if (!acc[item.questionnaire_type]) {
      acc[item.questionnaire_type] = [];
    }
    acc[item.questionnaire_type].push(item);
    return acc;
  }, {});

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
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(groupedByType).map((type, index) => (
            <React.Fragment key={index}>
              <tr>
                <td onClick={() => handleToggleType(type)}>{type}</td>
                <td>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => handleToggleType(type)}
                  >
                    {expandedType === type ? "Hide" : "Show"}
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleNavigateToEditPage("_" + type)}
                    className="ms-2"
                  >
                    <BsPlusSquareFill />
                  </Button>
                </td>
              </tr>
              {expandedType === type &&
                groupedByType[type].map((item: any) => (
                  <tr key={item.id} className="expanded-row">
                    <td colSpan={2}>
                      <div className="item-name">
                        <strong>{item.name}</strong>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleNavigateToEditPage(item.name)}
                          className="ms-2"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          className="ms-2"
                        >
                          <BsDashSquareFill />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Questionnaire;