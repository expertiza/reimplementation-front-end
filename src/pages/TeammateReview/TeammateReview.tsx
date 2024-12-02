// src/pages/TeammateReview/TeammateReview.tsx

import React, { useState } from 'react';
import { Container, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import ReviewToggle from './components/ReviewToggle';
import CompositeScore from './components/CompositeScore';
import TeammateHeatmap from './components/TeammateHeatmap';
import { reviewsGiven, reviewsReceived } from './data/dummyData';
import './TeammateReview.scss';

const TeammateReview: React.FC = () => {
  const [viewMode, setViewMode] = useState<'given' | 'received'>('received');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );

  const isInstructor = auth.user.role === 'Instructor';
  const showTeammateReviews = true; // Should come from assignment settings

  const anonymizeData = (data: any[][]) => {
    if (!isAnonymous) return data[0];
    
    return data[0].map(review => ({
      ...review,
      reviews: review.reviews.map((r: any, idx: number) => ({
        ...r,
        name: `Student ${idx + 1}`
      }))
    }));
  };

  const currentReviews = viewMode === 'given' ? reviewsGiven : reviewsReceived;

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
        reviews={currentReviews}
        viewMode={viewMode}
      />

      <TeammateHeatmap
        data={anonymizeData(currentReviews)}
        showQuestions={showQuestions}
      />
    </Container>
  );
};

export default TeammateReview;