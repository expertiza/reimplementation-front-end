import React, { useState } from 'react';
import { Card, Row, Col, Badge, Modal, Table } from 'react-bootstrap';
import { BiddingTopic } from '../../utils/types';
import biddingData from './data.json';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './BiddingPage.scss';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

  const getChartData = (topic: BiddingTopic) => {
    return {
      labels: ['First Priority', 'Second Priority', 'Third Priority'],
      datasets: [
        {
          label: 'Number of Bids',
          data: [
            topic.bidding['#1'].length,
            topic.bidding['#2'].length,
            topic.bidding['#3'].length,
          ],
          backgroundColor: [
            'rgba(46, 125, 50, 0.7)',  // Green for first priority
            'rgba(33, 150, 243, 0.7)', // Blue for second priority
            'rgba(255, 152, 0, 0.7)',  // Orange for third priority
          ],
          borderColor: [
            'rgba(46, 125, 50, 1)',
            'rgba(33, 150, 243, 1)',
            'rgba(255, 152, 0, 1)',
          ],
          borderWidth: 2,
          borderRadius: 8,
          barThickness: 40,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          font: {
            size: 14,
            weight: 'bold' as const,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: 'Bid Distribution by Priority',
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            const priority = context.label;
            const value = context.raw;
            const priorityNumber = priority.split(' ')[0];
            const priorityKey = `#${priorityNumber}` as '#1' | '#2' | '#3';
            const teams = selectedTopic?.bidding[priorityKey] || [];
            return [
              `Bids: ${value}`,
              `Teams: ${teams.join(', ')}`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 12,
            weight: 'bold' as const,
          },
          padding: 10,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        ticks: {
          font: {
            size: 12,
            weight: 'bold' as const,
          },
          padding: 10,
        },
        grid: {
          display: false,
        },
      },
    },
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
          <div className="d-flex align-items-center">
            <Modal.Title className="mb-0">{selectedTopic?.topicName}</Modal.Title>
            <Badge bg="secondary" className="ms-2">
              ID: {selectedTopic?.topicId}
            </Badge>
          </div>
        </Modal.Header>
        <Modal.Body>
          {selectedTopic && (
            <div className="modal-content">
              <div className="topic-details">
                <div className="chart-container">
                  <Bar options={chartOptions} data={getChartData(selectedTopic)} />
                </div>

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

                <div className="bidding-table mt-4">
                  <h6>Bidding Details</h6>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Priority</th>
                        <th>Number of Bids</th>
                        <th>Teams</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(selectedTopic.bidding).map(([priority, teams]) => (
                        <tr key={priority}>
                          <td>
                            <Badge bg={
                              priority === '#1' ? 'success' :
                              priority === '#2' ? 'primary' : 'warning'
                            }>
                              {priority}
                            </Badge>
                          </td>
                          <td>{teams.length}</td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {teams.map((team, index) => (
                                <Badge key={index} bg="secondary">
                                  {team}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td>
                            {((teams.length / selectedTopic.totalBids) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
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