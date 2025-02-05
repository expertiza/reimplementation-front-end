// export default UserEditor;
import React, { useEffect, useState } from "react";
import { Form, Formik, FormikHelpers } from "formik";
import { Button, Col, InputGroup, Modal, Row } from "react-bootstrap";
import FormCheckBoxGroup from "components/Form/FormCheckBoxGroup";
import FormInput from "components/Form/FormInput";
import FormSelect from "components/Form/FormSelect";
import { alertActions } from "store/slices/alertSlice";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { IEditor, ROLE } from "../../utils/interfaces";
import { RootState } from "../../store/store";
import dummyUsers from './dummyUsers.json';  // Assuming you have dummy users in this file

type User = {
  id: number;
  name: string;
  email: string;
  full_name: string;
  email_on_review: boolean;
  email_on_submission: boolean;
  email_on_review_of_review: boolean;
  parent: {
    id: null | number;
    name: null | string;
  };
  institution: {
    id: number | null;
    name: string | null;
  };
  role: {
    id: null | number;
    name: string;
  };
  take_quiz: boolean;
};
const initialValues: User = {
  id: 0,
  name: "",
  email: "",
  full_name: "",
  email_on_review: false,
  email_on_submission: false,
  email_on_review_of_review: false,
  parent: {
    id: null,
    name: null,
  },
  institution: {
    id: null,
    name: null,
  },
  role: {
    id: null,
    name: "",
  },
  take_quiz: false,
};

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Required")
    .matches(/^[a-z]+$/, "Username must be in lowercase")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters"),
  email: Yup.string().required("Required").email("Invalid email format"),
  full_name: Yup.string().required("Required").nonNullable(),
  role: Yup.object().shape({
    id: Yup.number().required("Required"),
    name: Yup.string().required("Required"),
  }),
  institution: Yup.object().shape({
    id: Yup.number().required("Required"),
    name: Yup.string().required("Required"),
  }),
});

const EditUser: React.FC<IEditor> = ({ mode}) => {
  const [users, setUsers] = useState<User[]>(dummyUsers);
  const [userData, setUserData] = useState<User | null>(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );

  // Pre-fill the data if in update mode
  useEffect(() => {
    if (mode === "update" && location.state?.userId) {
      const user = users.find((user) => user.id === location.state.userId);
      if (user) {
        setUserData(user);
      } else {
        console.error("User not found");
        // Handle case where the user isn't found in the dummy data
      }
    } else if (mode === "create") {
      setUserData(initialValues); // Ensure initial data is set for create mode
    }
  }, [mode, location.state?.userId, users]);

  const onSubmit = (values: User, submitProps: FormikHelpers<User>) => {
    if (mode === "update") {
      // Find and update the user in the dummy data
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === values.id ? { ...user, ...values } : user
        )
      );
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `User ${values.name} updated successfully!`,
        })
      );
    } else {
      // Add new user to the dummy data
      const newUser = { ...values, id: new Date().getTime() };
      setUsers((prevUsers) => [...prevUsers, newUser]);
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `User ${values.name} created successfully!`,
        })
      );
    }

    submitProps.setSubmitting(false);
    navigate("/users");
  };

  const handleClose = () => navigate(location.state?.from ? location.state.from : "/users");

  if (!userData) {
    // Loading or error state if no user data is found or loaded
    return <div>Loading...</div>;
  }

  return (
    <Modal size="lg" centered show={true} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{mode === "update" ? "Update User" : "Create User"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Formik
          initialValues={userData}  // Use userData directly for initial values
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          validateOnChange={false}
          enableReinitialize={true}
        >
          {(formik) => (
            <Form>
              <FormSelect
                controlId="user-role"
                name="role.id"
                options={[
                  { label: "Participant", value: 1 },
                  { label: "Reader", value: 2 },
                  { label: "Reviewer", value: 3 },
                  { label: "Submitter", value: 4 },
                  { label: "Mentor", value: 5 },
                ]}
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
                  controlId="user-full-name"
                  label="Full Name"
                  name="full_name"
                />
              </Row>
              <FormInput controlId="user-email" label="Email" name="email" />
              <FormCheckBoxGroup
                controlId="email-pref"
                label="Email Preferences"
                name="emailPreferences"
                options={[
                  { label: "On Review", value: "email_on_review" },
                  { label: "On Submission", value: "email_on_submission" },
                  { label: "On Review of Review", value: "email_on_review_of_review" },
                ]}
              />
              <FormSelect
                controlId="user-institution"
                name="institution.id"
                disabled={mode === "update" || auth.user.role !== ROLE.SUPER_ADMIN.valueOf()}
                options={[{ label: "Institution A", value: 1 }, { label: "Institution B", value: 2 }]}
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
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default EditUser;