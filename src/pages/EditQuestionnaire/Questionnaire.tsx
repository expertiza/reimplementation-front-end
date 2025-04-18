import React, { useState } from "react";
import ImportModal from "./ImportModal";
import ExportModal from "./ExportModal";
import axios from "axios";

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
      {
        seq: 3.0,
        question: "How much did this person offer to do in this project?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "100%-80%",
        min_label: "20%-0%",
      },
      {
        seq: 4.0,
        question: "What fraction of the work assigned to this person did s(he) do?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "100%-80%",
        min_label: "20%-0%",
      },
      {
        seq: 4.5,
        question: "Did this person do assigned work on time?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "always",
        min_label: "never",
      },
      {
        seq: 5.0,
        question: "How much initiative did this person take on this project?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "a whole lot",
        min_label: "total deadbeat",
      },
      {
        seq: 6.0,
        question: "Did this person try to avoid doing any task that was necessary?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "not at all",
        min_label: "absolutely",
      },
      {
        seq: 7.0,
        question: "How many of the useful ideas did this person come up with?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "100%-80%",
        min_label: "20%-0%",
      },
      {
        seq: 8.0,
        question: "What fraction of the coding did this person do?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "100%-80%",
        min_label: "20%-0%",
      },
      {
        seq: 9.0,
        question: "What fraction of the documentation did this person write?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "100%-80%",
        min_label: "20%-0%",
      },
      {
        seq: 11.0,
        question: "How important is this person to the team?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "indispensable",
        min_label: "redundant",
      },
    ],
  };
  const [name, setName] = useState("Default Name");
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(5);
  const [isPrivate, setIsPrivate] = useState(false);

  const [questionnaireData, setQuestionnaireData] = useState(sample_questionnaire);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Function to export questionnaire data
  const exportQuestionnaire = () => {
    const dataToExport = JSON.stringify(questionnaireData, null, 2); // Format JSON for readability
    const blob = new Blob([dataToExport], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "questionnaire.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  // Function to handle imported data
  const handleFileChange = (importedData: ImportedData) => {
    setQuestionnaireData(importedData);
  };

  // Function to handle saving the edited content
  const handleSave = async () => {
    const updatedContent = {
      name,
      minScore,
      maxScore,
      isPrivate,
    };
  
    try {
      // Retrieve the token from the authentication state or a utility function
      const token = localStorage.getItem("authToken"); // Assuming the token is stored in localStorage
  
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }
  
      // Make the POST request with the Authorization header
      const response = await axios.post(
        "http://localhost:3002/api/v1/questionnaires",
        updatedContent,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the bearer token
            "Content-Type": "application/json",
          },
        }
      );
  
      // Handle successful save
      console.log("Save successful:", response.data);
      alert("Content saved successfully!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle Axios-specific error
        alert(`Failed to save content. ${error.response?.data?.message || error.message}`);
      } else {
        // Handle generic error
        alert(`Failed to save content. ${String(error)}`);
      }
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#f8f9fa" }} // Optional background color
    >
      <div
        className="p-4 rounded shadow"
        style={{
          backgroundColor: "white",
          width: "400px", // Adjust width as needed
        }}
      >
        <h1 className="text-center mb-4">Manage Content</h1>
        <form>
          <div className="form-group mb-3">
            <label htmlFor="contentName">Name:</label>
            <input
              type="text"
              className="form-control"
              id="contentName"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              className="btn btn-primary"
              onClick={handleSave}
            >
              Save Changes
            </button>
          </div>
        </form>
        <hr />
        <div className="text-center">
          <button
            type="button"
            className="btn btn-secondary mt-3"
            onClick={exportQuestionnaire}
          >
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
