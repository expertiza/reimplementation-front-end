// src/pages/TeammateReview/components/CompositeScore.tsx

import React from 'react';
import { Card } from 'react-bootstrap';
import { Review } from '../data/dummyData';

interface CompositeScoreProps {
  reviews: Review[][];
  viewMode: 'given' | 'received';
}

const calculateCompositeScore = (reviews: Review[][]): number => {
  let totalScore = 0;
  let totalQuestions = 0;

  reviews.forEach(round => {
    round.forEach(review => {
      const avgScore = review.reviews.reduce((sum, r) => sum + r.score, 0) / review.reviews.length;
      totalScore += avgScore;
      totalQuestions += 1;
    });
  });

  return totalQuestions > 0 ? Number((totalScore / totalQuestions).toFixed(2)) : 0;
};

const CompositeScore: React.FC<CompositeScoreProps> = ({ reviews, viewMode }) => {
  const score = calculateCompositeScore(reviews);
  const maxScore = reviews[0]?.[0]?.maxScore || 5;

  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>
          Composite Score - {viewMode === 'given' ? 'Reviews Given' : 'Reviews Received'}
        </Card.Title>
        <Card.Text className="display-4 text-center">
          {score} / {maxScore}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default CompositeScore;