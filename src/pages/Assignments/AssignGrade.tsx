import { useLocation, useLoaderData } from 'react-router-dom';
import { useState } from 'react';
import ReviewTable from '../../components/HeatGrid/ReviewTable'; // HeatGrid import
import { convertReviewDataToHeatMap, LoaderOutput } from './AssignmentUtil';



const AssignGrade = () => {
  const location = useLocation();
  const { assignment, reviews } = useLoaderData() as LoaderOutput;

  const [grade, setGrade] = useState('');
  const [comment, setComment] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const authorReviewes = convertReviewDataToHeatMap(reviews.author_feedback_reviews);
  const teamReviews = convertReviewDataToHeatMap(reviews.teammate_reviews);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grade.trim() || !comment.trim()) {
      setError('Both grade and comment are required');
      return;
    }
    setError('');
    setShowSuccess(true);
    console.log('Grade submitted:', grade, 'Comment:', comment);
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
      {showSuccess && (
        <div style={{ backgroundColor: '#d1fae5', padding: '1rem', marginBottom: '1rem', border: '1px solid #10b981', color: '#065f46' }}>
          Grade and comment saved!
        </div>
      )}

      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
        Summary Report for Assignment: {assignment.name}
      </h1>

      <div style={{ margin: '1rem 0' }}>
        <strong>Team:</strong> {location.state?.teamName || 'Unknown Team'}
      </div>

      <button style={{ padding: '0.5rem 1rem', backgroundColor: '#eee', border: '1px solid #ccc', marginBottom: '1rem' }}>
        Show Submission
      </button>

      {/* HeatGrid Summary Report */}
      <ReviewTable reviews={authorReviewes} />

      <ReviewTable reviews={teamReviews} />

      <h3>Grade and Comment for Submission</h3>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <label>Grade:</label>
        <input type="text" value={grade} onChange={e => setGrade(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} />
        <label>Comment:</label>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} style={{ width: '100%', padding: '0.5rem' }} />
        <button type="submit" style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Save</button>
      </form>
    </div>
  );
};

export default AssignGrade;
