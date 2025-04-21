import React from "react";

interface StatisticsProps {
  avg_scores_by_round: Record<string, number>;
  avg_scores_by_criterion: Record<string, Record<string, number>>;
  review_score_count: number;
  summary: Record<string, Record<string, string[]>>;
}

const Statistics: React.FC<StatisticsProps> = ({
  avg_scores_by_round,
  avg_scores_by_criterion,
  review_score_count,
  summary,
}) => {
  const headerCellStyle: React.CSSProperties = {
    padding: "8px",
    backgroundColor: "#f2f2f2",
    fontWeight: "bold",
    border: "1px solid black",
  };

  const subHeaderCellStyle: React.CSSProperties = {
    padding: "8px",
    backgroundColor: "#ffffff",
    fontWeight: "normal",
    border: "1px solid black",
  };

  // Calculate total number of reviews for the first question
  const totalReviewsForQuestion1 = Object.values(summary).reduce((sum, reviewee) => {
    return sum + (reviewee["What is the main purpose of this feature?"]?.length || 0);
  }, 0);

  return (
    <div className="table-container">
      <h2>Review Statistics</h2>

      <p>Total Reviews for Question 1: {totalReviewsForQuestion1}</p>
      <p>Review Score Count: {review_score_count}</p>

      <table className="tbl_heat">
        <thead>
          <tr>
            <th style={headerCellStyle}>Round</th>
            <th style={headerCellStyle}>Submitted Work (Avg)</th>
            <th style={headerCellStyle}>Author Feedback (Avg)</th>
            <th style={headerCellStyle}>Teammate Review (Avg)</th>
            <th style={headerCellStyle}>Final Score</th>
          </tr>
        </thead>
        <tbody>
        {Object.entries(avg_scores_by_round).map(([round, submittedAvg]) => {
            const submittedWorkAvg = submittedAvg; // always a number

            const finalScore = submittedWorkAvg ?? "N/A"; // <-- this fixes the error

            return (
              <tr key={round}>
                <td style={subHeaderCellStyle}>{`Round ${round}`}</td>
                <td style={subHeaderCellStyle}>{submittedWorkAvg}</td>
                <td style={subHeaderCellStyle}>N/A</td>
                <td style={subHeaderCellStyle}>N/A</td>
                <td style={subHeaderCellStyle}>{finalScore}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Statistics;