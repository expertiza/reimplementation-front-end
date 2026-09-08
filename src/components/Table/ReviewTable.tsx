/**
 * FeedbackTable — the "Feedback" view of the ViewTeamGrades page. The page offers two
 * views toggled by the user: "Scores" renders a color-coded heatgrid (ReviewTable); this
 * view replaces it with a detailed table that shows each rubric item's full text alongside
 * every reviewer's score and comment. Renders one sub-table per review round. The # and
 * Item columns are sticky (they stay put while you scroll) so the item number and text remain
 * visible when there are many reviewer columns.
 */
import React from "react";
import { ReviewData, SectionHeaderData } from "../../pages/ViewTeamGrades/App";
import { scoreToColor, isHeader, RoundRow } from "../../utils/heatgridUtils";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

interface ReviewTableProps {
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

/** Styles for the sticky "#" (item number) column — pinned to the left edge so it stays visible during horizontal scroll. */
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
  borderRight: "none",
};

/** Styles for the sticky "Item" (question text) column — pinned just right of stickyNo so both columns stay visible during horizontal scroll. */
const stickyQ: React.CSSProperties = {
  ...cellBase,
  position: "sticky",
  left: STICKY_NO_WIDTH,
  zIndex: 3,
  background: "#fff",
  width: STICKY_Q_WIDTH,
  minWidth: STICKY_Q_WIDTH,
  maxWidth: STICKY_Q_WIDTH,
  borderLeft: "1px solid #ddd",
  borderRight: "2px solid #aaa",
};

/** Styles for each reviewer's answer column — wide enough to show a score badge plus a multi-line comment. */
const reviewerCell: React.CSSProperties = {
  ...cellBase,
  minWidth: 260,
  maxWidth: 380,
  verticalAlign: "top",
};

/** Color-coded score badge — circular, background relative to observed data range */
const ScoreBubble: React.FC<{ score: number; maxScore: number; dataMin?: number; dataMax?: number }> = ({ score, maxScore, dataMin, dataMax }) => (
  <span
    style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 24, height: 24, borderRadius: "50%",
      backgroundColor: scoreToColor(score, maxScore, 0, dataMin, dataMax),
      fontWeight: "bold", fontSize: "13px", color: "black",
    }}
  >
    {score}
  </span>
);

const RoundFeedbackTable: React.FC<{ roundData: RoundRow[]; roundIndex: number; totalRounds: number; isStudent: boolean }> = ({
  roundData,
  roundIndex,
  totalRounds,
  isStudent,
}) => {
  if (!roundData || roundData.length === 0) return null;
  const firstScored = roundData.find(r => !isHeader(r)) as ReviewData | undefined;
  const numReviewers = firstScored?.reviews.length ?? 0;

  // Relative coloring: map colors to the actual observed score range in this round.
  const allScores = (roundData as any[]).flatMap((r: any) =>
    Array.isArray(r.reviews) ? r.reviews.map((rv: any) => rv.score).filter((s: any) => typeof s === "number") : []
  );
  const dataMin = allScores.length ? Math.min(...allScores) : undefined;
  const dataMax = allScores.length ? Math.max(...allScores) : undefined;

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ marginBottom: 8 }}>Round {roundIndex + 1}</h2>

      {/* Outer wrapper with horizontal scroll */}
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
              <th style={{ ...stickyNo, background: "#f0f0f0", zIndex: 5, top: 0, fontWeight: "bold" }}>
                #
              </th>

              {/* Sticky header: Question */}
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
              {Array.from({ length: numReviewers }, (_, i) => {
                const reviewerName = (firstScored?.reviews[i] as any)?.name || `Review ${i + 1}`;
                const displayName = isStudent ? `Review ${i + 1}` : reviewerName;
                return (
                  <th key={i} style={{ ...reviewerCell, background: "#f0f0f0", fontWeight: "bold", textAlign: "center" }}>
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
                      <td colSpan={numReviewers} style={{ background: "#fff", borderBottom: "1px solid #ddd" }} />
                    </tr>
                  );
                }

                // scoredRowIdx counts only data rows (headers are skipped above), so alternating
                // background colors are based on rubric-item rows only and don't reset per section.
                const rowIdx = scoredRowIdx++;
                const bg = rowIdx % 2 === 0 ? "#fff" : "#f5f5f5";
                return (
                  <tr key={idx} style={{ background: bg }}>
                    {/* Sticky: # — explicit opaque background prevents scrolling rows bleeding through */}
                    <td style={{ ...stickyNo, background: bg }}>
                      {row.itemNumber}
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
                              <ScoreBubble score={review.score} maxScore={row.maxScore} dataMin={dataMin} dataMax={dataMax} />
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
                            {review.selections.map((s, si) => <li key={si}>{s}</li>)}
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

/**
 * ReviewTable — renders one sub-table per review round showing each rubric item's
 * full text alongside every reviewer's score and comment. Students see anonymized
 * reviewer labels ("Review 1", "Review 2", …"); instructors see actual reviewer names.
 */
const ReviewTable: React.FC<ReviewTableProps> = ({ data, roundSelected }) => {
  const role = useSelector((state: RootState) => state.authentication.user?.role);
  const isStudent = role === "Student";

  if (!data || data.length === 0) {
    return <div style={{ color: "#888", padding: 16 }}>No feedback data available.</div>;
  }

  return (
    <div>
      {data.map((roundData: RoundRow[], roundIndex: number) => {
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

export default ReviewTable;
