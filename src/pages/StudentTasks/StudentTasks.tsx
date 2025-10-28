import React, { useEffect, useCallback, useMemo, useState } from "react";
import { Container, Table, Spinner, Alert, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
// We are bringing back the react-icons you were using
import { BsBookmark, BsBookmarkFill, BsCheck, BsX } from "react-icons/bs"; 
import useAPI from "../../hooks/useAPI";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

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
    }
  }, [signUpError]);

  useEffect(() => {
    if (dropResponse) {
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
    }
  }, [dropError]);

  const topics = useMemo(() => {
    if (topicsError || !topicsResponse?.data) return [];
    const topicsData = Array.isArray(topicsResponse.data) ? topicsResponse.data : [];
    return topicsData.map((topic: any) => ({
      id: topic.topic_identifier || topic.id?.toString() || 'unknown',
      name: topic.topic_name || 'Unnamed Topic',
      availableSlots: topic.available_slots || 0,
      waitlist: topic.waitlisted_teams?.length || 0,
      isBookmarked: bookmarkedTopics.has(topic.topic_identifier || topic.id?.toString() || 'unknown'),
      isSelected: selectedTopic === (topic.topic_identifier || topic.id?.toString() || 'unknown'),
      isTaken: (topic.available_slots || 0) <= 0
    }));
  }, [topicsResponse, topicsError, bookmarkedTopics, selectedTopic]);

  const assignmentName = useMemo(() => {
    if (!assignmentResponse?.data) return 'OSS project & documentation assignment';
    if (Array.isArray(assignmentResponse.data) && assignmentResponse.data.length > 0) {
      return assignmentResponse.data[0].name || 'OSS project & documentation assignment';
    } else {
      return assignmentResponse.data.name || 'OSS project & documentation assignment';
    }
  }, [assignmentResponse]);

  const userSelectedTopics: Topic[] = useMemo(() => {
    return topics.filter(topic => topic.isSelected);
  }, [topics]);

  const handleBookmarkToggle = (topicId: string) => {
    setBookmarkedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  const handleTopicSelect = async (topicId: string) => {
    if (!currentUser?.id) return;

    if (selectedTopic === topicId) {
      setSelectedTopic(null);
      const topic = topics.find(t => t.id === topicId);
      if (topic) {
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
      }
    } else {
      if (selectedTopic) {
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
  };

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

  return (
    <Container
      className="mt-4"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <div style={{ width: "100%", marginBottom: "20px" }}>
        <h3 className="fw-bold">
          Signup sheet for {assignmentName}
        </h3>
        <p className="mt-2">
          <strong>Your topic(s):</strong> {
            userSelectedTopics.length > 0 
              ? userSelectedTopics.map(topic => topic.name).join(', ')
              : 'No topics selected yet'
          }
        </p>
      </div>

      {/* This div will now shrink to fit the table content */}
      <div style={{ width: "fit-content" }}>
        {topics.length === 0 ? (
          <Alert variant="info">
            <Alert.Heading>No Topics Available</Alert.Heading>
            <p>There are no topics available for this assignment yet.</p>
          </Alert>
        ) : (
          // CHANGE 1: Removed the "bordered" prop to get rid of lines
          <Table hover striped responsive>
            <thead className="table-light"> {/* This gives the gray header */}
              <tr>
                {/* CHANGE 2: Added style to prevent wrapping */}
                <th className="p-3" style={{ whiteSpace: "nowrap" }}>Topic ID</th>
                <th className="p-3" style={{ whiteSpace: "nowrap" }}>Topic name(s)</th>
                <th className="p-3 text-center" style={{ whiteSpace: "nowrap" }}>Available slots</th>
                <th className="p-3 text-center" style={{ whiteSpace: "nowrap" }}>Num. on waitlist</th>
                <th className="p-3" style={{ whiteSpace: "nowrap" }}>Bookmarks</th>
                <th className="p-3" style={{ whiteSpace: "nowrap" }}>Select</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => {
                const isSelected = topic.isSelected;
                const isTaken = topic.isTaken;

                const rowClass = isSelected
                  ? "table-warning"
                  : isTaken
                  ? "table-light"
                  : "";

                const rowStyle = {
                  fontWeight: isSelected ? 'bold' : 'normal',
                };
                
                return (
                  <tr
                    key={topic.id}
                    className={rowClass}
                    style={rowStyle}
                  >
                    <td className="p-3" style={{ whiteSpace: "nowrap" }}>{topic.id}</td>
                    <td className="p-3" style={{ whiteSpace: "nowrap" }}>{topic.name}</td>
                    <td className="p-3 text-center" style={{ whiteSpace: "nowrap" }}>{topic.availableSlots}</td>
                    <td className="p-3 text-center" style={{ whiteSpace: "nowrap" }}>{topic.waitlist}</td>
                    <td className="text-center p-3" style={{ whiteSpace: "nowrap" }}>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleBookmarkToggle(topic.id)}
                        className="p-0"
                        style={{ border: 'none', background: 'none' }}
                      >
                        {topic.isBookmarked ? (
                          <BsBookmarkFill className="text-warning" size={20} />
                        ) : (
                          <BsBookmark className="text-muted" size={20} />
                        )}
                      </Button>
                    </td>
                    <td className="text-center p-3" style={{ whiteSpace: "nowrap" }}>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleTopicSelect(topic.id)}
                        className="p-0"
                        style={{ border: 'none', background: 'none' }}
                        disabled={topic.isTaken || isSigningUp}
                      >
                        {isSigningUp && selectedTopic === topic.id ? (
                          <Spinner size="sm" animation="border" />
                        ) : topic.isSelected ? (
                          // --- CHANGE 1: Path updated (removed "public/") ---
                          <img 
                            src="/assets/images/delete-icon-24.png" 
                            alt="Deselect" 
                            width="20" 
                            height="20" 
                          />
                        ) : (
                          // --- CHANGE 2: Path updated (removed "public/") ---
                          <img 
                            src="/assets/icons/Check-icon.png" 
                            alt="Select" 
                            width="20" 
                            height="20" 
                          />
                        )}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </div>
    </Container>
  );
};

export default StudentTasks;