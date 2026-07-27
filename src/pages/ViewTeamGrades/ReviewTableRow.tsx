/**
 * ReviewTableRow — renders one rubric item as a table row inside the score heatgrid.
 *
 * Layout (identical to FeedbackTable rows):
 *   - Column 1 (sticky, 52 px): item number + weight badge (circled max-score).
 *     The weight badge is omitted for binary items (maxScore === 1) — a ✓ tick is shown instead.
 *   - Column 2 (sticky, 340 px): full question text. No truncation.
 *   - Columns 3..N: one cell per reviewer, color-coded by score via getColorClass().
 *     Color classes (c1–c5, cf) are declared :global in ViewTeamGrades.module.scss so they
 *     work as plain strings returned by getColorClass().
 *
 * The `rowIndex` prop drives alternating row background (#fff / #f5f5f5).
 * Sticky cells explicitly set `background` to match the row — otherwise scrolling rows
 * bleed through behind the sticky column (a side-effect of borderCollapse:"separate").
 */
import React from "react";
import { getColorClass } from "./heatgridUtils";
import { ReviewData } from "./App";
import styles from "./ViewTeamGrades.module.scss";

interface ReviewTableRowProps {
  row: ReviewData;
  rowIndex: number;
  onReviewClick?: (reviewIndex: number) => void;
}

const STICKY_NO_WIDTH = 68; // wide enough for two-digit item numbers + weight badge on one line
const STICKY_Q_WIDTH  = 340;

const cellBase: React.CSSProperties = {
  padding: "4px 10px",
  verticalAlign: "top",
  border: "1px solid #ddd",
  fontSize: "13px",
  whiteSpace: "normal",
  wordBreak: "break-word",
  position: "relative", // needed for hover tooltip in SCSS
};

const stickyNo = (bg: string): React.CSSProperties => ({
  ...cellBase,
  position: "sticky",
  left: 0,
  zIndex: 3,
  background: bg,
  width: STICKY_NO_WIDTH,
  minWidth: STICKY_NO_WIDTH,
  maxWidth: STICKY_NO_WIDTH,
  textAlign: "center",
  fontWeight: "bold",
  borderRight: "none",
});

const stickyQ = (bg: string): React.CSSProperties => ({
  ...cellBase,
  position: "sticky",
  left: STICKY_NO_WIDTH,
  zIndex: 3,
  background: bg,
  width: STICKY_Q_WIDTH,
  minWidth: STICKY_Q_WIDTH,
  maxWidth: STICKY_Q_WIDTH,
  borderLeft: "1px solid #ddd",
  borderRight: "2px solid #aaa",
});

const reviewerCell: React.CSSProperties = {
  ...cellBase,
  textAlign: "center",
  minWidth: 110,
  width: 110,
};

const ReviewTableRow: React.FC<ReviewTableRowProps> = ({ row, rowIndex, onReviewClick }) => {
  const bg = rowIndex % 2 === 0 ? "#fff" : "#f5f5f5";

  let cellContent;
  // The score cells — build one per reviewer
  const reviewCells = row.reviews.map((review, idx) => {
    let bgClass = 'cf';

    if (review.score !== undefined) {
      bgClass = getColorClass(review.score, row.maxScore);
      cellContent = (
        <span style={{ textDecoration: review.comment ? "underline" : "none", fontWeight: "bold" }}>
          {review.score}
        </span>
      );
    } else if (review.textResponse) {
      bgClass = 'cf';
      cellContent = <span style={{ fontStyle: "italic" }}>{review.textResponse}</span>;
    } else if (review.selections && review.selections.length > 0) {
      cellContent = <span>✓ ({review.selections.length})</span>;
    } else if (review.selectedOption) {
      cellContent = <span>{review.selectedOption}</span>;
    } else if (review.fileName) {
      cellContent = <span style={{ color: "#b00404" }}>📎 {review.fileName}</span>;
    } else {
      cellContent = <span>-</span>;
    }

    return (
      <td
        key={idx}
        className={bgClass}            // c1–c5/cf — :global in CSS module
        data-question={review.comment || undefined}
        style={{
          ...reviewerCell,
          cursor: onReviewClick ? "pointer" : "default",
        }}
        onClick={() => onReviewClick && onReviewClick(idx)}
      >
        {cellContent}
      </td>
    );
  });

  return (
    <tr style={{ background: bg }}>
      <td style={stickyNo(bg)}>
        <div className={styles.itemCell}>
          <span style={{ fontWeight: "bold" }}>{row.itemNumber}</span>
          {row.maxScore !== 1 && (
            <span className={styles.weightCircle}>{row.maxScore}</span>
          )}
        </div>
      </td>
      <td style={stickyQ(bg)}>{row.itemText}</td>
      {reviewCells}
    </tr>
  );
};

export default ReviewTableRow;
