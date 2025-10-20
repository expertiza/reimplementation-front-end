import React, { useState } from "react";

const ImportModal = ({ onClose, onImport }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleImport = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          onImport(importedData);
          onClose();
        } catch (error) {
          console.error("Error parsing JSON:", error);
          // Handle the error as needed (e.g., show an error message)
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  return (
    <div className="modal" style={{ display: "block" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Import Questionnaire</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <p>
              Select a JSON file to import questionnaire data. The file should
              contain a valid JSON object.
            </p>
            <input type="file" onChange={handleFileChange} />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleImport}
            >
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
