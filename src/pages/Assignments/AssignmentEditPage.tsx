import { Container, Row, Col } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { alertActions } from "store/slices/alertSlice";
import useAPI from "hooks/useAPI";

// Import tab components
import GeneralTab from "./tabs/GeneralTab";
import TopicsTab from "./tabs/TopicsTab";
import RubricsTab from "./tabs/RubricsTab";
import ReviewStrategyTab from "./tabs/ReviewStrategyTab";
import DueDatesTab from "./tabs/DueDatesTab";
import EtcTab from "./tabs/EtcTab";

interface TopicSettings {
  allowTopicSuggestions: boolean;
  enableBidding: boolean;
  enableAuthorsReview: boolean;
  allowReviewerChoice: boolean;
  allowBookmarks: boolean;
  allowBiddingForReviewers: boolean;
  allowAdvertiseForPartners: boolean;
}

interface TopicData {
  id: string;
  databaseId: number;
  name: string;
  url?: string;
  description?: string;
  category?: string;
  assignedTeams: any[];
  waitlistedTeams: any[];
  questionnaire: string;
  numSlots: number;
  availableSlots: number;
  bookmarks: any[];
  partnerAd?: any;
  createdAt?: string;
  updatedAt?: string;
}

const AssignmentEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.authentication);

  const [activeTab, setActiveTab] = useState("topics");
  const [assignmentName, setAssignmentName] = useState("");

  // Topic settings state
  const [topicSettings, setTopicSettings] = useState<TopicSettings>({
    allowTopicSuggestions: false,
    enableBidding: false,
    enableAuthorsReview: true,
    allowReviewerChoice: true,
    allowBookmarks: false,
    allowBiddingForReviewers: false,
    allowAdvertiseForPartners: false,
  });

  // Topics data state
  const [topicsData, setTopicsData] = useState<TopicData[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  // Fetch assignment data
  const { data: assignmentResponse, error: assignmentError, sendRequest: fetchAssignment } = useAPI();
  const { data: topicsResponse, error: topicsApiError, sendRequest: fetchTopics } = useAPI();
  const { data: updateResponse, error: updateError, sendRequest: updateAssignment } = useAPI();
  const { data: deleteResponse, error: deleteError, sendRequest: deleteTopic } = useAPI();
  const { data: createResponse, error: createError, sendRequest: createTopic } = useAPI();
  const { data: updateTopicResponse, error: updateTopicError, sendRequest: updateTopic } = useAPI();
  const { data: dropTeamResponse, error: dropTeamError, sendRequest: dropTeamRequest } = useAPI();

  useEffect(() => {
    if (id) {
      fetchAssignment({ url: `/assignments/${id}` });
    }
  }, [id, fetchAssignment]);

  useEffect(() => {
    if (assignmentResponse?.data) {
      setAssignmentName(assignmentResponse.data.name || "");
      // Load allow_bookmarks setting from backend
      if (assignmentResponse.data.allow_bookmarks !== undefined && assignmentResponse.data.advertising_for_partners_allowed !== undefined) {
        setTopicSettings(prev => ({ ...prev, allowBookmarks: assignmentResponse.data.allow_bookmarks,allowAdvertiseForPartners: assignmentResponse.data.advertising_for_partners_allowed }));
      }
    }
  }, [assignmentResponse]);

  useEffect(() => {
    if (assignmentError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: assignmentError }));
    }
  }, [assignmentError, dispatch]);

  useEffect(() => {
    if (updateResponse) {
      dispatch(alertActions.showAlert({ variant: "success", message: "Bookmark setting saved successfully" }));
    }
  }, [updateResponse, dispatch]);

  useEffect(() => {
    if (updateError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: updateError }));
    }
  }, [updateError, dispatch]);

  useEffect(() => {
    if (deleteResponse) {
      dispatch(alertActions.showAlert({ variant: "success", message: "Topic deleted successfully" }));
      // Refresh topics data
      if (id) {
        fetchTopics({ url: `/project_topics?assignment_id=${id}` });
      }
    }
  }, [deleteResponse, dispatch, id, fetchTopics]);

  useEffect(() => {
    if (deleteError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: deleteError }));
    }
  }, [deleteError, dispatch]);

  useEffect(() => {
    if (createResponse) {
      dispatch(alertActions.showAlert({ variant: "success", message: "Topic created successfully" }));
      // Refresh topics data
      if (id) {
        fetchTopics({ url: `/project_topics?assignment_id=${id}` });
      }
    }
  }, [createResponse, dispatch, id, fetchTopics]);

  useEffect(() => {
    if (createError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: createError }));
    }
  }, [createError, dispatch]);

  useEffect(() => {
    if (updateTopicResponse) {
      dispatch(alertActions.showAlert({ variant: "success", message: "Topic updated successfully" }));
      // Refresh topics data
      if (id) {
        fetchTopics({ url: `/project_topics?assignment_id=${id}` });
      }
    }
  }, [updateTopicResponse, dispatch, id, fetchTopics]);

  useEffect(() => {
    if (updateTopicError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: updateTopicError }));
    }
  }, [updateTopicError, dispatch]);

  useEffect(() => {
    if (dropTeamResponse) {
      dispatch(alertActions.showAlert({ variant: "success", message: "Team removed from topic successfully" }));
      if (id) {
        fetchTopics({ url: `/project_topics?assignment_id=${id}` });
      }
    }
  }, [dropTeamResponse, dispatch, id, fetchTopics]);

  useEffect(() => {
    if (dropTeamError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: dropTeamError }));
    }
  }, [dropTeamError, dispatch]);

  // Load topics for this assignment
  useEffect(() => {
    if (id) {
      setTopicsLoading(true);
      setTopicsError(null);
      fetchTopics({ url: `/project_topics?assignment_id=${id}` });
    }
  }, [id, fetchTopics]);

  // Process topics response
  useEffect(() => {
    if (topicsResponse?.data) {
      const transformedTopics: TopicData[] = (topicsResponse.data || []).map((topic: any) => ({
        id: topic.topic_identifier?.toString?.() || topic.topic_identifier || topic.id?.toString?.() || String(topic.id),
        databaseId: Number(topic.id),
        name: topic.topic_name,
        url: topic.link,
        description: topic.description,
        category: topic.category,
        assignedTeams: topic.confirmed_teams || [],
        waitlistedTeams: topic.waitlisted_teams || [],
        questionnaire: "Default rubric",
        numSlots: topic.max_choosers,
        availableSlots: topic.available_slots || 0,
        bookmarks: [],
        partnerAd: undefined,
        createdAt: topic.created_at,
        updatedAt: topic.updated_at,
      }));
      setTopicsData(transformedTopics);
      setTopicsLoading(false);
    }
  }, [topicsResponse]);

  // Handle topics API errors
  useEffect(() => {
    if (topicsApiError) {
      setTopicsError(topicsApiError);
      setTopicsLoading(false);
    }
  }, [topicsApiError]);

  const handleTopicSettingChange = useCallback((setting: string, value: boolean) => {
    setTopicSettings((prev) => ({ ...prev, [setting]: value }));
    
    // Save allow_bookmarks setting to backend immediately
    if (setting === 'allowBookmarks' && id) {
      updateAssignment({
        url: `/assignments/${id}`,
        method: 'PATCH',
        data: {
          assignment: {
            allow_bookmarks: value
          }
        }
      });
    }
    // Save advertising_for_partners_allowed setting to backend immediately
    if (setting === 'allowAdvertiseForPartners' && id) {
      updateAssignment({
        url: `/assignments/${id}`,
        method: 'PATCH',
        data: {
          assignment: {
            advertising_for_partners_allowed: value
          }
        }
      });
    }

  }, [id, updateAssignment]);

 


  const handleDropTeam = useCallback((topicId: string, teamId: string) => {
    if (!topicId || !teamId) return;
    dropTeamRequest({
      url: `/signed_up_teams/drop_team_from_topic`,
      method: 'DELETE',
      params: {
        topic_id: topicId,
        team_id: teamId,
      },
    });
  }, [dropTeamRequest]);

  const handleDeleteTopic = useCallback((topicIdentifier: string) => {
    console.log(`Delete topic ${topicIdentifier}`);
    if (id) {
      deleteTopic({
        url: `/project_topics`,
        method: 'DELETE',
        params: {
          assignment_id: Number(id),
          'topic_ids[]': [topicIdentifier]
        }
      });
    }
  }, [id, deleteTopic]);

  const handleEditTopic = useCallback((dbId: string, updatedData: any) => {
    console.log(`Edit topic DB id ${dbId}`, updatedData);
    updateTopic({
      url: `/project_topics/${dbId}`,
      method: 'PATCH',
      data: {
        project_topic: {
          topic_identifier: updatedData.topic_identifier,
          topic_name: updatedData.topic_name,
          category: updatedData.category,
          max_choosers: updatedData.max_choosers,
          assignment_id: id,
          description: updatedData.description,
          link: updatedData.link
        }
      }
    });
  }, [id, updateTopic]);

  const handleCreateTopic = useCallback((topicData: any) => {
    console.log(`Create topic`, topicData);
    if (id) {
      createTopic({
        url: `/project_topics`,
        method: 'POST',
        data: {
          project_topic: {
            topic_identifier: topicData.topic_identifier || topicData.id,
            topic_name: topicData.topic_name || topicData.name,
            category: topicData.category,
            max_choosers: topicData.max_choosers ?? topicData.numSlots,
            assignment_id: id,
            description: topicData.description,
            link: topicData.link
          },
          micropayment: topicData.micropayment ?? 0
        }
      });
    }
  }, [id, createTopic]);

  const handleApplyPartnerAd = useCallback((topicId: string, applicationText: string) => {
    console.log(`Applying to partner ad for topic ${topicId}: ${applicationText}`);
    // TODO: Implement partner ad application logic
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      
      case "general":
        return <GeneralTab />;
      
      case "topics":
        return (
          <TopicsTab
            assignmentName={assignmentName}
            assignmentId={id!}
            topicSettings={topicSettings}
            topicsData={topicsData}
            topicsLoading={topicsLoading}
            topicsError={topicsError}
            onTopicSettingChange={handleTopicSettingChange}
            onDropTeam={handleDropTeam}
            onDeleteTopic={handleDeleteTopic}
            onEditTopic={handleEditTopic}
            onCreateTopic={handleCreateTopic}
            onApplyPartnerAd={handleApplyPartnerAd}
            onTopicsChanged={() => id && fetchTopics({ url: `/project_topics?assignment_id=${id}` })}
          />
        );
      
      case "rubrics":
        return <RubricsTab />;
      
      case "review-strategy":
        return <ReviewStrategyTab />;
      
      case "due-dates":
        return <DueDatesTab />;
      
      case "etc":
        return <EtcTab />;
      
      default:
        return null;
    }
  };

  return (
    <main>
      <Container fluid className="px-md-4">
        <Row className="mt-md-2 mb-md-2">
          <Col className="text-center">
            <h2>Editing Assignment: {assignmentName}</h2>
          </Col>
          <hr />
        </Row>
        
        <div className="tab-container" style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '5px',
          padding: '0',
          marginBottom: '20px'
        }}>
          <div className="d-flex">
            <button 
              className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
              style={{
                backgroundColor: activeTab === 'general' ? '#ffffff' : '#f8f9fa',
                border: '1px solid #dee2e6',
                borderBottom: 'none',
                borderTopLeftRadius: '5px',
                borderTopRightRadius: '0px',
                borderBottomLeftRadius: '0px',
                borderBottomRightRadius: '0px',
                padding: '8px 16px',
                margin: '0',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'general' ? '500' : '400',
                color: '#495057',
                outline: 'none',
                flex: '1'
              }}
            >
              General
            </button>
            <button 
              className={`tab-button ${activeTab === 'topics' ? 'active' : ''}`}
              onClick={() => setActiveTab('topics')}
              style={{
                backgroundColor: activeTab === 'topics' ? '#ffffff' : '#f8f9fa',
                border: '1px solid #dee2e6',
                borderBottom: 'none',
                borderTopLeftRadius: '0px',
                borderTopRightRadius: '0px',
                borderBottomLeftRadius: '0px',
                borderBottomRightRadius: '0px',
                padding: '8px 16px',
                margin: '0',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'topics' ? '500' : '400',
                color: '#495057',
                outline: 'none',
                flex: '1'
              }}
            >
              Topics
            </button>
            <button 
              className={`tab-button ${activeTab === 'rubrics' ? 'active' : ''}`}
              onClick={() => setActiveTab('rubrics')}
              style={{
                backgroundColor: activeTab === 'rubrics' ? '#ffffff' : '#f8f9fa',
                border: '1px solid #dee2e6',
                borderBottom: 'none',
                borderTopLeftRadius: '0px',
                borderTopRightRadius: '0px',
                borderBottomLeftRadius: '0px',
                borderBottomRightRadius: '0px',
                padding: '8px 16px',
                margin: '0',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'rubrics' ? '500' : '400',
                color: '#495057',
                outline: 'none',
                flex: '1'
              }}
            >
              Rubrics
            </button>
            <button 
              className={`tab-button ${activeTab === 'review-strategy' ? 'active' : ''}`}
              onClick={() => setActiveTab('review-strategy')}
              style={{
                backgroundColor: activeTab === 'review-strategy' ? '#ffffff' : '#f8f9fa',
                border: '1px solid #dee2e6',
                borderBottom: 'none',
                borderTopLeftRadius: '0px',
                borderTopRightRadius: '0px',
                borderBottomLeftRadius: '0px',
                borderBottomRightRadius: '0px',
                padding: '8px 16px',
                margin: '0',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'review-strategy' ? '500' : '400',
                color: '#495057',
                outline: 'none',
                flex: '1'
              }}
            >
              Review strategy
            </button>
            <button 
              className={`tab-button ${activeTab === 'due-dates' ? 'active' : ''}`}
              onClick={() => setActiveTab('due-dates')}
              style={{
                backgroundColor: activeTab === 'due-dates' ? '#ffffff' : '#f8f9fa',
                border: '1px solid #dee2e6',
                borderBottom: 'none',
                borderTopLeftRadius: '0px',
                borderTopRightRadius: '0px',
                borderBottomLeftRadius: '0px',
                borderBottomRightRadius: '0px',
                padding: '8px 16px',
                margin: '0',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'due-dates' ? '500' : '400',
                color: '#495057',
                outline: 'none',
                flex: '1'
              }}
            >
              Due dates
            </button>
            <button 
              className={`tab-button ${activeTab === 'etc' ? 'active' : ''}`}
              onClick={() => setActiveTab('etc')}
              style={{
                backgroundColor: activeTab === 'etc' ? '#ffffff' : '#f8f9fa',
                border: '1px solid #dee2e6',
                borderBottom: 'none',
                borderTopLeftRadius: '0px',
                borderTopRightRadius: '5px',
                borderBottomLeftRadius: '0px',
                borderBottomRightRadius: '0px',
                padding: '8px 16px',
                margin: '0',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'etc' ? '500' : '400',
                color: '#495057',
                outline: 'none',
                flex: '1'
              }}
            >
              Etc.
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </Container>
    </main>
  );
};

export default AssignmentEditPage;
