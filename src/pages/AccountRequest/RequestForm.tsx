import FormInput from "components/Form/FormInput";
import FormSelect from "components/Form/FormSelect";
import { Form, Formik, FormikHelpers } from "formik";
import React, { useEffect } from "react";
import { IInstitution, IRole, IUserFormValues } from "./accountUtil";
import * as Yup from "yup";
import useAPI from "hooks/useAPI";
import { Button, Col, InputGroup } from "react-bootstrap";
import axios from "axios";

const initialValues: IUserFormValues = {
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
  const { data: roles, sendRequest: fetchRoles } = useAPI();
  const { data: institutions, sendRequest: fetchInstitutions } = useAPI();

  useEffect(() => {
    fetchRoles({
      url: "/roles",
      transformResponse: (response) => {
        return JSON.parse(response);
      },
    });
    fetchInstitutions({
      url: "/institutions",
      transformResponse: (response) => {
        return JSON.parse(response);
      },
    });
  }, [fetchRoles, fetchInstitutions]);

  const onSubmit = async (values: IUserFormValues, submitProps: FormikHelpers<IUserFormValues>) => {
    try {
      const response = await axios.post("http://127.0.0.1:3000/api/v1/account_requests", values);
      console.log("Form submitted successfully:", response.data);
      submitProps.resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  return (
    <div>
      <h2>Request Account Form</h2>
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
                options={[
                  { value: 0, label: "" },
                  ...roles.map((role: IRole) => {
                    return {
                      label: role.name,
                      value: role.id,
                    };
                  }),
                ]}
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
                options={[
                  { value: 0, label: "" },
                  ...institutions.map((institution: IInstitution) => {
                    return {
                      label: institution.name,
                      value: institution.id,
                    };
                  }),
                ]}
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

            <Button variant="outline-secondary" type="reset">
              Reset
            </Button>
            <Button
              variant="outline-success"
              type="submit"
              disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
            >
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RequestForm;
