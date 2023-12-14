import React, { useState } from "react";
import "./DueDate.css"; // Assuming you've created a CSS file for styling

const DueDate: React.FC = () => {
  // State for form values
  const [useTeamFormationDeadline, setUseTeamFormationDeadline] = useState(false);
  const [useMetaReviewDeadline, setUseMetaReviewDeadline] = useState(false);
  const [deadlineType, setDeadlineType] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [submissionAllowed, setSubmissionAllowed] = useState("Yes");
  const [reviewAllowed, setReviewAllowed] = useState("Yes");
  const [teammateReviewAllowed, setTeammateReviewAllowed] = useState("Yes");
  const [metaReviewAllowed, setMetaReviewAllowed] = useState("Yes");
  const [reminderHours, setReminderHours] = useState("");

  // Below code is written to manage form submission for Due Date changes
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Process form data or send it to the server
    // ...

    // Reset form fields if needed
    // ...
  };

// Static data for an additional row in the table
const staticRowData = {
  deadlineType: 'Round 1: Submission',
  dateTime: '12/01/2023, 11:59 PM', // Replace with an appropriate date and time
  submissionAllowed: 'Yes',
  reviewAllowed: 'Yes',
  teammateReviewAllowed: 'Yes',
  metaReviewAllowed: 'Yes',
  reminderHours: '1',
};
const staticRowData2 = {
  deadlineType: 'Round 1: Review',
  dateTime: '12/05/2023, 11:59 PM',
  submissionAllowed: 'Yes',
  reviewAllowed: 'Yes',
  teammateReviewAllowed: 'No',
  metaReviewAllowed: 'No',
  reminderHours: '2',
};

  return (
    <div className="due-date-container">
      <div className="checkbox-section">
        {/* Display and control time zone */}
        <div>
          <label>Time zone : </label>
          <span>Eastern Standard Time (US & Canada)</span>
        </div>
        {/* Checkbox for using team formation deadline */}
        <div className="checkbox-item">
          <input
            type="checkbox"
            checked={useTeamFormationDeadline}
            onChange={(e) => setUseTeamFormationDeadline(e.target.checked)}
          />
          Use team formation deadline
        </div>
        {/* Checkbox for using meta-review deadline */}
        <div className="checkbox-item">
          <input
            type="checkbox"
            checked={useMetaReviewDeadline}
            onChange={(e) => setUseMetaReviewDeadline(e.target.checked)}
          />
          Use meta-review deadline
        </div>
      </div>

      <form onSubmit={handleSubmit} className="due-date-form">
        <table className="deadline-table">
          <thead>
            <tr>
              <th>Deadline type</th>
              <th>Date and time</th>
              <th>Submission allowed</th>
              <th>Review allowed</th>
              <th>Teammate review allowed</th>
              <th>Meta-review allowed</th>
              <th>Reminder (hrs)</th>
            </tr>
          </thead>
          <tbody>
          {/* Display static deadline table; This can be replaced later when data fetched from backend */}
          <tr>
          <td>{staticRowData.deadlineType}</td>
          <td>{staticRowData.dateTime}</td>
          <td>{staticRowData.submissionAllowed}</td>
          <td>{staticRowData.reviewAllowed}</td>
          <td>{staticRowData.teammateReviewAllowed}</td>
          <td>{staticRowData.metaReviewAllowed}</td>
          <td>{staticRowData.reminderHours}</td>
        </tr>

        <tr>
          <td>{staticRowData2.deadlineType}</td>
          <td>{staticRowData2.dateTime}</td>
          <td>{staticRowData2.submissionAllowed}</td>
          <td>{staticRowData2.reviewAllowed}</td>
          <td>{staticRowData2.teammateReviewAllowed}</td>
          <td>{staticRowData2.metaReviewAllowed}</td>
          <td>{staticRowData2.reminderHours}</td>
        </tr>
          {/* Form for adding new deadline */}
          <tr>
              <td>
                <select
                  value={deadlineType}
                  onChange={(e) => setDeadlineType(e.target.value)}
                >
                  <option value="">Select Deadline Type</option>
                  <option value="Round 2: Submission">Round 2: Submission</option>
                  <option value="Round 2: Review">Round 2: Review</option>
                  {/* Add more options as needed */}
                </select>
              </td>
              <td>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                />
              </td>
              <td>
                <select
                  value={submissionAllowed}
                  onChange={(e) => setSubmissionAllowed(e.target.value)}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </td>
              <td>
                <select
                  value={reviewAllowed}
                  onChange={(e) => setReviewAllowed(e.target.value)}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </td>
              <td>
                <select
                  value={teammateReviewAllowed}
                  onChange={(e) => setTeammateReviewAllowed(e.target.value)}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </td>
              <td>
                <select
                  value={metaReviewAllowed}
                  onChange={(e) => setMetaReviewAllowed(e.target.value)}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </td>
              <td>
                <select
                  value={reminderHours}
                  onChange={(e) => setReminderHours(e.target.value)}
                >
                  <option value="">Select Hours</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="2">4</option>
                  <option value="2">8</option>
                  <option value="2">16</option>
                  <option value="2">32</option>
                  <option value="2">64</option>
                  <option value="2">96</option>
                  {/* Add more options as needed */}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
          {/* Checkbox for using late policy */}
          <div className="late-policy-section">
            <input type="checkbox" className="late-policy-checkbox" />
            Use the late policy for this assignment
            <select>
              <option>Random Dropdown Option 1</option>
              <option>Random Dropdown Option 2</option>
              <option>Random Dropdown Option 3</option>
              {/* Add more options as needed */}
            </select>
            <a href="#" className="new-late-policy-link">New Late Policy</a>
          </div>
        {/* Save and Back buttons */}
        <div className="buttons-section">
          <button type="submit" className="save-btn">Save</button>
          <button type="button" className="back-btn">Back</button>
        </div>
      </form>
    </div>
  );
};

export default DueDate;
