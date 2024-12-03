import React, { useState, useMemo } from 'react';
import { Container, Form, Button, Collapse } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import ReviewToggle from './components/ReviewToggle';
import CompositeScore from './components/CompositeScore';
import TeammateHeatmap from './components/TeammateHeatmap';
import CircularProgress from '../ViewTeamGrades/CircularProgress';
import ShowReviews from './components/ShowReviews';
import { generateAllReviews } from './utils';
import './TeammateReview.scss';

const TeammateReview: React.FC = () => {
  const [viewMode, setViewMode] = useState<'given' | 'received'>('received');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const [showReviews, setShowReviews] = useState(false);

  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );

  const isInstructor = auth.user?.role === 'Instructor';
  const showTeammateReviews = true;

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

  const statsData = calculateRowAverages();

  return (
    <Container fluid className="teammate-review-container">
      <h2 className="mb-4">Teammate Reviews</h2>
      
      <div className="assignment-info">
        <h2>Assignment: {assignmentInfo.name}</h2>
        <h3>Team: {assignmentInfo.teamName}</h3>
      </div>
      
      <div className="controls mb-4">
        <div className="control-group d-flex align-items-center">
          <ReviewToggle
            viewMode={viewMode}
            onToggle={setViewMode}
            showTeammateReviews={showTeammateReviews}
            isInstructor={isInstructor}
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
            {showReviews ? 'Hide Reviews' : 'Show Reviews'} ({currentReviews[0]?.reviews.length || 0})
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

      <CompositeScore
        reviewsGiven={reviewData.given}
        reviewsReceived={reviewData.received}
      />

      <TeammateHeatmap
        data={currentReviews}
        showQuestions={showQuestions}
        isAnonymous={isAnonymous}
        columnAverages={columnAverages}
      />

      <Collapse in={showReviews}>
        <div>
          <ShowReviews 
            data={currentReviews}
            isAnonymous={isAnonymous}
          />
        </div>
      </Collapse>
    </Container>
  );
};

export default TeammateReview;