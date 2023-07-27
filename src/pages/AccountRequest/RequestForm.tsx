import FormInput from "components/Form/FormInput";
import FormSelect from "components/Form/FormSelect";
import { Form, Formik, FormikHelpers } from "formik";
import React, { useEffect } from "react";
import { IAccountRequestForm } from "./accountUtil";
import * as Yup from "yup";
import useAPI from "hooks/useAPI";
import { Button, Col, InputGroup, Container, Row } from "react-bootstrap";
import { HttpMethod } from "utils/httpMethods";
import { useLoaderData } from "react-router-dom";
import { alertActions } from "store/slices/alertSlice";
import { useDispatch } from "react-redux";
const initialValues: IAccountRequestForm = {
  role_id: 0,
  username: "",
  full_name: "",
  email: "",
  institution_id: 0,
  introduction: "",
};

const validationSchema = Yup.object({
  role_id: Yup.number().required("Required"),
  username: Yup.string()
    .required("Required")
    .lowercase("Username must be lowercase")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters"),
  full_name: Yup.string().required("Required"),
  email: Yup.string().required("Required").email("Invalid email format"),
  institution_id: Yup.number().required("Required"),
  introduction: Yup.string().required("Required"),
});

const RequestForm: React.FC = () => {
  const { roles, institutions }: any = useLoaderData();
  const { error, sendRequest } = useAPI();
  const dispatch = useDispatch();
  useEffect(() => {
    if (error) {
      dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }
  }, [error, dispatch]);

  const onSubmit = async (
    values: IAccountRequestForm,
    submitProps: FormikHelpers<IAccountRequestForm>
  ) => {
    let method: HttpMethod = HttpMethod.POST;
    let url: string = "/account_requests";
    sendRequest({
      url: url,
      method: method,
      data: values,
    });
    submitProps.resetForm();
  };

  return (
    <Container className="mt-4 px-0">
      <h2>Request New User</h2>
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
        validateOnChange={false}
        enableReinitialize={true}
      >
        {(formik) => (
          <Form className="mt-4 ml-3">
            <Col md={2}>
              <FormSelect
                controlId="user-role"
                name="role_id"
                options={roles}
                inputGroupPrepend={<InputGroup.Text id="role-prepend">Role</InputGroup.Text>}
              />
            </Col>
            <Col md={2}>
              <FormInput
                controlId="user-name"
                label="Username"
                name="username"
                inputGroupPrepend={<InputGroup.Text id="user-name-prep">@</InputGroup.Text>}
              />
            </Col>
            <Col md={2}>
              <FormInput controlId="user-fullname" label="Full Name" name="full_name" />
            </Col>
            <Col md={2}>
              <FormInput controlId="user-email" label="Email" name="email" />
            </Col>
            <Col md={2}>
              <FormSelect
                controlId="user-institution"
                name="institution_id"
                options={institutions}
                inputGroupPrepend={
                  <InputGroup.Text id="user-inst-prep">Institution</InputGroup.Text>
                }
              />
            </Col>
            <Col md={2}>
              <FormInput
                name={"introduction"}
                controlId={"user-self-intro"}
                label="Self Introduction"
              />
            </Col>

            <Container className="mt-4">
              <Row>
                <Col md={12} className="d-flex justify-content-front">
                  <Button variant="outline-secondary" type="reset">
                    Reset
                  </Button>
                  <Button
                    variant="success"
                    type="submit"
                    disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
                    className="ms-2"
                  >
                    Submit
                  </Button>
                </Col>
              </Row>
            </Container>
          </Form>
        )}
      </Formik>
    </Container>
  );
};
export default RequestForm;
