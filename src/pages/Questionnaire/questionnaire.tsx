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

  const handleCopyitem = async (id: number) => {
    try {
      // Fetch the questionnaire data for the given name
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
        (item: any) => item.id === id // Match the questionnaire by name
      );
  
      if (!matchedQuestionnaire) {
        console.warn("No matching questionnaire found for the id:", id);
        return;
      }
  
      // Construct updatedContent immediately after fetching data
      const updatedContent = {
        name: `${matchedQuestionnaire.name}`, // Append "Copy" to the name to avoid conflicts
        questionnaire_type: matchedQuestionnaire.questionnaire_type || "",
        min_question_score: matchedQuestionnaire.min_question_score || 0,
        max_question_score: matchedQuestionnaire.max_question_score || 5,
        private: matchedQuestionnaire.private || false,
        data: matchedQuestionnaire.data,
        instructor_id: 1,
      };
  
      // Make the POST request to create a new questionnaire
      const token = await getAuthToken();
      const postResponse = await axios.post(
        `http://localhost:3002/api/v1/questionnaires`,
        updatedContent,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("Entry creation successful:", postResponse.data);
      alert("New questionnaire entry created successfully!");
  
      // Reload the questionnaire list
      fetchQuestionnaireItems();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(`Failed to create questionnaire. ${error.response?.data?.message || error.message}`);
      } else {
        alert(`Failed to create questionnaire. ${String(error)}`);
      }
    }
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

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Function to sort alphabetically by name
  const sortGroupedByType = (groupedByType: any) => {
    const sortedKeys = Object.keys(groupedByType).sort((a, b) => {
      if (sortOrder === "asc") {
        return a.localeCompare(b); // Ascending order
      } else {
        return b.localeCompare(a); // Descending order
      }
    });

    // Return a new sorted object based on sorted keys
    const sortedGroupedByType: any = {};
    sortedKeys.forEach((key) => {
      sortedGroupedByType[key] = groupedByType[key];
    });

    return sortedGroupedByType;
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="questionnaire-container">
      <h1>Manage Content</h1>
      <br />
      <table className="questionnaire-table">
        <thead>
          <tr>
            <th>
              Name{" "}
              <Button
                variant="link"
                onClick={toggleSortOrder}
                style={{
                  textDecoration: "none",
                  color: "black", // Set the arrow color to black
                  border: "none", // Remove the border
                  background: "none", // Ensure no background
                  padding: "0", // Remove padding for a minimal look
                  fontSize: "1.2rem", // Adjust font size for better visibility
                  display: "inline", // Prevent block-level behavior
                }}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(sortGroupedByType(groupedByType)).map((type, index) => (
            <React.Fragment key={index}>
              <tr>
                <td onClick={() => handleToggleType(type)}>{type}</td>
                <td>
                  <Button
                    onClick={() => handleNavigateToEditPage("_" + type)}
                    className="ms-2"
                    style={{
                      backgroundColor: "#4678b2", // Solid blue background
                      border: "none", // Removes border
                      width: "30px", // Sets width of the circle
                      height: "30px", // Sets height of the circle
                      borderRadius: "50%", // Makes the button circular
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer", // Changes cursor to pointer
                    }}
                  >
                    <span
                      style={{
                        color: "white", // White color for the "+" symbol
                        fontSize: "1.3rem", // Adjust size of the "+" symbol
                        fontWeight: "bold", // Makes the "+" symbol bold
                        lineHeight: "0.5", // Ensures consistent line height for the "+"
                      }}
                    >
                      +
                    </span>
                  </Button>
                </td>
              </tr>
              {expandedType === type && (
                <tr>
                  <td colSpan={2}>
                    <div className="expanded-row">
                      <div
                        className="item-name"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)", // 4 equal-width columns
                          alignItems: "left",
                          gap: "16px", // Optional: spacing between columns
                        }}
                      >
                        {/* Column 1: Item Name */}
                        <strong
                          style={{
                            textAlign: "left", // Centers the text horizontally in the column
                          }}
                        >
                          {"Item Name"}
                        </strong>

                        {/* Column 2: Creation Date */}
                        <strong
                          style={{
                            textAlign: "left", // Centers the text horizontally in the column
                          }}
                        >
                          {"Creation Date"}
                        </strong>

                        {/* Column 3: Updated Date */}
                        <strong
                          style={{
                            textAlign: "left", // Centers the text horizontally in the column
                          }}
                        >
                          {"Updated Date"}
                        </strong>

                        {/* Column 4: Actions */}
                        <strong
                          style={{
                            textAlign: "center", // Centers the text horizontally in the column
                          }}
                        >
                          {"Actions"}
                        </strong>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {expandedType === type &&
                groupedByType[type].map((item: any) => (
                  <tr key={item.id} className="expanded-row">
                    <td colSpan={2}>
                      <div
                        className="item-name"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)", // 4 equal-width columns
                          alignItems: "left",
                          gap: "16px", // Optional: spacing between columns
                        }}
                      >
                        {/* Column 1: Item Name */}
                        <time
                          style={{
                            textAlign: "left", // Centers the text horizontally in the column
                          }}
                        >
                          {item.name}
                        </time>

                        {/* Column 2: Created At */}
                        <time
                          style={{
                            textAlign: "left", // Centers the text horizontally in the column
                          }}
                        >
                          {new Date(item.created_at).toLocaleDateString("en-CA", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                          <br />
                          {new Date(item.created_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            timeZoneName: "short",
                          })}
                        </time>

                        {/* Column 3: Updated At */}
                        <time
                          style={{
                            textAlign: "left", // Centers the text horizontally in the column
                          }}
                        >
                          {new Date(item.updated_at).toLocaleDateString("en-CA", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                          <br />
                          {new Date(item.updated_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            timeZoneName: "short",
                          })}
                        </time>

                        {/* Column 4: Action Buttons */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center", // Centers the buttons horizontally
                            gap: "8px", // Spacing between buttons
                          }}
                        >
                          <button
                            onClick={() => handleNavigateToEditPage(item.id)}
                            style={{
                              background: "none",
                              border: "none",
                              padding: "0",
                              cursor: "pointer",
                            }}
                          >
                            <img
                              src={EditIcon}
                              alt="Edit Icon"
                              style={{ width: "16px", height: "16px" }}
                            />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            style={{
                              background: "none",
                              border: "none",
                              padding: "0",
                              cursor: "pointer",
                            }}
                          >
                            <img
                              src={DeleteIcon}
                              alt="Delete Icon"
                              style={{ width: "16px", height: "16px" }}
                            />
                          </button>
                          <button
                            onClick={() => handleCopyitem(item.id)}
                            style={{
                              background: "none",
                              border: "none",
                              padding: "0",
                              cursor: "pointer",
                            }}
                          >
                            <img
                              src={CopyIcon}
                              alt="Copy Icon"
                              style={{ width: "16px", height: "16px" }}
                            />
                          </button>
                        </div>
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