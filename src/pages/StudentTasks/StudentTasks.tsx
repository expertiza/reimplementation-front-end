import React, { useEffect, useCallback, useMemo, useState } from "react";
import { Container, Table, Spinner, Alert, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { BsBookmark, BsBookmarkFill, BsCheck, BsX } from "react-icons/bs";
import useAPI from "../../hooks/useAPI";

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
  
  // State for bookmarks and selections
  const [bookmarkedTopics, setBookmarkedTopics] = useState<Set<string>>(new Set());
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());

  // Fetch assignment data first to get the assignment ID
  const fetchAssignmentData = useCallback(() => {
    if (assignmentId) {
      fetchAssignment({
        url: `/assignments/${assignmentId}`,
        method: 'GET'
      });
    } else {
      // If no assignment ID in URL, fetch all assignments and use the first one
      fetchAssignment({
        url: `/assignments`,
        method: 'GET'
      });
    }
  }, [assignmentId, fetchAssignment]);

  // Fetch topics for the current assignment
  const fetchTopics = useCallback((assignmentId: number) => {
    if (!assignmentId) return;
    console.log('Fetching topics for assignment:', assignmentId);
    fetchTopicsAPI({ 
      url: `/project_topics?assignment_id=${assignmentId}`,
      method: 'GET'
    });
  }, [fetchTopicsAPI]);

  // Load assignment data on component mount
  useEffect(() => {
    fetchAssignmentData();
  }, [fetchAssignmentData]);

  // Fetch topics when assignment data is available
  useEffect(() => {
    if (assignmentResponse?.data) {
      let targetAssignmentId: number;
      
      if (assignmentId) {
        // If assignment ID is in URL, use it
        targetAssignmentId = parseInt(assignmentId);
      } else if (Array.isArray(assignmentResponse.data) && assignmentResponse.data.length > 0) {
        // If no assignment ID in URL, use the first assignment
        targetAssignmentId = assignmentResponse.data[0].id;
      } else {
        // Single assignment object
        targetAssignmentId = assignmentResponse.data.id;
      }
      
      fetchTopics(targetAssignmentId);
    }
  }, [assignmentResponse, assignmentId, fetchTopics]);

  // Transform topics data to match expected format
  const topics = useMemo(() => {
    // If there's an error or no response, return empty array
    if (topicsError || !topicsResponse?.data) {
      console.log('No topics data available:', { topicsError, topicsResponse });
      return [];
    }
    
    // Check if data is an array, if not, return empty array
    const topicsData = Array.isArray(topicsResponse.data) ? topicsResponse.data : [];
    
    console.log('Processing topics for StudentTasks:', topicsData);
    
    return topicsData.map((topic: any) => ({
      id: topic.topic_identifier || topic.id?.toString() || 'unknown',
      name: topic.topic_name || 'Unnamed Topic',
      availableSlots: topic.available_slots || 0,
      waitlist: topic.waitlisted_teams?.length || 0,
      isBookmarked: bookmarkedTopics.has(topic.topic_identifier || topic.id?.toString() || 'unknown'),
      isSelected: selectedTopics.has(topic.topic_identifier || topic.id?.toString() || 'unknown'),
      isTaken: (topic.available_slots || 0) <= 0
    }));
  }, [topicsResponse, topicsError, bookmarkedTopics, selectedTopics]);

  // Get assignment name for display
  const assignmentName = useMemo(() => {
    if (!assignmentResponse?.data) return 'OSS project & documentation assignment';
    
    if (Array.isArray(assignmentResponse.data) && assignmentResponse.data.length > 0) {
      return assignmentResponse.data[0].name || 'OSS project & documentation assignment';
    } else {
      return assignmentResponse.data.name || 'OSS project & documentation assignment';
    }
  }, [assignmentResponse]);

  // Get user's selected topics (this would need to be implemented based on user's selections)
  const userSelectedTopics: Topic[] = useMemo(() => {
    return topics.filter(topic => topic.isSelected);
  }, [topics]);

  // Handle bookmark toggle
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

  // Handle topic selection toggle
  const handleTopicSelect = (topicId: string) => {
    setSelectedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  // Show loading spinner while data is being fetched
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

  // Show error message if there's an error
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
        alignItems: "flex-start",
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

      <div style={{ width: "100%" }}>
        {topics.length === 0 ? (
          <Alert variant="info">
            <Alert.Heading>No Topics Available</Alert.Heading>
            <p>There are no topics available for this assignment yet.</p>
          </Alert>
        ) : (
          <Table bordered hover striped responsive>
            <thead className="table-light">
              <tr>
                <th>Topic ID</th>
                <th>Topic name(s)</th>
                <th>Available slots</th>
                <th>Num. on waitlist</th>
                <th>Bookmarks</th>
                <th>Select</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <tr
                  key={topic.id}
                  style={{
                    backgroundColor: topic.isTaken 
                      ? "#fff8c4" // Yellow for taken topics
                      : topic.isSelected 
                        ? "#e3f2fd" // Light blue for selected topics
                        : "white"
                  }}
                >
                  <td>{topic.id}</td>
                  <td>{topic.name}</td>
                  <td>{topic.availableSlots}</td>
                  <td>{topic.waitlist}</td>
                  <td className="text-center">
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
                  <td className="text-center">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleTopicSelect(topic.id)}
                      className="p-0"
                      style={{ border: 'none', background: 'none' }}
                      disabled={topic.isTaken}
                    >
                      {topic.isSelected ? (
                        <BsX className="text-danger" size={20} />
                      ) : (
                        <BsCheck className="text-success" size={20} />
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Container>
  );
};

export default StudentTasks;
