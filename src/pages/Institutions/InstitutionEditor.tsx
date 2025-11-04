import React, { useEffect } from "react";
import { Form, Formik, FormikHelpers } from "formik";
import { Button, Modal } from "react-bootstrap";
import FormInput from "../../components/Form/FormInput";
import { alertActions } from "../../store/slices/alertSlice";
import { useDispatch } from "react-redux";
import { useLoaderData, useNavigate } from "react-router-dom";
import { HttpMethod } from "../../utils/httpMethods";
import useAPI from "../../hooks/useAPI";
import * as Yup from "yup";
import axiosClient from "../../utils/axios_client";
import { IEditor, IInstitution } from "../../utils/interfaces";

/**
 * @author Ankur Mundra on June, 2023
 */

const initialValues: IInstitution = {
  name: "",
};

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Required")
    .min(3, "Institution name must be at least 3 characters")
    .max(50, "Institution name must be at most 36 characters"),
});

const InstitutionEditor: React.FC<IEditor> = ({ mode }) => {
  const { data: institutionResponse, error, sendRequest } = useAPI();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const institution: any = useLoaderData();

  // Close the modal if the institution is updated successfully and navigate to the institutions page
  useEffect(() => {
    if (
      institutionResponse &&
      institutionResponse.status >= 200 &&
      institutionResponse.status < 300
    ) {
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `Institution ${mode}d successfully!`,
        })
      );
      navigate("/administrator/institutions");
    }
  }, [dispatch, mode, navigate, institutionResponse]);

  // Show the error message if the institution is not updated successfully
  useEffect(() => {
    error && dispatch(alertActions.showAlert({ variant: "danger", message: error }));
  }, [error, dispatch]);

  const onSubmit = (values: IInstitution, submitProps: FormikHelpers<IInstitution>) => {
    let method: HttpMethod = HttpMethod.POST;
    let url: string = "/institutions";

    if (mode === "update") {
      url = `/institutions/${values.id}`;
      method = HttpMethod.PATCH;
    }

    sendRequest({
      url: url,
      method: method,
      data: values,
    });
    submitProps.setSubmitting(false);
  };

  const handleClose = () => navigate("/administrator/institutions");

  return (
    <Modal size="lg" centered show={true} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{mode === "update" ? "Update " : "Create "}Institution</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <p className="text-danger">{error}</p>}
        <Formik
          initialValues={mode === "update" ? institution : initialValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          validateOnChange={false}
          enableReinitialize={true}
        >
          {(formik) => {
            return (
              <Form>
                <FormInput controlId="institution-name" label="Institution Name" name="name" />
                <Modal.Footer>
                  <Button variant="outline-secondary" onClick={handleClose}>
                    Close
                  </Button>

                  <Button
                    variant="outline-success"
                    type="submit"
                    disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
                  >
                    {mode === "update" ? "Update " : "Create "}Institution
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

export async function loadInstitution({ params }: any) {
  const institutionResponse = await axiosClient.get(`/institutions/${params.id}`);
  return await institutionResponse.data;
}

export default InstitutionEditor;
