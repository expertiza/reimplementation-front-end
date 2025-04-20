import React, { useState, useEffect } from "react";
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
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(5);
  const [isPrivate, setIsPrivate] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState(sample_questionnaire);
  const [questionnaireId, setQuestionnaireId] = useState<number | null>(null);

  useEffect(() => {
    const hash = window.location.hash.substring(1); // Remove the '#' symbol
    if (hash) {
      const decodedHash = decodeURIComponent(hash); // Decode URL-encoded characters like %20 to spaces
      setName(decodedHash);
    } else {
      console.warn("No name found in the URL hash");
    }
  }, []); // Runs only once on mount

  // Fetch questionnaire data after the name is set
  useEffect(() => {
    if (name === "Default Name") {
      // Skip fetching if the name is still the default
      return;
    }

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
          (item: any) => item.name === name // Match the questionnaire by name
        );

        if (matchedQuestionnaire) {
          setQuestionnaireId(matchedQuestionnaire.id);
          setMinScore(matchedQuestionnaire.min_question_score || 0);
          setMaxScore(matchedQuestionnaire.max_question_score || 5);
          setIsPrivate(matchedQuestionnaire.private || false);
          setQuestionnaireData(matchedQuestionnaire.data || sample_questionnaire.data);
        } else {
          setQuestionnaireId(0);
          console.warn("No matching questionnaire found for the name:", name);
        }
      } catch (error) {
        console.error("Error fetching questionnaires:", error);
      }
    };

    fetchQuestionnaireData();
  }, [name]); // Runs whenever `name` changes

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
              onClick={handleUpdate}
            >
              Update Questionnaire
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