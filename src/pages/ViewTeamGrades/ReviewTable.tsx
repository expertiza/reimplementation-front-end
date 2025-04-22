import React, { useEffect, useState } from "react";
import ReviewTableRow from "./ReviewTableRow";
import RoundSelector from "./RoundSelector";
import { calculateAverages } from "./utils";
import "./grades.scss";
import { Link } from "react-router-dom";
import Statistics from "./Statistics";
import Filters from "./Filters";
import ShowReviews from "./ShowReviews"; 
import mockData from "mock/api_output_3.json"; // Replace later with real fetch
import mockData1 from "mock/api_output_2.json" // Replace later with real fetch
import mockData2 from "mock/api_output_1.json" // Replace later with real fetch

const ReviewTable: React.FC = () => {
  const [currentRound, setCurrentRound] = useState<number>(-1);
  const [sortOrderRow, setSortOrderRow] = useState<"asc" | "desc" | "none">("none");  
  const [showToggleQuestion, setShowToggleQuestion] = useState(false);
  const [roundSelected, setRoundSelected] = useState(-1);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => {
      const apiData = mockData; // Replace with real API fetch later
      const apiData1 = mockData1; // Replace with real API fetch later
      const apiData2 = mockData2; // Replace with real API fetch later

      setData({
        questions: apiData.questions?.review1 || [],
        summary: apiData.summary || {},
        avg_scores_by_round: apiData.avg_scores_by_round || {},
        avg_scores_by_criterion: apiData.avg_scores_by_criterion || {},
        review_score_count: apiData2.review_score_count || 0,
        participant: apiData1.participant || {},
        assignment: apiData.assignment || {},
        roundsOfReviews: apiData.assignment?.rounds_of_reviews || 1,
      });
    }, 1000); // Simulate delay
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  const toggleSortOrderRow = () => {
    setSortOrderRow((prevSortOrder) => {
      if (prevSortOrder === "asc") return "desc";
      if (prevSortOrder === "desc") return "none";
      return "asc";
    });
  };

  const handleRoundChange = (roundIndex: number) => {
    setCurrentRound(roundIndex);
  };

  const toggleShowQuestion = () => {
    setShowToggleQuestion(!showToggleQuestion);
  };

  const generateRoundData = () => {
    const participantId = "1"; // Assuming participant 1
    const reviewerComments = data.summary?.[participantId] || {}; // question -> comments array
    const avgScoresByCriterion = data.avg_scores_by_criterion?.[participantId] || {}; // question -> avg score
  
    return data.questions.map((q: any) => {
      const comments = reviewerComments[q.txt] || [];
      const avgScore = avgScoresByCriterion[q.txt] ?? 0; 
  
      return {
        questionNumber: q.id,
        questionText: q.txt,
        reviews: comments.map((comment: string) => ({
          score: avgScore / 100, 
          comment: comment,
        })),
        RowAvg: avgScore / 100,
        maxScore: 5,
      };
    });
  };

  const getReviewScoreCount = () => {
    if (data?.summary && data.summary["1"]) {
      return Object.keys(data.summary["1"]).length;
    }
    return 0;
  };

  const renderTable = (roundData: any[], roundIndex: number) => {
    const { averagePeerReviewScore, columnAverages, sortedData } = calculateAverages(
      roundData,
      sortOrderRow
    );

    return (
      <div key={roundIndex} className="table-container mb-6">
        <h4 className="text-xl font-semibold">
          Review (Round: {roundIndex + 1})
        </h4>
        <table className="tbl_heat">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 text-center" style={{ width: "70px" }}>
                Question No.
              </th>
              {showToggleQuestion && (
                <th className="py-2 px-4 text-center" style={{ width: "150px" }}>
                  Question
                </th>
              )}
              {Array.from({ length: roundData[0].reviews.length }, (_, i) => (
                <th key={i} className="py-2 px-4 text-center">{`Review ${i + 1}`}</th>
              ))}
              <th className="py-2 px-4" style={{ width: "70px" }} onClick={toggleSortOrderRow}>
                Average
                {sortOrderRow === "none" && <span>▲▼</span>}
                {sortOrderRow === "asc" && <span> ▲</span>}
                {sortOrderRow === "desc" && <span> ▼</span>}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <ReviewTableRow key={index} row={row} showToggleQuestion={showToggleQuestion} />
            ))}
            <tr className="no-bg">
              <td className="py-2 px-4">Avg</td>
              {showToggleQuestion && <td></td>}
              {columnAverages.map((avg, index) => (
                <td key={index} className="py-2 px-4 text-center">
                  {avg.toFixed(2)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <br />
        <h5>
          Average peer review score:{" "}
          <span style={{ fontWeight: "normal" }}>{averagePeerReviewScore}</span>
        </h5>
        <br />
      </div>
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Summary Report: {data.assignment?.name || "Assignment"}</h2>

      <Statistics 
        avg_scores_by_round={data.avg_scores_by_round}
        avg_scores_by_criterion={data.avg_scores_by_criterion}
        review_score_count={getReviewScoreCount()}
        summary={data.summary}
      />

      <br />

      <RoundSelector
        currentRound={currentRound}
        handleRoundChange={handleRoundChange}
        roundsOfReviews={data.roundsOfReviews}
      />

      <div className="toggle-container">
        <input
          type="checkbox"
          id="toggleQuestion"
          name="toggleQuestion"
          checked={showToggleQuestion}
          onChange={toggleShowQuestion}
        />
        <label htmlFor="toggleQuestion"> &nbsp;Toggle Question List</label>
      </div>

      {/* Render tables */}
      {currentRound === -1
        ? [0].map((_, index) => renderTable(generateRoundData(), index))
        : renderTable(generateRoundData(), currentRound)}

      <div>
        <Filters
          toggleShowReviews={() => {}}
          toggleAuthorFeedback={() => {}}
          selectRound={setRoundSelected}
        />
      </div>

      <div>
        <ShowReviews
          questions={data.questions}
          summary={data.summary}
          roundSelected={roundSelected}
          avg_scores_by_criterion={data.avg_scores_by_criterion}
        />
      </div>

      <div className="mt-4">
        <h3>Grade and comment for submission</h3>
        <p>
          Grade: {data.participant?.grade ?? "N/A"}
          <br />
          Comment: No Comment Available
          <br />
          Late Penalty: No Late Penalty
        </p>
      </div>

      <Link to="/">Back</Link>
    </div>
  );
};

export default ReviewTable;