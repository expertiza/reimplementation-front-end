import React from 'react';
import { getColorClass, getWordCount10, getWordCount20 } from './utils'; // Importing utility functions
import { ReviewData } from './App'; // Importing the ReviewData interface from App

// Props interface for ReviewTableRow component
interface ReviewTableRowProps {
  row: ReviewData; // Data for the row
  showWordCount10: boolean; // Flag to show reviews with 10+ words
  showWordCount20: boolean; // Flag to show reviews with 20+ words
}

// Functional component ReviewTableRow
const ReviewTableRow: React.FC<ReviewTableRowProps> = ({ row, showWordCount10, showWordCount20 }) => {
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

      {/* Review Cells */}
      {row.reviews.map((review, idx) => (
        <td
          key={idx}
          className={`py-2 px-4 text-center ${getColorClass(review.score, row.maxScore)}`}
          data-question={review.comment}
        >
          <span style={{ textDecoration: review.comment ? "underline" : "none" }}>{review.score}</span>
        </td>
      ))}

      {/* Row Average */}
      <td className="py-2 px-4 text-center">{row.RowAvg.toFixed(2)}</td>

      {/* Optional columns for word count */}
      {showWordCount10 && <td className="py-2 px-4 text-center">{getWordCount10(row)}</td>}
      {showWordCount20 && <td className="py-2 px-4 text-center">{getWordCount20(row)}</td>}
    </tr>
  );
};

export default ReviewTableRow; // Exporting the ReviewTableRow component as default
