import React, { useEffect, useState } from "react";
import Select from 'react-select';
import { Form, Formik, FormikHelpers } from "formik";
import useAPI from "hooks/useAPI";
import { Alert, Button, InputGroup, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useLoaderData, useLocation, useNavigate, useParams } from "react-router-dom";
import { alertActions } from "store/slices/alertSlice";
import { HttpMethod } from "utils/httpMethods";
import * as Yup from "yup";
import { IEditor } from "../../utils/interfaces";
import { ITAFormValues, transformTARequest } from "./TAUtil";

/**
 * @author Anurag Gorkar, on December, 2024
 * @author Makarand Pundalik, on December, 2024
 * @author Rutvik Kulkarni, on December, 2024
 */


// Type definition for user options
type UserOption = {
  label: string;
  value: string | number;
  role?: string;
};

const initialValues: ITAFormValues = {
  name: "",
};

const validationSchema = Yup.object({
  name: Yup.string().required("Required").nonNullable(),
});

const TAEditor: React.FC<IEditor> = ({ mode }) => {
  const { data: TAResponse, error: TAError, sendRequest } = useAPI();
  const TAData = { ...initialValues };

  const { taUsers }: any = useLoaderData();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { courseId } = params;

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOption>({ label: "", value: "" });

  useEffect(() => {
    if (TAResponse && TAResponse.status >= 200 && TAResponse.status < 300) {
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `TA ${TAData.name} ${mode}d successfully!`,
        })
      );
      navigate(location.state?.from ? location.state.from : `/courses/${courseId}/tas`);
    }
  }, [dispatch, mode, navigate, TAData.name, TAResponse, location.state?.from, showConfirmModal]);

  useEffect(() => {
    TAError && dispatch(alertActions.showAlert({ variant: "danger", message: TAError }));
  }, [TAError, dispatch]);

  const onSubmit = (values: ITAFormValues, submitProps: FormikHelpers<ITAFormValues>) => {
    const selectedUserData = taUsers.find((user: UserOption) => 
      parseInt(String(user.value)) === parseInt(String(values.name))
    );
 
    if (selectedUserData?.role === 'student') {
      // If selected user is a student, show confirmation modal
      setSelectedUser(selectedUserData);
      setShowConfirmModal(true);
    } else {
      // If TA or other role, directly submit
      submitTA(values);
    }
    submitProps.setSubmitting(false);
  };

  const submitTA = (values: ITAFormValues) => {
    let method: HttpMethod = HttpMethod.GET;
    let url: string = `/courses/${courseId}/add_ta/${values.name}`;

    sendRequest({
      url: url,
      method: method,
      data: {},
      transformRequest: transformTARequest,
    });
  };

  const handleConfirmAddStudent = () => {
    // Submit TA addition if confirmed
    submitTA({ name: String(selectedUser.value) });
    setShowConfirmModal(false);
  };

  const handleClose = () => navigate(location.state?.from ? location.state.from : `/courses/${courseId}/tas`);

  return (
    <>
      <Modal size="lg" centered show={true} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Add TA</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { TAError && (
            <Alert variant="flash_note alert alert-danger">
              {TAError}
            </Alert>
          )}
          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
            validateOnChange={false}
            enableReinitialize={true}
          >
            {(formik) => {
              return (
                <Form>
                  <div className="mb-3">
                    <label htmlFor="TA-name">Teaching assistant name</label>
                    <Select
                      id="TA-name"
                      name="name"
                      options={taUsers}
                      value={taUsers.find((option: UserOption) => option.value === formik.values.name) || null}
                      onChange={(selectedOption: UserOption | null) => {
                        formik.setFieldValue('name', selectedOption ? selectedOption.value : '');
                      }}
                      placeholder="Search and select Teaching Assistant"
                      isSearchable={true}
                      // Custom filtering to search through label and value
                      filterOption={(option, inputValue) => {
                        const label = String(option.label).toLowerCase();
                        const value = String(option.value).toLowerCase();
                        const input = inputValue.toLowerCase();
                        return label.includes(input) || value.includes(input);
                      }}
                    />
                  </div>
                  <Modal.Footer>
                    <Button
                      variant="danger"
                      type="submit"
                      className="btn btn-md"
                      disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
                    >
                      Confirm
                    </Button>
                  </Modal.Footer>
                </Form>
              );
            }}
          </Formik>
        </Modal.Body>
      </Modal>

      {/* Confirmation Modal for Student */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Adding Student as TA</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to add {selectedUser.label} (a student) as a teaching assistant for this course? 
          This action will convert {selectedUser.label} to a TA. 
        </Modal.Body>
        <Modal.Footer>
        <Button variant="danger" className="btn btn-md" onClick={handleConfirmAddStudent}>
          Confirm
        </Button>

        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TAEditor;