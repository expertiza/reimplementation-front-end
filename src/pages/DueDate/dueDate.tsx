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

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Process form data or send it to the server
    // ...

    // Reset form fields if needed
    // ...
  };

  return (
    <div className="due-date-container">
      <div className="checkbox-section">
        <div>
          <label>Timezone:</label>
          <span>Timezone Value</span>
        </div>
        <div className="checkbox-item">
          <input
            type="checkbox"
            checked={useTeamFormationDeadline}
            onChange={(e) => setUseTeamFormationDeadline(e.target.checked)}
          />
          Use team formation deadline
        </div>
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
          <tr>
              <td>
                <select
                  value={deadlineType}
                  onChange={(e) => setDeadlineType(e.target.value)}
                >
                  <option value="">Select Deadline Type</option>
                  <option value="Round 1: Submission">Round 1: Submission</option>
                  <option value="Round 1: Review">Round 1: Review</option>
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
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  {/* Add more options as needed */}
                </select>
              </td>
            </tr>
          </tbody>
        </table>

          <div className="late-policy-section">
            <input type="checkbox" className="late-policy-checkbox" />
            Use the late policy for this assignment
            <select>
            <option>Random Dropdown Option 1</option>
              <option>Random Dropdown Option 2</option>
              {/* Add more options as needed */}
            </select>
            <a href="#" className="new-late-policy-link">New Late Policy</a>
          </div>

        <div className="buttons-section">
          <button type="submit" className="save-btn">Save</button>
          <button type="button" className="back-btn">Back</button>
        </div>
      </form>
    </div>
  );
};

export default DueDate;