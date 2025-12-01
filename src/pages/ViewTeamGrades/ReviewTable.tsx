import React, { useEffect, useState, useRef } from "react";
import ReviewTableRow from "./ReviewTableRow";
import RoundSelector from "./RoundSelector";
import axiosClient from "../../utils/axios_client";
import { calculateAverages, normalizeReviewDataArray, convertBackendRoundArray } from "./utils";
import { TeamMember } from "./App";
import "./grades.scss";
import { Link, useSearchParams } from "react-router-dom";
import Filters from "./Filters";
import ShowReviews from "./ShowReviews";
import { useSelector } from "react-redux";
import { getAuthToken } from "../../utils/auth";
import jwtDecode from "jwt-decode";

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
  const [showToggleQuestion, setShowToggleQuestion] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [roundsData, setRoundsData] = useState<any[] | null>(null);
  
  // Get assignment ID from URL query parameter, default to 1
  const assignmentIdFromUrl = searchParams.get("assignmentId");
  const assignmentId = assignmentIdFromUrl ? parseInt(assignmentIdFromUrl, 10) : 1;
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string>("");
  const [teamGrade, setTeamGrade] = useState<number | string>("");
  const [teamComment, setTeamComment] = useState<string>("");
  const [submissionLinks, setSubmissionLinks] = useState<string[] | null>(null);
  const [teamFetchError, setTeamFetchError] = useState<string | null>(null);
  const [lastParticipantsResp, setLastParticipantsResp] = useState<any>(null);
  const [lastTeamResp, setLastTeamResp] = useState<any>(null);
  const [showReviews, setShowReviews] = useState(false);
  const [ShowAuthorFeedback, setShowAuthorFeedback] = useState(false);
  const [roundSelected, setRoundSelected] = useState(-1);
  const [targetReview, setTargetReview] = useState<{roundIndex: number, reviewIndex: number} | null>(null);
  const [averageFinalScore, setAverageFinalScore] = useState<string | number | null>(null);
  const authUser = useSelector((state: any) => state.authentication?.user);

  // Ref for the reviews section
  const reviewsSectionRef = useRef<HTMLDivElement>(null);

  // Auto-fetch assignment from URL parameter or default to 1 on mount
  useEffect(() => {
    fetchBackend(assignmentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When roundsData is loaded, automatically select the first round
  useEffect(() => {
    if (roundsData && roundsData.length > 0 && roundSelected === -1) {
      setRoundSelected(0);
    }
  }, [roundsData, roundSelected]);



  const fetchBackend = async (id: number) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      let res;
      try {
        res = await axiosClient.get(`/grades/${id}/view_our_scores`);
      } catch (e: any) {
        if (e?.response?.status === 404 || e?.response?.status === 403) {
          try {
            res = await axiosClient.get(`/grades/${id}/view_all_scores`);
            if (res && res.data && res.data.team_scores && Object.keys(res.data.team_scores).length > 0) {
              const maybe = res.data.team_scores;
              if (maybe.reviews_of_our_work) {
                res = { data: maybe };
              } else {
                const firstKey = Object.keys(maybe)[0];
                if (firstKey) {
                  res = { data: maybe[firstKey] };
                }
              }
            }
          } catch (e2: any) {
            res = null;
          }
        } else {
          throw e;
        }
      }
      if (res && res.data && res.data.reviews_of_our_work) {
        const backendRoundsObj = res.data.reviews_of_our_work;
        const orderedRounds = Object.keys(backendRoundsObj)
          .sort()
          .map((k) => backendRoundsObj[k]);
        const converted = convertBackendRoundArray(orderedRounds);
        setRoundsData(converted);
        
        // Set average final score from API response
        console.log("=== API Response Data ===");
        console.log("Full res.data:", res.data);
        console.log("avg_score_of_our_work value:", res.data.avg_score_of_our_work);
        console.log("Type:", typeof res.data.avg_score_of_our_work);
        
        if (res.data.avg_score_of_our_work !== undefined && res.data.avg_score_of_our_work !== null) {
          console.log("Setting averageFinalScore to:", res.data.avg_score_of_our_work);
          setAverageFinalScore(res.data.avg_score_of_our_work);
        } else {
          console.log("avg_score_of_our_work is not available in response");
        }
        
        try {
          const token = getAuthToken();
          if (!token || token === "EXPIRED") {
            setTeamFetchError("No valid auth token found — team name and members require login.\nPlease log in and try again.");
          } else {
            const userId = getCurrentUserId();
            if (!userId) {
              setTeamFetchError("Unable to determine current user from token. Team metadata cannot be loaded.");
            } else {
              setTeamFetchError(null);
              await fetchTeamMetadata(id, userId);
            }
          }
        } catch (err) {
          console.warn("Failed to load team metadata:", err);
        }
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      setFetchError("No review data returned by backend.");
    } catch (err: any) {
      setIsLoading(false);
      const status = err?.response?.status;
      if (status === 404) {
        setFetchError("No review data found for this assignment (404). You may not be a participant for this assignment or the assignment does not exist.");
      } else if (status === 403) {
        setFetchError("You are not authorized to view reviews for this assignment (403). Try using a user with instructor privileges or check the assignment ID.");
      } else {
        setFetchError(err?.message || "Failed to fetch backend data");
      }
    }
  };

  const getCurrentUserId = (): number | null => {
    if (authUser && authUser.id) return authUser.id;
    const token = getAuthToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token as string);
      return decoded?.id || decoded?.user_id || null;
    } catch (err) {
      return null;
    }
  };

  const fetchTeamMetadata = async (assignmentIdParam: number, userId: number) => {
    try {
      const participantsResp = await axiosClient.get(`/participants/user/${userId}`);
      setLastParticipantsResp(participantsResp?.data || participantsResp);
      const participants = participantsResp?.data || [];

      const myParticipant = participants.find((p: any) => {
        return Number(p.parent_id) === Number(assignmentIdParam) || Number(p.assignment_id) === Number(assignmentIdParam);
      });

      if (!myParticipant) {
        setTeamFetchError("You are not a participant in this assignment (no participant record found for the current user and assignment).\nIf you expect to be a participant, confirm the assignment ID and that you're logged in as the correct user.");
        return;
      }

      const teamId = myParticipant.team_id || myParticipant.team?.id;
      if (!teamId) {
        setTeamFetchError("Participant found but no team_id set on participant. Team metadata cannot be loaded.");
        return;
      }

      let teamResp;
      let teamObj;
      let teamParticipants: any[] = [];
      try {
        teamResp = await axiosClient.get(`/teams_participants/${teamId}/list_participants`);
        setLastTeamResp(teamResp?.data || teamResp);
        teamObj = teamResp?.data?.team;
        teamParticipants = teamResp?.data?.team_participants || [];
      } catch (e: any) {
        const status = e?.response?.status;
        setLastTeamResp(e?.response?.data || e?.response || e);
        if (status === 403) {
          setTeamFetchError("teams_participants endpoint returned 403 — attempting fallback using /participants/assignment/:assignment_id");
          try {
            const assignPartsResp = await axiosClient.get(`/participants/assignment/${assignmentIdParam}`);
            const assignParts = assignPartsResp?.data || [];
            const matching = assignParts.filter((p: any) => (p.team_id || (p.team && p.team.id)) === Number(teamId));
            const userIdsFromAssign = matching.map((p: any) => p.user_id || (p.participant && p.participant.user_id)).filter(Boolean);
            const uniqueUserIds2 = Array.from(new Set(userIdsFromAssign));
            const userFetches2 = uniqueUserIds2.map((uid) => axiosClient.get(`/users/${uid}`));
            const usersResp2 = await Promise.allSettled(userFetches2);
            const members2 = usersResp2
              .map((r) => (r.status === "fulfilled" ? r.value.data : null))
              .filter(Boolean)
              .map((u: any) => ({ name: u.full_name || u.fullName || u.name, username: u.name }));
            if (members2.length > 0) {
              setTeamMembers(members2);
              setTeamFetchError(null);
            } else {
              setTeamFetchError("Fallback succeeded but no user records found for team members.");
            }
          } catch (e2: any) {
            setTeamFetchError(`Fallback via participants/assignment failed: ${e2?.message || String(e2)}`);
          }
        } else {
          setTeamFetchError(`Failed to fetch team participants: ${e?.message || String(e)}`);
        }
      }

      if (teamObj) {
        setTeamName(teamObj.name || teamObj.team_name || teamObj.display_name || teamName);
        setTeamGrade(teamObj.grade_for_submission ?? teamGrade);
        setTeamComment(teamObj.comment_for_submission ?? teamComment);
        const links: string[] = [];
        if (teamObj.hyperlinks && Array.isArray(teamObj.hyperlinks)) {
          teamObj.hyperlinks.forEach((l: any) => links.push(String(l)));
        }
        if (teamObj.submitted_hyperlinks) {
          try {
            const parsed = JSON.parse(teamObj.submitted_hyperlinks);
            if (Array.isArray(parsed)) parsed.forEach((l: any) => links.push(String(l)));
          } catch (e) {
            const str = String(teamObj.submitted_hyperlinks);
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const found = str.match(urlRegex) || [];
            found.forEach((u: string) => links.push(u));
          }
        }
        setSubmissionLinks(links.length > 0 ? Array.from(new Set(links)) : null);
      }

      const sourceParticipants = teamParticipants && teamParticipants.length > 0 ? teamParticipants : [];
      const userIds: number[] = sourceParticipants
        .map((tp: any) => tp.user_id || tp.userId || (tp.participant && tp.participant.user_id))
        .filter(Boolean);

      const uniqueUserIds = Array.from(new Set(userIds));

      let members: any[] = [];
      if (uniqueUserIds.length > 0) {
        const userFetches = uniqueUserIds.map((uid) => axiosClient.get(`/users/${uid}`));
        const usersResp = await Promise.allSettled(userFetches);

        members = usersResp
          .map((r) => (r.status === "fulfilled" ? r.value.data : null))
          .filter(Boolean)
          .map((u: any) => ({ name: u.full_name || u.fullName || u.name, username: u.name }));
      }

      if (members.length === 0 && sourceParticipants.length > 0) {
        members = sourceParticipants.map((p: any) => ({ name: p.handle || `user_${p.user_id || p.id}`, username: String(p.user_id || p.id || "") }));
        setTeamMembers(members);
        setTeamFetchError("Team participants resolved but user details couldn't be fetched; showing participant handles instead.");
      } else if (members.length > 0) {
        setTeamMembers(members);
        setTeamFetchError(null);
      }
    } catch (err: any) {
      console.warn("Failed to fetch team metadata", err?.message || err);
      setTeamFetchError(`Failed to fetch team metadata: ${err?.message || String(err)}`);
    }
  };

  const toggleShowReviews = () => {
    setShowReviews((prev) => !prev);
  };

  const selectRound = (r: number) => {
    setRoundSelected(r);
  };

  const toggleAuthorFeedback = () => {
    setShowAuthorFeedback((prev) => !prev);
  };

  const handleRoundChange = (roundIndex: number) => {
    setCurrentRound(roundIndex);
  };

  const toggleShowQuestion = () => {
    setShowToggleQuestion(!showToggleQuestion);
  };

  // Handle clicking on a review cell in the table
  const handleReviewClick = (roundIndex: number, reviewIndex: number) => {
    // Show reviews section if not already shown
    if (!showReviews) {
      setShowReviews(true);
    }
    
    // Set the target review to expand
    setTargetReview({ roundIndex, reviewIndex });
    
    // Scroll to reviews section after a short delay to allow state to update
    setTimeout(() => {
      if (reviewsSectionRef.current) {
        reviewsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const renderTable = (roundData: any, roundIndex: number) => {
    const normalizedData = normalizeReviewDataArray(roundData);
    
    const { averagePeerReviewScore, sortedData } = calculateAverages(
      normalizedData,
      "none"
    );

    const roundsSource = roundsData || [];

    return (
      <div key={roundIndex} className="table-container mb-6">
        <h2>
          Review (Round: {roundIndex + 1} of {roundsSource.length})
        </h2>
        <table className="tbl_heat">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-1 px-2 text-center" style={{ width: "50px" }}>
                Item no.
              </th>
              {showToggleQuestion && (
                <th className="item-prompt-header" style={{ width: "150px" }}>
                  Item
                </th>
              )}
              {Array.from({ length: roundData[0].reviews.length }, (_, i) => {
                const reviewerName = roundData[0].reviews[i]?.name || `Review ${i + 1}`;
                const isStudent = authUser?.role === "Student";
                const displayName = isStudent ? `Review ${i + 1}` : reviewerName;

                return (
                  <th
                    key={i}
                    className="py-1 px-2 text-center"
                    style={{ width: "70px", cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => handleReviewClick(roundIndex, i)}
                    title={isStudent ? "Click to view full review" : `Review by ${reviewerName} - Click to view full`}
                  >
                    {displayName}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <ReviewTableRow 
                key={index} 
                row={row} 
                showToggleQuestion={showToggleQuestion}
                onReviewClick={(reviewIndex) => handleReviewClick(roundIndex, reviewIndex)}
              />
            ))}
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
      <h2>Summary Report: Program 2</h2>
      <h5>Team: {teamName || "Loading..."}</h5>
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
        Average final score: <span style={{ fontWeight: "normal" }}>{averageFinalScore || "N/A"}</span>
      </div>
      <div className="mt-2">
        <h5>Submission links</h5>
        {submissionLinks && submissionLinks.length > 0 ? (
          <ul>
            {submissionLinks.map((l, i) => (
              <li key={i}>
                <a href={l} target="_blank" rel="noopener noreferrer">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div>
            <em>No submission links found for this team.</em>
          </div>
        )}
        {teamFetchError && (
          <div style={{ color: "red", marginTop: 8, whiteSpace: "pre-wrap" }}>
            {teamFetchError}
          </div>
        )}
      </div>

      <br />

      <RoundSelector currentRound={currentRound} handleRoundChange={handleRoundChange} roundsData={roundsData} />

      <div className="toggle-container">
        <input
          type="checkbox"
          id="toggleQuestion"
          name="toggleQuestion"
          checked={showToggleQuestion}
          onChange={toggleShowQuestion}
        />
        <label htmlFor="toggleQuestion"> &nbsp;{showToggleQuestion ? "Hide item prompts" : "Show item prompts"}</label>
      </div>

      {roundsData && roundsData.length > 0 ? (
        currentRound === -1
          ? roundsData.map((roundData: any, index: number) => renderTable(roundData, index))
          : renderTable(roundsData[currentRound], currentRound)
      ) : (
        <div style={{ padding: "20px", textAlign: "center" }}>
          {isLoading ? "Loading review data..." : "No review data available. Please load an assignment."}
        </div>
      )}

      <div>
        <Filters
          toggleShowReviews={toggleShowReviews}
          toggleAuthorFeedback={toggleAuthorFeedback}
          selectRound={selectRound}
        />
      </div>

      <div ref={reviewsSectionRef}>
        {showReviews && roundsData && roundsData.length > 0 && (
          <div>
            <h2>Reviews</h2>
            <ShowReviews 
              data={roundsData} 
              roundSelected={roundSelected}
              targetReview={targetReview}
              onReviewExpanded={() => setTargetReview(null)}
            />
          </div>
        )}
        {ShowAuthorFeedback && (
          <div>
            <h2>Author Feedback</h2>
            <p style={{ fontStyle: "italic", color: "#666" }}>Author feedback feature coming soon.</p>
          </div>
        )}
      </div>

      {teamGrade || teamComment ? (
        <div className="mt-4">
          <h2>Grade and Comment for Submission</h2>
          {teamGrade && <p>Grade: {teamGrade}</p>}
          {teamComment && <p>Comment: <TruncatableText text={teamComment} wordLimit={10} /></p>}
        </div>
      ) : null}

      <Link to="/">Back</Link>
    </div>
  );
};

export default ReviewTable;