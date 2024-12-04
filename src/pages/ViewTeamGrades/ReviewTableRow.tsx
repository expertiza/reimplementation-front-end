import React, { useState, useEffect } from 'react';
import { getColorClass } from './utils'; // Importing utility functions
import { ReviewData } from './App'; // Importing the ReviewData interface from App

// Props interface for ReviewTableRow component
interface ReviewTableRowProps {
  row: ReviewData; // Data for the row
  showToggleQuestion: boolean; // Flag to toggle the question column
  showToggle10WordComments: boolean; // Flag to toggle the > 10 word column
  showToggle20WordComments: boolean; // Flag to toggle the > 20 word column
  showToggleCustomWordComment: boolean; // Flag to toggle the custom feature
  customCharacterNumber: number; // 
}

// Functional component ReviewTableRow
const ReviewTableRow: React.FC<ReviewTableRowProps> = ({ row, showToggleQuestion, showToggle10WordComments, showToggle20WordComments, showToggleCustomWordComment, customCharacterNumber}) => {


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
      {showToggleQuestion && (
        <td className="text-center" >{row.questionText}</td>
      )}

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

      {/* Toggle >= 10 word comments */}
      {showToggle10WordComments && (
        <td className='text-center'>{row.reviews.filter(review => review?.comment && review.comment.split(' ').length >= 10).length}</td>
      )}

      {/* Toggle >= 20 word comments */}
      {showToggle20WordComments && (
        <td className='text-center'>{row.reviews.filter(review => review?.comment && review.comment.split(' ').length >= 20).length}</td>
      )}

      {/* Toggle >= (input value) character */}
      {showToggleCustomWordComment && (
        <td className='text-center'>{row.reviews.filter(review => review?.comment && review.comment.length >= customCharacterNumber).length}</td>
      )}

    </tr>
  );
};

export default ReviewTableRow; // Exporting the ReviewTableRow component as default
