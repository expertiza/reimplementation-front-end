// src/pages/TeammateReview/components/ReviewToggle.tsx

import React from 'react';
import { Button } from 'react-bootstrap';

interface ReviewToggleProps {
  viewMode: 'given' | 'received';
  onToggle: (mode: 'given' | 'received') => void;
  showTeammateReviews?: boolean;
  isInstructor?: boolean;
}

const ReviewToggle: React.FC<ReviewToggleProps> = ({ 
  viewMode, 
  onToggle, 
  showTeammateReviews = true,
  isInstructor = false 
}) => {
  // 如果是学生且不允许查看teammate reviews，则只显示"Reviews Given"
  if (!isInstructor && !showTeammateReviews) {
    return (
      <div className="review-toggle">
        <Button 
          variant={viewMode === 'given' ? 'primary' : 'outline-primary'}
          onClick={() => onToggle('given')}
        >
          Reviews Given
        </Button>
      </div>
    );
  }

  return (
    <div className="review-toggle">
      <Button 
        variant={viewMode === 'given' ? 'primary' : 'outline-primary'}
        onClick={() => onToggle('given')}
        className="me-2"
      >
        Reviews Given
      </Button>
      <Button 
        variant={viewMode === 'received' ? 'primary' : 'outline-primary'}
        onClick={() => onToggle('received')}
      >
        Reviews Received
      </Button>
    </div>
  );
};

export default ReviewToggle;