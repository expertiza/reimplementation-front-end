import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Container, Row, Col, Alert, Button, Nav } from "react-bootstrap";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import axiosClient from "../../utils/axios_client";
import useAPI from "../../hooks/useAPI";

interface ReviewerPersistParticipant {
  id: number;
  user_id: number;
  parent_id: number;
  team_id?: number | null;
}

interface ReviewerPersistResponseMap {
  id: number;
  reviewer_id: number;
  reviewee_id: number;
  reviewed_object_id: number;
  reviewee_team_id?: number | null;
}

interface ReviewerPersistResponse {
  id: number;
  map_id: number;
  is_submitted: boolean | 0 | 1;
  created_at?: string | null;
  updated_at?: string | null;
}

interface ReviewerPersistTeam {
  id: number;
  name: string;
}

interface ReviewerPersist {
  participants?: ReviewerPersistParticipant[];
  response_maps?: ReviewerPersistResponseMap[];
  responses?: ReviewerPersistResponse[];
  teams?: ReviewerPersistTeam[];
}

interface AssignedReviewRow {
  mapId: number;
  responseId?: number;
  teamName: string;
  revieweeTeamId?: number;
  assignmentId?: number;
  assignmentName?: string;
  status: "Not saved" | "Saved" | "Submitted";
  questionnaireType: "Review" | "Teammate Review";
  questionnaireId?: number;
  questionnaireName: string;
}

const AssignedReviews: React.FC = () => {
  const navigate = useNavigate();
  const { assignmentId: assignmentIdParam } = useParams<{ assignmentId?: string }>();
  const { data: assignmentResponse, sendRequest: fetchAssignment } = useAPI();

  const auth = useSelector((state: RootState) => state.authentication);
  const currentUser = auth.user;

  const [assignedReviews, setAssignedReviews] = useState<AssignedReviewRow[]>([]);
  const [tasksByAssignment, setTasksByAssignment] = useState<Record<number, { require_quiz: boolean; quiz_taken: boolean; has_quiz_questionnaire: boolean; quiz_questionnaire_id?: number }>>({})

  // Fetch student tasks to get authoritative require_quiz / quiz_taken per assignment
  useEffect(() => {
    axiosClient
      .get('/student_tasks/list')
      .then((res) => {
        const tasks = Array.isArray(res.data) ? res.data : [];
        const lookup: Record<number, { require_quiz: boolean; quiz_taken: boolean; has_quiz_questionnaire: boolean; quiz_questionnaire_id?: number }> = {};
        tasks.forEach((task: any) => {
          if (task.assignment_id != null) {
            lookup[Number(task.assignment_id)] = {
              require_quiz: Boolean(task.require_quiz),
              quiz_taken: Boolean(task.quiz_taken),
              has_quiz_questionnaire: Boolean(task.has_quiz_questionnaire),
              quiz_questionnaire_id: task.quiz_questionnaire_id != null ? Number(task.quiz_questionnaire_id) : undefined,
            };
          }
        });
        setTasksByAssignment(lookup);
      })
      .catch(() => {});
  }, []);

  // Resolve the assignment ID from the URL param if provided
  const resolvedAssignmentId = useMemo(() => {
    if (assignmentIdParam) return parseInt(assignmentIdParam, 10);
    return undefined;
  }, [assignmentIdParam]);

  useEffect(() => {
    if (resolvedAssignmentId) {
      fetchAssignment({ url: `/assignments/${resolvedAssignmentId}`, method: "GET" });
    }
  }, [resolvedAssignmentId, fetchAssignment]);

  useEffect(() => {
    if (!currentUser?.id) {
      setAssignedReviews([]);
      return;
    }

    const assignmentData = Array.isArray(assignmentResponse?.data)
      ? assignmentResponse?.data?.[0]
      : assignmentResponse?.data;

    const questionnaires = Array.isArray(assignmentData?.questionnaires)
      ? assignmentData.questionnaires
      : [];

    const isTeammateQuestionnaire = (questionnaire: any) => {
      const questionnaireType = String(questionnaire?.questionnaire_type || "");
      const questionnaireName = String(questionnaire?.name || "");
      return (
        /teammatereview/i.test(questionnaireType) ||
        /teammate\s*review/i.test(questionnaireType) ||
        /teammate\s*review/i.test(questionnaireName)
      );
    };

    const isQuizQuestionnaire = (questionnaire: any) => {
      const questionnaireType = String(questionnaire?.questionnaire_type || "");
      return /^quiz/i.test(questionnaireType);
    };

    const teammateQuestionnaire = questionnaires.find((q: any) => isTeammateQuestionnaire(q));
    const normalReviewQuestionnaire = questionnaires.find(
      (q: any) => !isTeammateQuestionnaire(q) && !isQuizQuestionnaire(q)
    );

    const buildRows = (
      maps: {
        id: number;
        reviewee_id: number;
        reviewed_object_id?: number;
        assignment_name?: string;
        reviewee_team_id?: number | null;
        team_name?: string;
        latest_response?: any;
      }[],
      currentUserTeamId?: number
    ): AssignedReviewRow[] =>
      maps.map((map) => {
        const teamId = Number(map.reviewee_team_id ?? map.reviewee_id);
        const teamName = map.team_name ?? `Team #${teamId}`;
        const latestResponse = map.latest_response;
        const isTeammateReview =
          Boolean(currentUserTeamId) && Number(currentUserTeamId) === Number(teamId);
        const mapAssignmentId = (map as any).reviewed_object_id
          ? Number((map as any).reviewed_object_id)
          : resolvedAssignmentId;

        const selectedQuestionnaire = isTeammateReview
          ? teammateQuestionnaire ?? normalReviewQuestionnaire
          : normalReviewQuestionnaire ?? teammateQuestionnaire;

        let status: AssignedReviewRow["status"] = "Not saved";
        if (latestResponse) {
          const submitted =
            typeof latestResponse.is_submitted === "boolean"
              ? latestResponse.is_submitted
              : Number(latestResponse.is_submitted) === 1;
          status = submitted ? "Submitted" : "Saved";
        }

        return {
          mapId: Number(map.id),
          responseId: latestResponse ? Number(latestResponse.id) : undefined,
          teamName,
          revieweeTeamId:
            (map as any)._revieweeTeamId ?? Number(map.reviewee_team_id ?? map.reviewee_id),
          assignmentId: mapAssignmentId,
          assignmentName: (map as any).assignment_name,
          status,
          questionnaireType: isTeammateReview ? "Teammate Review" : "Review",
          questionnaireId: selectedQuestionnaire?.id ? Number(selectedQuestionnaire.id) : undefined,
          questionnaireName:
            selectedQuestionnaire?.name ||
            (isTeammateReview ? "Teammate Review Questionnaire" : "Review Questionnaire"),
        };
      });

    // 1) Try localStorage first (data written by AssignReviewer page) if scoped to one assignment
    if (resolvedAssignmentId) {
      try {
        const raw = localStorage.getItem(`assignreviewer:${resolvedAssignmentId}`);
        if (raw) {
          const parsed = JSON.parse(raw) as ReviewerPersist;
          const participants = Array.isArray(parsed.participants) ? parsed.participants : [];
          const responseMaps = Array.isArray(parsed.response_maps) ? parsed.response_maps : [];
          const responses = Array.isArray(parsed.responses) ? parsed.responses : [];
          const teams = Array.isArray(parsed.teams) ? parsed.teams : [];

          const participantIds = new Set(
            participants
              .filter(
                (p) =>
                  Number(p.user_id) === Number(currentUser.id) &&
                  Number(p.parent_id) === Number(resolvedAssignmentId)
              )
              .map((p) => p.id)
          );

          const currentParticipant = participants.find(
            (p) =>
              Number(p.user_id) === Number(currentUser.id) &&
              Number(p.parent_id) === Number(resolvedAssignmentId)
          );
          const currentUserTeamId = currentParticipant?.team_id
            ? Number(currentParticipant.team_id)
            : undefined;

          if (participantIds.size > 0) {
            const latestByMapId = new Map<number, ReviewerPersistResponse>();
            responses.forEach((response) => {
              const mapId = Number(response.map_id);
              const timestamp =
                new Date(response.updated_at ?? response.created_at ?? "").getTime() || 0;
              const previous = latestByMapId.get(mapId);
              const previousTs = previous
                ? new Date(previous.updated_at ?? previous.created_at ?? "").getTime() || 0
                : -1;
              if (!previous || timestamp > previousTs) latestByMapId.set(mapId, response);
            });

            const filtered = responseMaps.filter(
              (m) =>
                Number(m.reviewed_object_id) === Number(resolvedAssignmentId) &&
                participantIds.has(Number(m.reviewer_id))
            );

            const withResponse = filtered.map((m) => ({
              ...m,
              team_name: teams.find(
                (t) => Number(t.id) === Number(m.reviewee_team_id ?? m.reviewee_id)
              )?.name,
              latest_response: latestByMapId.get(Number(m.id)),
              _revieweeTeamId: Number(m.reviewee_team_id ?? m.reviewee_id),
            }));

            const rows = buildRows(withResponse, currentUserTeamId);
            if (rows.length > 0) {
              setAssignedReviews(rows);
            }
          }
        }
      } catch {
        /* fall through to API */
      }
    }

    // 2) Always fetch ALL reviews from backend (source of truth)
    let cancelled = false;
    axiosClient
      .get("/response_maps", { params: { reviewer_user_id: currentUser.id } })
      .then((res) => {
        if (cancelled) return;
        const maps = Array.isArray(res.data?.response_maps) ? res.data.response_maps : [];
        const backendRows = buildRows(maps);
        setAssignedReviews((prev) => {
          // Merge: backend rows take priority (by mapId), then add any localStorage-only rows
          const byMapId = new Map<number, AssignedReviewRow>();
          prev.forEach((r) => byMapId.set(r.mapId, r));
          backendRows.forEach((r) => byMapId.set(r.mapId, r));
          return Array.from(byMapId.values());
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, assignmentResponse?.data]);

  // Opens the review form for a given review assignment
  const openReview = useCallback(
    (review: AssignedReviewRow) => {
      const effectiveAssignmentId = review.assignmentId ?? resolvedAssignmentId;
      const params = new URLSearchParams({
        assignment_id: String(effectiveAssignmentId),
        map_id: String(review.mapId),
        questionnaire_type: review.questionnaireType,
        questionnaire_name: review.questionnaireName,
        team_name: review.teamName,
      });

      if (review.questionnaireId) {
        params.set("questionnaire_id", String(review.questionnaireId));
      }
      if (review.responseId) {
        params.set("response_id", String(review.responseId));
      }
      if (review.revieweeTeamId) {
        params.set("reviewee_team_id", String(review.revieweeTeamId));
      }

      navigate(`/response/new?${params.toString()}`);
    },
    [navigate, resolvedAssignmentId]
  );

  const signUpPath = resolvedAssignmentId
    ? `/student_tasks/${resolvedAssignmentId}`
    : "/student_tasks";

  return (
    <Container
      fluid
      className="px-md-4"
      style={{ fontFamily: "verdana, arial, helvetica, sans-serif", color: "#333" }}
    >
      <Row className="mt-3 mb-3">
        <Col xs={12}>
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link as={Link} to={signUpPath}>
                Sign Up
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link active>Reviews</Nav.Link>
            </Nav.Item>
          </Nav>
          <h2>Assigned Reviews</h2>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xs={12}>
          {assignedReviews.length === 0 ? (
            <Alert variant="light" className="flash_note mb-0" style={{ fontSize: 13 }}>
              No reviews currently assigned to you.
            </Alert>
          ) : (
            <table className="table table-striped" style={{ fontSize: 15, lineHeight: "1.428em" }}>
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Team</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignedReviews.map((review) => {
                  const taskInfo = review.assignmentId != null
                    ? tasksByAssignment[review.assignmentId]
                    : undefined;
                  const requireQuiz = taskInfo?.require_quiz ?? false;
                  const hasQuizQuestionnaire = taskInfo?.has_quiz_questionnaire ?? false;
                  const quizCompleted = taskInfo?.quiz_taken ?? false;
                  const quizQuestionnaireId = taskInfo?.quiz_questionnaire_id;

                  // Build the review URL so we can redirect back after the quiz
                  const buildReviewParams = () => {
                    const p = new URLSearchParams({
                      assignment_id: String(review.assignmentId),
                      map_id: String(review.mapId),
                      questionnaire_type: review.questionnaireType,
                      questionnaire_name: review.questionnaireName,
                      team_name: review.teamName,
                    });
                    if (review.questionnaireId) p.set('questionnaire_id', String(review.questionnaireId));
                    if (review.responseId) p.set('response_id', String(review.responseId));
                    if (review.revieweeTeamId) p.set('reviewee_team_id', String(review.revieweeTeamId));
                    return `/response/new?${p.toString()}`;
                  };

                  const handleTakeQuiz = async () => {
                    if (!review.assignmentId || !currentUser?.id) return;
                    try {
                      const res = await axiosClient.post('/quiz_response_maps', {
                        assignment_id: review.assignmentId,
                        reviewer_user_id: currentUser.id,
                      });
                      const quizMapId = res.data?.quiz_map_id;
                      const quizQId = res.data?.quiz_questionnaire_id ?? quizQuestionnaireId;
                      if (!quizMapId || !quizQId) return;
                      const reviewUrl = buildReviewParams();
                      const quizParams = new URLSearchParams({
                        assignment_id: String(review.assignmentId),
                        map_id: String(quizMapId),
                        questionnaire_id: String(quizQId),
                        questionnaire_type: 'Quiz',
                        questionnaire_name: 'Quiz',
                        team_name: review.teamName,
                        redirect_after: reviewUrl,
                      });
                      navigate(`/response/new?${quizParams.toString()}`);
                    } catch {
                      // ignore — button stays visible
                    }
                  };
                  return (
                    <tr key={review.mapId}>
                      <td>{review.assignmentName || `Assignment #${review.assignmentId}`}</td>
                      <td>{review.teamName}</td>
                      <td>{review.questionnaireType}</td>
                      <td>
                        <strong>{review.status}</strong>
                      </td>
                      <td>
                        {requireQuiz && hasQuizQuestionnaire && !quizCompleted ? (
                          <Button
                            variant="warning"
                            className="btn btn-md"
                            size="sm"
                            onClick={handleTakeQuiz}
                          >
                            Take Quiz
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            className="btn btn-md"
                            size="sm"
                            onClick={() => openReview(review)}
                          >
                            {review.responseId ? "Open review" : "Start review"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AssignedReviews;
