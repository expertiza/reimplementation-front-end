import React, { useState, useEffect } from "react";
import { getColorClass } from "./utils"; // Importing utility functions
import { ReviewData } from "./App"; // Importing the ReviewData interface from App

// Truncatable text component
const TruncatableText: React.FC<{ text: string; wordLimit?: number }> = ({ text, wordLimit = 10 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle empty or undefined text
  if (!text || typeof text !== 'string') {
    console.log('TruncatableText: Empty or invalid text', text);
    return <span></span>;
  }

  const words = text.trim().split(/\s+/);
  const shouldTruncate = words.length > wordLimit;
  const displayText = isExpanded || !shouldTruncate
    ? text
    : words.slice(0, wordLimit).join(" ");

  console.log('TruncatableText:', { text: text.substring(0, 50), wordCount: words.length, wordLimit, shouldTruncate });

  return (
    <span>
      {displayText}
      {shouldTruncate && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
            console.log('Truncatable text clicked, isExpanded:', !isExpanded);
          }}
          style={{
            color: "#b00404",
            cursor: "pointer",
            fontWeight: "bold",
            marginLeft: "4px"
          }}
        >
          {isExpanded ? " [show less]" : "..."}
        </span>
      )}
    </span>
  );
};

// Props interface for ReviewTableRow component
interface ReviewTableRowProps {
  row: ReviewData; // Data for the row
  showToggleQuestion: boolean; // Flag to toggle the item column
  onReviewClick?: (reviewIndex: number) => void; // Add click handler
}

// Functional component ReviewTableRow
const ReviewTableRow: React.FC<ReviewTableRowProps> = ({ row, showToggleQuestion, onReviewClick }) => {
  return (
    <tr className={row.maxScore === 1 ? "no-bg" : ""}>
      {/* Item Number with weight to the right */}
      <td className="py-1 px-2 text-center">
        <div className="item-number-with-weight">
          <span className="item-number">{row.itemNumber}</span>
          <span className="weight-circle" data-question={`Weight: ${row.maxScore}`}>
            {row.maxScore !== 1 ? (
              <span className="circle">{row.maxScore}</span>
            ) : (
              <span className="tick">✓</span>
            )}
          </span>
        </div>
      </td>
      {/* Toggle Item */}
      {showToggleQuestion && (
        <td className="item-prompt-cell" data-tooltip={row.itemText}>
          <TruncatableText text={row.itemText} wordLimit={5} />
        </td>
      )}

      {/* Review Cells - Now clickable */}
      {row.reviews.map((review, idx) => {
        // Determine cell content based on item type
        let cellContent;
        let bgClass = 'cf';

        if (review.score !== undefined) {
          // Scored items (Scale, Criterion)
          bgClass = getColorClass(review.score, row.maxScore);
          cellContent = (
            <span style={{ textDecoration: review.comment ? "underline" : "none", fontWeight: "bold" }}>
              {review.score}
            </span>
          );
        } else if (review.textResponse) {
          // Text items (TextArea, TextField)
          cellContent = <span style={{ fontSize: "12px", fontStyle: "italic" }}>{review.textResponse.substring(0, 15)}...</span>;
        } else if (review.selections && review.selections.length > 0) {
          // Multi-select items (Checkbox)
          cellContent = <span style={{ fontSize: "12px" }}>✓ ({review.selections.length})</span>;
        } else if (review.selectedOption) {
          // Single-select items (Dropdown, Radio)
          cellContent = <span style={{ fontSize: "12px" }}>{review.selectedOption}</span>;
        } else if (review.fileName) {
          // File upload
          cellContent = <span style={{ fontSize: "11px", color: "#b00404" }}>📎 {review.fileName.substring(0, 10)}</span>;
        } else {
          cellContent = <span>-</span>;
        }

        return (
          <td
            key={idx}
            className={`py-1 px-2 text-center ${bgClass}`}
            data-question={review.comment || review.textResponse || ''}
            style={{ cursor: onReviewClick ? "pointer" : "default" }}
            onClick={() => onReviewClick && onReviewClick(idx)}
            title={onReviewClick ? "Click to view full review" : ""}
          >
            {cellContent}
          </td>
        );
      })}
    </tr>
  );
};

export default ReviewTableRow; // Exporting the ReviewTableRow component as default