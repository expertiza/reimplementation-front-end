/**
 * FeedbackTable — the "Feedback" view of the ViewTeamGrades page. The page offers two
 * views toggled by the user: "Scores" renders a color-coded heatgrid (ReviewTable); this
 * view replaces it with a detailed table that shows each rubric item's full text alongside
 * every reviewer's score and comment. Renders one sub-table per review round. The # and
 * Item columns are sticky (they stay put while you scroll) so the item number and text remain
 * visible when there are many reviewer columns.
 */
import React from "react";
import { ReviewData, SectionHeaderData } from "./App";
import { getColorClass, isHeader, RoundRow } from "./heatgridUtils";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import styles from "./ViewTeamGrades.module.scss";

interface FeedbackTableProps {
  /** All rounds of review data — each round is a mixed array of ReviewData and SectionHeaderData */
  data: RoundRow[][];
  /**
   * -1 = show all rounds
   *  0 = round 1 only
   *  1 = round 2 only
   */
  roundSelected: number;
}

const STICKY_NO_WIDTH = 68;   // px — wide enough for two-digit item numbers + weight badge on one line
const STICKY_Q_WIDTH  = 340;  // px — the Question column

const cellBase: React.CSSProperties = {
  padding: "8px 10px",
  verticalAlign: "top",
  border: "1px solid #ddd",
  fontSize: "13px",
  whiteSpace: "normal",
  wordBreak: "break-word",
};

const stickyNo: React.CSSProperties = {
  ...cellBase,
  position: "sticky",
  left: 0,
  zIndex: 3,
  background: "#fff",
  width: STICKY_NO_WIDTH,
  minWidth: STICKY_NO_WIDTH,
  maxWidth: STICKY_NO_WIDTH,
  textAlign: "center",
  fontWeight: "bold",
  // no right border here — the Question column's left border provides the single divider
  borderRight: "none",
};

const stickyQ: React.CSSProperties = {
  ...cellBase,
  position: "sticky",
  left: STICKY_NO_WIDTH,
  zIndex: 3,
  background: "#fff",
  width: STICKY_Q_WIDTH,
  minWidth: STICKY_Q_WIDTH,
  maxWidth: STICKY_Q_WIDTH,
  borderLeft: "1px solid #ddd",   // single line between # and Question
  borderRight: "2px solid #aaa",  // strong separator before reviewer columns
};

const reviewerCell: React.CSSProperties = {
  ...cellBase,
  minWidth: 260,
  maxWidth: 380,
  verticalAlign: "top",
};

/** Score displayed with a color that reflects its relative weight (see getColorClass). */
const ColoredScore: React.FC<{ score: number; maxScore: number }> = ({ score, maxScore }) => (
  <span
    className={`score ${getColorClass(score, maxScore)}`}
    style={{ fontWeight: "bold", fontSize: "13px" }}
  >
    {score}
  </span>
);

/** One per-round feedback table */
const RoundFeedbackTable: React.FC<{ roundData: RoundRow[]; roundIndex: number; totalRounds: number; isStudent: boolean }> = ({
  roundData,
  roundIndex,
  totalRounds,
  isStudent,
}) => {
  if (!roundData || roundData.length === 0) return null;
  // Find the first scored row (skip any leading SectionHeader) to get reviewer count
  const firstScored = roundData.find(r => !isHeader(r)) as ReviewData | undefined;
  const numReviewers = firstScored?.reviews.length ?? 0;

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ marginBottom: 8 }}>Round {roundIndex + 1}</h2>

      {/* Outer wrapper: scrolls horizontally if there are too many reviewer columns to fit in the window */}
      <div style={{ overflowX: "auto", position: "relative" }}>
        <table
          style={{
            borderCollapse: "separate",
            borderSpacing: 0,
            tableLayout: "fixed",
            width: "max-content",
            minWidth: STICKY_NO_WIDTH + STICKY_Q_WIDTH + numReviewers * 280,
          }}
        >
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              {/* Sticky header: # — z-index 5 so it stays above body sticky cells (z-index 3) */}
              <th
                style={{
                  ...stickyNo,
                  background: "#f0f0f0",
                  zIndex: 5,
                  top: 0,
                  fontWeight: "bold",
                }}
              >
                #
              </th>

              {/* Sticky header: Item */}
              <th
                style={{
                  ...stickyQ,
                  background: "#f0f0f0",
                  zIndex: 5,
                  top: 0,
                  fontWeight: "bold",
                }}
              >
                Item
              </th>

              {/* One column per reviewer */}
              {Array.from({ length: numReviewers }, (_, i) => {
                const reviewerName = (firstScored?.reviews[i] as any)?.name || `Review ${i + 1}`;
                const displayName = isStudent ? `Review ${i + 1}` : reviewerName;
                return (
                  <th
                    key={i}
                    style={{
                      ...reviewerCell,
                      background: "#f0f0f0",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    {displayName}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {(() => {
              let scoredRowIdx = 0;
              return roundData.map((row, idx) => {
                // SectionHeader sentinel → heading row with sticky label.
                // Split into two cells so the label stays fixed on horizontal scroll:
                //   cell 1 — sticky, covers the # col + question col (68 + 340 px)
                //   cell 2 — colSpan for all reviewer columns, scrolls away
                if (isHeader(row)) {
                  return (
                    <tr key={`hdr-${idx}`}>
                      <td
                        colSpan={2}
                        style={{
                          padding: "6px 14px",
                          background: "#fff",
                          fontWeight: "bold",
                          fontSize: "14px",
                          fontFamily: "verdana, arial, helvetica, sans-serif",
                          color: "#986633",
                          position: "sticky",
                          left: 0,
                          zIndex: 4,
                          width: STICKY_NO_WIDTH + STICKY_Q_WIDTH,
                          minWidth: STICKY_NO_WIDTH + STICKY_Q_WIDTH,
                        }}
                      >
                        {row.txt}
                      </td>
                      <td
                        colSpan={numReviewers}
                        style={{ background: "#fff", borderBottom: "1px solid #ddd" }}
                      />
                    </tr>
                  );
                }

                // scoredRowIdx counts only data rows (headers are skipped above), so alternating
                // background colors are based on rubric-item rows only and don't reset per section.
                const rowIdx = scoredRowIdx++;
                const bg = rowIdx % 2 === 0 ? "#fff" : "#f5f5f5";
                return (
                  <tr key={idx} style={{ background: bg }}>
                    {/* Sticky: # with circled max-score badge (omitted for binary maxScore===1 items) */}
                    <td style={{ ...stickyNo, background: bg }}>
                      <div className={styles.itemCell}>
                        <span style={{ fontWeight: "bold" }}>{row.itemNumber}</span>
                        {row.maxScore !== 1 && (
                          <span className={styles.weightCircle}>{row.maxScore}</span>
                        )}
                      </div>
                    </td>

                    {/* Sticky: Question text */}
                    <td style={{ ...stickyQ, background: bg }}>
                      {row.itemText}
                    </td>

                    {/* Reviewer answer columns */}
                    {row.reviews.map((review, revIdx) => (
                      <td key={revIdx} style={reviewerCell}>
                        {review.score !== undefined ? (
                          <>
                            <div>
                              <ColoredScore score={review.score} maxScore={row.maxScore} />
                            </div>
                            {review.comment && (
                              <div style={{ marginTop: 5, color: "#444", fontSize: "12px" }}>
                                {review.comment}
                              </div>
                            )}
                          </>
                        ) : review.textResponse ? (
                          <div style={{ color: "#444", fontSize: "12px", fontStyle: "italic" }}>
                            {review.textResponse}
                          </div>
                        ) : review.selections ? (
                          <ul style={{ margin: "4px 0", paddingLeft: 16, fontSize: "12px" }}>
                            {review.selections.map((s, si) => (
                              <li key={si}>{s}</li>
                            ))}
                          </ul>
                        ) : review.selectedOption ? (
                          <div style={{ fontSize: "12px", fontWeight: "bold" }}>{review.selectedOption}</div>
                        ) : review.fileName ? (
                          <div style={{ fontSize: "12px", color: "#b00404" }}>
                            {review.fileUrl ? (
                              <a href={review.fileUrl} target="_blank" rel="noopener noreferrer">
                                📎 {review.fileName}
                              </a>
                            ) : (
                              <span>📎 {review.fileName}</span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "#bbb", fontSize: "12px" }}>—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FeedbackTable: React.FC<FeedbackTableProps> = ({ data, roundSelected }) => {
  const role = useSelector((state: RootState) => state.authentication.user?.role);
  const isStudent = role === "Student";

  if (!data || data.length === 0) {
    return <div style={{ color: "#888", padding: 16 }}>No feedback data available.</div>;
  }

  return (
    <div>
      {data.map((roundData: RoundRow[], roundIndex: number) => {
        // roundSelected: -1 = all, otherwise 1-indexed round number
        if (roundSelected !== -1 && roundIndex !== roundSelected - 1) return null;
        return (
          <RoundFeedbackTable
            key={roundIndex}
            roundData={roundData}
            roundIndex={roundIndex}
            totalRounds={data.length}
            isStudent={isStudent}
          />
        );
      })}
    </div>
  );
};

export default FeedbackTable;
