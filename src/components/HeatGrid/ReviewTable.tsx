import React, { useEffect, useState } from "react";
import RoundSelector from "./RoundSelector";
import dummyDataRounds from "../../pages/ViewTeamGrades/Data/heatMapData.json";
import dummyData from "../../pages/ViewTeamGrades/Data/dummyData.json";
import "../../pages/ViewTeamGrades/grades.scss";
import { Link } from "react-router-dom";
import Statistics from "./Statistics";
import Filters from "./Filters";
import ShowReviews from "./ShowReviews";
import dummyauthorfeedback from "../../pages/ViewTeamGrades/Data/authorFeedback.json";
import ReviewTableContent from "./ReviewTableContent";

interface ReviewTableProps {
  currentUser?: { id: string };
  project?: { student: { id: string } };
}

const ReviewTable: React.FC<ReviewTableProps> = ({ currentUser, project }) => {
  const [currentRound, setCurrentRound] = useState<number>(-1);
  const [sortOrderRow, setSortOrderRow] = useState<"asc" | "desc" | "none">("none");
  const [sortByTotalScore, setSortByTotalScore] = useState<"asc" | "desc" | "none">("none");
  const [showToggleQuestion, setShowToggleQuestion] = useState(false);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [showReviews, setShowReviews] = useState(false);
  const [ShowAuthorFeedback, setShowAuthorFeedback] = useState(false);
  const [roundSelected, setRoundSelected] = useState(-1);

  useEffect(() => {
    setTeamMembers(dummyData.members);
  }, []);

  const toggleSortOrderRow = () => {
    setSortOrderRow((prev) =>
      prev === "asc" ? "desc" : prev === "desc" ? "none" : "asc"
    );
  };

  const toggleSortByTotalScore = () => {
    setSortByTotalScore((prev) =>
      prev === "asc" ? "desc" : prev === "desc" ? "none" : "asc"
    );
  };

  const toggleShowReviews = () => setShowReviews((prev) => !prev);
  const toggleAuthorFeedback = () => setShowAuthorFeedback((prev) => !prev);
  const selectRound = (r: number) => setRoundSelected(r);
  const toggleShowQuestion = () => setShowToggleQuestion(!showToggleQuestion);
  const handleRoundChange = (roundIndex: number) => setCurrentRound(roundIndex);

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
      

      {/* Render Round(s) */}
      {currentRound === -1
        ? dummyDataRounds.map((roundData, index) => (
            <ReviewTableContent
              key={index}
              roundData={roundData}
              roundIndex={index}
              currentUser={currentUser}
              project={project}
              sortOrderRow={sortOrderRow}
              toggleSortOrderRow={toggleSortOrderRow}
              sortByTotalScore={sortByTotalScore}
              toggleSortByTotalScore={toggleSortByTotalScore}
              showToggleQuestion={showToggleQuestion}
              toggleShowQuestion={toggleShowQuestion}
            />
          ))
        : (
            <ReviewTableContent
              roundData={dummyDataRounds[currentRound]}
              roundIndex={currentRound}
              currentUser={currentUser}
              project={project}
              sortOrderRow={sortOrderRow}
              toggleSortOrderRow={toggleSortOrderRow}
              sortByTotalScore={sortByTotalScore}
              toggleSortByTotalScore={toggleSortByTotalScore}
              showToggleQuestion={showToggleQuestion}
              toggleShowQuestion={toggleShowQuestion}
            />
          )}

      <Filters
        toggleShowReviews={toggleShowReviews}
        toggleAuthorFeedback={toggleAuthorFeedback}
        selectRound={selectRound}
      />

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

      <div className="mt-4">
        <h3>Grade and comment for submission</h3>
        Grade: {dummyData.grade}
        <br />
        Comment: {dummyData.comment}
        <br />
        Late Penalty: {dummyData.late_penalty}
        <br />
      </div>

      <Link to="/">Back</Link>
    </div>
  );
};

export default ReviewTable;