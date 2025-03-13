// Statistics.tsx
import React, { useState, useEffect } from "react";
import { calculateAverages } from "./utils";
import "./grades.scss";
import dummyDataRounds from "./Data/heatMapData.json"; // Importing dummy data for rounds
import dummyauthorfeedback from "./Data/authorFeedback.json"; // Importing dummy data for author feedback
import teammateData from "./Data/teammateData.json";

//props for statistics component
interface StatisticsProps {}

//statistics component
const Statistics: React.FC<StatisticsProps> = () => {
  const [sortedData, setSortedData] = useState<any[]>([]);
  useEffect(() => {
    const { averagePeerReviewScore, columnAverages, sortedData } = calculateAverages(
      dummyDataRounds[0],
      "asc"
    );
    const rowAvgArray = sortedData.map((item) => item.RowAvg);
    console.log(rowAvgArray);
    setSortedData(sortedData.map((item) => item.RowAvg));
  }, []);

  const [statisticsVisible, setstatisticsVisible] = useState<boolean>(false);
  const toggleStatisticsVisibility = () => {
    setstatisticsVisible(!statisticsVisible);
  };
  const [showReviews, setShowReviews] = useState(false);
  const [ShowAuthorFeedback, setShowAuthorFeedback] = useState(false);

  const [roundSelected, setRoundSelected] = useState(-1);

  const selectRound = (r: number) => {
    setRoundSelected((prev) => r);
  };

  // Function to toggle the visibility of ShowReviews component
  const toggleShowReviews = () => {
    setShowReviews((prev) => !prev);
  };

  // Function to toggle the visibility of ShowAuthorFeedback component
  const toggleAuthorFeedback = () => {
    setShowAuthorFeedback((prev) => !prev);
  };

  const headerCellStyle: React.CSSProperties = {
    padding: "10px",
    textAlign: "center",
  };

  //calculation for total reviews recieved
  let totalReviewsForQuestion1: number = 0;
  dummyDataRounds.forEach((round) => {
    round.forEach((question) => {
      if (question.questionNumber === "1") {
        totalReviewsForQuestion1 += question.reviews.length;
      }
    });
  });
  //calculation for total feedback recieved
  let totalfeedbackForQuestion1: number = 0;
  dummyauthorfeedback.forEach((round) => {
    round.forEach((question) => {
      if (question.questionNumber === "1") {
        totalfeedbackForQuestion1 += question.reviews.length;
      }
    });
  });

  const subHeaderCellStyle: React.CSSProperties = {
    padding: "10px",
    textAlign: "center",
  };

  return (
    <div className="table-container mb-6">
      <h5 className="font-semibold">Round Summary</h5>
      <table className="tbl_heat">
        <thead>
          <tr>
            <th>Round</th>
            <th>Submitted Work (Avg)</th>
            <th>Author Feedback (Avg)</th>
            <th>Teammate Review (Avg)</th>
            <th>Final Score</th>
          </tr>
        </thead>
        <tbody>
          {dummyDataRounds.map((roundData, index) => {
            // Calculate averages for each category using data from utils or manually.
            const submittedWorkAvg = calculateAverages(roundData, "asc").averagePeerReviewScore;
            const authorFeedbackAvg =
              dummyauthorfeedback[index]?.reduce((acc, item) => {
                const questionScoreSum = item.reviews.reduce(
                  (sum, review) => sum + review.score,
                  0
                );
                return acc + questionScoreSum / item.reviews.length;
              }, 0) / dummyauthorfeedback[index].length;

            const teammateReviewAvg =
              teammateData[index]?.reviews.reduce((acc, review) => acc + review.score, 0) /
              teammateData[index]?.reviews.length;

            const finalScore = (
              (Number(submittedWorkAvg) + Number(authorFeedbackAvg) + Number(teammateReviewAvg)) /
              3
            ).toFixed(2); // Average of all three categories

            return (
              <tr key={index}>
                <td>Round {index + 1}</td>
                <td>{Number(submittedWorkAvg).toFixed(2)}</td>
                <td>{authorFeedbackAvg?.toFixed(2) || "N/A"}</td>
                <td>{teammateReviewAvg?.toFixed(2) || "N/A"}</td>
                <td>{finalScore}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Statistics;
