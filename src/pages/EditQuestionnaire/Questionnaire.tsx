import React, { useState } from "react";
import ImportModal from "./ImportModal";
import ExportModal from "./ExportModal";

interface ImportedData {
  title: string;
  data: Array<{
    id: number,
    sequence: number; // defines the order of questions
    question: string; // the question itself
    type: string; // type of item which can be Criterion, DropDown, multiple choice etc..
    weight: number; // defines the weight of the question
    text_area_size: string; // size of the text area in rows and columns
    max_label: string;  // the maximum value, differs according to the type
    min_label: string; // the minimum value, differs according to the type
  }>;
}

// Various Types of items available 
const itemTypeArray = ['Criterion','Scale','Cake','Dropdown','Checkbox','TextArea','TextField','UploadFile','SectionHeader','TableHeader','ColumnHeader'];

const Questionnaire = () => {
// Sample data for initial questionnaire
  const initialQuestionnaire = {
    title: "Edit Teammate Review",
    data: [
      {
        id:1,
        sequence: 1.0,
        question: "How many times was this person late to meetings?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "almost never",
        min_label: "almost always",
      },
      {
        id:2,
        sequence: 2.0,
        question: "How many times did this person not show up?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "almost never",
        min_label: "almost always",
      },
      {
        id:3,
        sequence: 3.0,
        question: "How much did this person offer to do in this project?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "100%-80%",
        min_label: "20%-0%",
      },
      {
        id:4,
        sequence: 4.5,
        question: "What fraction of the work assigned to this person did s(he) do?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "100%-80%",
        min_label: "20%-0%",
      },
      {
        id:5,
        sequence: 5.0,
        question: "How much initiative did this person take on this project?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "a whole lot",
        min_label: "total deadbeat",
      },
      {
        id:6,
        sequence: 6.0,
        question: "Did this person try to avoid doing any task that was necessary?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "not at all",
        min_label: "absolutely",
      },
      {
        id:7,
        sequence: 7.0,
        question: "How many of the useful ideas did this person come up with?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "100%-80%",
        min_label: "20%-0%",
      },
      {
        id:8,
        sequence: 8.0,
        question: "What fraction of the coding did this person do?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "100%-80%",
        min_label: "20%-0%",
      },
      {
        id:9,
        sequence: 9.0,
        question: "What fraction of the documentation did this person write?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "100%-80%",
        min_label: "20%-0%",
      },
      {
        id:10,
        sequence: 10.0,
        question: "How important is this person to the team?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "indispensable",
        min_label: "redundant",
      },
      // ... additional questions omitted for brevity
    ],
  };
  // State hooks for questionnaire settings
  const [selectedItemType, setSelectedItemType] = useState(''); // State to track selected value
  const [itemQuantity,setItemQuantity] = useState("1");
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(5);
  const [isReviewPrivate, setIsReviewPrivate] = useState(false);

  // State hooks for questionnaire data and modals
  const [questionnaireData, setQuestionnaireData] = useState(initialQuestionnaire);
  const [isImportModalVisible, setImportModalVisible] = useState(false);
  const [isExportModalVisible, setExportModalVisible] = useState(false);

  // Function to export questionnaire data
  const exportQuestionnaire = () => {
    const dataToExport = JSON.stringify(questionnaireData);
    const blob = new Blob([dataToExport], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "questionnaire.json";
    downloadLink.click();

    URL.revokeObjectURL(url);
  };

  // Function to handle imported data to update questionnaire
  const handleImportData = (importedData: ImportedData) => {
    setQuestionnaireData(importedData);
  };

  // Function to add a new item to the questionnaire
  const handleAddItem = ()=> {
    let updatedData = questionnaireData.data;
    for (let i=0; i< parseInt(itemQuantity); i++) {
    const newQuestion = {
      id: questionnaireData.data.slice(-1)[0].id + 1,
      sequence: questionnaireData.data.slice(-1)[0].id + 1,
      question: "Type your question",
      type: selectedItemType,
      weight: 1,
      text_area_size: "50, 30",
      max_label: "max value",
      min_label: "min value"
    };
    updatedData.push(newQuestion);
  }
  setQuestionnaireData({...questionnaireData, data: updatedData });
  }

  // function to handle the dropdown change event
  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedItemType(event.target.value); // Safely access the value
  };

  // function for removing the item
  const handleRemoveItem = (seq: number)=>{
    let updatedData = questionnaireData.data.filter(q=> +q.id!== seq);
    setQuestionnaireData({...questionnaireData, data: [...updatedData] });
  }
  return (
    <div style={{width:"80%", margin:"auto"}}>
      <div>
        <h1 className="mt-4">{questionnaireData.title}</h1>
        <div className="row" style={{alignItems:"center"}}>
        {/* Min Score Input */}
          <div className="col-3">
            Min item score:
            <input
              className="form-control"
              type="number"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
              min={0}
              // Using parseInt to convert the input value to a number
            ></input>
          </div>
        {/* Max Score Input */}
        <div className="col-3">
            Max item score:
            <input
              className="form-control"
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(parseInt(e.target.value, 10))}
              min={0}
              // Using parseInt to convert the input value to a number
            ></input>
        </div>
        {/* Privacy Toggle */}
        <div className="col-3">
            Is this Teammate review private:{' '} 
            <input
              type="checkbox"
              checked={isReviewPrivate}
              onChange={() => setIsReviewPrivate(!isReviewPrivate)}
            />
        </div>
        {/* Update Parameters Button */}
        <div className="col-3">
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

        {/* Display questionnaire items */}
        <div className="row" style={{textAlign:"center"}}>
          <h6 className="col-1">Sequence</h6>
          <h6 className="col-2">Question</h6>
          <h6 className="col-2">Type</h6>
          <h6 className="col-1">Weight</h6>
          <h6 className="col-1">Text Area Size</h6>
          <h6 className="col-2">Max Label</h6>
          <h6 className="col-2">Min Label</h6>
          <h6 className="col-1">Action</h6>
        </div>
        {/* Iterate over questions */}
        {questionnaireData.data.map((item) => {
          return (
            <div className="row my-3" key={item.sequence}  style={{ border:"2px solid gray", padding:"8px"}}>
              {/* Sequence number */}
              <div className="col-1">
                <input
                  className="form-control d-block mx-auto"
                  style={{ borderColor: "black",width: "40px",}}
                  type="text"
                  value={item.sequence}
                  disabled
                />
              </div>
              {/* The Question Text field */}
              <div className="col-2">
                <textarea
                  style={{ borderColor: "black",height:"auto",marginBottom:"0px",resize:"vertical",overflowY:"hidden" }}
                  rows={2}
                  defaultValue={item.question}
                ></textarea>
              </div>
              {/* The Item type dropdown */}
              <div className="col-2">
              <select
                className="form-select"
                style={{ borderColor: "black"}}
                defaultValue = {item.type}
              >
                {/* Iterating item array for getting all the various type of items as options to select from dropdown */}
                {itemTypeArray.map((itemType) => 
                    <option key={itemType} value={itemType}>
                      {itemType}
                    </option>
                  )
                }
              </select>
              </div>
              {/* The weight of the item chosen */}
              <div className="col-1">
                <input
                  className="form-control d-block mx-auto"
                  style={{ borderColor: "black", width:"60px"}}
                  type="number"
                  placeholder="1"
                  pattern="[0-9]*" // Only allow numeric values
                  defaultValue={item.weight}
                ></input>
              </div>
              {/* The text-area size of the item being added */}
              <div className="col-1">
                <input
                  className="form-control d-block mx-auto"
                  style={{ borderColor: "black",width:"70px" }}
                  type="text"
                  defaultValue={item.text_area_size}
                ></input>
              </div>
              {/* The maximum label you want to attach to that item */}
              <div className="col-2">
                <input
                  className="form-control d-block mx-auto"
                  style={{ borderColor: "black" }}
                  type="text"
                  defaultValue={item.max_label}
                ></input>
              </div>
              {/* The minimum label you want to attach to that item */}
              <div className="col-2">
                <input
                  className="form-control d-block mx-auto"
                  style={{ borderColor: "black" }}
                  type="text"
                  defaultValue={item.min_label}
                ></input>
              </div>  
              {/* Remove item button */}            
              <div className="col-1">
              <button
                type="button"
                className="btn btn-light"
                style={{display:"block",margin:"auto"}}
                onClick={()=> handleRemoveItem(item.id)}
              >
                <img height="20" src="https://expertiza.ncsu.edu/assets/close-8a5d1b64ae50a63b14630b78411fcb0c2d2ed0d6eac7230b448b2824f08f6f68.png" alt="Close"/>
              </button>  
              </div>
            </div>
          );
        })}
        <br /> 
        {/* Add new item inputs */}
        <div className="row m-2">
        <br /> 
        <div className="col-1">
            <input className="form-control" type="text" placeholder={itemQuantity} onChange={(e)=> setItemQuantity(e.target.value)}></input>
        </div>
        <div className="col-1">
        <p style={{ fontSize: "18px", paddingLeft: 0, paddingRight: 0 }}>
          more
        </p>
        </div>
        <div className="col-2">
            <select className="form-select"  onChange={handleDropdownChange} defaultValue='Criterion'>
            {/* Iterating item array for getting all the various type of items as options to select from dropdown */}
            {itemTypeArray.map((itemType) => 
              <option key={itemType} value={itemType}>
                {itemType}
              </option>
              )
            }
            </select>
        </div>
        <div className="col-1">
        <p style={{ fontSize: "18px" }}>
        question(s)
        </p>
        </div>
        {/* Add a new question button */}
        <div className="col-2">
          <button
              type="button"
              style={{ backgroundColor: "#4d8ac0", borderColor: "#4d8ac0" ,  marginBottom: '20px' }}
              className="btn btn-primary"
              onClick={handleAddItem}
            >
              Add Question
            </button>   
          </div>
        </div>
        <br /> 
        <div className="row m-2">
        {/* Save all questions button */}
          {/* <div className="col-2">
            <button
              type="button"
              style={{ backgroundColor: "#4d8ac0", borderColor: "#4d8ac0" }}
              className="btn btn-primary"
            >
              Save all questions
            </button>
          </div> */}
        {/* Edit/View Advice button */}
          {/* <div className="col-2">
            <button
              type="button"
              style={{ borderColor: "black" }}
              className="btn btn-light"
            >
              Edit/View Advice
            </button>
          </div> */}
        </div>
        <hr />
        {/* Import/Export Section */}
        <div className="row m-2">
          {/*  button  for Importing Questionnaire*/}
          <div className="col-2">
              <button
                style={{ color: "#b28b66",padding:"8px",borderRadius:"6px" }}
                onClick={() => setImportModalVisible(true)}
              >
                Import Questionnaire
              </button>{" "}
            </div>
          {/*  button  for Importing Questionnaire*/}
          <div className="col-2">
            <button
            
              style={{ color: "#b28b66",padding:"8px",borderRadius:"6px" }}
              onClick={() => setExportModalVisible(true)}
            >
              Export Questionnaire
            </button> 
          </div>

          {/* Render import and export modals conditionally */}
          {isImportModalVisible && (
            <ImportModal
              onClose={() => setImportModalVisible(false)}
              onImport={handleImportData}
            />
          )}
          {isExportModalVisible && (
            <ExportModal
              onClose={() => setExportModalVisible(false)}
              onExport={exportQuestionnaire}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;