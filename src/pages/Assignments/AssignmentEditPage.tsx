import { Container, Row, Col, Tabs, Tab } from "react-bootstrap";
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
          // backgroundColor: '#f8f9fa',
          // border: '1px solid #dee2e6',
          borderRadius: '5px',
          padding: '0',
          marginBottom: '20px'
        }}>
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || "topics")} id="assignment-edit-tabs">
            <Tab eventKey="general" title="General" />
            <Tab eventKey="topics" title="Topics" />
            <Tab eventKey="rubrics" title="Rubrics" />
            <Tab eventKey="review-strategy" title="Review Strategy" />
            <Tab eventKey="due-dates" title="Due Dates" />
            <Tab eventKey="etc" title="Etc." />
          </Tabs>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </Container>
    </main>
  );
};

export default AssignmentEditPage;
