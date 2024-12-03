// src/pages/TeammateReview/components/CompositeScore.tsx
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { CompositeScoreProps } from '../types';
import { calculateCompositeScore } from '../utils';

const CompositeScore: React.FC<CompositeScoreProps> = ({ 
  reviewsGiven, 
  reviewsReceived 
}) => {
  const givenScore = calculateCompositeScore(reviewsGiven);
  const receivedScore = calculateCompositeScore(reviewsReceived);
  const overallScore = ((givenScore + receivedScore) / 2);

  return (
    <Card className="mb-4">
      <Card.Body>
        <Row>
          <Col md={4}>
            <Card.Title>Reviews given</Card.Title>
            <div className="score-display">
              {givenScore.toFixed(2)} / 5
            </div>
          </Col>
          <Col md={4}>
            <Card.Title>Reviews received</Card.Title>
            <div className="score-display">
              {receivedScore.toFixed(2)} / 5
            </div>
          </Col>
          <Col md={4}>
            <Card.Title>Overall score</Card.Title>
            <div className="score-display highlight">
              {overallScore.toFixed(2)} / 5
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default CompositeScore;