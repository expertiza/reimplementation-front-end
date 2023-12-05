import * as Yup from "yup";

import { Button, FormSelect, Modal } from "react-bootstrap";
import { Form, Formik, FormikHelpers } from "formik";
import { IAssignmentFormValues, transformAssignmentRequest } from "./AssignmentUtil";
import { IEditor} from "../../utils/interfaces";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";

import FormInput from "components/Form/FormInput";
import { HttpMethod } from "utils/httpMethods";
import { RootState } from "../../store/store";
import { alertActions } from "store/slices/alertSlice";
import useAPI from "hooks/useAPI";
import FormCheckbox from "components/Form/FormCheckBox";

const initialValues: IAssignmentFormValues = {
  name: "",
  directory_path: "",
  // dir: "",
  spec_location:"",
  private:false,
  show_template_review:false,
  require_quiz:false,
  has_badge:false,
  staggered_deadline:false,
  is_calibrated:false,
  // Add other assignment-specific initial values
};

const validationSchema = Yup.object({
  name: Yup.string().required("Required")
  // Add other assignment-specific validation rules
});

const AssignmentEditor: React.FC<IEditor> = ({ mode }) => {
  const { data: assignmentResponse, error: assignmentError, sendRequest } = useAPI();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const assignmentData : any = useLoaderData();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Close the modal if the assignment is updated successfully and navigate to the assignments page
  useEffect(() => {
    if (
      assignmentResponse &&
      assignmentResponse.status >= 200 &&
      assignmentResponse.status < 300
    ) {
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `Assignment ${assignmentData.name} ${mode}d successfully!`,
        })
      );
      navigate(location.state?.from ? location.state.from : "/assignments");
    }
  }, [dispatch, mode, navigate, assignmentData, assignmentResponse, location.state?.from]);

  // Show the error message if the assignment is not updated successfully
  useEffect(() => {
    assignmentError && dispatch(alertActions.showAlert({ variant: "danger", message: assignmentError }));
  }, [assignmentError, dispatch]);

  const onSubmit = (
    values: IAssignmentFormValues,
    submitProps: FormikHelpers<IAssignmentFormValues>
  ) => {
    let method: HttpMethod = HttpMethod.POST;
    let url: string = "/assignments";
    if (mode === "update") {
      url = `/assignments/${values.id}`;
      method = HttpMethod.PATCH;
    }
    // to be used to display message when assignment is created
    assignmentData.name = values.name;
    console.log(values);
    sendRequest({
      url: url,
      method: method,
      data: values,
      transformRequest: transformAssignmentRequest,
    });
    submitProps.setSubmitting(false);
  };

  const handleClose = () => navigate(location.state?.from ? location.state.from : "/assignments");

  return (
    <Modal size="lg" centered show={true} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{mode === "update" ? "Update Assignment" : "Create Assignment"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {assignmentError && <p className="text-danger">{assignmentError}</p>}
        <Formik
          initialValues={mode === "update" ? assignmentData : initialValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          validateOnChange={false}
          enableReinitialize={true}
        >
          {(formik) => {
            return (
              <Form>
                <FormInput controlId="assignment-name" label="Assignment Name" name="name" />
                <FormInput controlId="assignment-directory_path" label="Submission Directory" name="directory_path" />
                {/* <FormInput controlId="assignment-dir" label="Submission Directory" name="dir" /> */}
                <FormInput controlId="assignment-spec_location" label="Description URL" name="spec_location" />
                <FormCheckbox controlId="assignment-private" label="Private Assignment" name="private" />
                <FormCheckbox controlId="assignment-subdir" label="Show Teammate Reviews?" name="show_teammate_review" />
                <FormCheckbox controlId="assignment-subdir" label="Has quiz?" name="require_quiz" />
                <FormCheckbox controlId="assignment-subdir" label="Has badge?" name="has_badge" />  
                <FormCheckbox controlId="assignment-subdir" label="Staggered deadline assignment?" name="staggered_deadline" />  
                <FormCheckbox controlId="assignment-subdir" label="Calibration for training?" name="is_calibrated" />    
                <Modal.Footer>
                  <Button variant="outline-secondary" onClick={handleClose}>
                    Close
                  </Button>

                  <Button
                    variant="outline-success"
                    type="submit"
                    disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
                  >
                    {mode === "update" ? "Update Assignment" : "Create Assignment"}
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

export default AssignmentEditor;
