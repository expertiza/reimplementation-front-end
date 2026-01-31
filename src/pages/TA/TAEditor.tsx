// Importing necessary interfaces and modules
import FormSelect from "../../components/Form/FormSelect";
import { Form, Formik, FormikHelpers } from "formik";
import useAPI from "../../hooks/useAPI";
import React, { useEffect } from "react";
import { Button, InputGroup, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useLoaderData, useLocation, useNavigate, useParams } from "react-router-dom";
import { alertActions } from "../../store/slices/alertSlice";
import { HttpMethod } from "../../utils/httpMethods";
import * as Yup from "yup";
import { IEditor } from "../../utils/interfaces";
import { ITAFormValues, transformTARequest } from "./TAUtil";

/**
 * @author Atharva Thorve, on December, 2023
 * @author Divit Kalathil, on December, 2023
 */

const initialValues: ITAFormValues = {
  name: "",
};

const validationSchema = Yup.object({
  name: Yup.string().required("Required").nonNullable(),
});

const TAEditor: React.FC<IEditor> = ({ mode }) => {
  const { data: TAResponse, error: TAError, sendRequest } = useAPI();
  const TAData = { ...initialValues };

  // Load data from the server
  const { taUsers }: any = useLoaderData();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { courseId } = params;

  // logged-in TA is the parent of the TA being created and the institution is the same as the parent's

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
    let method: HttpMethod = HttpMethod.GET;
    // ToDo: Need to create API in the backend for this call. 
    // Note: The current API needs the TA id to create a new TA which is incorrect and needs to be fixed. 
    // Currently we send the username of the user we want to add as the TA for the course.
    let url: string = `/courses/${courseId}/add_ta/${values.name}`;

    // to be used to display message when TA is created
    sendRequest({
      url: url,
      method: method,
      data: {},
      transformRequest: transformTARequest,
    });
    submitProps.setSubmitting(false);
  };

  const handleClose = () => navigate(location.state?.from ? location.state.from : `/courses/${courseId}/tas`);
  //Validation of TA Entry 
  return (
    <Modal size="lg" centered show={true} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Add TA</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {TAError && <p className="text-danger">{TAError}</p>}
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
                <FormSelect
                  controlId="TA-name"
                  label="Teaching Assistant Name"
                  name="name"
                  options={taUsers}
                  inputGroupPrepend={
                    <InputGroup.Text id="TA-name-prep">TA</InputGroup.Text>
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
                    "Add TA"
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
