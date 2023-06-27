import React from "react";
import { Alert, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

/**
 * @author Ankur Mundra on June, 2023
 */

interface AccessDeniedProps {
  message: string;
}

const AccessDenied = ({ message }: AccessDeniedProps) => {
  const navigate = useNavigate();

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <div>
        <Alert variant="danger">
          <Alert.Heading>Access Denied!</Alert.Heading>
          <p>{message}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-danger" onClick={() => navigate("..")}>
              Go Back
            </Button>
          </div>
        </Alert>
      </div>
    </Container>
  );
};

export default AccessDenied;
