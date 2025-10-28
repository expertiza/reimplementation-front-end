import React, { useEffect, useCallback, useMemo, useState } from "react";
import { Container, Spinner, Alert, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import useAPI from "../../hooks/useAPI";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import TopicsTable, { TopicRow } from "pages/Assignments/components/TopicsTable";

interface Topic {
  id: string;
  name: string;
  availableSlots: number;
  waitlist: number;
  isBookmarked?: boolean;
  isSelected?: boolean;
  isTaken?: boolean;
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
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [optimisticSlotChanges, setOptimisticSlotChanges] = useState<Map<string, number>>(new Map());

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
    }
  }, [dropError]);

  const topics = useMemo(() => {
    if (topicsError || !topicsResponse?.data) return [];
    const topicsData = Array.isArray(topicsResponse.data) ? topicsResponse.data : [];
    return topicsData.map((topic: any) => {
      const topicId = topic.topic_identifier || topic.id?.toString() || 'unknown';
      const baseSlots = topic.available_slots || 0;
      const adjustedSlots = optimisticSlotChanges.has(topicId) 
        ? optimisticSlotChanges.get(topicId)! 
        : baseSlots;
      
      return {
        id: topicId,
        name: topic.topic_name || 'Unnamed Topic',
        availableSlots: adjustedSlots,
        waitlist: topic.waitlisted_teams?.length || 0,
        isBookmarked: bookmarkedTopics.has(topicId),
        isSelected: selectedTopic === topicId,
        isTaken: adjustedSlots <= 0
      };
    });
  }, [topicsResponse, topicsError, bookmarkedTopics, selectedTopic, optimisticSlotChanges]);

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

    if (selectedTopic === topicId) {
      // Deselecting current topic - optimistically increment available slots
      const topic = topics.find(t => t.id === topicId);
      if (topic) {
        setOptimisticSlotChanges(prev => {
          const newMap = new Map(prev);
          newMap.set(topicId, topic.availableSlots + 1);
          return newMap;
        });
      }
      
      setSelectedTopic(null);
      const topicData = topicsResponse?.data?.find((t: any) => 
        t.topic_identifier === topicId || t.id?.toString() === topicId
      );
      if (topicData?.id) {
        dropAPI({
          url: '/signed_up_teams/drop_topic',
          method: 'DELETE',
          data: { user_id: currentUser.id, topic_id: topicData.id }
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
          if (selectedTopic) {
            const prevTopic = topics.find(t => t.id === selectedTopic);
            if (prevTopic) {
              newMap.set(selectedTopic, prevTopic.availableSlots + 1);
            }
          }
          
          return newMap;
        });
      }
      
      if (selectedTopic) {
        // Drop previous topic first
        const previousTopicData = topicsResponse?.data?.find((t: any) => 
          t.topic_identifier === selectedTopic || t.id?.toString() === selectedTopic
        );
        if (previousTopicData?.id) {
          dropAPI({
            url: '/signed_up_teams/drop_topic',
            method: 'DELETE',
            data: { user_id: currentUser.id, topic_id: previousTopicData.id }
          });
        }
      }
      
      setSelectedTopic(topicId);
      setIsSigningUp(true);
      
      const topicData = topicsResponse?.data?.find((t: any) => 
        t.topic_identifier === topicId || t.id?.toString() === topicId
      );
      
      if (topicData?.id) {
        setTimeout(() => {
          signUpAPI({
            url: '/signed_up_teams/sign_up_student',
            method: 'POST',
            data: { user_id: currentUser.id, topic_id: topicData.id }
          });
        }, 100);
      } else {
        setIsSigningUp(false);
      }
    }
  }, [currentUser?.id, dropAPI, selectedTopic, signUpAPI, topics, topicsResponse?.data]);

  // Table columns (declare before any conditional returns to satisfy hooks rules)
  const topicRows: TopicRow[] = useMemo(() => topics.map(t => ({
    id: t.id,
    name: t.name,
    availableSlots: t.availableSlots,
    waitlistCount: t.waitlist,
    isTaken: t.isTaken,
    isBookmarked: t.isBookmarked,
    isSelected: t.isSelected,
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
              ? userSelectedTopics.map((topic) => topic.name).join(", ")
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
              selectedTopicId={selectedTopic}
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
