import React, { useEffect } from "react";
import { emailOptions, IUserFormValues, transformUserRequest } from "./userUtil";
import { Form, Formik, FormikHelpers } from "formik";
import { Button, Col, InputGroup, Modal, Row } from "react-bootstrap";
import FormCheckBoxGroup from "../../components/Form/FormCheckBoxGroup";
import FormInput from "../../components/Form/FormInput";
import FormSelect from "../../components/Form/FormSelect";
import { alertActions } from "../../store/slices/alertSlice";
import { useDispatch, useSelector } from "react-redux";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";
import { HttpMethod } from "../../utils/httpMethods";
import useAPI from "../../hooks/useAPI";
import * as Yup from "yup";
import { IEditor, ROLE } from "../../utils/interfaces";
import { RootState } from "../../store/store";

/**
 * @author Ankur Mundra on April, 2023
 */

const initialValues: IUserFormValues = {
  name: "",
  email: "",
  firstName: "",
  lastName: "",
  role_id: -1,
  institution_id: -1,
  emailPreferences: [],
};

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Required")
    .matches(/^[a-z]+$/, "Username must be in lowercase")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters"),
  email: Yup.string().required("Required").email("Invalid email format"),
  firstName: Yup.string().required("Required").nonNullable(),
  lastName: Yup.string().required("Required").nonNullable(),
  role_id: Yup.string().required("Required").nonNullable(),
  institution_id: Yup.string().required("Required").nonNullable(),
});

const UserEditor: React.FC<IEditor> = ({ mode }) => {
  const { data: userResponse, error: userError, sendRequest } = useAPI();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const { userData, roles, institutions }: any = useLoaderData();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // logged-in user is the parent of the user being created and the institution is the same as the parent's
  initialValues.parent_id = auth.user.id;
  initialValues.institution_id = auth.user.institution_id;

  // Close the modal if the user is updated successfully and navigate to the users page
  useEffect(() => {
    if (userResponse && userResponse.status >= 200 && userResponse.status < 300) {
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `User ${userData.name} ${mode}d successfully!`,
        })
      );
      navigate(location.state?.from ? location.state.from : "/users");
    }
  }, [dispatch, mode, navigate, userData.name, userResponse, location.state?.from]);

  // Show the error message if the user is not updated successfully
  useEffect(() => {
    userError && dispatch(alertActions.showAlert({ variant: "danger", message: userError }));
  }, [userError, dispatch]);

  const onSubmit = (values: IUserFormValues, submitProps: FormikHelpers<IUserFormValues>) => {
    let method: HttpMethod = HttpMethod.POST;
    let url: string = "/users";

    if (mode === "update") {
      url = `/users/${values.id}`;
      method = HttpMethod.PATCH;
    }

    // to be used to display message when user is created
    userData.name = values.name;
    sendRequest({
      url: url,
      method: method,
      data: values,
      transformRequest: transformUserRequest,
    });
    submitProps.setSubmitting(false);
  };

  const handleClose = () => navigate(location.state?.from ? location.state.from : "/users");

  return (
    <Modal size="lg" centered show={true} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{mode === "update" ? "Update User" : "Create User"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {userError && <p className="text-danger">{userError}</p>}
        <Formik
          initialValues={mode === "update" ? userData : initialValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          validateOnChange={false}
          enableReinitialize={true}
        >
          {(formik) => {
            return (
              <Form>
                <FormSelect
                  controlId="user-role"
                  name="role_id"
                  options={roles}
                  inputGroupPrepend={<InputGroup.Text id="role-prepend">Role</InputGroup.Text>}
                />
                <FormInput
                  controlId="user-name"
                  label="Username"
                  name="name"
                  disabled={mode === "update"}
                  inputGroupPrepend={<InputGroup.Text id="user-name-prep">@</InputGroup.Text>}
                />
                <Row>
                  <FormInput
                    as={Col}
                    controlId="user-first-name"
                    label="First name"
                    name="firstName"
                  />
                  <FormInput
                    as={Col}
                    controlId="user-last-name"
                    label="Last name"
                    name="lastName"
                  />
                </Row>
                <FormInput controlId="user-email" label="Email" name="email" />
                <FormCheckBoxGroup
                  controlId="email-pref"
                  label="Email Preferences"
                  name="emailPreferences"
                  options={emailOptions}
                />
                <FormSelect
                  controlId="user-institution"
                  name="institution_id"
                  disabled={mode === "update" || auth.user.role !== ROLE.SUPER_ADMIN.valueOf()}
                  options={institutions}
                  inputGroupPrepend={
                    <InputGroup.Text id="user-inst-prep">Institution</InputGroup.Text>
                  }
                />
                <Modal.Footer>
                  <Button variant="outline-secondary" onClick={handleClose}>
                    Close
                  </Button>

                  <Button
                    variant="outline-success"
                    type="submit"
                    disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
                  >
                    {mode === "update" ? "Update User" : "Create User"}
                  </Button>
                </Modal.Footer>
              </Form>
            );
          }}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default UserEditor;
