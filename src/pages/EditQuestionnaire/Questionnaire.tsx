import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import ImportModal from "./ImportModal";
import ExportModal from "./ExportModal";
import axios from "axios";
import { getAuthToken } from "../../utils/auth";

interface ImportedData {
  title: string;
  data: Array<{
    seq: number;
    question: string;
    type: string;
    weight: number;
    text_area_size: string;
    max_label: string;
    min_label: string;
  }>;
}

const Questionnaire = () => {
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

  const [name, setName] = useState("Default Name");
  const [questionnaireType, setQuestionnaireType] = useState(""); // New state for questionnaire type
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(5);
  const [isPrivate, setIsPrivate] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState(sample_questionnaire);
  const [questionnaireId, setQuestionnaireId] = useState<number | null>(null);

  useEffect(() => {
    const hash = window.location.hash.substring(1); // Remove the '#' symbol
    if (hash) {
      const decodedHash = decodeURIComponent(hash); // Decode URL-encoded characters like %20 to spaces
  
      if (decodedHash.startsWith("_")) {
        // If the token starts with '_', set the questionnaire type directly and skip fetching
        setQuestionnaireType(decodedHash.substring(1)); // Remove the leading '_'
      } else {
        const parsedId = Number(decodedHash); // Convert the hash to a number
        if (!isNaN(parsedId)) {
          setQuestionnaireId(parsedId); // Set the questionnaire ID if it's a valid number
        } else {
          console.warn("Invalid questionnaire ID in the URL hash:", decodedHash);
        }
      }
    } else {
      console.warn("No hash value found in the URL");
    }
  }, []); // Runs only once on mount

  // Fetch questionnaire data after the id is set (only if the string does not start with '_')
  useEffect(() => {
    const fetchQuestionnaireData = async () => {
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
          (item: any) => item.id === questionnaireId // Match the questionnaire by name
        );

        if (matchedQuestionnaire) {
          setName(matchedQuestionnaire.name || ""); // Set name
          setQuestionnaireType(matchedQuestionnaire.questionnaire_type || ""); // Set questionnaire type
          setMinScore(matchedQuestionnaire.min_question_score || 0);
          setMaxScore(matchedQuestionnaire.max_question_score || 5);
          setIsPrivate(matchedQuestionnaire.private || false);
          setQuestionnaireData(matchedQuestionnaire.data || sample_questionnaire.data);
        } else {
          console.warn("No matching questionnaire found for the id:", questionnaireId);
        }
      } catch (error) {
        console.error("Error fetching questionnaires:", error);
      }
    };

    fetchQuestionnaireData();
  }, [questionnaireId]); // Runs whenever `name` or `questionnaireType` changes

  const exportQuestionnaire = () => {
    const dataToExport = JSON.stringify(questionnaireData, null, 2);
    const blob = new Blob([dataToExport], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "questionnaire.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleFileChange = (importedData: ImportedData) => {
    setQuestionnaireData(importedData);
  };

  const handleUpdate = async () => {
    if (!questionnaireId) {
      alert("Questionnaire ID not found. Please try again.");
      return;
    }

    const updatedContent = {
      name,
      questionnaire_type: questionnaireType, // Include questionnaire type in the update
      min_question_score: minScore,
      max_question_score: maxScore,
      private: isPrivate,
      data: questionnaireData,
    };

    try {
      const token = getAuthToken();
      const response = await axios.put(
        `http://localhost:3002/api/v1/questionnaires/${questionnaireId}`,
        updatedContent,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update successful:", response.data);
      alert("Questionnaire updated successfully!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(`Failed to update questionnaire. ${error.response?.data?.message || error.message}`);
      } else {
        alert(`Failed to update questionnaire. ${String(error)}`);
      }
    }
  };

  const handleAddToQuestionnaire = async () => {
    const updatedContent = {
      name,
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
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div
        className="p-4 rounded shadow"
        style={{
          backgroundColor: "white",
          width: "400px",
        }}
      >
        <h1 className="text-center mb-4">Edit Questionnaire</h1>
        <div className="text-center mt-4">
          <Link to="/questionnaire" className="btn btn-link">
            Back to Manage Questionnaire Page
          </Link>
        </div>
        <form>
          <div className="form-group mb-3">
            <label htmlFor="contentName">Name:</label>
            <input
              type="text"
              className="form-control"
              id="contentName"
              value={name}
              onChange={(e) => setName(e.target.value)} // Allow editing of the name
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="questionnaireType">Questionnaire Type:</label>
            <input
              type="text"
              className="form-control"
              id="questionnaireType"
              value={questionnaireType}
              onChange={(e) => setQuestionnaireType(e.target.value)} // Allow editing of the questionnaire type
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="minScore">Min Item Score:</label>
            <input
              type="number"
              className="form-control"
              id="minScore"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="maxScore">Max Item Score:</label>
            <input
              type="number"
              className="form-control"
              id="maxScore"
              value={maxScore}
              onChange={(e) => setMaxScore(parseInt(e.target.value, 10))}
            />
          </div>

          <div className="form-group mb-4">
            <label htmlFor="isPrivate">Is This Review Private:</label>
            <div>
              <input
                type="checkbox"
                id="isPrivate"
                checked={isPrivate}
                onChange={() => setIsPrivate(!isPrivate)}
              />{" "}
              <label htmlFor="isPrivate">{isPrivate ? "Private" : "Public"}</label>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="btn btn-primary me-3"
              onClick={handleUpdate}
            >
              Update Questionnaire
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleAddToQuestionnaire}
            >
              Add to Questionnaire
            </button>
          </div>
        </form>
        <hr />
      </div>
    </div>
  );
};

export default Questionnaire;