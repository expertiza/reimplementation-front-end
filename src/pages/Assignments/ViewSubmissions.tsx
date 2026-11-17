import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const ViewSubmissions: React.FC = () => {
  return (
    <Container className="mt-4">
      <div
        style={{
          color: "#31708f",
          backgroundColor: "#d9edf7",
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #bce8f1",
          marginBottom: "20px",
        }}
      >
        This is a placeholder page and is still in progress.
      </div>
      <Row className="mt-md-2 mb-md-2">
        <Col className="text-center">
          <h1>View Submissions</h1>
        </Col>
        <hr />
      </Row>
      {/* <Row>
        <Col className="text-right">
          <Button variant="outline-secondary" onClick={handleClose} style={{ marginRight: '10px' }}>
            Close
          </Button>
        </Col>
      </Row> */}
    </Container>
  );
};

export default ViewSubmissions;
