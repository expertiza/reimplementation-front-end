import React, { useState } from 'react';
import { Card, Row, Col, Badge, Modal } from 'react-bootstrap';
import { BiddingTopic } from '../../utils/types';
import biddingData from './data.json';
import './BiddingPage.scss';

const BiddingPage: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<BiddingTopic | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Sample data - replace with actual data from your API
  const biddingData: BiddingTopic[] = [
    {
      topicId: 5135,
      topicName: 'Topic OODD',
      firstPriorityBids: 0,
      secondPriorityBids: 3,
      thirdPriorityBids: 1,
      totalBids: 4,
      percentageFirstBids: 0,
      biddingTeams: ['Team_1', 'Team_2', 'Team_3', 'Team_4'],
    },
    {
      topicId: 5136,
      topicName: 'Topic2',
      firstPriorityBids: 0,
      secondPriorityBids: 0,
      thirdPriorityBids: 1,
      totalBids: 3,
      percentageFirstBids: 0,
      biddingTeams: ['Team_2', 'Team_3', 'Team_4'],
    },
    {
      topicId: 5137,
      topicName: 'Topic3',
      firstPriorityBids: 1,
      secondPriorityBids: 1,
      thirdPriorityBids: 0,
      totalBids: 3,
      percentageFirstBids: 33.33,
      biddingTeams: ['Team_1', 'Team_2', 'Team_3'],
    },
    {
      topicId: 5138,
      topicName: 'Topic new',
      firstPriorityBids: 0,
      secondPriorityBids: 0,
      thirdPriorityBids: 1,
      totalBids: 1,
      percentageFirstBids: 0,
      biddingTeams: ['Team_4'],
    },
    {
      topicId: 5139,
      topicName: 'Topic decode',
      firstPriorityBids: 3,
      secondPriorityBids: 0,
      thirdPriorityBids: 0,
      totalBids: 3,
      percentageFirstBids: 100,
      biddingTeams: ['Team_4', 'Team_3', 'Team_2'],
    },
  ];

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
                    <span className="stat-value">{selectedTopic.firstPriorityBids}</span>
                  </div>
                  <div className="bid-stat">
                    <span className="stat-label">Second Priority Bids:</span>
                    <span className="stat-value">{selectedTopic.secondPriorityBids}</span>
                  </div>
                  <div className="bid-stat">
                    <span className="stat-label">Third Priority Bids:</span>
                    <span className="stat-value">{selectedTopic.thirdPriorityBids}</span>
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
                  <h6>Bidding Teams:</h6>
                  <div className="teams-list">
                    {selectedTopic.biddingTeams.map((team, index) => (
                      <Badge key={index} bg="secondary" className="team-badge">
                        {team}
                      </Badge>
                    ))}
                  </div>
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