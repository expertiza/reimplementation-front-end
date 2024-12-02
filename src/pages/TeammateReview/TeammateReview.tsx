import React, { useState, useMemo } from 'react';
import { Container, Form, Button, Collapse } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import ReviewToggle from './components/ReviewToggle';
import CompositeScore from './components/CompositeScore';
import TeammateHeatmap from './components/TeammateHeatmap';
import RoundSelector from './components/RoundSelector';
import CircularProgress from '../ViewTeamGrades/CircularProgress';
// import BarGraph from '../ViewTeamGrades/BarGraph';
import ShowReviews from './components/ShowReviews';
import { generateAllReviews } from './utils';
import './TeammateReview.scss';

const TeammateReview: React.FC = () => {
  const [viewMode, setViewMode] = useState<'given' | 'received'>('received');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const [currentRound, setCurrentRound] = useState(0);
  const [showReviews, setShowReviews] = useState(false);

  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );

  const isInstructor = auth.user?.role === 'Instructor';
  const showTeammateReviews = true; // This would come from your assignment settings

  const reviewData = useMemo(() => generateAllReviews(), []);
  
  // Mock assignment data - in a real app, this would come from your state/API
  const assignmentInfo = {
    name: "Final Project",
    teamName: "group1"
  };

  // Calculate column averages
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

  const currentReviews = viewMode === 'given' 
    ? reviewData.given[currentRound]
    : reviewData.received[currentRound];

  const columnAverages = calculateColumnAverages(currentReviews);

  // Calculate stats for bar graph
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

      <RoundSelector
        currentRound={currentRound}
        totalRounds={2}
        onRoundChange={setCurrentRound}
      />

      <Collapse in={showReviews}>
        <div>
          <ShowReviews 
            data={currentReviews}
            isAnonymous={isAnonymous}
          />
        </div>
      </Collapse>

      {/* <div className="stats-section mt-4">
        <div className="d-flex justify-content-between align-items-center">
          <BarGraph sortedData={statsData} />
          <CircularProgress 
            size={70} 
            progress={75} 
            strokeWidth={10} 
          />
        </div>
      </div> */}
      
    </Container>
  );
};

export default TeammateReview;