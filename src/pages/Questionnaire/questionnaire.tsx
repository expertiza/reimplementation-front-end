import React, { useState, useEffect } from "react";
import "./Questionnaire.css";
import { Button } from "react-bootstrap";
import { BsPlusSquareFill, BsDashSquareFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthToken } from "../../utils/auth";
import DeleteIcon from "../../assets/icons/delete-icon-24.png";
import CopyIcon from "../../assets/icons/Copy-icon-24.png";
import EditIcon from "../../assets/icons/edit-icon-24.png";

function Questionnaire() {

  const sample_questionnaire = {
    title: "Edit Teammate Review",
    data: [
      {
        seq: 1.0,
        question: "How many times was this person late to meetings?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "almost never",
        min_label: "almost always",
      },
      {
        seq: 2.0,
        question: "How many times did this person not show up?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "almost never",
        min_label: "almost always",
      },
    ],
  };

  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [questionnaireItems, setQuestionnaireItems] = useState<any[]>([]); // Initialize with an empty array
  const [newQuestionnaireName, setNewQuestionnaireName] = useState("");   // State for new questionnaire name
  const [newQuestionnaireType, setNewQuestionnaireType] = useState("");   // State for new questionnaire type
  const [triggerEffect, setTriggerEffect] = useState(false);             // State to trigger useEffect
  const navigate = useNavigate();                                        // Initialize navigation

  const [questionnaireType, setQuestionnaireType] = useState("");        // New state for questionnaire type
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(5);
  const [isPrivate, setIsPrivate] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState(sample_questionnaire);
  const [questionnaireId, setQuestionnaireId] = useState<number | null>(null);
  const [questionnaireName, setQuestionnaireName] = useState("");

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

  const fetchQuestionnaireData = async (name: string) => {
    try {
      const response = await axios.get(
        "http://localhost:3002/api/v1/questionnaires",
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`, // Retrieve the authentication token
          },
        }
      );

      const questionnaires = response.data;
      const matchedQuestionnaire = questionnaires.find(
        (item: any) => item.name === name // Match the questionnaire by name
      );

      if (matchedQuestionnaire) {
        setQuestionnaireName(matchedQuestionnaire.name);
        setQuestionnaireId(matchedQuestionnaire.id);
        setQuestionnaireType(matchedQuestionnaire.questionnaire_type || ""); // Set questionnaire type
        setMinScore(matchedQuestionnaire.min_question_score || 0);
        setMaxScore(matchedQuestionnaire.max_question_score || 5);
        setIsPrivate(matchedQuestionnaire.private || false);
        setQuestionnaireData(matchedQuestionnaire.data);
      } else {
        console.warn("No matching questionnaire found for the name:", name);
      }
    } catch (error) {
      console.error("Error fetching questionnaires:", error);
    }
  };

  const handleCopyElement = async (name: string) => {
    await fetchQuestionnaireData(name);
    const updatedContent = {
      name: questionnaireName,
      questionnaire_type: questionnaireType, // Include questionnaire type in the update
      min_question_score: minScore,
      max_question_score: maxScore,
      private: isPrivate,
      data: questionnaireData,
      instructor_id: 1,
    };

    try {
      const token = getAuthToken();
      const response = await axios.post(
        `http://localhost:3002/api/v1/questionnaires`, // Use POST for creating a new entry
        updatedContent, // Payload for the new entry
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Entry creation successful:", response.data);
      alert("New questionnaire entry created successfully!");

      // Update the local state with the server response
      setQuestionnaireData(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(`Failed to create questionnaire. ${error.response?.data?.message || error.message}`);
      } else {
        alert(`Failed to create questionnaire. ${String(error)}`);
      }
    }
    fetchQuestionnaireItems();
  };

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
      <h1>Manage Content</h1>
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
                          <img 
                            src={EditIcon} 
                            alt="EditIcon" 
                            style={{ width: "16px", height: "16px" }} 
                          />
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleCopyElement(item.name)}
                          className="ms-2"
                        >
                          <img 
                            src={CopyIcon} 
                            alt="CopyIcon" 
                            style={{ width: "16px", height: "16px" }} 
                          />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          className="ms-2"
                        >
                          <img 
                            src={DeleteIcon} 
                            alt="Delete Icon" 
                            style={{ width: "16px", height: "16px" }} 
                          />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <Button
        variant="outline-primary"
        size="lg"
        onClick={() => handleNavigateToEditPage("_")}
        className="ms-2"
        style={{ marginTop: "20px" }}
      >
        Add Item to a New Type
      </Button>
    </div>
  );
}

export default Questionnaire;