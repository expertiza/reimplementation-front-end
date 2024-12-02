// src/pages/TeammateReview/TeammateReview.tsx

import React, { useState, useMemo } from 'react';
import { Container, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import ReviewToggle from './components/ReviewToggle';
import CompositeScore from './components/CompositeScore';
import TeammateHeatmap from './components/TeammateHeatmap';
import RoundSelector from './components/RoundSelector';
import { generateAllReviews } from './utils';
import './TeammateReview.scss';

const TeammateReview: React.FC = () => {
  const [viewMode, setViewMode] = useState<'given' | 'received'>('received');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const [currentRound, setCurrentRound] = useState(0);

  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );

  const isInstructor = auth.user.role === 'Instructor';
  const showTeammateReviews = true; // This would come from your assignment settings

  const reviewData = useMemo(() => generateAllReviews(), []);

  const currentReviews = viewMode === 'given' 
    ? reviewData.given[currentRound]
    : reviewData.received[currentRound];

  return (
    <Container fluid className="teammate-review-container">
      <h2 className="mb-4">Teammate Reviews</h2>
      
      <div className="controls mb-4">
        <div className="control-group">
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
      />

      <RoundSelector
        currentRound={currentRound}
        totalRounds={2}
        onRoundChange={setCurrentRound}
      />
    </Container>
  );
};

export default TeammateReview;