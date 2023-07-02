import FormInput from "components/Form/FormInput";
import FormSelect from "components/Form/FormSelect";
import { Form, Formik, FormikHelpers } from "formik";
import React from "react";
import { IAccountRequestForm } from "./accountUtil";
import * as Yup from "yup";
import useAPI from "hooks/useAPI";
import { Button, Col, InputGroup } from "react-bootstrap";
import { HttpMethod } from "utils/httpMethods";
import { useLoaderData } from "react-router-dom";
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
  const { sendRequest } = useAPI();

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
    <div style={{ marginTop: "20px" }}>
      <h2>Request New User</h2>
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
        validateOnChange={false}
        enableReinitialize={true}
      >
        {(formik) => (
          <Form style={{ marginTop: "20px", marginLeft: "10px" }}>
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

            <div style={{ marginTop: "20px" }}>
              <Button variant="outline-secondary" type="reset">
                Reset
              </Button>
              <span style={{ marginLeft: "10px" }}></span>
              <Button
                variant="success"
                type="submit"
                disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
              >
                Submit
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
export default RequestForm;
