import React, { useEffect, useCallback, useMemo, useState } from "react";
import { Container, Spinner, Alert, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import useAPI from "../../hooks/useAPI";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import TopicsTable, { TopicRow } from "pages/Assignments/components/TopicsTable";

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

const StudentTasks: React.FC = () => {
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
    fetchTopicsAPI({ url: `/project_topics?assignment_id=${assignmentId}`, method: 'GET' });
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
    <Container fluid className="px-md-4">
      <Row className="mt-3 mb-3">
        <Col xs={12}>
          <h2>Signup Sheet For {assignmentName}</h2>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col xs={12}>
          <p className="mb-0">
            <strong>Your topic(s):</strong> {userSelectedTopics.length > 0
              ? userSelectedTopics.map((topic) => topic.isWaitlisted ? `${topic.name} (waitlisted)` : topic.name).join(", ")
              : "No topics selected yet"}
          </p>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          {topics.length === 0 ? (
            <Alert variant="info">
              <Alert.Heading>No Topics Available</Alert.Heading>
              <p>There are no topics available for this assignment yet.</p>
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
