import { getColorClass } from './utils';
import { QuestionFeedback } from './Review';

interface ReviewTableRowProps {
  row: QuestionFeedback;
  isQuestionListVisible: boolean;
}

const ReviewTableRow: React.FC<ReviewTableRowProps> = ({ row, isQuestionListVisible }) => {
  return (
    <tr className={row.maxScore === 1 ? "no-bg" : ""} >
      {/* Question Number */}
      <td className="py-2 px-4 text-center" data-question={row.questionText}>
        {row.questionNumber}
      </td>
      {/* Toggle Question */}
      {isQuestionListVisible && (
        <td width="300px" className="text-left" >
          <div className="circle-container">
            {row.maxScore !== 1 ? (
              <span className="star">☆</span>
            ) : (
              <span className="tick">✓</span>
            )}
          &nbsp;{row.questionText}
        </div>
        </td>
      )}

      {/* Review Cells */}
      {row.reviews.map((review, idx) => (
        <td
          key={idx}
          className={`py-2 px-4 text-center ${getColorClass(review.score, row.maxScore)}`} align="center" data-toggle="tooltip"
          data-question={review.comment}
        >
          <span style={{ textDecoration: review.comment ? "underline" : "none" }}>{review.score}</span>
        </td>
      ))}

      {/* Row Average */}
      <td className="py-2 px-4 text-center">{row.RowAvg.toFixed(2)}</td>
    </tr>
  );
};

export default ReviewTableRow;