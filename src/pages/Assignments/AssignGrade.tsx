import { useLocation } from 'react-router-dom';
import { useState } from 'react';

const AssignGrade = () => {
  // Access route state (e.g., team name passed from previous page)
  const location = useLocation();

  // State for input values
  const [grade, setGrade] = useState('');
  const [comment, setComment] = useState('');

  // UI state for feedback
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!grade.trim() || !comment.trim()) {
      setError('Both grade and comment are required');
      return;
    }

    // Clear error and simulate successful submission
    setError('');
    console.log('Grade:', grade, 'Comment:', comment);
    setShowSuccess(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Success message */}
      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Grade and comment for submission successfully saved.
        </div>
      )}

      {/* Assignment title */}
      <h1 className="text-left text-xl font-semibold mb-4">
        Summary Report for assignment: Program 1
      </h1>

      {/* Team name display */}
      <div className="mb-4">
        <span className="font-semibold">Team: </span>
        {location.state?.teamName || 'Unknown Team'}
      </div>

      {/* Peer review score placeholder */}
      <div className="mb-4">
        <span className="font-semibold">Average peer review score: </span>
        <span className="bg-green-50 text-green-600">N/A</span>
      </div>

      {/* Placeholder for future submission view */}
      <button className="mb-6 bg-white text-black border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded">
        Show Submission
      </button>

      {/* Warnings for missing review types */}
      <div className="mb-6 space-y-3">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          NO REVIEW OF AuthorFeedbackQuestionnaire TYPE EXISTS.
        </div>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          NO REVIEW OF TeammateReviewQuestionnaire TYPE EXISTS.
        </div>
      </div>

      {/* Section heading */}
      <h3 className="text-left text-xl font-semibold mb-4">
        Grade and Comment for Submission
      </h3>

      {/* Display validation errors */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Grade and comment form */}
      <form onSubmit={handleSubmit}>
        {/* Grade input */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Grade:</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          />
        </div>

        {/* Comment input */}
        <div className="mb-6 mt-6">
          <label className="block font-semibold mb-1">Comment:</label>
          <textarea
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {/* Save button */}
        <button
          type="submit"
          className="bg-white text-black border border-gray-300 px-4 py-2 rounded"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default AssignGrade;
