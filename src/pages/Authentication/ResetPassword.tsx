import React, { useEffect } from "react";
import { Button, Col, Container } from "react-bootstrap";
import { Form, Formik, FormikHelpers } from "formik";
import FormInput from "../../components/Form/FormInput";
import { useLocation, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { alertActions } from "../../store/slices/alertSlice";
import { useDispatch } from "react-redux";
import { API_BASE_URL } from "../../constants/Api";
import * as Yup from "yup";

interface IResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

const validationSchema = Yup.object({
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Required"),
});

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
  }, [token, dispatch, navigate]);

  const onSubmit = async (
    values: IResetPasswordFormValues,
    submitProps: FormikHelpers<IResetPasswordFormValues>
  ) => {
    try {
      // Send password reset request to the backend
      await axios.put(`${API_BASE_URL}/password_resets/${token}`, {
        user: { password: values.password },
      });
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: "Password Successfully Updated",
        })
      );
      navigate("/login");
    } catch (error) {
      let errorFallback = "An error occurred. Please try again.";
      if (error instanceof AxiosError && error.response && error.response.data) {
        const { error: errorMessage } = error.response.data;
        errorFallback = errorMessage || errorFallback;
      }
      dispatch(
        alertActions.showAlert({
          variant: "danger",
          message: errorFallback,
        })
      );
    }
    submitProps.setSubmitting(false);
  };

  return (
    <Container className="d-flex justify-content-center mt-xxl-5">
      <Col xs={12} md={6} lg={4}>
        <h2 className="text-center">Reset Your Password</h2>
        <Formik
          initialValues={{ password: "", confirmPassword: "" }}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
        >
          {(formik) => (
            <Form>
              <FormInput
                controlId="reset-password"
                label="Password"
                name="password"
                type="password"
              />
              <FormInput
                controlId="reset-confirm-password"
                label="Confirm Password"
                name="confirmPassword"
                type="password"
              />
              <Button
                style={{ width: "100%", marginTop: "8px" }}
                variant="primary"
                type="submit"
                disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
              >
                Reset Password
              </Button>
            </Form>
          )}
        </Formik>
      </Col>
    </Container>
  );
};

export default ResetPassword;
