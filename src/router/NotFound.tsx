import React from "react";
import { Alert, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

/**
 * @author Ankur Mundra on June, 2023
 */

function NotFound() {
  const navigate = useNavigate();
  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <div>
        <Alert variant="danger">
          <Alert.Heading>Oops! Something went wrong.</Alert.Heading>
          <hr />
          <h1>404 Not Found!</h1>
          <p>The page you are looking for does not exist.</p>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={() => navigate("/")}>
              {" "}
              Go Home{" "}
            </Button>
          </div>
        </Alert>
      </div>
    </Container>
  );
}

export default NotFound;
