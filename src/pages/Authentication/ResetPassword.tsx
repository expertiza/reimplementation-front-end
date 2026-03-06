import React, { useState, useEffect } from "react";
import { Button, Col, Container, Form } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { alertActions } from "../../store/slices/alertSlice";
import { useDispatch } from "react-redux";
import { API_BASE_URL } from '@/constants/Api';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  // Ensure the token is present when the component mounts
  useEffect(() => {
    if (!token) {
      dispatch(
        alertActions.showAlert({
          variant: "danger",
          message: "Invalid or missing token.",
        })
      );
      navigate("/login");
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {


    if (password.length < 6) {
      dispatch(
        alertActions.showAlert({
          variant: "danger",
          message: "Password should be at least 6 letters long."
        })
      );
      return;
    }
    else if (password !== confirmPassword) {
      dispatch(
        alertActions.showAlert({
          variant: "danger",
          message: "Passwords do not match."
        })
      );
      return;
    }
    else {
      try {
        // Send password reset request to the backend
        await axios.put(`${API_BASE_URL}/password_resets/${token}`, {
          user: { password },
        });

        dispatch(
          alertActions.showAlert({
            variant: "success",
            message: `Password Successfully Updated`,
          })
        );

        navigate("/login");

      } catch (error) {
        if (error instanceof AxiosError && error.response && error.response.data) {
          const { error: errorMessage} = error.response.data;
          if (errorMessage) {
            dispatch(
              alertActions.showAlert({
                variant: "danger",
                message: errorMessage,
              })
            );
          }
        }
      }
    }
  };

  return (
    <Container className="d-flex justify-content-center mt-xxl-5">
      <Col xs={12} md={6} lg={4}>
        <h1 className="text-center">Reset Your Password</h1>
        <Form.Group className="mb-2" controlId="reset-password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-2" controlId="reset-confirm-password">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Button
          style={{ width: "100%" }}
          variant="primary"
          type="submit"
          onClick={handleSubmit}
        >
          Reset Password
        </Button>
      </Col>
    </Container>
  );
};

export default ResetPassword;
