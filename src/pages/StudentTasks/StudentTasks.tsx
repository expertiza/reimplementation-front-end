import React, { useEffect, useCallback, useMemo, useState } from "react";
import { Container, Spinner, Alert, Row, Col, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import useAPI from "../../hooks/useAPI";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import TopicsTable, { TopicRow } from "pages/Assignments/components/TopicsTable";
import axiosClient from "../../utils/axios_client";

interface Topic {
  id: string;
  databaseId?: number;
  name: string;
  availableSlots: number;
  waitlist: number;
  isBookmarked?: boolean;
  isSelected?: boolean;
  isTaken?: boolean;
  isWaitlisted?: boolean;
}

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

const StudentTasks: React.FC = () => {
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId?: string }>();
  const { data: topicsResponse, error: topicsError, isLoading: topicsLoading, sendRequest: fetchTopicsAPI } = useAPI();
  const { data: assignmentResponse, sendRequest: fetchAssignment } = useAPI();
  const { data: signUpResponse, error: signUpError, sendRequest: signUpAPI } = useAPI();
  const { data: dropResponse, error: dropError, sendRequest: dropAPI } = useAPI();
  
  const auth = useSelector((state: RootState) => state.authentication);
  const currentUser = auth.user;
  
  const [bookmarkedTopics, setBookmarkedTopics] = useState<Set<string>>(new Set());
  // UI-selected topic override for instant icon/row updates
  const [uiSelectedTopic, setUiSelectedTopic] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [optimisticSlotChanges, setOptimisticSlotChanges] = useState<Map<string, number>>(new Map());
  const [optimisticSelection, setOptimisticSelection] = useState<Map<string, 'selected' | 'deselected'>>(new Map());
  const [pendingDeselections, setPendingDeselections] = useState<Set<string>>(new Set());
  const [lastSignedDbTopicId, setLastSignedDbTopicId] = useState<number | null>(null);

  const fetchAssignmentData = useCallback(() => {
    if (assignmentId) {
      fetchAssignment({ url: `/assignments/${assignmentId}`, method: 'GET' });
    } else {
      fetchAssignment({ url: `/assignments`, method: 'GET' });
    }
  }, [assignmentId, fetchAssignment]);

  const fetchTopics = useCallback((assignmentId: number) => {
    if (!assignmentId) return;
    fetchTopicsAPI({ url: `/sign_up_topics?assignment_id=${assignmentId}`, method: 'GET' });
  }, [fetchTopicsAPI]);

  useEffect(() => {
    fetchAssignmentData();
  }, [fetchAssignmentData]);

  useEffect(() => {
    if (assignmentResponse?.data) {
      let targetAssignmentId: number;
      if (assignmentId) {
        targetAssignmentId = parseInt(assignmentId);
      } else if (Array.isArray(assignmentResponse.data) && assignmentResponse.data.length > 0) {
        targetAssignmentId = assignmentResponse.data[0].id;
      } else {
        targetAssignmentId = assignmentResponse.data.id;
      }
      fetchTopics(targetAssignmentId);
    }
  }, [assignmentResponse, assignmentId, fetchTopics]);

  useEffect(() => {
    if (signUpResponse) {
      setIsSigningUp(false);
      const dbTopicId = (signUpResponse as any)?.data?.signed_up_team?.project_topic_id;
      if (dbTopicId) setLastSignedDbTopicId(Number(dbTopicId));
      // Clear optimistic updates since we'll get real data
      setOptimisticSlotChanges(new Map());
      if (assignmentResponse?.data) {
        let targetAssignmentId: number;
        if (assignmentId) {
          targetAssignmentId = parseInt(assignmentId);
        } else if (Array.isArray(assignmentResponse.data) && assignmentResponse.data.length > 0) {
          targetAssignmentId = assignmentResponse.data[0].id;
        } else {
          targetAssignmentId = assignmentResponse.data.id;
        }
        fetchTopics(targetAssignmentId);
      }
    }
  }, [signUpResponse, assignmentResponse, assignmentId, fetchTopics]);

  useEffect(() => {
    if (signUpError) {
      console.error('Error signing up for topic:', signUpError);
      setIsSigningUp(false);
      // Clear optimistic updates on error to restore actual values
      setOptimisticSlotChanges(new Map());
    }
  }, [signUpError]);

  useEffect(() => {
    if (dropResponse) {
      // Clear optimistic updates since we'll get real data
      setOptimisticSlotChanges(new Map());
      if (assignmentResponse?.data) {
        let targetAssignmentId: number;
        if (assignmentId) {
          targetAssignmentId = parseInt(assignmentId);
        } else if (Array.isArray(assignmentResponse.data) && assignmentResponse.data.length > 0) {
          targetAssignmentId = assignmentResponse.data[0].id;
        } else {
          targetAssignmentId = assignmentResponse.data.id;
        }
        fetchTopics(targetAssignmentId);
      }
    }
  }, [dropResponse, assignmentResponse, assignmentId, fetchTopics]);

  useEffect(() => {
    if (dropError) {
      console.error('Error dropping topic:', dropError);
      // Clear optimistic updates on error to restore actual values
      setOptimisticSlotChanges(new Map());
      setPendingDeselections(new Set());
    }
  }, [dropError]);

  const isUserOnTopic = useCallback((topic: any) => {
    if (!topic) return false;
    const matches = (teams: any[]) => Array.isArray(teams)
      ? teams.some((team: any) =>
          Array.isArray(team.members) &&
          team.members.some((m: any) => String(m.id) === String(currentUser?.id)))
      : false;
    return matches(topic.confirmed_teams) || matches(topic.waitlisted_teams);
  }, [currentUser?.id]);

  const topics = useMemo(() => {
    if (topicsError || !topicsResponse?.data) return [];
    const topicsData = Array.isArray(topicsResponse.data) ? topicsResponse.data : [];
    return topicsData.map((topic: any) => {
      const topicId = topic.topic_identifier || topic.id?.toString() || 'unknown';
      const dbId = Number(topic.id);
      const baseSlots = topic.available_slots || 0;
      const adjustedSlots = optimisticSlotChanges.has(topicId) 
        ? optimisticSlotChanges.get(topicId)! 
        : baseSlots;
      // Determine if current user is on a team for this topic (confirmed or waitlisted)
      const matches = (teams: any[]) => {
        if (!currentUser?.id || !Array.isArray(teams)) return false;
        return teams.some((team: any) =>
          Array.isArray(team.members) &&
          team.members.some((m: any) => String(m.id) === String(currentUser.id))
        );
      };
      const userWaitlisted = matches(topic.waitlisted_teams);
      const userConfirmed = matches(topic.confirmed_teams);
      const userOnTopic = userConfirmed || userWaitlisted;
      const pendingDrop = pendingDeselections.has(topicId);
      
      const selectionOverride = optimisticSelection.get(topicId);
      const isSelected = pendingDrop
        ? false
        : selectionOverride === 'selected'
            ? true
            : selectionOverride === 'deselected'
              ? false
              : uiSelectedTopic !== null
                ? uiSelectedTopic === topicId
                : userOnTopic;
      return {
        id: topicId,
        databaseId: isNaN(dbId) ? undefined : dbId,
        name: topic.topic_name || 'Unnamed Topic',
        availableSlots: adjustedSlots,
        waitlist: topic.waitlisted_teams?.length || 0,
        isBookmarked: bookmarkedTopics.has(topicId),
        isSelected,
        isTaken: adjustedSlots <= 0,
        isWaitlisted: userWaitlisted
      };
    });
  }, [topicsResponse, topicsError, bookmarkedTopics, uiSelectedTopic, optimisticSlotChanges, optimisticSelection, pendingDeselections, currentUser?.id]);

  // Initialize or reconcile selectedTopic from backend data after fetch
  useEffect(() => {
    if (Array.isArray(topicsResponse?.data)) {
      // Priority 1: if we have lastSignedDbTopicId, map it to identifier and select
      if (lastSignedDbTopicId) {
        const t = topicsResponse.data.find((x: any) => Number(x.id) === Number(lastSignedDbTopicId));
        const key = t?.topic_identifier || t?.id?.toString();
        if (key) setUiSelectedTopic(key);
        setLastSignedDbTopicId(null);
        return;
      }
      // Priority 2: use membership lists
      if (uiSelectedTopic === null) {
        const found = topicsResponse.data.find((topic: any) => {
          const topicKey = topic.topic_identifier || topic.id?.toString();
          if (!topicKey || pendingDeselections.has(topicKey)) return false;
          return isUserOnTopic(topic);
        });
        if (found) {
          const key = found.topic_identifier || found.id?.toString();
          if (key) setUiSelectedTopic(key);
        }
      }
    }
    if (optimisticSelection.size > 0) {
      setOptimisticSelection(new Map());
    }
  }, [topicsResponse?.data, currentUser?.id, uiSelectedTopic, lastSignedDbTopicId, optimisticSelection.size, pendingDeselections, isUserOnTopic]);

  useEffect(() => {
    if (!Array.isArray(topicsResponse?.data)) return;
    setPendingDeselections(prev => {
      if (prev.size === 0) return prev;
      const next = new Set(prev);
      let changed = false;
      prev.forEach(topicId => {
        const topic = topicsResponse.data.find((t: any) => {
          const key = t.topic_identifier || t.id?.toString();
          return key === topicId;
        });
        const stillAssigned = topic ? isUserOnTopic(topic) : false;
        if (!stillAssigned) {
          next.delete(topicId);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [topicsResponse?.data, isUserOnTopic]);

  const assignmentName = useMemo(() => {
    if (!assignmentResponse?.data) return 'OSS project & documentation assignment';
    if (Array.isArray(assignmentResponse.data) && assignmentResponse.data.length > 0) {
      return assignmentResponse.data[0].name || 'OSS project & documentation assignment';
    } else {
      return assignmentResponse.data.name || 'OSS project & documentation assignment';
    }
  }, [assignmentResponse]);

  const resolvedAssignmentId = useMemo(() => {
    if (assignmentId) return parseInt(assignmentId, 10);
    if (!assignmentResponse?.data) return undefined;
    if (Array.isArray(assignmentResponse.data) && assignmentResponse.data.length > 0) {
      return Number(assignmentResponse.data[0].id);
    }
    return Number(assignmentResponse.data.id);
  }, [assignmentId, assignmentResponse]);

  const [assignedReviews, setAssignedReviews] = useState<AssignedReviewRow[]>([]);

  useEffect(() => {
    if (!currentUser?.id) { setAssignedReviews([]); return; }

    const assignmentData = Array.isArray(assignmentResponse?.data)
      ? assignmentResponse?.data?.[0]
      : assignmentResponse?.data;

    const questionnaires = Array.isArray(assignmentData?.questionnaires) ? assignmentData.questionnaires : [];
    const isTeammateQuestionnaire = (questionnaire: any) => {
      const questionnaireType = String(questionnaire?.questionnaire_type || "");
      const questionnaireName = String(questionnaire?.name || "");
      return (
        /teammatereview/i.test(questionnaireType)
        || /teammate\s*review/i.test(questionnaireType)
        || /teammate\s*review/i.test(questionnaireName)
      );
    };

    const teammateQuestionnaire = questionnaires.find((questionnaire: any) => isTeammateQuestionnaire(questionnaire));
    const normalReviewQuestionnaire = questionnaires.find((questionnaire: any) => !isTeammateQuestionnaire(questionnaire));

    // Helper: build rows from a list of maps + optional responses
    const buildRows = (
      maps: { id: number; reviewee_id: number; reviewed_object_id?: number; assignment_name?: string; reviewee_team_id?: number | null; team_name?: string; latest_response?: any }[],
      currentUserTeamId?: number
    ): AssignedReviewRow[] =>
      maps.map((map) => {
        const teamId = Number(map.reviewee_team_id ?? map.reviewee_id);
        const teamName = map.team_name ?? `Team #${teamId}`;
        const latestResponse = map.latest_response;
        const isTeammateReview = Boolean(currentUserTeamId) && Number(currentUserTeamId) === Number(teamId);
        const mapAssignmentId = (map as any).reviewed_object_id ? Number((map as any).reviewed_object_id) : resolvedAssignmentId;

        const selectedQuestionnaire = isTeammateReview
          ? (teammateQuestionnaire ?? normalReviewQuestionnaire)
          : (normalReviewQuestionnaire ?? teammateQuestionnaire);

        let status: AssignedReviewRow["status"] = "Not saved";
        if (latestResponse) {
          const submitted = typeof latestResponse.is_submitted === "boolean"
            ? latestResponse.is_submitted
            : Number(latestResponse.is_submitted) === 1;
          status = submitted ? "Submitted" : "Saved";
        }

        return {
          mapId: Number(map.id),
          responseId: latestResponse ? Number(latestResponse.id) : undefined,
          teamName,
          revieweeTeamId: (map as any)._revieweeTeamId ?? Number(map.reviewee_team_id ?? map.reviewee_id),
          assignmentId: mapAssignmentId,
          assignmentName: (map as any).assignment_name,
          status,
          questionnaireType: isTeammateReview ? "Teammate Review" : "Review",
          questionnaireId: selectedQuestionnaire?.id ? Number(selectedQuestionnaire.id) : undefined,
          questionnaireName: selectedQuestionnaire?.name || (isTeammateReview ? "Teammate Review Questionnaire" : "Review Questionnaire")
        };
      });

    // 1) Try localStorage first (data written by AssignReviewer page) — only when scoped to one assignment
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
            .filter((p) => Number(p.user_id) === Number(currentUser.id) && Number(p.parent_id) === Number(resolvedAssignmentId))
            .map((p) => p.id)
        );

        const currentParticipant = participants.find((p) =>
          Number(p.user_id) === Number(currentUser.id) && Number(p.parent_id) === Number(resolvedAssignmentId)
        );
        const currentUserTeamId = currentParticipant?.team_id ? Number(currentParticipant.team_id) : undefined;

        if (participantIds.size > 0) {
          const latestByMapId = new Map<number, ReviewerPersistResponse>();
          responses.forEach((response) => {
            const mapId = Number(response.map_id);
            const timestamp = new Date(response.updated_at ?? response.created_at ?? "").getTime() || 0;
            const previous = latestByMapId.get(mapId);
            const previousTs = previous
              ? (new Date(previous.updated_at ?? previous.created_at ?? "").getTime() || 0)
              : -1;
            if (!previous || timestamp > previousTs) latestByMapId.set(mapId, response);
          });

          const filtered = responseMaps
            .filter((m) => Number(m.reviewed_object_id) === Number(resolvedAssignmentId) && participantIds.has(Number(m.reviewer_id)));

          const withResponse = filtered.map((m) => ({
            ...m,
            team_name: teams.find((t) => Number(t.id) === Number(m.reviewee_team_id ?? m.reviewee_id))?.name,
            latest_response: latestByMapId.get(Number(m.id)),
            _revieweeTeamId: Number(m.reviewee_team_id ?? m.reviewee_id)
          }));

          const rows = buildRows(withResponse, currentUserTeamId);
          // Don't return early — also fetch from backend and merge below
          if (rows.length > 0) { setAssignedReviews(rows); }
        }
      }
    } catch { /* fall through to API */ }
    } // end if resolvedAssignmentId

    // 2) Always fetch ALL reviews across assignments (backend is source of truth)
    let cancelled = false;
    axiosClient
      .get('/response_maps', { params: { reviewer_user_id: currentUser.id } })
      .then((res) => {
        if (cancelled) return;
        const maps = Array.isArray(res.data?.response_maps) ? res.data.response_maps : [];
        const backendRows = buildRows(maps);
        setAssignedReviews(prev => {
          // Merge: backend rows take priority (by mapId), then add any localStorage-only rows
          const byMapId = new Map<number, AssignedReviewRow>();
          prev.forEach(r => byMapId.set(r.mapId, r));
          backendRows.forEach(r => byMapId.set(r.mapId, r));
          return Array.from(byMapId.values());
        });
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [currentUser?.id, assignmentResponse?.data]);

  const handleOpenReview = useCallback((review: AssignedReviewRow) => {
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
  }, [navigate, resolvedAssignmentId]);

  // Check if bookmarks are allowed for this assignment
  const allowBookmarks = useMemo(() => {
    if (!assignmentResponse?.data) return false;
    if (Array.isArray(assignmentResponse.data) && assignmentResponse.data.length > 0) {
      return assignmentResponse.data[0].allow_bookmarks || false;
    } else {
      return assignmentResponse.data.allow_bookmarks || false;
    }
  }, [assignmentResponse]);

  const userSelectedTopics: Topic[] = useMemo(() => {
    return topics.filter(topic => topic.isSelected);
  }, [topics]);

  const handleBookmarkToggle = useCallback((topicId: string) => {
    setBookmarkedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  }, []);

  const handleTopicSelect = useCallback(async (topicId: string) => {
    if (!currentUser?.id) return;
    // Treat as deselect if either local selection matches or backend indicates selection
    const topicEntry = topics.find(t => t.id === topicId);
    const isCurrentlyOnThisTopic = !!topicEntry?.isSelected;

    if (uiSelectedTopic === topicId || (uiSelectedTopic === null && isCurrentlyOnThisTopic)) {
      // Deselecting current topic - optimistically increment available slots when confirmed
      if (topicEntry && !topicEntry.isWaitlisted) {
        setOptimisticSlotChanges(prev => {
          const newMap = new Map(prev);
          newMap.set(topicId, topicEntry.availableSlots + 1);
          return newMap;
        });
      }
      setPendingDeselections(prev => {
        if (prev.has(topicId)) return prev;
        const next = new Set(prev);
        next.add(topicId);
        return next;
      });
      
      setUiSelectedTopic(null);
      setOptimisticSelection(prev => {
        const next = new Map(prev);
        next.set(topicId, 'deselected');
        return next;
      });
      const dbId = topicEntry?.databaseId || topicsResponse?.data?.find((t: any) => t.topic_identifier === topicId || t.id?.toString() === topicId)?.id;
      if (dbId) {
        dropAPI({
          url: '/signed_up_teams/drop_topic',
          method: 'DELETE',
          data: { user_id: currentUser.id, topic_id: dbId }
        });
      }
    } else {
      // Selecting new topic - optimistically decrement available slots
      const topic = topics.find(t => t.id === topicId);
      if (topic) {
        setOptimisticSlotChanges(prev => {
          const newMap = new Map(prev);
          newMap.set(topicId, Math.max(0, topic.availableSlots - 1));

          // If there's a previously selected topic, increment its slots
          if (uiSelectedTopic) {
            const prevTopic = topics.find(t => t.id === uiSelectedTopic);
            if (prevTopic) {
              newMap.set(uiSelectedTopic, prevTopic.availableSlots + 1);
            }
          }

          return newMap;
        });
      }

      setOptimisticSelection(prev => {
        const next = new Map(prev);
        next.set(topicId, 'selected');
        if (uiSelectedTopic) {
          next.set(uiSelectedTopic, 'deselected');
        }
        return next;
      });
      setPendingDeselections(prev => {
        const next = new Set(prev);
        next.delete(topicId);
        if (uiSelectedTopic) {
          next.add(uiSelectedTopic);
        }
        return next;
      });
      
      if (uiSelectedTopic) {
        // Drop previous topic first
        const prev = topics.find(t => t.id === uiSelectedTopic);
        const prevDbId = prev?.databaseId || topicsResponse?.data?.find((t: any) => t.topic_identifier === uiSelectedTopic || t.id?.toString() === uiSelectedTopic)?.id;
        if (prevDbId) {
          dropAPI({
            url: '/signed_up_teams/drop_topic',
            method: 'DELETE',
            data: { user_id: currentUser.id, topic_id: prevDbId }
          });
        }
      }
      
      setUiSelectedTopic(topicId);
      setIsSigningUp(true);
      
      const topicData = topics.find(t => t.id === topicId);
      const dbId = topicData?.databaseId || topicsResponse?.data?.find((t: any) => t.topic_identifier === topicId || t.id?.toString() === topicId)?.id;
      if (dbId) {
        setTimeout(() => {
          signUpAPI({
            url: '/signed_up_teams/sign_up_student',
            method: 'POST',
            data: { user_id: currentUser.id, topic_id: dbId }
          });
        }, 100);
      } else {
        setIsSigningUp(false);
      }
    }
  }, [currentUser?.id, dropAPI, uiSelectedTopic, signUpAPI, topics, topicsResponse?.data]);

  // Table columns (declare before any conditional returns to satisfy hooks rules)
  const topicRows: TopicRow[] = useMemo(() => topics.map(t => ({
    id: t.id,
    name: t.name,
    availableSlots: t.availableSlots,
    waitlistCount: t.waitlist,
    isTaken: t.isTaken,
    isBookmarked: t.isBookmarked,
    isSelected: t.isSelected,
    isWaitlisted: t.isWaitlisted,
  })), [topics]);

  if (topicsLoading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading topics...</span>
        </Spinner>
        <p className="mt-2">Loading topics...</p>
      </Container>
    );
  }

  if (topicsError) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Topics</Alert.Heading>
          <p>
            {typeof topicsError === 'string'
              ? topicsError
              : JSON.stringify(topicsError)
            }
          </p>
        </Alert>
      </Container>
    );
  }

  // removed duplicate columns definition placed after conditional returns

  return (
    <Container fluid className="px-md-4" style={{ fontFamily: 'verdana, arial, helvetica, sans-serif', color: '#333' }}>
      <Row className="mt-3 mb-3">
        <Col xs={12}>
          <h2>Signup sheet for {assignmentName}</h2>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col xs={12}>
          <p className="mb-0" style={{ fontSize: 13, lineHeight: '30px' }}>
            <strong>Your topic(s):</strong> {userSelectedTopics.length > 0
              ? userSelectedTopics.map((topic) => topic.isWaitlisted ? `${topic.name} (waitlisted)` : topic.name).join(", ")
              : "No topics selected yet"}
          </p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xs={12}>
          <h5 className="mb-2" style={{ fontSize: '1.2em', lineHeight: '18px' }}>Assigned reviews</h5>
          {assignedReviews.length === 0 ? (
            <Alert variant="light" className="flash_note mb-0" style={{ fontSize: 13 }}>
              No reviews currently assigned to you.
            </Alert>
          ) : (
            <table className="table table-striped" style={{ fontSize: 15, lineHeight: '1.428em' }}>
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
                {assignedReviews.map((review) => (
                  <tr key={review.mapId}>
                    <td>{review.assignmentName || `Assignment #${review.assignmentId}`}</td>
                    <td>{review.teamName}</td>
                    <td>{review.questionnaireType}</td>
                    <td><strong>{review.status}</strong></td>
                    <td>
                      <Button
                        variant="outline-secondary"
                        className="btn btn-md"
                        size="sm"
                        onClick={() => handleOpenReview(review)}
                      >
                        {review.responseId ? "Open review" : "Start review"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          {topics.length === 0 ? (
            <Alert variant="info" className="flash_note">
              <Alert.Heading>No topics available</Alert.Heading>
              <p style={{ fontSize: 13 }}>There are no topics available for this assignment yet.</p>
            </Alert>
          ) : (
            <TopicsTable
              data={topicRows}
              mode="student"
              onBookmarkToggle={handleBookmarkToggle}
              onSelectTopic={handleTopicSelect}
              isSigningUp={isSigningUp}
              selectedTopicId={uiSelectedTopic}
              showBookmarks={allowBookmarks}
              showPaginationThreshold={10}
              tableSize={{ span: 12, offset: 0 }}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default StudentTasks;
