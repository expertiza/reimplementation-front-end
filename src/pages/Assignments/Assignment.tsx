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

  // Sample topics data
  const topicsData = [
    {
      id: "E2550",
      name: "Response hierarchy and responses_controller back end",
      students: ["Student 10929", "Student 10913", "Student 10912"],
      questionnaire: "--Default rubric--",
      numSlots: 1,
      availableSlots: 0,
      waitlist: 0,
    },
    {
      id: "E2551", 
      name: "Reimplementing SubmittedContentController",
      students: ["Student 10904", "Student 10922", "Student 10924"],
      questionnaire: "--Default rubric--",
      numSlots: 1,
      availableSlots: 0,
      waitlist: 0,
    },
    {
      id: "E2552",
      name: "ProjectTopic and SignedUpTeam",
      students: ["Student 10905", "Student 10915"],
      questionnaire: "--Default rubric--",
      numSlots: 1,
      availableSlots: 0,
      waitlist: 0,
    },
  ];


  const fetchData = useCallback(async () => {
    try {
      const [assignments, courses] = await Promise.all([
        fetchAssignments({ url: `/assignments` }),
        fetchCourses({ url: '/courses' }),
      ]);
      // Handle the responses as needed
    } catch (err) {
      // Handle any errors that occur during the fetch
      console.error("Error fetching data:", err);
    }
  }, [fetchAssignments, fetchCourses]);

  useEffect(() => {
    if (!showDeleteConfirmation.visible) {
      fetchData();
    }
  }, [fetchData, showDeleteConfirmation.visible, auth.user.id]);

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
            onTopicSettingChange={handleTopicSettingChange}
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