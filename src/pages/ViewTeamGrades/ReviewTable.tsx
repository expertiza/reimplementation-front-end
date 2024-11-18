import React, { useEffect, useState } from "react";
import ReviewTableRow from "./ReviewTableRow";
import RoundSelector from "./RoundSelector";
import dummyDataRounds from "./Data/heatMapData.json";
import dummyData from "./Data/dummyData.json";
import { calculateAverages, getColorClass } from "./utils";
import "./grades.scss";
import { Link } from "react-router-dom";
import Statistics from "./Statistics";
import Filters from "./Filters";
import ShowReviews from "./ShowReviews"; //importing show reviews component
import dummyauthorfeedback from "./Data/authorFeedback.json"; // Importing dummy data for author feedback

const ReviewTable: React.FC = () => {
  const [currentRound, setCurrentRound] = useState<number>(-1);
  const [sortOrderRow, setSortOrderRow] = useState<"asc" | "desc" | "none">("none");
  const [showToggleQuestion, setShowToggleQuestion] = useState(false);
  const [open, setOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [showReviews, setShowReviews] = useState(false);
  const [ShowAuthorFeedback, setShowAuthorFeedback] = useState(false);
  const [roundSelected, setRoundSelected] = useState(-1);

  useEffect(() => {
    setTeamMembers(dummyData.members);
  }, []);

  const toggleSortOrderRow = () => {
    setSortOrderRow((prevSortOrder) => {
      if (prevSortOrder === "asc") return "desc";
      if (prevSortOrder === "desc") return "none";
      return "asc";
    });
  };

  const toggleShowReviews = () => {
    setShowReviews((prev) => !prev);
  };

  const selectRound = (r: number) => {
    setRoundSelected((prev) => r);
  };

  // Function to toggle the visibility of ShowAuthorFeedback component
  const toggleAuthorFeedback = () => {
    setShowAuthorFeedback((prev) => !prev);
  };

  const handleRoundChange = (roundIndex: number) => {
    setCurrentRound(roundIndex);
  };

  const toggleShowQuestion = () => {
    setShowToggleQuestion(!showToggleQuestion);
  };

  const renderTable = (roundData: any, roundIndex: number) => {
    const { averagePeerReviewScore, columnAverages, sortedData } = calculateAverages(
      roundData,
      sortOrderRow
    );

    return (
      <div key={roundIndex} className="table-container mb-6">
        <h4 className="text-xl font-semibold">
          Review (Round: {roundIndex + 1} of {dummyDataRounds.length})
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
                <th key={i} className="py-2 px-4 text-center" style={{ width: "70px" }}>{`Review ${
                  i + 1
                }`}</th>
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
              <td className="py-2 px-4" style={{ width: "70px" }}>
                Avg
              </td>
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
      <h2 className="text-2xl font-bold mb-2">Summary Report: Program 2</h2>
      <h5 className="text-xl font-semibold mb-1">Team: {dummyData.team}</h5>
      <span className="ml-4">
        Team members:{" "}
        {teamMembers.map((member, index) => (
          <span key={index}>
            {member}
            {index !== teamMembers.length - 1 && ", "}
          </span>
        ))}
      </span>
      <div className="mt-2">
        <h5>Submission Links</h5>
        <ul>
          <li>
            <a
              href="https://github.ncsu.edu/Program-2-Ruby-on-Rails/WolfEvents"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://github.ncsu.edu/Program-2-Ruby-on-Rails/WolfEvents
            </a>
          </li>
          <li>
            <a href="http://152.7.177.44:8080/" target="_blank" rel="noopener noreferrer">
              http://152.7.177.44:8080/
            </a>
          </li>
          <li>
            <a
              href="https://github.ncsu.edu/Program-2-Ruby-on-Rails/WolfEvents/raw/main/README.md"
              download="README.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              README.md
            </a>
          </li>
        </ul>
      </div>

      <Statistics />

      <br />

      <RoundSelector currentRound={currentRound} handleRoundChange={handleRoundChange} />

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

      {/* Conditionally render tables based on currentRound */}
      {currentRound === -1
        ? dummyDataRounds.map((roundData, index) => renderTable(roundData, index)) // Render a table for each round if "All Rounds" is selected
        : renderTable(dummyDataRounds[currentRound], currentRound)}

      <div>
        <Filters
          toggleShowReviews={toggleShowReviews}
          toggleAuthorFeedback={toggleAuthorFeedback}
          selectRound={selectRound}
        />
      </div>

      <div>
        {showReviews && (
          <div>
            <h2>Reviews</h2>
            <ShowReviews data={dummyDataRounds} roundSelected={roundSelected} />
          </div>
        )}
        {ShowAuthorFeedback && (
          <div>
            <h2>Author Feedback</h2>
            <ShowReviews data={dummyauthorfeedback} roundSelected={roundSelected} />
          </div>
        )}
      </div>

      <p className="mt-4">
        <h3>Grade and comment for submission</h3>
        Grade: {dummyData.grade}
        <br />
        Comment: {dummyData.comment}
        <br />
        Late Penalty: {dummyData.late_penalty}
        <br />
      </p>

      <Link to="/">Back</Link>
    </div>
  );
};

export default ReviewTable;
