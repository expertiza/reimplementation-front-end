import { useLocation, useLoaderData } from 'react-router-dom';
import { useState } from 'react';

interface Reviewer {
  id: number;
  name: string;
}

interface Reviewee {
  id: number;
  name: string;
}

interface ReviewData {
  reviewer: Reviewer;
  reviewee: Reviewee;
  comments: string;
  score: number | string;
  date: string;
  team_based: boolean;
}

interface ReviewResponse {
  author_feedback_reviews: ReviewData[];
  teammate_reviews: ReviewData[];
}

interface Assignment {
  id: number;
  name: string;
}

interface LoaderOutput {
  assignment: Assignment;
  reviews: ReviewResponse;
}

const AssignGrade = () => {
  const location = useLocation();
  const { assignment, reviews } = useLoaderData() as LoaderOutput;

  const [grade, setGrade] = useState('');
  const [comment, setComment] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

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

  const ReviewTable = ({ title, data }: { title: string; data: ReviewData[] }) => (
    <div style={{ margin: '2rem 0' }}>
      <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>{title}</h4>
      {data.length === 0 ? (
        <div style={{ fontStyle: 'italic', color: '#999' }}>No reviews available</div>
      ) : (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', backgroundColor: '#f8f9fa', padding: '1rem' }}>
            <div style={{ flex: 1, fontWeight: 600 }}>Reviewer</div>
            <div style={{ flex: 3, fontWeight: 600 }}>Comments</div>
            <div style={{ flex: 1, fontWeight: 600 }}>Score</div>
            <div style={{ flex: 1, fontWeight: 600 }}>Date</div>
          </div>
          {data.map((review, i) => (
            <div key={i} style={{ display: 'flex', padding: '1rem', borderBottom: '1px solid #eee' }}>
              <div style={{ flex: 1 }}>{review.reviewer.name}</div>
              <div style={{ flex: 3 }}>{review.comments}</div>
              <div style={{ flex: 1 }}>{review.score}/5</div>
              <div style={{ flex: 1 }}>{review.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      maxWidth: '700px',
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

      <ReviewTable title="Author Feedback Reviews" data={reviews.author_feedback_reviews} />
      <ReviewTable title="Teammate Reviews" data={reviews.teammate_reviews} />

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
