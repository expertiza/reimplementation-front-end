import React, { useState, useRef } from 'react';
import { Card, Row, Col, Badge, Modal, Table, Button } from 'react-bootstrap';
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

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
  const chartRef = useRef<HTMLDivElement>(null);

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

  const handleDownloadPDF = async () => {
    if (!selectedTopic || !chartRef.current) return;
    
    // Create a new PDF document
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    
    // Add a title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Bidding Report: ${selectedTopic.topicName}`, 20, 20);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Topic ID: ${selectedTopic.topicId}`, 20, 30);
    
    try {
      // Capture the chart as an image
      const canvas = await html2canvas(chartRef.current);
      const chartImage = canvas.toDataURL('image/png');
      
      // Add the chart image to the PDF (positioned below the title)
      pdf.addImage(chartImage, 'PNG', 20, 40, 170, 80);
      
      // Add bidding stats as text
      pdf.setFontSize(12);
      pdf.text('Bidding Summary:', 20, 130);
      pdf.text(`First Priority Bids: ${selectedTopic.bidding['#1'].length}`, 30, 140);
      pdf.text(`Second Priority Bids: ${selectedTopic.bidding['#2'].length}`, 30, 150);
      pdf.text(`Third Priority Bids: ${selectedTopic.bidding['#3'].length}`, 30, 160);
      pdf.text(`Total Bids: ${selectedTopic.totalBids}`, 30, 170);
      
      // Add the bidding details table
      pdf.text('Bidding Details Table:', 20, 180);
      
      // Define table data
      const tableData = Object.entries(selectedTopic.bidding).map(([priority, teams]) => [
        priority,
        teams.length,
        teams.join(', '),
        ((teams.length / selectedTopic.totalBids) * 100).toFixed(1) + '%'
      ]);
      
      // Add table to PDF
      autoTable(pdf, {
        startY: 185,
        head: [['Priority', 'Number of Bids', 'Teams', 'Percentage']],
        body: tableData,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 135, 245] },
        margin: { top: 20 },
      });
      
      // Save the PDF
      pdf.save(`bidding_report_${selectedTopic.topicId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleDownloadCSV = () => {
    if (!selectedTopic) return;

    // Create CSV headers
    const headers = ['Priority', 'Number of Bids', 'Teams', 'Percentage'];
    
    // Create CSV rows
    const rows = Object.entries(selectedTopic.bidding).map(([priority, teams]) => [
      priority,
      teams.length,
      teams.join('; '),
      ((teams.length / selectedTopic.totalBids) * 100).toFixed(1) + '%'
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bidding_report_${selectedTopic.topicId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            const priorityKey = priority === 'First Priority' ? '#1' :
                              priority === 'Second Priority' ? '#2' : '#3';
            const teams = selectedTopic?.bidding[priorityKey] || [];
            return [
              `Bids: ${value}`,
              teams.length > 0 ? `Teams: ${teams.join(', ')}` : 'No teams'
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
                <div className="chart-container" ref={chartRef}>
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
                
                <div className="mt-4 text-center">
                  <div className="download-buttons">
                    <Button 
                      variant="primary" 
                      onClick={handleDownloadPDF}
                      className="download-btn"
                    >
                      <i className="fas fa-file-pdf me-2"></i>
                      Download as PDF
                    </Button>
                    <Button 
                      variant="success" 
                      onClick={handleDownloadCSV}
                      className="download-btn"
                    >
                      <i className="fas fa-file-csv me-2"></i>
                      Download as CSV
                    </Button>
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