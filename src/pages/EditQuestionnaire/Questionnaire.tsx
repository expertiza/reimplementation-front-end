import React, { useState, useEffect } from "react";
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
    ],
  };

  const [name, setName] = useState("Default Name");
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(5);
  const [isPrivate, setIsPrivate] = useState(false);

  const [questionnaireData, setQuestionnaireData] = useState(sample_questionnaire);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Use the hash fragment to populate the name
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const hashValue = decodeURIComponent(hash.substring(1)); // Remove the leading '#' and decode
      setName(hashValue || "Default Name");
    }
  }, []);

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

  const handleSave = async () => {
    const updatedContent = {
      name,
      minScore,
      maxScore,
      isPrivate,
    };

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      const response = await axios.post(
        "http://localhost:3002/api/v1/questionnaires",
        updatedContent,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Save successful:", response.data);
      alert("Content saved successfully!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(`Failed to save content. ${error.response?.data?.message || error.message}`);
      } else {
        alert(`Failed to save content. ${String(error)}`);
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
        <h1 className="text-center mb-4">Manage Content</h1>
        <form>
          <div className="form-group mb-3">
            <label htmlFor="contentName">Name:</label>
            <div
              id="contentName"
              className="form-control"
              style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
            >
              {name}
            </div>
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