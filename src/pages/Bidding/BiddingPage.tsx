import React, { useState } from 'react';
import { Card, Row, Col, Badge, Modal } from 'react-bootstrap';
import { BiddingTopic } from '../../utils/types';
import biddingData from './data.json';
import './BiddingPage.scss';

const BiddingPage: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<BiddingTopic | null>(null);
  const [showModal, setShowModal] = useState(false);

  const topics: BiddingTopic[] = biddingData.topics;

  const getBidPercentageVariant = (percentage: number): string => {
    if (percentage === 0) return 'danger';
    if (percentage === 100) return 'success';
    return 'warning';
  };

  const handleCardClick = (topic: BiddingTopic) => {
    setSelectedTopic(topic);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTopic(null);
  };

  return (
    <div className="bidding-page">
      <h2>Assignment Bidding Summary by Priority</h2>
      
      <Row xs={1} md={2} lg={3} className="g-4">
        {topics.map((topic) => (
          <Col key={topic.topicId}>
            <Card 
              className="bidding-card" 
              onClick={() => handleCardClick(topic)}
              style={{ cursor: 'pointer' }}
            >
              <Card.Header>
                <h5 className="mb-0">{topic.topicName}</h5>
                <div className="topic-id">ID: {topic.topicId}</div>
              </Card.Header>
              <Card.Body>
                <div className="bid-stats">
                  <div className="bid-stat">
                    <span className="stat-label">#1 Bids:</span>
                    <span className="stat-value">{topic.bidding['#1'].length}</span>
                  </div>
                  <div className="bid-stat">
                    <span className="stat-label">#2 Bids:</span>
                    <span className="stat-value">{topic.bidding['#2'].length}</span>
                  </div>
                  <div className="bid-stat">
                    <span className="stat-label">#3 Bids:</span>
                    <span className="stat-value">{topic.bidding['#3'].length}</span>
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
                    {Object.entries(topic.bidding).map(([priority, teams]) => (
                      teams.map((team, index) => (
                        <Badge key={`${priority}-${index}`} bg="secondary" className="team-badge">
                          {team} ({priority})
                        </Badge>
                      ))
                    ))}
                  </div>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedTopic?.topicName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTopic && (
            <div className="modal-content">
              <div className="topic-details">
                <h5>Topic ID: {selectedTopic.topicId}</h5>
                <div className="bid-stats">
                  <div className="bid-stat">
                    <span className="stat-label">First Priority Bids:</span>
                    <span className="stat-value">{selectedTopic.bidding['#1'].length}</span>
                  </div>
                  <div className="bid-stat">
                    <span className="stat-label">Second Priority Bids:</span>
                    <span className="stat-value">{selectedTopic.bidding['#2'].length}</span>
                  </div>
                  <div className="bid-stat">
                    <span className="stat-label">Third Priority Bids:</span>
                    <span className="stat-value">{selectedTopic.bidding['#3'].length}</span>
                  </div>
                  <div className="bid-stat">
                    <span className="stat-label">Total Bids:</span>
                    <span className="stat-value">{selectedTopic.totalBids}</span>
                  </div>
                </div>
                <div className="percentage-badge mt-3">
                  <Badge bg={getBidPercentageVariant(selectedTopic.percentageFirstBids)}>
                    {selectedTopic.percentageFirstBids.toFixed(1)}% First Priority
                  </Badge>
                </div>
                <div className="teams-section mt-4">
                  <h6>Bidding Teams by Priority:</h6>
                  {Object.entries(selectedTopic.bidding).map(([priority, teams]) => (
                    <div key={priority} className="priority-group">
                      <h6>{priority} Priority:</h6>
                      <div className="teams-list">
                        {teams.map((team, index) => (
                          <Badge key={index} bg="secondary" className="team-badge">
                            {team}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default BiddingPage; 