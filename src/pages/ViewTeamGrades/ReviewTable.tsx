/**
 * ReviewTable — the main page component for "View Team Grades" (student-facing).
 *
 * Key design decisions made during this implementation:
 *
 * 1. Single API call: the original implementation made 6+ sequential API calls
 *    (view_our_scores, then participants/user/:id, teams_participants/:id/list_participants,
 *    and one /users/:id per team member). All that waterfall was replaced by embedding
 *    `team_members` directly in the `view_our_scores` response on the backend, so the
 *    entire page now loads with one GET /grades/:id/view_our_scores.
 *
 * 2. Scores / Feedback toggle: the original page had a separate review list below the
 *    heatgrid. These were merged into a single content area with a toggle button group —
 *    "Scores" renders the color-coded heatgrid per round; "Feedback" renders FeedbackTable
 *    which shows full question text and reviewer comments side-by-side.
 *
 * 3. Sticky columns on the score heatgrid: the old layout had an optional "Show item
 *    prompts" checkbox that inserted a second column. When checked, the tooltip on the
 *    first column was obscured by the new column. The toggle was removed entirely and the
 *    layout was redesigned to match FeedbackTable — sticky # column (52 px) + sticky
 *    Question column (340 px) with horizontally scrollable reviewer columns.
 *
 * 4. CSS Modules: the old side-effect import `import "./grades.scss"` was converted to
 *    `import styles from "./ViewTeamGrades.module.scss"`. Classes used as plain strings by
 *    other components (c1–c5, score, review-block, etc.) are wrapped in `:global {}` so
 *    they keep their original names after hashing.
 *
 * 5. Reviewer anonymisation: `authUser` from Redux is still used to check whether the
 *    logged-in user is a Student — if so, reviewer names are replaced with "Review N".
 */
import React, { useEffect, useState } from "react";
import ReviewTableRow from "./ReviewTableRow";
import RoundSelector from "./RoundSelector";
import axiosClient from "../../utils/axios_client";
import { calculateAverages, normalizeReviewDataArray, convertBackendRoundArray, isHeader, RoundRow } from "./heatgridUtils";
import { TeamMember } from "./App";
import styles from "./ViewTeamGrades.module.scss";
import { Link, useSearchParams } from "react-router-dom";
import FeedbackTable from "./FeedbackTable";
import { useSelector } from "react-redux";

// Truncatable text component
const TruncatableText: React.FC<{ text: string; wordLimit?: number }> = ({ text, wordLimit = 10 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const words = text.split(" ");
  const shouldTruncate = words.length > wordLimit;
  const displayText = isExpanded || !shouldTruncate
    ? text
    : words.slice(0, wordLimit).join(" ");

  return (
    <span>
      {displayText}
      {shouldTruncate && (
        <span
          onClick={() => setIsExpanded(!isExpanded)}
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

const ReviewTable: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [currentRound, setCurrentRound] = useState<number>(-1);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [roundsData, setRoundsData] = useState<RoundRow[][] | null>(null);
  
  // Get assignment ID from URL query parameter, default to 1
  const assignmentIdFromUrl = searchParams.get("assignmentId");
  const assignmentId = assignmentIdFromUrl ? parseInt(assignmentIdFromUrl, 10) : 1;
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [assignmentName, setAssignmentName] = useState<string>("");
  const [teamName, setTeamName] = useState<string>("");
  const [teamGrade, setTeamGrade] = useState<number | string>("");
  const [teamComment, setTeamComment] = useState<string>("");
  const [submissionLinks, setSubmissionLinks] = useState<string[] | null>(null);
  const [teamFetchError, setTeamFetchError] = useState<string | null>(null);
  // 'scores' renders the color-coded heatgrid; 'feedback' toggles to FeedbackTable which shows full item text and reviewer comments.
  const [viewMode, setViewMode] = useState<'scores' | 'feedback'>('scores');
  const [averageScore, setAverageScore] = useState<string | number | null>(null);
  const authUser = useSelector((state: any) => state.authentication?.user);

  // Re-fetch whenever the assignmentId query parameter changes
  useEffect(() => {
    fetchBackend(assignmentId);
  }, [assignmentId]);




  /**
   * Fetches all data for the page in a single request.
   * The backend embeds `team_members` (name, grade, comment, submission links, member list)
   * directly in the response, eliminating the previous multi-step waterfall that called
   * /participants/user/:id → /teams_participants/:id/list_participants → /users/:id per member.
   */
  const fetchBackend = async (id: number) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await axiosClient.get(`/grades/${id}/view_our_scores`);

      if (res?.data?.reviews_of_our_work) {
        // Populate heatgrid / feedback table
        // backendRoundsObj: the raw API value — a keyed object where each key is a round
        // identifier (e.g. "round_1", "round_2") and each value is an array of review rows.
        const backendRoundsObj = res.data.reviews_of_our_work;
        // Sort by key so rounds appear in chronological order regardless of response order.
        const orderedRounds = Object.keys(backendRoundsObj).sort().map((k) => backendRoundsObj[k]);
        setRoundsData(convertBackendRoundArray(orderedRounds));

        if (res.data.assignment_name) setAssignmentName(res.data.assignment_name);

        // Average score
        if (res.data.avg_score_of_our_work != null) {
          setAverageScore(res.data.avg_score_of_our_work);
        }

        // Team metadata — embedded by the backend, no follow-up requests needed
        const tm = res.data.team_members;
        if (tm) {
          setTeamName(tm.team_name || "");
          setTeamGrade(tm.grade ?? "");
          setTeamComment(tm.comment ?? "");
          setSubmissionLinks(tm.submission_links?.length > 0 ? tm.submission_links : null);
          setTeamMembers(tm.members || []);
        }
      } else {
        setFetchError("No review data returned by backend.");
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        setFetchError("No review data found for this assignment (404). You may not be a participant, or the assignment does not exist.");
      } else if (status === 403) {
        setFetchError("You are not authorized to view reviews for this assignment (403).");
      } else {
        setFetchError(err?.message || "Failed to fetch backend data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoundChange = (roundIndex: number) => {
    setCurrentRound(roundIndex);
  };

  // Column widths shared between the header (defined here) and body rows (defined in ReviewTableRow).
  // These must stay in sync — the table uses tableLayout:"fixed" so widths are set once in the header.
  const STICKY_NO_WIDTH = 68;  // px — wide enough for two-digit item numbers + weight badge on one line
  const STICKY_Q_WIDTH  = 340; // px — question text column

  /**
   * Renders the score heatgrid for a single round.
   * Layout mirrors FeedbackTable exactly: overflowX scroll wrapper, borderCollapse separate,
   * sticky # and Question columns, scrollable color-coded reviewer columns.
   * borderCollapse:"separate" + borderSpacing:0 is required so sticky cells keep an
   * opaque background and don't bleed through when the table scrolls horizontally.
   */
  const renderTable = (roundData: RoundRow[], roundIndex: number) => {
    const normalizedData = normalizeReviewDataArray(roundData);
    const { averagePeerReviewScore, sortedData } = calculateAverages(normalizedData, "none");

    const roundsSource = roundsData || [];

    // Find the first non-header row to determine reviewer count
    const firstScored = normalizedData.find(r => !isHeader(r)) as any;
    const numReviewers = firstScored?.reviews?.length || 0;

    return (
      <div key={roundIndex} style={{ marginBottom: 32 }}>
        <h2>
          Round {roundIndex + 1}
        </h2>

        {/* Horizontally scrollable wrapper — identical to FeedbackTable */}
        <div style={{ overflowX: "auto", position: "relative" }}>
          <table className={styles.tbl_heat} style={{
            borderCollapse: "separate",
            borderSpacing: 0,
            tableLayout: "fixed",
            // width: "max-content" prevents the table from stretching to fill the scroll
            // container, which would cause reviewer columns to widen beyond their fixed 80px.
            width: "max-content",
            minWidth: STICKY_NO_WIDTH + STICKY_Q_WIDTH + numReviewers * 110,
          }}>
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                {/* Sticky: # */}
                <th style={{
                  padding: "8px 10px", border: "1px solid #ddd", fontSize: "13px",
                  position: "sticky", left: 0, zIndex: 5, top: 0,
                  background: "#f0f0f0", fontWeight: "bold",
                  width: STICKY_NO_WIDTH, minWidth: STICKY_NO_WIDTH, maxWidth: STICKY_NO_WIDTH,
                  textAlign: "center", borderRight: "none",
                }}>
                  #
                </th>

                {/* Sticky: Question */}
                <th style={{
                  padding: "8px 10px", border: "1px solid #ddd", fontSize: "13px",
                  position: "sticky", left: STICKY_NO_WIDTH, zIndex: 5, top: 0,
                  background: "#f0f0f0", fontWeight: "bold",
                  width: STICKY_Q_WIDTH, minWidth: STICKY_Q_WIDTH, maxWidth: STICKY_Q_WIDTH,
                  textAlign: "left",
                  borderLeft: "1px solid #ddd", borderRight: "2px solid #aaa",
                }}>
                  Question
                </th>

                {/* Reviewer columns, one for each reviewer */}
                {Array.from({ length: numReviewers }, (_, i) => {
                  const reviewerName = (firstScored as any)?.reviews[i]?.name || `Review ${i + 1}`;
                  const isStudent = authUser?.role === "Student";
                  const displayName = isStudent ? `Review ${i + 1}` : reviewerName;
                  return (
                    <th key={i} style={{
                      padding: "8px 10px", border: "1px solid #ddd", fontSize: "13px",
                      background: "#f0f0f0", fontWeight: "bold",
                      textAlign: "center", width: 110, minWidth: 110,
                    }}>
                      {displayName}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {(() => {
                let scoredRowIdx = 0;
                return sortedData.map((row, index) => {
                  // Render SectionHeader sentinel as a heading row.
                  // Split into two cells so the label stays sticky on horizontal scroll:
                  //   cell 1 — sticky, covers the # col + question col (68 + 340 px)
                  //   cell 2 — colSpan for all reviewer columns, scrolls away
                  if (isHeader(row)) {
                    return (
                      <tr key={`hdr-${index}`}>
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
                  // Scored row — use its own index for alternating background
                  return <ReviewTableRow key={index} row={row} rowIndex={scoredRowIdx++} />;
                });
              })()}
            </tbody>
          </table>
        </div>

        <div style={{
          marginTop: 8,
          padding: "8px 14px",
          background: "#f0f0f0",
          border: "1px solid #ddd",
          borderRadius: 4,
          fontSize: 13,
          display: "inline-block",
        }}>
          <strong>Average peer review score:</strong>{" "}{averagePeerReviewScore}
        </div>
      </div>
    );
  };

  // Convert 0-indexed currentRound to the 1-indexed roundSelected expected by FeedbackTable
  // (-1 = all rounds, 0 → 1, 1 → 2, etc.)
  const feedbackRoundSelected = currentRound === -1 ? -1 : currentRound + 1;

  return (
    <div className={styles['page-wrapper']} style={{ padding: "24px 96px" }}>
      <h2><strong>Summary report{assignmentName ? `: ${assignmentName}` : ""}</strong></h2>
      <p style={{ marginTop: 0, color: "#666", fontSize: "13px" }}>Peer review scores for your team's work</p>
      <h5><strong>Team:</strong> {teamName || "Loading..."}</h5>
      {fetchError && (
        <div className="mb-3">
          <span style={{ color: "red" }}>{fetchError}</span>
        </div>
      )}
      <span className="ml-4">
        Team members:{" "}
        {teamMembers.map((member, index) => (
          <span key={index}>
            {member.name}{member.username && ` (${member.username})`}
            {index !== teamMembers.length - 1 && ", "}
          </span>
        ))}
      </span>
      <div className="ml-4 mt-2">
        <h5><strong>Average score:</strong> <span style={{ fontWeight: "normal", fontSize: "inherit" }}>{averageScore || "N/A"}</span></h5>
      </div>
      <div className="mt-2">
        <h5><strong>Submission links</strong></h5>
        {submissionLinks && submissionLinks.length > 0 ? (
          <ul>
            {submissionLinks.map((l, i) => (
              <li key={i}>
                <a href={l} target="_blank" rel="noopener noreferrer">{l}</a>
              </li>
            ))}
          </ul>
        ) : (
          <em>No submission links found for this team.</em>
        )}
        {teamFetchError && (
          <div style={{ color: "red", marginTop: 8, whiteSpace: "pre-wrap" }}>{teamFetchError}</div>
        )}
      </div>

      <br />

      {/* Round selector + Scores/Feedback toggle in one toolbar row */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "12px" }}>
        <RoundSelector currentRound={currentRound} handleRoundChange={handleRoundChange} roundsData={roundsData} />

        {/* Scores / Feedback toggle — height matches the round dropdown (36px) */}
        <div style={{
          display: "flex",
          border: "2px solid #b00404",
          borderRadius: "0.375rem",
          overflow: "hidden",
          height: "36px",
        }}>
          {(["scores", "feedback"] as const).map((mode, i) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: "0 18px",
                height: "100%",
                fontWeight: "bold",
                fontSize: "14px",
                fontFamily: "verdana, arial, helvetica, sans-serif",
                cursor: "pointer",
                border: "none",
                borderLeft: i === 1 ? "2px solid #b00404" : "none",
                background: viewMode === mode ? "#b00404" : "transparent",
                color: viewMode === mode ? "white" : "#b00404",
                transition: "background 0.2s, color 0.2s",
                minWidth: "90px",
              }}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main content area — toggled by Scores/Feedback */}
      {roundsData && roundsData.length > 0 ? (
        viewMode === 'scores' ? (
          currentRound === -1
            ? roundsData.map((roundData: any, index: number) => renderTable(roundData, index))
            : renderTable(roundsData[currentRound], currentRound)
        ) : (
          <FeedbackTable data={roundsData} roundSelected={feedbackRoundSelected} />
        )
      ) : (
        <div style={{ padding: "20px", textAlign: "center" }}>
          {isLoading ? "Loading review data..." : "No review data available. Please load an assignment."}
        </div>
      )}

      {(teamGrade || teamComment) && (
        <div className="mt-4">
          <h2>Grade and Comment for Submission</h2>
          {teamGrade && <p>Grade: {teamGrade}</p>}
          {teamComment && <p>Comment: <TruncatableText text={teamComment} wordLimit={50} /></p>}
        </div>
      )}

      <Link to="/">Back</Link>
    </div>
  );
};

export default ReviewTable;
