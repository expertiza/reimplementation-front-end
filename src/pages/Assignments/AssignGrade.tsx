// import { useLocation } from 'react-router-dom';
// import { useState } from 'react';

// interface ReviewData {
//   id: number;
//   reviewer_id: number;
//   comments: string;
//   score: number;
//   created_at: string;
// }

// const AssignGrade = () => {
//   const location = useLocation();
//   const [grade, setGrade] = useState('');
//   const [comment, setComment] = useState('');
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!grade.trim() || !comment.trim()) {
//       setError('Both grade and comment are required');
//       return;
//     }

//     setError('');
//     console.log('Grade:', grade, 'Comment:', comment);
//     setShowSuccess(true);
//   };

//   const styles = {
//     container: {
//       maxWidth: '700px',
//       margin: '2rem auto',
//       padding: '2rem',
//       backgroundColor: '#fff',
//       borderRadius: '10px',
//       boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
//       fontFamily: 'Arial, sans-serif',
//     },
//     heading: {
//       fontSize: '1.8rem',
//       fontWeight: 'bold',
//       marginBottom: '1rem',
//     },
//     label: {
//       fontWeight: 'bold',
//       display: 'block',
//       marginBottom: '0.5rem',
//     },
//     input: {
//       width: '100%',
//       padding: '0.6rem',
//       border: '1px solid #ccc',
//       borderRadius: '5px',
//       marginBottom: '1rem',
//     },
//     textarea: {
//       width: '100%',
//       padding: '0.6rem',
//       border: '1px solid #ccc',
//       borderRadius: '5px',
//       marginBottom: '1rem',
//     },
//     button: {
//       padding: '0.6rem 1.2rem',
//       border: '1px solid #888',
//       backgroundColor: '#f0f0f0',
//       borderRadius: '5px',
//       cursor: 'pointer',
//     },
//     message: {
//       marginBottom: '1rem',
//       padding: '0.75rem',
//       borderRadius: '6px',
//     },
//     success: {
//       backgroundColor: '#d1fae5',
//       color: '#065f46',
//       border: '1px solid #10b981',
//     },
//     error: {
//       backgroundColor: '#fee2e2',
//       color: '#b91c1c',
//       border: '1px solid #ef4444',
//     },
//     warning: {
//       backgroundColor: '#fef3c7',
//       color: '#92400e',
//       border: '1px solid #f59e0b',
//       marginBottom: '0.5rem',
//     },
//     badge: {
//       backgroundColor: '#d1fae5',
//       color: '#065f46',
//       padding: '0.2rem 0.5rem',
//       borderRadius: '6px',
//       fontSize: '0.9rem',
//     },
//   };

//   return (
//     <div style={styles.container}>
//       {showSuccess && (
//         <div style={{ ...styles.message, ...styles.success }}>
//           Grade and comment for submission successfully saved.
//         </div>
//       )}

//       <h1 style={styles.heading}>
//         Summary Report for assignment: Program 1
//       </h1>

//       <div style={{ marginBottom: '1rem' }}>
//         <span style={styles.label}>Team:</span>
//         {location.state?.teamName || 'Unknown Team'}
//       </div>

//       <div style={{ marginBottom: '1rem' }}>
//         <span style={styles.label}>Average peer review score:</span>
//         <span style={styles.badge}>N/A</span>
//       </div>

//       <button style={styles.button}>Show Submission</button>

//       <div style={{ margin: '1rem 0' }}>
//         <div style={styles.warning}>
//           NO REVIEW OF AuthorFeedbackQuestionnaire TYPE EXISTS.
//         </div>
//         <div style={styles.warning}>
//           NO REVIEW OF TeammateReviewQuestionnaire TYPE EXISTS.
//         </div>
//       </div>

//       <h3 style={{ ...styles.label, fontSize: '1.2rem' }}>
//         Grade and Comment for Submission
//       </h3>

//       {error && (
//         <div style={{ ...styles.message, ...styles.error }}>{error}</div>
//       )}

//       <form onSubmit={handleSubmit}>
//         <label style={styles.label}>Grade:</label>
//         <input
//           type="text"
//           style={styles.input}
//           value={grade}
//           onChange={(e) => setGrade(e.target.value)}
//         />

//         <label style={styles.label}>Comment:</label>
//         <textarea
//           rows={4}
//           style={styles.textarea}
//           value={comment}
//           onChange={(e) => setComment(e.target.value)}
//         />

//         <button type="submit" style={styles.button}>
//           Save
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AssignGrade;





import { useLocation } from 'react-router-dom';
import { useState } from 'react';

interface ReviewData {
  id: number;
  reviewer_id: number;
  comments: string;
  score: number;
  created_at: string;
}

const AssignGrade = () => {
  const location = useLocation();
  const [grade, setGrade] = useState('');
  const [comment, setComment] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const ReviewTable = ({ title, data }: { title: string; data: ReviewData[] }) => (
    <div style={{ margin: '2rem 0' }}>
      <h4 style={{ 
        fontSize: '1.1rem',
        fontWeight: 'bold',
        borderBottom: '2px solid #eee',
        paddingBottom: '0.5rem',
        marginBottom: '1rem'
      }}>
        {title}
      </h4>
      <div style={{ 
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{ 
          display: 'flex',
          backgroundColor: '#f8f9fa',
          padding: '1rem',
          borderBottom: '1px solid #ddd'
        }}>
          <div style={{ flex: 1, fontWeight: 600 }}>Reviewer</div>
          <div style={{ flex: 3, fontWeight: 600 }}>Comments</div>
          <div style={{ flex: 1, fontWeight: 600 }}>Score</div>
          <div style={{ flex: 1, fontWeight: 600 }}>Date</div>
        </div>
        {data.map((review) => (
          <div key={review.id} style={{ 
            display: 'flex',
            padding: '1rem',
            borderBottom: 
              data.indexOf(review) === data.length - 1 
                ? 'none' 
                : '1px solid #ddd'
          }}>
            <div style={{ flex: 1 }}>User #{review.reviewer_id}</div>
            <div style={{ flex: 3 }}>{review.comments}</div>
            <div style={{ flex: 1 }}>{review.score}/5</div>
            <div style={{ flex: 1 }}>
              {new Date(review.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!grade.trim() || !comment.trim()) {
      setError('Both grade and comment are required');
      return;
    }

    setError('');
    console.log('Grade:', grade, 'Comment:', comment);
    setShowSuccess(true);
  };

  const styles = {
    container: {
      maxWidth: '700px',
      margin: '2rem auto',
      padding: '2rem',
      backgroundColor: '#fff',
      borderRadius: '10px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      fontFamily: 'Arial, sans-serif',
    },
    heading: {
      fontSize: '1.8rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
    },
    label: {
      fontWeight: 'bold',
      display: 'block',
      marginBottom: '0.5rem',
    },
    input: {
      width: '100%',
      padding: '0.6rem',
      border: '1px solid #ccc',
      borderRadius: '5px',
      marginBottom: '1rem',
    },
    textarea: {
      width: '100%',
      padding: '0.6rem',
      border: '1px solid #ccc',
      borderRadius: '5px',
      marginBottom: '1rem',
    },
    button: {
      padding: '0.6rem 1.2rem',
      border: '1px solid #888',
      backgroundColor: '#f0f0f0',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    message: {
      marginBottom: '1rem',
      padding: '0.75rem',
      borderRadius: '6px',
    },
    success: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      border: '1px solid #10b981',
    },
    error: {
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      border: '1px solid #ef4444',
    },
    warning: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
      border: '1px solid #f59e0b',
      marginBottom: '0.5rem',
    },
    badge: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      padding: '0.2rem 0.5rem',
      borderRadius: '6px',
      fontSize: '0.9rem',
    },
  };

  return (
    <div style={styles.container}>
      {showSuccess && (
        <div style={{ ...styles.message, ...styles.success }}>
          Grade and comment for submission successfully saved.
        </div>
      )}

      <h1 style={styles.heading}>
        Summary Report for assignment: Program 1
      </h1>

      <div style={{ marginBottom: '1rem' }}>
        <span style={styles.label}>Team:</span>
        {location.state?.teamName || 'Unknown Team'}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <span style={styles.label}>Average peer review score:</span>
        <span style={styles.badge}>N/A</span>
      </div>

      <button style={styles.button}>Show Submission</button>

      <ReviewTable 
        title="Author Feedback Reviews"
        data={[
          {
            id: 1,
            reviewer_id: 4,
            comments: "Excellent documentation quality",
            score: 4.5,
            created_at: "2023-10-05T14:48:00Z"
          },
          {
            id: 2,
            reviewer_id: 5,
            comments: "Very thorough implementation",
            score: 4.8,
            created_at: "2023-10-05T15:12:00Z"
          }
        ]}
      />
      
      <ReviewTable
        title="Teammate Reviews"
        data={[
          {
            id: 3,
            reviewer_id: 5,
            comments: "Great collaboration skills",
            score: 4.0,
            created_at: "2023-10-05T15:30:00Z"
          },
          {
            id: 4,
            reviewer_id: 4,
            comments: "Consistent code quality",
            score: 4.2,
            created_at: "2023-10-05T16:45:00Z"
          }
        ]}
      />

      <h3 style={{ ...styles.label, fontSize: '1.2rem' }}>
        Grade and Comment for Submission
      </h3>

      {error && (
        <div style={{ ...styles.message, ...styles.error }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <label style={styles.label}>Grade:</label>
        <input
          type="text"
          style={styles.input}
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        />

        <label style={styles.label}>Comment:</label>
        <textarea
          rows={4}
          style={styles.textarea}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button type="submit" style={styles.button}>
          Save
        </button>
      </form>
    </div>
  );
};

export default AssignGrade;