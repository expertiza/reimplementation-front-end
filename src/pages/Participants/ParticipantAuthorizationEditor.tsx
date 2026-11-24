import FormSelect from "../../components/Form/FormSelect";
import { Form, Formik } from "formik";
import useAPI from "../../hooks/useAPI";
import React, { useEffect } from "react";
import { Button, InputGroup, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useLoaderData, useNavigate } from "react-router-dom";
import { alertActions } from "../../store/slices/alertSlice";
import { HttpMethod } from "../../utils/httpMethods";
import * as Yup from "yup";
import { IParticipantAuthorization, authorizationOptions } from "./participantUtil";

// A participant is a user added to an assignment, so the only thing to edit is
// their authorization, which sets what they can do (submit, review, take quizzes, mentor)
const validationSchema = Yup.object({
  authorization: Yup.string().required("Required"),
});

const ParticipantAuthorizationEditor: React.FC = () => {
  const participant = useLoaderData() as IParticipantAuthorization;
  const { data: response, error, sendRequest } = useAPI();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Back to the participants list this editor was opened from
  const handleClose = () => navigate("..");

  useEffect(() => {
    if (response && response.status >= 200 && response.status < 300) {
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `Participant ${participant.username} updated successfully!`,
        })
      );
      navigate("..");
    }
  }, [dispatch, navigate, participant.username, response]);

  useEffect(() => {
    error && dispatch(alertActions.showAlert({ variant: "danger", message: error }));
  }, [error, dispatch]);

  const onSubmit = (values: { authorization: string }) =>
    sendRequest({
      url: `/participants/${participant.id}/${values.authorization}`,
      method: HttpMethod.PATCH,
    });

  return (
    <Modal size="lg" centered show={true} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          Update Participant: {participant.username}
          {participant.name && ` (${participant.name})`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <p className="text-danger">{error}</p>}
        <Formik
          initialValues={{ authorization: participant.authorization }}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          enableReinitialize={true}
        >
          {(formik) => (
            <Form>
              <FormSelect
                controlId="participant-authorization"
                name="authorization"
                options={authorizationOptions}
                inputGroupPrepend={
                  <InputGroup.Text id="participant-authorization-prep">
                    Authorization
                  </InputGroup.Text>
                }
              />
              <Modal.Footer>
                <Button className="btn btn-md" variant="outline-secondary" onClick={handleClose}>
                  Close
                </Button>
                <Button
                  className="btn btn-md"
                  variant="success"
                  type="submit"
                  disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
                >
                  Update participant
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default ParticipantAuthorizationEditor;
