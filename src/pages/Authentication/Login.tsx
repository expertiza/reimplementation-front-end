import React from "react";
import { Button, Col, Container, InputGroup, Row } from "react-bootstrap";
import { Form, Formik, FormikHelpers } from "formik";
import FormInput from "../../components/Form/FormInput";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { authenticationActions } from "../../store/slices/authenticationSlice";
import { ILoggedInUser, ROLE } from "../../utils/interfaces";
import { alertActions } from "../../store/slices/alertSlice";
import { setAuthToken } from "../../utils/auth";
import * as Yup from "yup";
import axios from "axios";

/**
 * @author Ankur Mundra on June, 2023
 */
interface ILoginFormValues {
  user_name: string;
  password: string;
}

const validationSchema = Yup.object({
  user_name: Yup.string().required("Required"),
  password: Yup.string().required("Required"),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const onSubmit = (values: ILoginFormValues, submitProps: FormikHelpers<ILoginFormValues>) => {
    axios
      .post("http://localhost:3002/login", values)
      .then((response) => {
        const payload = setAuthToken(response.data.token);

        dispatch(
          authenticationActions.setAuthentication({
            authToken: response.data.token,
            user: payload,
          })
        );
        navigate(location.state?.from ? location.state.from : "/");
      })
      .catch((error) => {
        dispatch(
          alertActions.showAlert({
            variant: "danger",
            message: `Username or password is incorrect, ${error.message}`,
            title: "Unable to authenticate user!",
          })
        );
      });
    submitProps.setSubmitting(false);
  };

  // Development helper: mock sign-in without backend
  const handleMockSignIn = (user: ILoggedInUser) => {
    // Set a fake token and expiration in localStorage so utils/getAuthToken behave
    const mockToken = "MOCK_DEV_TOKEN";
    localStorage.setItem("token", mockToken);
    localStorage.setItem("expiration", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()); // 24h

    dispatch(
      authenticationActions.setAuthentication({
        authToken: mockToken,
        user: user,
      })
    );
    navigate(location.state?.from ? location.state.from : "/");
  };

  return (
    <Container className="d-flex justify-content-center mt-xxl-5">
      <Col xs={12} md={6} lg={4}>
        <h1 className="text-center">Login</h1>
        <Formik
          initialValues={{ user_name: "", password: "" }}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          validateOnChange={false}
        >
          {(formik) => {
            return (
              <Form>
                <FormInput
                  controlId="login-user-name"
                  label="User Name"
                  name="user_name"
                  inputGroupPrepend={<InputGroup.Text id="login-prepend">@</InputGroup.Text>}
                />
                <FormInput
                  controlId="user-password"
                  label="Password"
                  name="password"
                  type="password"
                />
                <Row className="mt-2 mb-2">
                  <Col className="d-flex justify-content-end">
                    <Link to="/forgot-password">Forgot password?</Link>
                  </Col>
                </Row>
                <Button
                  style={{ width: "100%" }}
                  variant="primary"
                  type="submit"
                  disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
                >
                  Login
                </Button>
                {process.env.NODE_ENV === "development" && (
                  <div className="mt-2">
                    <div className="text-center mb-1 small text-muted">Dev helpers</div>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="mb-1"
                      style={{ width: "100%" }}
                      onClick={() =>
                        handleMockSignIn({ id: 1, name: "admin", full_name: "Admin User", role: ROLE.SUPER_ADMIN as unknown as string, institution_id: 1 })
                      }
                    >
                      Sign in as Super Admin (dev)
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="mb-1"
                      style={{ width: "100%" }}
                      onClick={() =>
                        handleMockSignIn({ id: 2, name: "instructor", full_name: "Instructor User", role: ROLE.INSTRUCTOR as unknown as string, institution_id: 1 })
                      }
                    >
                      Sign in as Instructor (dev)
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      style={{ width: "100%" }}
                      onClick={() =>
                        handleMockSignIn({ id: 3, name: "student", full_name: "Student User", role: ROLE.STUDENT as unknown as string, institution_id: 1 })
                      }
                    >
                      Sign in as Student (dev)
                    </Button>
                  </div>
                )}
              </Form>
            );
          }}
        </Formik>
      </Col>
    </Container>
  );
};

export default Login;
