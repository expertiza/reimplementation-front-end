import React from "react";
import { useParams } from "react-router-dom";
import { Container, Table, Spinner, Button, Form } from "react-bootstrap";
import "./Reviews.css"; // <-- your CSS goes here

const ReviewReportPage = () => {
  const { id } = useParams<{ id: string }>();

  const isLoading = false;
  const error = null;

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
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

      <select name="reports" id="report-select">
        <option value="review">Review report</option>
        <option value="summary">Summary report</option>
        <option value="detailed">Detailed report</option>
      </select>

      <button type="button">View</button>

    <h2 style={{ textAlign: "left" }}>
      Review report for Final project (and design doc)
    </h2>      
      <a href="#">Back</a>
{/* Search box */}
      <div style={{ marginTop: "15px" }}>
        <Form.Label>Reviewer's Name</Form.Label>
        <Form.Control type="text" style={{ width: "250px", display: "inline-block" }} />
        <Button className="ms-2">Search</Button>
      </div>

      {/* Legend */}
      <div className="legend mt-3">
        <p><strong>**In "Team reviewed” column text in:</strong></p>
        <ul>
          <li><span className="legend-red">red</span> indicates that the review is not completed in any rounds;</li>
          <li><span className="legend-blue">blue</span> indicates that a review is completed in every round and the review grade is not assigned;</li>
          <li><span className="legend-green">green</span> indicates that there is no submitted work to review within the round;</li>
          <li><span className="legend-purple">purple</span> indicates that there is no review for a submitted work within the round;</li>
          <li><span className="legend-brown">brown</span> indicates that the review grade has been assigned;</li>
          <li>✔ Check mark indicates that the student has given consent to make the reviews public</li>
        </ul>
      </div>

      <Button className="mb-3">Export Review Scores To CSV File</Button>

      <Table bordered>
        <thead>
          <tr>
            <th>Reviewer</th>
            <th>Reviews Done</th>
            <th>Team reviewed</th>
            <th>Scores Awarded</th>
            <th>AVG Score</th>
            <th>Metrics</th>
            <th>Assign grade</th>
          </tr>
        </thead>

        <tbody>
          to be parsed
        </tbody>
      </Table>
    </Container>
  );
};

export default ReviewReportPage;
