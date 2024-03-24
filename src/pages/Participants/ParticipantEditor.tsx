import FormSelect from "components/Form/FormSelect";
import { Form, Formik, FormikHelpers } from "formik";
import useAPI from "hooks/useAPI";
import React, { useEffect } from "react";
import { Button, InputGroup, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useLoaderData, useLocation, useNavigate, useParams } from "react-router-dom";
import { alertActions } from "store/slices/alertSlice";
import { HttpMethod } from "utils/httpMethods";
import { RootState } from "../../store/store";
import { ROLE } from "../../utils/interfaces";
import { IParticipantFormValues, transformParticipantRequest } from "./participantUtil";
/**
 * @author Mrityunjay Joshi on October, 2023
 */

const initialValues: IParticipantFormValues = {
  type: "",
  assignment_id: -1,
  course_id: -1,
  user_id: -1,
  name: "",
};



interface IParticipantEditor {
  mode: "create" | "update";
  type: string;
}



const ParticipantEditor: React.FC<IParticipantEditor> = ({ mode, type }) => {
  const { data: participantResponse, error: participantError, sendRequest } = useAPI();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const { participantData, users }: any = useLoaderData();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const {typeId} = useParams();
  // logged-in participant is the parent of the participant being created and the institution is the same as the parent's


  // Close the modal if the participant is updated successfully and navigate to the participants page
  useEffect(() => {
    if (participantResponse && participantResponse.status >= 200 && participantResponse.status < 300) {
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `Participant ${participantData.name} ${mode}d successfully!`,
        })
      );
      navigate(location.state?.from ? location.state.from : `/${type}/${typeId}/participants`);
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

    values.type = type;
    if(type === "assignments" || type === "student_tasks")
    {
      values.assignment_id = typeId as unknown as number;
    }
    else if(type === "courses")
    {
      values.course_id = typeId as unknown as number;
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

  const handleClose = () => navigate(location.state?.from ? location.state.from : `/${type}/${typeId}/participants`);  

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
          validateOnChange={false}
          enableReinitialize={true}
        >
          {(formik) => {
            return (
              <Form>

                <FormSelect
                  controlId="participant-user"
                  name="user_id"
                  options={users}
                  disabled={mode === "update" || auth.user.role !== ROLE.ADMIN.valueOf()}
                  inputGroupPrepend={<InputGroup.Text id="user-prepend">Users</InputGroup.Text>}
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
