import FormCheckBoxGroup from "../../components/Form/FormCheckBoxGroup";
import FormInput from "../../components/Form/FormInput";
import FormSelect from "../../components/Form/FormSelect";
import { Form, Formik, FormikHelpers } from "formik";
import useAPI from "../../hooks/useAPI";
import React, { useEffect } from "react";
import { Button, Col, InputGroup, Modal, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";
import { alertActions } from "../../store/slices/alertSlice";
import { HttpMethod } from "../../utils/httpMethods";
import * as Yup from "yup";
import { RootState } from "../../store/store";
import { ROLE } from "../../utils/interfaces";
import { IParticipantFormValues, emailOptions, transformParticipantRequest } from "./participantUtil";
/**
 * @author Mrityunjay Joshi on October, 2023
 */

const initialValues: IParticipantFormValues = {
  name: "",
  email: "",
  firstName: "",
  lastName: "",
  role_id: -1,
  institution_id: -1,
  emailPreferences: [],
};

interface IParticipantEditor {
  mode: "create" | "update";
  type: string;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Required")
    .matches(/^[a-z]+$/, "Name must be in lowercase")
    .min(3, "Name must be at least 3 characters")
    .max(20, "Name must be at most 20 characters"),
  email: Yup.string().required("Required").email("Invalid email format"),
  firstName: Yup.string().required("Required").nonNullable(),
  lastName: Yup.string().required("Required").nonNullable(),
  role_id: Yup.string().required("Required").nonNullable(),
  institution_id: Yup.string().required("Required").nonNullable(),
});

const ParticipantEditor: React.FC<IParticipantEditor> = ({ mode, type }) => {
  const { data: participantResponse, error: participantError, sendRequest } = useAPI();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const { participantData, roles, institutions }: any = useLoaderData();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // logged-in participant is the parent of the participant being created and the institution is the same as the parent's
  initialValues.parent_id = auth.user.id;
  initialValues.institution_id = auth.user.institution_id;

  // Close the modal if the participant is updated successfully and navigate to the participants page
  useEffect(() => {
    if (participantResponse && participantResponse.status >= 200 && participantResponse.status < 300) {
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `Participant ${participantData.name} ${mode}d successfully!`,
        })
      );
      navigate(location.state?.from ? location.state.from : `/${type}/participants`);
    }
  }, [dispatch, mode, navigate, participantData.name, participantResponse, location.state?.from, type]);

  // Show the error message if the participant is not updated successfully
  useEffect(() => {
    participantError && dispatch(alertActions.showAlert({ variant: "danger", message: participantError }));
  }, [participantError, dispatch]);

  const onSubmit = (values: IParticipantFormValues, submitProps: FormikHelpers<IParticipantFormValues>) => {
    let method: HttpMethod = HttpMethod.POST;
    let url: string = "/participants";

    if (mode === "update") {
      url = `/participants/${values.id}`;
      method = HttpMethod.PATCH;
    }

    // to be used to display message when participant is created
    participantData.name = values.name;
    sendRequest({
      url: url,
      method: method,
      data: values,
      transformRequest: transformParticipantRequest,
    });
    submitProps.setSubmitting(false);
  };

  const handleClose = () => navigate(location.state?.from ? location.state.from : `/${type}/participants`);  

  return (
    <Modal size="lg" centered show={true} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{mode === "update" ? "Update Participant" : "Create Participant"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {participantError && <p className="text-danger">{participantError}</p>}
        <Formik
          initialValues={mode === "update" ? participantData : initialValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          validateOnChange={false}
          enableReinitialize={true}
        >
          {(formik) => {
            return (
              <Form>
                <FormSelect
                  controlId="participant-role"
                  name="role_id"
                  options={roles}
                  inputGroupPrepend={<InputGroup.Text id="role-prepend">Role</InputGroup.Text>}
                />
                <FormInput
                  controlId="participant-name"
                  label="Participant Name"
                  name="name"
                  disabled={mode === "update"}
                  inputGroupPrepend={<InputGroup.Text id="participant-name-prep">@</InputGroup.Text>}
                />
                <Row>
                  <FormInput
                    as={Col}
                    controlId="participant-first-name"
                    label="First name"
                    name="firstName"
                  />
                  <FormInput
                    as={Col}
                    controlId="participant-last-name"
                    label="Last name"
                    name="lastName"
                  />
                </Row>
                <FormInput controlId="participant-email" label="Email" name="email" />
                <FormCheckBoxGroup
                  controlId="email-pref"
                  label="Email Preferences"
                  name="emailPreferences"
                  options={emailOptions}
                />
                <FormSelect
                  controlId="participant-institution"
                  name="institution_id"
                  disabled={mode === "update" || auth.user.role !== ROLE.SUPER_ADMIN.valueOf()}
                  options={institutions}
                  inputGroupPrepend={
                    <InputGroup.Text id="participant-inst-prep">Institution</InputGroup.Text>
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
                    {mode === "update" ? "Update Participant" : "Create Participant"}
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

export default ParticipantEditor;
