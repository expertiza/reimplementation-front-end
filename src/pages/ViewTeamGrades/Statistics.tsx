// Statistics.tsx
import React, { useEffect } from "react";
import { calculateAverages, normalizeReviewDataArray } from "./utils";
import "./grades.scss";

//props for statistics component
interface StatisticsProps {
  roundsSource?: any[] | null;
}

//statistics component
const Statistics: React.FC<StatisticsProps> = ({ roundsSource = null }) => {
  useEffect(() => {
    // Recompute stats whenever roundsSource changes (so backend-provided rounds are honored)
    if (!roundsSource || roundsSource.length === 0) {
      return;
    }

    // Use the first round as a reference for the stats calculation (legacy behaviour preserved)
    const firstRound = roundsSource[0] || [];
    const normalizedData = normalizeReviewDataArray(firstRound);
    const { sortedData } = calculateAverages(
      normalizedData,
      "asc"
    );
    const rowAvgArray = sortedData.map((item) => item.RowAvg);
    console.log(rowAvgArray);
  }, [roundsSource]);

  // Statistics component focuses on rendering round summary. No local UI toggles required currently.
  
  if (!roundsSource || roundsSource.length === 0) {
    return null; // Don't render if no data available
  }

  return (
    <div className="table-container mb-6">
      <h5>Round Summary</h5>
      <table className="tbl_heat">
        <thead>
          <tr>
            <th>Round</th>
            <th>Submitted work (avg)</th>
            <th>Author feedback (avg)</th>
            <th>Teammate review (avg)</th>
          </tr>
        </thead>
        <tbody>
          {roundsSource.length > 0 ? (
            roundsSource.map((roundData: any, index: number) => {
              // Normalize data to handle both old and new field names
              const normalizedData = normalizeReviewDataArray(roundData);
              // Calculate averages for each category using data from utils or manually.
              const submittedWorkAvg = calculateAverages(normalizedData, "asc").averagePeerReviewScore;

              return (
                <tr key={index}>
                  <td>Round {index + 1}</td>
                  <td>{Number(submittedWorkAvg).toFixed(2)}</td>
                  <td>N/A</td>
                  <td>N/A</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", fontStyle: "italic" }}>
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Statistics;
