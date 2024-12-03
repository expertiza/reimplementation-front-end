import React, { useState, useMemo, useEffect} from 'react';
import { Container, Form, Button, Collapse } from 'react-bootstrap';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from '../../store/store';
import ReviewToggle from './components/ReviewToggle';
import CompositeScore from './components/CompositeScore';
import TeammateHeatmap from './components/TeammateHeatmap';
import ShowReviews from './components/ShowReviews';
import { generateAllReviews } from './utils';
import './TeammateReview.scss';
import { alertActions } from "../../store/slices/alertSlice";
import styles from "../ProjectTopics/ProjectTopics.module.css";


enum ROLE {
  SUPER_ADMIN = "Super Administrator",
  ADMIN = "Administrator",
  INSTRUCTOR = "Instructor",
  TA = "Teaching Assistant",
  STUDENT = "Student",
}
const TeammateReview: React.FC = () => {
  const [viewMode, setViewMode] = useState<'given' | 'received'>('received');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const [showReviews, setShowReviews] = useState(false);
  const [showTeammateReviewsToStudents, setShowTeammateReviewsToStudents] = useState(false);

  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const userRole = auth.user?.role || "";
  const isAdmin = userRole === ROLE.ADMIN || userRole === ROLE.SUPER_ADMIN;
  const isInstructor = userRole === ROLE.INSTRUCTOR;
  const isAdminOrInstructor = isAdmin || isInstructor;

  const reviewData = useMemo(() => generateAllReviews(), []);
  const assignmentInfo = {
    name: "Final Project",
    teamName: "group1"
  };

  const calculateColumnAverages = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return [];
    const numCols = reviews[0].reviews.length;
    const averages = new Array(numCols).fill(0);
    
    reviews.forEach(row => {
      row.reviews.forEach((review: any, idx: number) => {
        averages[idx] += review.score;
      });
    });
    
    return averages.map(sum => sum / reviews.length);
  };

  const currentReviews = viewMode === 'given' ? reviewData.given : reviewData.received;

  const columnAverages = calculateColumnAverages(currentReviews);

  const calculateRowAverages = () => {
    return currentReviews.map(question => {
      const sum = question.reviews.reduce((acc, review) => acc + review.score, 0);
      return sum / question.reviews.length;
    });
  };

  useEffect(() => {
    const storedValue = localStorage.getItem('checkboxSetting');
    if (storedValue !== null) {
      setShowTeammateReviewsToStudents(storedValue === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('checkboxSetting', showTeammateReviewsToStudents.toString());
  }, [showTeammateReviewsToStudents]);

  const handleChange = (event: {
    target: { checked: boolean | ((prevState: boolean) => boolean) };
  }) => {
    setShowTeammateReviewsToStudents(event.target.checked);
  };


  return (
    <Container fluid className="teammate-review-container">
      <h2 className="mb-4">Teammate Reviews</h2>

      <div className="assignment-info">
        <h2>Assignment: {assignmentInfo.name}</h2>
        <h3>Team: {assignmentInfo.teamName}</h3>
      </div>
      {isAdminOrInstructor && (
        <div className="controls mb-4">
          <Form>
            <Form.Check
              type="checkbox"
              id="instructor_selection"
              label="Allow students to view their teammate reviews?"
              onChange = {handleChange}
              checked = {showTeammateReviewsToStudents}
            />
          </Form>
        </div>
      )}
      <div className="controls mb-4">
        <div className="control-group d-flex align-items-center">
          <ReviewToggle
            viewMode={viewMode}
            onToggle={setViewMode}
            showTeammateReviewsToStudents={showTeammateReviewsToStudents}
            isAdminOrInstructor={isAdminOrInstructor}
          />

          <Form.Check
            type="switch"
            id="question-toggle"
            label="Toggle Question List"
            checked={showQuestions}
            onChange={(e) => setShowQuestions(e.target.checked)}
            className="ms-4"
          />

          <Button
            variant="link"
            onClick={() => setShowReviews(!showReviews)}
            className="show-reviews-btn ms-4"
          >
            {showReviews ? "Hide Reviews" : "Show Reviews"} (
            {currentReviews[0]?.reviews.length || 0})
          </Button>
        </div>

        <Form.Check
          type="switch"
          id="anonymous-mode"
          label="Anonymous Mode"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
        />
      </div>

      <CompositeScore reviewsGiven={reviewData.given} reviewsReceived={reviewData.received} />

      <TeammateHeatmap
        data={currentReviews}
        showQuestions={showQuestions}
        isAnonymous={isAnonymous}
        columnAverages={columnAverages}
      />

      <Collapse in={showReviews}>
        <div>
          <ShowReviews data={currentReviews} isAnonymous={isAnonymous} />
        </div>
      </Collapse>
    </Container>
  );
};

export default TeammateReview;