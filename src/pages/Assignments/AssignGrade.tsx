import { useLocation, useLoaderData } from 'react-router-dom';
import { useState } from 'react';
import ReviewTable from '../../components/HeatGrid/ReviewTable'; // HeatGrid component for displaying reviews in tabular format
import { convertReviewDataToHeatMap, LoaderOutput } from './AssignmentUtil';

const AssignGrade = () => {
  // Accessing navigation state passed from the previous route (team name, topic, team members)
  const location = useLocation();
  console.log("Location state:", location.state);

  // Getting the assignment and review data from the route loader
  const { assignment, reviews } = useLoaderData() as LoaderOutput;

  // State variables to manage form data and UI state
  const [grade, setGrade] = useState('');
  const [comment, setComment] = useState('');
  const [latePenalty, setLatePenalty] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // Converting raw review data into a format suitable for HeatGrid (peer reviews)
  const authorReviewes = convertReviewDataToHeatMap(reviews.author_feedback_reviews);
  // Converting teammate reviews similarly
  const teamReviews = convertReviewDataToHeatMap(reviews.teammate_reviews);

  // Handle submission of grade and comment
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!grade.trim() || !comment.trim()) {
      setError('Both grade and comment are required');
      return;
    }

    // Reset error and show success message
    setError('');
    setShowSuccess(true);

    // Logging submitted data (in production this would be replaced with an API call)
    console.log('Grade submitted:', grade, 'Comment:', comment, 'Late Penalty:', latePenalty);
  };

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '2rem auto',
      padding: '2rem',
      backgroundColor: '#fff',
      borderRadius: '10px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
    }}>
      {/* Success message after grade is submitted */}
      {showSuccess && (
        <div style={{ backgroundColor: '#d1fae5', padding: '1rem', marginBottom: '1rem', border: '1px solid #10b981', color: '#065f46' }}>
          Grade and comment saved!
        </div>
      )}

      {/* Assignment title */}
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
        Summary Report for Assignment: {assignment.name}
      </h1>

      {/* Team and topic details from navigation state */}
      <div style={{ margin: '1rem 0' }}>
        <strong>Team:</strong> {location.state?.teamName || 'Unknown Team'}
      </div>
      <div style={{ margin: '1rem 0' }}>
        <strong>Topic:</strong> {location.state?.topicName || 'Unknown Topic'}
      </div>

      {/* Placeholder button for viewing the submission */}
      <button style={{ padding: '0.5rem 1rem', backgroundColor: '#eee', border: '1px solid #ccc', marginBottom: '1rem' }}>
        Show Submission
      </button>

      {/* Peer review section */}
      <div style={{ margin: '1rem 0', fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'left' }}>
        Peer Review
      </div>
      {authorReviewes.length !== 0 ? (
        <ReviewTable reviews={authorReviewes} />
      ) : (
        <div style={{ backgroundColor: '#fffbcc', padding: '1rem', marginBottom: '1rem' }}>
          <strong>Note:</strong> No data provided for peer reviews table.
        </div>
      )}

      {/* Displaying list of teammates with profile links */}
      <div style={{ margin: '1rem 0', paddingLeft: '1rem' }}>
        <strong>Teammates:  </strong>
        <span style={{ marginTop: '0.5rem', fontSize: '1rem' }}>
          {location.state?.teamMembers?.map((member: { id: number; name: string }, index: number) => (
            <span key={member.id} style={{ marginRight: '0.5rem' }}>
              <a href={`/students/${member.id}`} style={{ color: '#a67c52', textDecoration: 'none' }}>
                {member.name}
              </a>
              {index < location.state.teamMembers.length - 1 ? ',' : ''}
            </span>
          ))}
        </span>
      </div>

      {/* Teammate review section */}
      {teamReviews.length !== 0 && (
        <div style={{ margin: '1rem 0', fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'left' }}>
          Teammate Review
        </div>
      )}
      {teamReviews.length !== 0 ? (
        <ReviewTable reviews={teamReviews} />
      ) : (
        <div style={{ backgroundColor: '#fffbcc', padding: '1rem', marginBottom: '1rem' }}>
          <strong>Note:</strong> No data provided for teammate reviews table.
        </div>
      )}

      {/* Grade and comment input form */}
      <h3>Grade and Comment for Submission</h3>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Grade input */}
        <label>Grade:</label>
        <input
          type="text"
          value={grade}
          onChange={e => setGrade(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />

        {/* Comment textarea */}
        <label>Comment:</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
          style={{ width: '100%', padding: '0.5rem' }}
        />

        {/* Late penalty input */}
        <label>Late Penalty:</label>
        <input
          type="text"
          value={latePenalty}
          onChange={e => setLatePenalty(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />

        <button type="submit" style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
          Save
        </button>
      </form>
    </div>
  );
};

export default AssignGrade;
