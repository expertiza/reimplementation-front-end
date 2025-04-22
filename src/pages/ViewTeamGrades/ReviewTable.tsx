import React, { useEffect, useState } from "react";
import ReviewTableRow from "./ReviewTableRow";
import RoundSelector from "./RoundSelector";
import { calculateAverages } from "./utils";
import "./grades.scss";
import { Link } from "react-router-dom";
import Statistics from "./Statistics";
import Filters from "./Filters";
import ShowReviews from "./ShowReviews";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const ReviewTable: React.FC = () => {
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const [currentRound, setCurrentRound] = useState<number>(-1);
  const [sortOrderRow, setSortOrderRow] = useState<"asc" | "desc" | "none">("none");
  const [showToggleQuestion, setShowToggleQuestion] = useState(false);
  const [roundSelected, setRoundSelected] = useState(-1);
  const [data, setData] = useState<any>(null);
  const [isActionAllowed, setIsActionAllowed] = useState<boolean>(false);

  useEffect(() => {
    const fetchActionAllowed = async () => {
      const token = localStorage.getItem("token");
      var show_page = false;
      if (!token) {

        return;
      }

      try {
        console.log(auth.user)
        if( auth.user.role=='Super Administrator'){
          show_page = true
        }else{
          const response = await fetch("http://localhost:3002/api/v1/grades/action_allowed?requested_action=view_my_scores", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            },
          });
          const result = await response.json();
          show_page = result['allowed']
        }
        
        if (show_page === true) {
          setIsActionAllowed(true);

          const response1 = await fetch("http://localhost:3002/api/v1/grades/view_grading_report?id=1", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            },
          });
          const resp1 = await response1.json();

          const response2 = await fetch("http://localhost:3002/api/v1/grades/view_my_scores?id=1", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            },
          });
          const resp2 = await response2.json();

          const response3 = await fetch("http://localhost:3002/api/v1/grades/view_team?id=1", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            },
          });
          const resp3 = await response3.json();
    
          setData({
            team: resp3.team,
            team_information: resp3.users,
            questions: resp2.questions?.review || [],
            summary: resp2.summary || {},
            avg_scores_by_round: resp2.avg_scores_by_round || {},
            avg_scores_by_criterion: resp2.avg_scores_by_criterion || {},
            review_score_count: resp1.review_score_count || 0,
            participant: resp3.participant || {},
            assignment: resp2.assignment || {},
            roundsOfReviews: resp2.assignment?.rounds_of_reviews || 1,
          });
        }
      } catch (error) {
        console.error("Error fetching action_allowed API:", error);
      }
    };

    fetchActionAllowed();
  }, []);

  if (!isActionAllowed) {
    return <div>Action not allowed. Please contact support.</div>;
  }

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
    const reviewerComments = data.summary?.["1"] || {}; 
    const avgScoresByCriterion = data.avg_scores_by_criterion?.["1"] || {}; 
  
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
      <h5 className="text-xl font-semibold mb-1">Team: {data.team.name}</h5>
      <span className="ml-4">
      Team members:{" "}
      {
        // Declare an empty array to hold the team members
        (() => {
          const teamMembers = [];
          for (let index = 0; index < data.team_information.length; index++) {
            const member = data.team_information[index];
            teamMembers.push(
              <span key={index}>
                {member.name} ({member.email}) {/* Display the user's name and email */}
                {index !== data.team_information.length - 1 && ", "} {/* Add a comma if it's not the last member */}
              </span>
            );
          }
          return teamMembers;
        })()
      }
    </span>
      <br />

      <br />
      <Statistics 
        avg_scores_by_round={data.avg_scores_by_round}
        avg_scores_by_criterion={data.avg_scores_by_criterion}
        review_score_count={getReviewScoreCount()}
        summary={data.summary}
      />

      <br />

      <RoundSelector currentRound={currentRound} handleRoundChange={handleRoundChange} totalRounds={data.roundsOfReviews} />

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
          totalRounds = {data.roundsOfReviews}
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
