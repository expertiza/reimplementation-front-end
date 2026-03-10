import React from "react";
import { Button, Col, Container } from "react-bootstrap";
import { Form, Formik, FormikHelpers } from "formik";
import FormInput from "../../components/Form/FormInput";
import axios, { AxiosError } from "axios";
import { alertActions } from "../../store/slices/alertSlice";
import { useDispatch } from "react-redux";
import { API_BASE_URL } from "../../constants/Api";
import * as Yup from "yup";

interface IForgotPasswordFormValues {
  email: string;
}

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Required"),
});

const ForgotPassword = () => {
  const dispatch = useDispatch();

  const onSubmit = async (
    values: IForgotPasswordFormValues,
    submitProps: FormikHelpers<IForgotPasswordFormValues>
  ) => {
    try {
      await axios.post(`${API_BASE_URL}/password_resets`, { email: values.email });
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: "A link to reset your password has been sent to your e-mail address.",
        })
      );
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
        <h1 className="text-center">Forgotten Your Password?</h1>
        <p className="text-center">Enter the e-mail address associated with your account</p>
        <Formik
          initialValues={{ email: "" }}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          validateOnChange={false}
        >
          {(formik) => (
            <Form>
              <FormInput
                controlId="forgot-password-email"
                label="Email Address"
                name="email"
                type="email"
              />
              <Button
                style={{ width: "100%" }}
                variant="primary"
                type="submit"
                disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
              >
                Request Password Reset
              </Button>
            </Form>
          )}
        </Formik>
      </Col>
    </Container>
  );
};

export default ForgotPassword;