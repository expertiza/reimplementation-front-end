import React from "react";
import { Button, Col, Container, InputGroup, Row } from "react-bootstrap";
import { Form, Formik, FormikHelpers } from "formik";
import FormInput from "../../components/Form/FormInput";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { authenticationActions } from "../../store/slices/authenticationSlice";
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
      .post("http://152.7.177.187:3002/login", values)
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
              </Form>
            );
          }}
        </Formik>
      </Col>
    </Container>
  );
};

export default Login;
