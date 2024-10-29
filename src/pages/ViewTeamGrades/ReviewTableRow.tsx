import { getColorClass } from './utils';
import { QuestionFeedback } from './Review';

interface ReviewTableRowProps {
  row: QuestionFeedback;
  isQuestionListVisible: boolean;
}

// Component to render a single table row with question data, reviews, and average
const ReviewTableRow: React.FC<ReviewTableRowProps> = ({ row, isQuestionListVisible }) => {
  return (
    <tr className={row.maxScore === 1 ? "no-bg" : ""}>
      {/* Display Question Number */}
      <td className="py-2 px-4 text-center" data-question={row.questionText}>
        {row.questionNumber}
      </td>
      
      {/* Conditional Display of Question Text based on `isQuestionListVisible` prop */}
      {isQuestionListVisible && (
        <td width="300px" className="text-left">
          <div className="circle-container">
            {/* Display a star or tick icon based on max score, for visual differentiation */}
            {row.maxScore !== 1 ? (
              <span className="star">☆</span>
            ) : (
              <span className="tick">✓</span>
            )}
            &nbsp;{row.questionText}
          </div>
        </td>
      )}

      {/* Review Cells - Iterates over `reviews` array to render each review score with appropriate styling */}
      {row.reviews.map((review, idx) => (
        <td
          key={idx}
          className={`py-2 px-4 text-center ${getColorClass(review.score, row.maxScore)}`}
          align="center"
          data-toggle="tooltip"
          data-question={review.comment}
        >
          {/* Display score with underline if a comment is present for that score */}
          <span style={{ textDecoration: review.comment ? "underline" : "none" }}>
            {review.score}
          </span>
        </td>
      ))}

      {/* Row Average Score - Display average score for each question rounded to 2 decimal places */}
      <td className="py-2 px-4 text-center">{row.RowAvg.toFixed(2)}</td>
    </tr>
  );
};

export default ReviewTableRow;
