// src/pages/Assignments/ReviewReportPage.tsx

import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
// import { useAPI } from '../../hooks/useAPI'; // We'll use this soon

const ReviewReportPage = () => {
  // Get the assignment ID from the URL (e.g., /assignments/123/review)
  const { id } = useParams<{ id: string }>();

  // --- Placeholder for Data Fetching ---
  // We will uncomment and use this in the next step
  // const { data, isLoading, error } = useAPI(
  //   `/api/assignments/${id}/review_report`,
  // );

  // Placeholder loading state
  const isLoading = false;
  const error = null;

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <h2 className="text-danger">Error loading report</h2>
        <p>{(error as Error).message}</p>
      </Container>
    );
  }
  
  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title>Review Report for Assignment (ID: {id})</Card.Title>
            </Card.Header>
            <Card.Body>
              <p>
                Our review grading dashboard table will go here.
              </p>
              {/* Next steps:
                1. Fetch real data with useAPI.
                2. Create column definitions for the report.
                3. Pass data and columns to your <Table /> component.
              */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ReviewReportPage;