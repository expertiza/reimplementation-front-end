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

      <h2>Review report for Final project (and design doc)</h2>

      <a href="#">Back</a>

      {/* Search box */}
      <div style={{ marginTop: "15px" }}>
        <Form.Label>Reviewer's Name</Form.Label>
        <Form.Control type="text" style={{ width: "250px", display: "inline-block" }} />
        <Button className="ms-2">Search</Button>
      </div>

      {/* Legend */}
      <div className="legend mt-3">
        <p><strong>“In Team reviewed” column text in:</strong></p>
        <ul>
          <li><span className="legend-red">red</span> = review not completed</li>
          <li><span className="legend-blue">blue</span> = completed but grade not assigned</li>
          <li><span className="legend-green">green</span> = no submission</li>
          <li><span className="legend-purple">purple</span> = no review for submitted work</li>
          <li><span className="legend-brown">brown</span> = review grade assigned</li>
          <li>✔ indicates public review consent</li>
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
          <tr className="row-highlight">
            <td><strong className="reviewer-name">1. Student 10807</strong></td>
            <td>4/4 summary</td>
            <td>
              ✔ (E2526 team)<br />
              ✔ (E2524 team)<br />
              ✔ (E2540 team)<br />
              ✔ (E2523 team)
            </td>
            <td>
              80%<br />76%<br />67%<br />60%
            </td>
            <td>
              80%<br />76%<br />67%<br />60%
            </td>
            <td>
              <div className="metrics-chart">chart</div>
            </td>
            <td>
              <Form.Control type="number" defaultValue={40} />
              <div className="grade-box mt-2">
                <Form.Select>
                  <option>4 reviews × 10</option>
                </Form.Select>
                <Button className="ms-2">Save</Button>
              </div>
            </td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
};

export default ReviewReportPage;
