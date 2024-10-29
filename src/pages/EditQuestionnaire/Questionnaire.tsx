import React, { useState } from "react";
import ImportModal from "./ImportModal";
import ExportModal from "./ExportModal";

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
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(5);
  const [isPrivate, setIsPrivate] = useState(false);

  const [questionnaireData, setQuestionnaireData] = useState(sample_questionnaire);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Function to export questionnaire data
  const exportQuestionnaire = () => {
    const dataToExport = JSON.stringify(questionnaireData);
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


  return (
    <div>
      <div className="container">
        <h1 className="mt-4">{sample_questionnaire.title}</h1>
        <div className="row m-2">
          <div className="col-6">
            Min item score:
            <input
              className="form-control"
              type="number"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
              // Using parseInt to convert the input value to a number
            ></input>
          </div>
        </div>
        <div className="row m-2">
          <div className="col-6">
            Max item score:
            <input
              className="form-control"
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(parseInt(e.target.value, 10))}
              // Using parseInt to convert the input value to a number
            ></input>
          </div>
        </div>
        <div className="row m-2">
          <div className="col-6">
            Is this Teammate review private:{' '} 
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={() => setIsPrivate(!isPrivate)}
            />
          </div>
        </div>
        <div className="row m-2">
          <div className="col-6">
            <button
              type="button"
              style={{ borderColor: "black" }}
              className="btn btn-light m-2"
            >
              Update questionnaire parameters
            </button>
          </div>
        </div>
        <hr />
             
        <div className="row m-2">
          <div className="col-1">Seq</div>
          <div className="col-3">Question</div>
          <div className="col-1">Type</div>
          <div className="col-1">Weight</div>
          <div className="col-1">Text_area_size</div>
          <div className="col-2">Max_label</div>
          <div className="col-2">Min_label</div>
          <div className="col-1">Action</div>
        </div>
        {sample_questionnaire.data.map((item) => {
          return (
            <div className="row m-2">
              <div className="col-1" >
                <input
                  className="form-control"
                  style={{ borderColor: "black",width: "50px" }}
                  type="text"
                  value={item.seq}
                  disabled
                />
              </div>
              <div className="col-3">
                <input
                  className="form-control"
                  style={{ borderColor: "black" }}
                  type="text"
                  value={item.question}
                ></input>
              </div>
              <div className="col-1">
              <select
                className="form-select"
                style={{ borderColor: "black" }}
                defaultValue = {item.type}
              >
                <option value="Criterion">Criterion</option>
                <option value="Scale">Scale</option>
                <option value="Cake">Cake</option>
                <option value="Dropdown">Dropdown</option>
                <option value="Checkbox">Checkbox</option>
                <option value="TextArea">TextArea</option>
                <option value="TextField">TextField</option>
                <option value="UploadFile">UploadFile</option>
                <option value="SectionHeader">SectionHeader</option>
                <option value="TableHeader">TableHeader</option>
                <option value="ColumnHeader">ColumnHeader</option>
              </select>
              </div>
              <div className="col-1">
                <input
                  className="form-control"
                  style={{ borderColor: "black" }}
                  type="number"
                  placeholder="1"
                  pattern="[0-9]*" // Only allow numeric values
                  value={item.weight}
                ></input>
              </div>
              <div className="col-1">
                <input
                  className="form-control"
                  style={{ borderColor: "black" }}
                  type="text"
                  value={item.text_area_size}
                  defaultValue="80, 1"
                ></input>
              </div>
              <div className="col-2">
                <input
                  className="form-control"
                  style={{ borderColor: "black" }}
                  type="text"
                  value={item.max_label}
                ></input>
              </div>
              <div className="col-2">
                <input
                  className="form-control"
                  style={{ borderColor: "black" }}
                  type="text"
                  value={item.min_label}
                ></input>
              </div>              
              <div className="col-1">
              <button
                type="button"
                className="btn btn-light"
              >
                Remove
              </button>  
              </div>
            </div>
          );
        })}
        <br /> 
        <div className="row m-2">
        <br /> 
        <div className="col-1">
            <input className="form-control" type="text" placeholder="1"></input>
        </div>
        <div className="col-1">
        <p style={{ fontSize: "18px", paddingLeft: 0, paddingRight: 0 }}>
          more
        </p>
        </div>
        <div className="col-2">
            <select className="form-select">
            <option value="Criterion">Criterion</option>
            <option value="Scale">Scale</option>
            <option value="Cake">Cake</option>
            <option value="Dropdown">Dropdown</option>
            <option value="Checkbox">Checkbox</option>
            <option value="TextArea">TextArea</option>
            <option value="TextField">TextField</option>
            <option value="UploadFile">UploadFile</option>
            <option value="SectionHeader">SectionHeader</option>
            <option value="TableHeader">TableHeader</option>
            <option value="ColumnHeader">ColumnHeader</option>
            </select>
        </div>
        <div className="col-1">
        <p style={{ fontSize: "18px" }}>
        question(s)
        </p>
        </div>
        <div className="col-2">
        <button
            type="button"
            style={{ backgroundColor: "#4d8ac0", borderColor: "#4d8ac0" ,  marginBottom: '20px' }}
            className="btn btn-primary"
          >
            Add Question
          </button> 
          </div>
        </div>
        <br /> 
        <div className="row m-2">
        <div className="col-2">
          <button
            type="button"
            style={{ backgroundColor: "#4d8ac0", borderColor: "#4d8ac0" }}
            className="btn btn-primary"
          >
            Save all questions
          </button>
        </div>
        </div>
        <div className="row m-2">
        <div className="col-2">
          <button
            type="button"
            style={{ borderColor: "black" }}
            className="btn btn-light"
          >
            Edit/View Advice
          </button>
        </div>
        </div>
        <hr />
        <div>
          <div>
            <a
             
              style={{ color: "#b28b66", textDecoration: "none", cursor: "pointer" }}
              onClick={() => setShowImportModal(true)}
            >
              Import Questionnaire
            </a>{" "}
            |
            <a
             
              style={{ color: "#b28b66", textDecoration: "none", cursor: "pointer" }}
              onClick={() => setShowExportModal(true)}
            >
              Export Questionnaire
            </a>
          </div>

          {/* Render import and export modals conditionally */}
          {showImportModal && (
            <ImportModal
              onClose={() => setShowImportModal(false)}
              onImport={handleFileChange}
            />
          )}
          {showExportModal && (
            <ExportModal
              onClose={() => setShowExportModal(false)}
              onExport={exportQuestionnaire}
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default Questionnaire;
