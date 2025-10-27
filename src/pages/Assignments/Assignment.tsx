import { Container, Row, Col } from "react-bootstrap";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IAssignmentResponse } from "../../utils/interfaces";
import { RootState } from "../../store/store";
import { Row as TRow } from "@tanstack/react-table";
import { alertActions } from "store/slices/alertSlice";
import useAPI from "hooks/useAPI";

// Import tab components
import GeneralTab from "./tabs/GeneralTab";
import TopicsTab from "./tabs/TopicsTab";
import RubricsTab from "./tabs/RubricsTab";
import ReviewStrategyTab from "./tabs/ReviewStrategyTab";
import DueDatesTab from "./tabs/DueDatesTab";
import EtcTab from "./tabs/EtcTab";


const Assignments = () => {
  const { error, isLoading, data: assignmentResponse, sendRequest: fetchAssignments } = useAPI();
  const { data: coursesResponse, sendRequest: fetchCourses } = useAPI();
  const { data: topicsResponse, error: topicsError, isLoading: topicsLoading, sendRequest: fetchTopicsAPI } = useAPI();
  const { data: editResponse, error: editError, sendRequest: editTopicAPI } = useAPI();


  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: IAssignmentResponse;
  }>({ visible: false });

  // Tab state
  const [activeTab, setActiveTab] = useState('general');

  // Topic settings state
  const [topicSettings, setTopicSettings] = useState({
    allowTopicSuggestions: false,
    enableBidding: false,
    enableAuthorsReview: false,
    allowReviewerChoice: false,
    allowBookmarks: false,
    allowBiddingForReviewers: false,
  });

  // Fetch topics for the current assignment
  const fetchTopics = useCallback((assignmentId: number) => {
    if (!assignmentId) return;
    console.log('Fetching topics for assignment:', assignmentId);
    fetchTopicsAPI({ 
      url: `/project_topics?assignment_id=${assignmentId}`,
      method: 'GET'
    });
  }, [fetchTopicsAPI]);

  // Debug logging
  useEffect(() => {
    console.log('Topics response:', topicsResponse);
    console.log('Topics response data:', topicsResponse?.data);
    console.log('Topics response data type:', typeof topicsResponse?.data);
    console.log('Is topics response data array:', Array.isArray(topicsResponse?.data));
    console.log('Topics error:', topicsError);
    console.log('Topics loading:', topicsLoading);
  }, [topicsResponse, topicsError, topicsLoading]);

  // Transform topics data to match expected format
  const topicsData = useMemo(() => {
    // If there's an error or no response, return empty array
    if (topicsError || !topicsResponse?.data) {
      console.log('No topics data available:', { topicsError, topicsResponse });
      return [];
    }
    
    // Check if data is an array, if not, return empty array
    const topics = Array.isArray(topicsResponse.data) ? topicsResponse.data : [];
    
    console.log('Processing topics:', topics);
    
    return topics.map((topic: any) => ({
      id: topic.topic_identifier || topic.id?.toString() || 'unknown',
      databaseId: topic.id, // Store the actual database ID for API calls
      name: topic.topic_name || 'Unnamed Topic',
      assignedTeams: topic.confirmed_teams || [],
      waitlistedTeams: topic.waitlisted_teams || [],
      questionnaire: "--Default rubric--", // This would need to be fetched separately
      numSlots: topic.max_choosers || 1,
      availableSlots: topic.available_slots || 0,
      bookmarks: [], // This would need to be fetched separately
      category: topic.category || '',
      description: topic.description || '',
      link: topic.link || '',
      micropayment: topic.micropayment || 0,
      private_to: topic.private_to || null
    }));
  }, [topicsResponse, topicsError]);

  const fetchData = useCallback(() => {
    // Trigger the API calls - they will update the state
    fetchAssignments({ url: `/assignments` });
    fetchCourses({ url: '/courses' });
  }, [fetchAssignments, fetchCourses]);

  useEffect(() => {
    if (!showDeleteConfirmation.visible) {
      fetchData();
    }
  }, [fetchData, showDeleteConfirmation.visible, auth.user.id]);

  // Fetch topics when assignment data is available
  useEffect(() => {
    if (assignmentResponse && assignmentResponse.data && assignmentResponse.data.length > 0) {
      const firstAssignment = assignmentResponse.data[0];
      fetchTopics(firstAssignment.id);
    }
  }, [assignmentResponse, fetchTopics]);

  // Refresh topics when edit is successful
  useEffect(() => {
    if (editResponse && assignmentResponse && assignmentResponse.data && assignmentResponse.data.length > 0) {
      console.log('Edit successful, refreshing topics...');
      dispatch(alertActions.showAlert({ variant: "success", message: "Topic updated successfully!" }));
      fetchTopics(assignmentResponse.data[0].id);
    }
  }, [editResponse, assignmentResponse, fetchTopics, dispatch]);

  // Handle edit errors
  useEffect(() => {
    if (editError) {
      console.error('Edit error:', editError);
      dispatch(alertActions.showAlert({ variant: "danger", message: `Edit failed: ${editError}` }));
    }
  }, [editError, dispatch]);

  let mergedData: Array<any & { courseName?: string }> = [];

  if (assignmentResponse && coursesResponse) {
    mergedData = assignmentResponse.data.map((assignment: any) => {
      const course = coursesResponse.data.find((c: any) => c.id === assignment.course_id);
      return { ...assignment, courseName: course ? course.name : 'Unknown' };
    });
  }



  // Error alert
  useEffect(() => {
    if (error) {
      dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }
  }, [error, dispatch]);

  const onDeleteAssignmentHandler = useCallback(() => setShowDeleteConfirmation({ visible: false }), []);

  const onEditHandle = useCallback(
    (row: TRow<IAssignmentResponse>) => navigate(`edit/${row.original.id}`),
    [navigate]
  );

  const onDeleteHandle = useCallback(
    (row: TRow<IAssignmentResponse>) => setShowDeleteConfirmation({ visible: true, data: row.original }),
    []
  );


  const tableData = useMemo(
    () => (isLoading || !mergedData?.length ? [] : mergedData),
    [mergedData, isLoading]
  );

  const handleTopicSettingChange = (setting: string, value: boolean) => {
    setTopicSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Handler functions for TopicsTab
  const handleDropTeam = async (topicId: string, teamId: string) => {
    try {
      // This would require a specific API endpoint for dropping teams from topics
      // For now, we'll just refresh the topics data
      console.log(`Dropping team ${teamId} from topic ${topicId}`);
      // TODO: Implement team dropping API call when endpoint is available
      
      // Refresh topics data
      if (assignmentResponse && assignmentResponse.data && assignmentResponse.data.length > 0) {
        fetchTopics(assignmentResponse.data[0].id);
      }
    } catch (err) {
      console.error("Error dropping team:", err);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      if (!assignmentResponse || !assignmentResponse.data || assignmentResponse.data.length === 0) {
        throw new Error('No assignment found');
      }
      
      // Find the topic to get the database ID
      const topic = topicsData.find(t => t.id === topicId);
      if (!topic || !topic.databaseId) {
        console.error('Topic not found or missing database ID:', topicId);
        dispatch(alertActions.showAlert({ variant: "danger", message: "Topic not found" }));
        return;
      }
      
      fetchTopicsAPI({
        url: `/project_topics?assignment_id=${assignmentResponse.data[0].id}&topic_ids[]=${topic.databaseId}`,
        method: 'DELETE'
      });
      
      // Refresh topics data after a short delay
      setTimeout(() => {
        fetchTopics(assignmentResponse.data[0].id);
      }, 500);
      
      console.log(`Topic ${topicId} (database ID: ${topic.databaseId}) deleted successfully`);
    } catch (err) {
      console.error("Error deleting topic:", err);
    }
  };

  const handleEditTopic = async (topicId: string, updatedData: any) => {
    try {
      // Find the topic to get the database ID
      const topic = topicsData.find(t => t.id === topicId);
      if (!topic || !topic.databaseId) {
        console.error('Topic not found or missing database ID:', topicId);
        dispatch(alertActions.showAlert({ variant: "danger", message: "Topic not found" }));
        return;
      }
      
      console.log('Starting edit for topic:', topicId, 'database ID:', topic.databaseId, 'with data:', updatedData);
      
      editTopicAPI({
        url: `/project_topics/${topic.databaseId}`,
        method: 'PATCH',
        data: {
          project_topic: updatedData
        }
      });
      
      console.log(`Edit request sent for topic ${topicId} (database ID: ${topic.databaseId})`);
    } catch (err) {
      console.error("Error updating topic:", err);
      dispatch(alertActions.showAlert({ variant: "danger", message: "Failed to update topic" }));
    }
  };

  const handleCreateTopic = async (topicData: any) => {
    try {
      if (!assignmentResponse || !assignmentResponse.data || assignmentResponse.data.length === 0) {
        throw new Error('No assignment found');
      }
      
      fetchTopicsAPI({
        url: `/project_topics`,
        method: 'POST',
        data: {
          project_topic: {
            ...topicData,
            assignment_id: assignmentResponse.data[0].id
          }
        }
      });
      
      // Refresh topics data after a short delay
      setTimeout(() => {
        fetchTopics(assignmentResponse.data[0].id);
      }, 500);
      
      console.log(`Topic created successfully`);
    } catch (err) {
      console.error("Error creating topic:", err);
    }
  };

  const handleCreateBookmark = (topicId: string) => {
    console.log(`Creating bookmark for topic ${topicId}`);
    // TODO: Implement bookmark creation logic
  };

  const handleApplyPartnerAd = (topicId: string, applicationText: string) => {
    console.log(`Applying to partner ad for topic ${topicId}: ${applicationText}`);
    // TODO: Implement partner ad application logic
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <GeneralTab
            tableData={tableData}
            isLoading={isLoading}
            showDeleteConfirmation={showDeleteConfirmation}
            onDeleteAssignmentHandler={onDeleteAssignmentHandler}
            onEditHandle={onEditHandle}
            onDeleteHandle={onDeleteHandle}
          />
        );
      
      case 'topics':
        return (
          <TopicsTab
            topicSettings={topicSettings}
            topicsData={topicsData}
            topicsLoading={topicsLoading}
            topicsError={topicsError}
            onTopicSettingChange={handleTopicSettingChange}
            onDropTeam={handleDropTeam}
            onDeleteTopic={handleDeleteTopic}
            onEditTopic={handleEditTopic}
            onCreateTopic={handleCreateTopic}
            onCreateBookmark={handleCreateBookmark}
            onApplyPartnerAd={handleApplyPartnerAd}
          />
        );
      
      case 'rubrics':
        return <RubricsTab />;
      
      case 'review-strategy':
        return <ReviewStrategyTab />;
      
      case 'due-dates':
        return <DueDatesTab />;
      
      case 'etc':
        return <EtcTab />;
      
      default:
        return null;
    }
  };

  return (
    <>
      <Outlet />
      <main>
        <Container fluid className="px-md-4">
          <Row className="mt-md-2 mb-md-2">
            <Col className="text-center">
              <h1>Editing Assignment: OSS project & documentation</h1>
            </Col>
            <hr />
          </Row>
          
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <a 
                    className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab('general'); }}
                  >
                    General<span className="sr-only"></span>
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className={`nav-link ${activeTab === 'topics' ? 'active' : ''}`}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab('topics'); }}
                  >
                    Topics<span className="sr-only"></span>
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className={`nav-link ${activeTab === 'rubrics' ? 'active' : ''}`}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab('rubrics'); }}
                  >
                    Rubrics<span className="sr-only"></span>
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className={`nav-link ${activeTab === 'review-strategy' ? 'active' : ''}`}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab('review-strategy'); }}
                  >
                    Review strategy<span className="sr-only"></span>
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className={`nav-link ${activeTab === 'due-dates' ? 'active' : ''}`}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab('due-dates'); }}
                  >
                    Due dates<span className="sr-only"></span>
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className={`nav-link ${activeTab === 'etc' ? 'active' : ''}`}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab('etc'); }}
                  >
                    Etc.<span className="sr-only"></span>
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          {/* Tab Content */}
          {renderTabContent()}
        </Container>
      </main>
    </>
  );
};

export default Assignments;