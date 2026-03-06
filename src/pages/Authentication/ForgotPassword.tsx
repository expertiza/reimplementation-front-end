import React, {useState} from "react";
import { Button, Col, Container, Form } from "react-bootstrap";
import axios, { AxiosError } from 'axios';
import { alertActions } from "../../store/slices/alertSlice";
import { useDispatch } from "react-redux";
import { API_BASE_URL } from '@/constants/Api';

const ForgotPassword = () =>{

  const [email, setEmail] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {

    try {
      await axios.post(`${API_BASE_URL}/password_resets`, { email });

      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `A link to reset your password has been sent to your e-mail address.`,
        })
      );
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
  };


  return (
    <Container className="d-flex justify-content-center mt-xxl-5">
      <Col xs={12} md={6} lg={4}>
        <h1 className="text-center">Forgotten Your Password?</h1>
        <p className="text-center">Enter the e-mail address associated with your account</p>
        <Form.Group className="mb-2" controlId="forgot-password-email">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Button
          style={{ width: "100%" }}
          variant="primary"
          type="submit"
          onClick={handleSubmit}
        >
          Request Password Reset
        </Button>
      </Col>
    </Container>
  );

};

export default ForgotPassword;