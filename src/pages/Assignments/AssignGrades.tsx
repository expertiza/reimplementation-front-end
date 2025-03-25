import React, { useState } from "react";
import { Button, Container, Row, Col, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// Importing the ReviewTable (and related data)
import ReviewTable from "../ViewTeamGrades/ReviewTable";
import dummyData from "../ViewTeamGrades/Data/dummyData.json";
import dummyDataRounds from "../ViewTeamGrades/Data/heatMapData.json";

const AssignGrades: React.FC = () => {
  const navigate = useNavigate();

  // Toggles the submission display
  const [showSubmission, setShowSubmission] = useState(false);

  // Grade and Comment states
  const [grade, setGrade] = useState("");
  const [comment, setComment] = useState("");

  const handleSave = () => {
    console.log("Saving Grade:", grade, "Comment:", comment);
    // Here you could POST to /participants/:id/grade if hooking into your backend
    alert("Grade and comment saved successfully!");

    // Navigate to the home page (or another route of your choice)
    navigate("/");
  };

  return (
    <Container fluid className="px-4">
      <Row className="mt-4">
        <Col className="text-center">
          <h2>Summary Report for assignment: Program 1</h2>
          <p>Team: asd</p>
          <hr />
        </Col>
      </Row>

      <Row>
        <Col>
          <Button
            variant="outline-info"
            size="sm"
            onClick={() => setShowSubmission((prev) => !prev)}
          >
            {showSubmission ? "Hide Submission" : "Show Submission"}
          </Button>

          {showSubmission && (
            <div className="mt-2">
              <strong>No Submission Available</strong>
            </div>
          )}
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <h3>Teammate Review</h3>
          <p>toggle question list | color legend | interaction legend</p>
          {dummyDataRounds && dummyDataRounds.length > 0 ? (
            <ReviewTable />
          ) : (
            <p>There are no reviews for this assignment</p>
          )}
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <h3>Grade and comment for submission</h3>

          <Form.Group controlId="gradeInput" className="mb-3 mt-2" style={{ maxWidth: "200px" }}>
            <Form.Label>Grade</Form.Label>
            <Form.Control
              type="number"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Enter numeric grade"
            />
          </Form.Group>

          <Form.Group controlId="commentInput" className="mb-3" style={{ maxWidth: "500px" }}>
            <Form.Label>Comments</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter comments"
            />
          </Form.Group>

          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
          <Button variant="secondary" className="ms-2" onClick={() => navigate(-1)}>
            Back
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default AssignGrades;
