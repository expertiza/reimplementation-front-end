import React from "react";
import { getColorClass } from "../../pages/ViewTeamGrades/utils"; // Importing utility functions
import { ReviewData } from "./App"; // Importing the ReviewData interface from App

// Props interface for ReviewTableRow component
interface ReviewTableRowProps {
  row: ReviewData;
  showToggleQuestion: boolean;
  showWordCount: number; // NEW
}

// Helper function to calculate word count
const calculateWordCount = (comment?: string) => {
  return comment ? comment.split(/\s+/).filter((word) => word).length : 0;
};

// Helper function to count short and long comments
const countShortAndLongComments = (reviews: { comment?: string }[]) => {
  let shortCount = 0;
  let longCount = 0;

  reviews.forEach((review) => {
    const wordCount = calculateWordCount(review.comment);
    if (wordCount > 20) {
      longCount++;
    } else if (wordCount <= 10) {
      shortCount++;
    }
  });

  return { shortCount, longCount };
};

// Functional component ReviewTableRow
const ReviewTableRow: React.FC<ReviewTableRowProps> = ({ row, showToggleQuestion , showWordCount }) => {
  const { shortCount, longCount } = countShortAndLongComments(row.reviews);

  return (
    <tr className={row.maxScore === 1 ? "no-bg" : ""}>
      {/* Question Number */}
      <td className="py-2 px-4 text-center" data-question={row.questionText}>
        <div className="circle-container">
          {row.maxScore !== 1 ? (
            <span className="circle">{row.maxScore}</span>
          ) : (
            <span className="tick">✓</span>
          )}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{row.questionNumber}
        </div>
      </td>

      {/* Toggle Question */}
      {showToggleQuestion && <td className="text-center">{row.questionText}</td>}

      {/* Review Cells */}
      {row.reviews.map((review, idx) => (
        <td
          key={idx}
          className={`py-2 px-4 text-center ${getColorClass(review.score, row.maxScore)}`}
          data-question={review.comment}
        >
          <span
            style={{ textDecoration: review.comment ? "underline" : "none", fontWeight: "bold" }}
          >
            {review.score}
          </span>
        </td>
      ))}

      {showWordCount !=0  && (
        <td className="py-2 px-4 text-center">
          {showWordCount >= 20 && `${longCount}`}
          {showWordCount <= 10 && `${shortCount}`}
        </td>
      )}



      {/* Row Average */}
      <td className="py-2 px-4 text-center">{row.RowAvg.toFixed(2)}</td>
    </tr>
  );
};

export default ReviewTableRow; // Exporting the ReviewTableRow component as default