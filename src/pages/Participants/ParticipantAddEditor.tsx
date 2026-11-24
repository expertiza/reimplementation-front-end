import FormSelect from "../../components/Form/FormSelect";
import { ErrorMessage, Field, Form, Formik } from "formik";
import useAPI from "../../hooks/useAPI";
import React, { useEffect, useMemo } from "react";
import { Button, InputGroup, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { alertActions } from "../../store/slices/alertSlice";
import { RootState } from "../../store/store";
import { HttpMethod } from "../../utils/httpMethods";
import * as Yup from "yup";
import { authorizationOptions } from "./participantUtil";

interface IManagedUser {
  id: number;
  username: string;
  name: string;
}

interface IAddParticipantValues {
  username: string;
  authorization: string;
}

// Like legacy Expertiza: type a user's login (with suggestions) and pick an authorization
const ParticipantAddEditor: React.FC = () => {
  const { assignmentId } = useParams();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const { data: usersResponse, sendRequest: fetchUsers } = useAPI();
  const { data: response, error, sendRequest: addParticipant } = useAPI();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Only users the logged-in user manages, like legacy's get_available_roles filter
  useEffect(() => {
    fetchUsers({ url: `/users/${auth.user.id}/managed` });
  }, [fetchUsers, auth.user.id]);

  const users: IManagedUser[] = useMemo(
    () => (Array.isArray(usersResponse?.data) ? usersResponse!.data : []),
    [usersResponse]
  );

  const validationSchema = useMemo(
    () =>
      Yup.object({
        username: Yup.string()
          .required("Required")
          .test("user-exists", "User not found", (value) =>
            users.some((u) => u.username === value?.trim())
          ),
        authorization: Yup.string().required("Required"),
      }),
    [users]
  );

  const handleClose = () => navigate("..");

  useEffect(() => {
    if (response && response.status >= 200 && response.status < 300) {
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `The user ${response.data?.user?.username ?? ""} has successfully been added.`,
        })
      );
      navigate("..");
    }
  }, [dispatch, navigate, response]);

  useEffect(() => {
    error && dispatch(alertActions.showAlert({ variant: "danger", message: error }));
  }, [error, dispatch]);

  const onSubmit = (values: IAddParticipantValues) => {
    const user = users.find((u) => u.username === values.username.trim());
    if (!user) return;
    return addParticipant({
      url: `/participants/${values.authorization}`,
      method: HttpMethod.POST,
      data: { user_id: user.id, assignment_id: Number(assignmentId) },
    });
  };

  return (
    <Modal size="lg" centered show={true} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Add Participant</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <p className="text-danger">{error}</p>}
        <Formik
          initialValues={{ username: "", authorization: "" }}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          validateOnChange={false}
        >
          {(formik) => {
            const typed = formik.values.username.trim().toLowerCase();
            const suggestions = typed
              ? users.filter((u) => u.username.toLowerCase().startsWith(typed))
              : [];
            return (
              <Form>
                <div className="mb-3">
                  <InputGroup>
                    <InputGroup.Text id="participant-username-prep">User login</InputGroup.Text>
                    <Field
                      name="username"
                      className="form-control"
                      placeholder="Enter a user login"
                      list="participant-username-suggestions"
                      autoComplete="off"
                    />
                  </InputGroup>
                  <datalist id="participant-username-suggestions">
                    {suggestions.map((u) => (
                      <option key={u.id} value={u.username}>
                        {u.name}
                      </option>
                    ))}
                  </datalist>
                  <ErrorMessage name="username" component="div" className="text-danger small" />
                </div>
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
                    disabled={!formik.dirty || formik.isSubmitting}
                  >
                    Add participant
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

export default ParticipantAddEditor;
