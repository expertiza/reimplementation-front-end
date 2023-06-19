import React from "react";
import {Alert, Button, Container} from "react-bootstrap";
import {useNavigate, useRouteError} from "react-router-dom";
import Header from "../layout/Header";

/**
 * @author Ankur Mundra on June, 2023
 */
const ErrorPage: React.FC = () => {
  const error: any = useRouteError();
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <div>
          <Alert variant="danger">
            <Alert.Heading>Oops! Something went wrong.</Alert.Heading>
            <p>{error.message}</p>
            <p>{error.data}</p>
            <p>{error.response && error.response.data.error}</p>
            <hr />
            <div className="d-flex justify-content-end">
              <Button variant="outline-danger" onClick={() => navigate("/")}>
                Go Home
              </Button>
            </div>
          </Alert>
        </div>
      </Container>
    </>
  );
};

export default ErrorPage;
