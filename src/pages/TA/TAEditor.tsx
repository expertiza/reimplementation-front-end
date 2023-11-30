import React, { useEffect } from "react";
import { emailOptions, ITAFormValues, transformTARequest } from "./TAUtil";
import { Form, Formik, FormikHelpers } from "formik";
import { Button, Col, InputGroup, Modal, Row } from "react-bootstrap";
import FormCheckBoxGroup from "components/Form/FormCheckBoxGroup";
import FormInput from "components/Form/FormInput";
import FormSelect from "components/Form/FormSelect";
import { alertActions } from "store/slices/alertSlice";
import { useDispatch, useSelector } from "react-redux";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";
import { HttpMethod } from "utils/httpMethods";
import useAPI from "hooks/useAPI";
import * as Yup from "yup";
import { IEditor, ROLE } from "../../utils/interfaces";
import { RootState } from "../../store/store";

/**
 * @author Ankur Mundra on April, 2023
 */

const initialValues: ITAFormValues = {
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
    .matches(/^[a-z]+$/, "TAname must be in lowercase")
    .min(3, "TAname must be at least 3 characters")
    .max(20, "TAname must be at most 20 characters"),
  email: Yup.string().required("Required").email("Invalid email format"),
  firstName: Yup.string().required("Required").nonNullable(),
  lastName: Yup.string().required("Required").nonNullable(),
  role_id: Yup.string().required("Required").nonNullable(),
  institution_id: Yup.string().required("Required").nonNullable(),
});

const TAEditor: React.FC<IEditor> = ({ mode }) => {
  const { data: TAResponse, error: TAError, sendRequest } = useAPI();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const { TAData, roles, institutions }: any = useLoaderData();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // logged-in TA is the parent of the TA being created and the institution is the same as the parent's
  initialValues.parent_id = auth.user.id;
  initialValues.institution_id = auth.user.institution_id;

  // Close the modal if the TA is updated successfully and navigate to the TAs page
  useEffect(() => {
    if (TAResponse && TAResponse.status >= 200 && TAResponse.status < 300) {
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `TA ${TAData.name} ${mode}d successfully!`,
        })
      );
      navigate(location.state?.from ? location.state.from : "/TAs");
    }
  }, [dispatch, mode, navigate, TAData.name, TAResponse, location.state?.from]);

  // Show the error message if the TA is not updated successfully
  useEffect(() => {
    TAError && dispatch(alertActions.showAlert({ variant: "danger", message: TAError }));
  }, [TAError, dispatch]);

  const onSubmit = (values: ITAFormValues, submitProps: FormikHelpers<ITAFormValues>) => {
    let method: HttpMethod = HttpMethod.POST;
    let url: string = "/TAs";

    if (mode === "update") {
      url = `/TAs/${values.id}`;
      method = HttpMethod.PATCH;
    }

    // to be used to display message when TA is created
    TAData.name = values.name;
    sendRequest({
      url: url,
      method: method,
      data: values,
      transformRequest: transformTARequest,
    });
    submitProps.setSubmitting(false);
  };

  const handleClose = () => navigate(location.state?.from ? location.state.from : "/TAs");

  return (
    <Modal size="lg" centered show={true} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{mode === "update" ? "Update TA" : "Create TA"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {TAError && <p className="text-danger">{TAError}</p>}
        <Formik
          initialValues={mode === "update" ? TAData : initialValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          validateOnChange={false}
          enableReinitialize={true}
        >
          {(formik) => {
            return (
              <Form>
                <FormSelect
                  controlId="TA-role"
                  name="role_id"
                  options={roles}
                  inputGroupPrepend={<InputGroup.Text id="role-prepend">Role</InputGroup.Text>}
                />
                <FormInput
                  controlId="TA-name"
                  label="TAname"
                  name="name"
                  disabled={mode === "update"}
                  inputGroupPrepend={<InputGroup.Text id="TA-name-prep">@</InputGroup.Text>}
                />
                <Row>
                  <FormInput
                    as={Col}
                    controlId="TA-first-name"
                    label="First name"
                    name="firstName"
                  />
                  <FormInput
                    as={Col}
                    controlId="TA-last-name"
                    label="Last name"
                    name="lastName"
                  />
                </Row>
                <FormInput controlId="TA-email" label="Email" name="email" />
                <FormCheckBoxGroup
                  controlId="email-pref"
                  label="Email Preferences"
                  name="emailPreferences"
                  options={emailOptions}
                />
                <FormSelect
                  controlId="TA-institution"
                  name="institution_id"
                  disabled={mode === "update" || auth.user.role !== ROLE.SUPER_ADMIN.valueOf()}
                  options={institutions}
                  inputGroupPrepend={
                    <InputGroup.Text id="TA-inst-prep">Institution</InputGroup.Text>
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
                    {mode === "update" ? "Update TA" : "Create TA"}
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

export default TAEditor;
