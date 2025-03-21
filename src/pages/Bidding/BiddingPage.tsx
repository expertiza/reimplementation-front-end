import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { BiddingTopic } from '../../utils/types';
import biddingData from './data.json';
import './BiddingPage.scss';

const BiddingPage: React.FC = () => {
  const topics: BiddingTopic[] = biddingData.topics;

  const getBidPercentageVariant = (percentage: number): string => {
    if (percentage === 0) return 'danger';
    if (percentage === 100) return 'success';
    return 'warning';
  };

  return (
    <div className="bidding-page">
      <h2>Assignment Bidding Summary by Priority</h2>
      
      <Row xs={1} md={2} lg={3} className="g-4">
        {topics.map((topic) => (
          <Col key={topic.topicId}>
            <Card className="bidding-card">
              <Card.Header>
                <h5 className="mb-0">{topic.topicName}</h5>
                <div className="topic-id">ID: {topic.topicId}</div>
              </Card.Header>
              <Card.Body>
                <div className="bid-stats">
                  <div className="bid-stat">
                    <span className="stat-label">#1 Bids:</span>
                    <span className="stat-value">{topic.firstPriorityBids}</span>
                  </div>
                  <div className="bid-stat">
                    <span className="stat-label">#2 Bids:</span>
                    <span className="stat-value">{topic.secondPriorityBids}</span>
                  </div>
                  <div className="bid-stat">
                    <span className="stat-label">#3 Bids:</span>
                    <span className="stat-value">{topic.thirdPriorityBids}</span>
                  </div>
                  <div className="bid-stat">
                    <span className="stat-label">Total Bids:</span>
                    <span className="stat-value">{topic.totalBids}</span>
                  </div>
                </div>
                
                <div className="percentage-badge mt-3">
                  <Badge bg={getBidPercentageVariant(topic.percentageFirstBids)}>
                    {topic.percentageFirstBids.toFixed(1)}% First Priority
                  </Badge>
                </div>
              </Card.Body>
              <Card.Footer>
                <div className="teams-section">
                  <div className="teams-label">Bidding Teams:</div>
                  <div className="teams-list">
                    {topic.biddingTeams.map((team, index) => (
                      <Badge key={index} bg="secondary" className="team-badge">
                        {team}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default BiddingPage; 