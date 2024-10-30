import { getColorClass } from './utils';
import { QuestionFeedback } from './Review';

interface ReviewTableRowProps {
  row: QuestionFeedback;
  isQuestionListVisible: boolean;
}

// Helper function to get the icon based on maxScore
const getScoreIcon = (maxScore: number) => {
  return maxScore !== 1 ? <span className="star">☆</span> : <span className="tick">✓</span>;
};

// Helper component for rendering individual review cells
const ReviewCell: React.FC<{ score: number; comment?: string; maxScore: number }> = ({ score, comment, maxScore }) => (
  <td
    className={`py-2 px-4 text-center ${getColorClass(score, maxScore)}`}
    align="center"
    data-toggle="tooltip"
    data-question={comment}
  >
    <span className={comment ? "underline" : ""}>{score}</span>
  </td>
);

// Component to render a single table row with question data, reviews, and average
const ReviewTableRow: React.FC<ReviewTableRowProps> = ({ row, isQuestionListVisible }) => {
  const { maxScore, questionNumber, questionText, reviews, RowAvg } = row;

  return (
    <tr className={maxScore === 1 ? "no-bg" : undefined}>
      {/* Display Question Number */}
      <td className="py-2 px-4 text-center" data-question={questionText}>
        {questionNumber}
      </td>

      {/* Conditional Display of Question Text based on `isQuestionListVisible` prop */}
      {isQuestionListVisible && (
        <td width="300px" className="text-left">
          <div className="circle-container">
            {getScoreIcon(maxScore)}
            &nbsp;{questionText}
          </div>
        </td>
      )}

      {/* Review Cells - Render each review cell with appropriate styling */}
      {reviews.map((review, idx) => (
        <ReviewCell key={idx} score={review.score} comment={review.comment} maxScore={maxScore} />
      ))}

      {/* Row Average Score - Display average score for each question rounded to 2 decimal places */}
      <td className="py-2 px-4 text-center">{RowAvg.toFixed(2)}</td>
    </tr>
  );
};

export default ReviewTableRow;
