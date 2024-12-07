import React, { useState } from "react";
import './AssignReviewerStyle.css'; 
import initialData from "./DummyData.json";

interface Reviewer {
  name: string;
  username: string;
  status: string;
}

interface IContributor {
  name: string;
  username: string;
}

interface RowData {
  topic: string;
  contributors: IContributor[];  
  reviewers: Reviewer[];
}

//Initial data for the table
const data: RowData[] = initialData as RowData[];

const AssignReviewer: React.FC = () => {
  // State variables for modal, selected topic, contributors, and inputs
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedContributors, setSelectedContributors] = useState<string[]>([]);
  const [reviewerName, setReviewerName] = useState<string>("");
  const [reviewerUsername, setReviewerUsername] = useState<string>("");
  const [tableData, setTableData] = useState<RowData[]>(data);

  // Opens a pop up window to assign a reviewer, populating topic and contributors
  const openModal = (topic: string, contributors: IContributor[]) => {
    const contributorDetails = contributors.map(
      (contributor) => `${contributor.name} (${contributor.username})`
    );

    setSelectedTopic(topic);
    setSelectedContributors(contributorDetails);
    setModalOpen(true);
  };

  // Closes the pop up window and clears the reviewer name and username
  const closeModal = () => {
    setModalOpen(false);
    setReviewerName(""); 
    setReviewerUsername("")
  };

  // Adds a new reviewer to the selected topic in the table
  const handleAddReviewer = () => {
    if (reviewerName.trim()) {
      setTableData((prevData) =>
        prevData.map((row) =>
          row.topic === selectedTopic
            ? {
                ...row,
                reviewers: [
                  ...row.reviewers,
                  { name: reviewerName, username: reviewerUsername, status: "Pending" },
                ],
              }
            : row
        )
      );
      closeModal();
    }
  };

  // Changes a reviewer’s status to "Pending" when "Unsubmit" is clicked
  const handleUnsubmit = (topic: string, reviewerName: string) => {
    setTableData((prevData) =>
      prevData.map((row) =>
        row.topic === topic
          ? {
              ...row,
              reviewers: row.reviewers.map((reviewer) =>
                reviewer.name === reviewerName
                  ? { ...reviewer, status: "Pending" }
                  : reviewer
              ),
            }
          : row
      )
    );
  };

  return (
    <div className="assign-reviewer-container">
      <h1>Assign Reviewer</h1>
      <h3>Assignment: Final Project (and design doc)</h3>
      <table className="assign-reviewer-table">
        <thead>
          <tr>
            <th>Topic selected</th>
            <th>Contributors</th>
            <th>Reviewed by</th>
            <th>Add reviewer</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index}>
              <td>{row.topic}</td>
              <td>
              {/* Rendering contributors list */}
              {row.contributors.map((contributor, idx) => (
                <div key={idx}>
                  {contributor.name} ({contributor.username})
                </div>
              ))}
              </td>
              <td>
                {/* Rendering reviewers and their statuses */}
                {row.reviewers.length > 0 ? (
                  row.reviewers.map((reviewer, idx) => (
                    <div key={idx}>
                      {reviewer.name} ({reviewer.username}) - Review status: {reviewer.status}
                      {reviewer.status === "Submitted" && (
                        <span
                          className="unsubmit-link"
                          onClick={() => handleUnsubmit(row.topic, reviewer.name)}
                        >
                          {" ("}Unsubmit{")"}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <span>No reviewers assigned</span>
                )}
              </td>
              <td>
                {/* Button to add reviewer, triggers modal */}
                <button
                  /*Styling of this button will be updated in future */
                  className="add-reviewer-button"
                  onClick={() => openModal(row.topic, row.contributors)}
                >
                  Add reviewer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for adding a reviewer */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add reviewer</h3>
            <p>Topic: {selectedTopic}</p>
            <p>Contributors: {selectedContributors.join(", ")}</p>
            <input
              type="text"
              placeholder="Enter user login (unityId)"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Enter reviewer name"
              value={reviewerUsername}
              onChange={(e) => setReviewerUsername(e.target.value)}
              className="input-field"
            />
            <button
              onClick={handleAddReviewer}
              className="submit-button"
            >
              Add reviewer
            </button>
            <button
              onClick={closeModal}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignReviewer;
