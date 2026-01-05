import React, { useEffect } from "react";
import { Form, Formik, FormikHelpers } from "formik";
import { Button, InputGroup, Modal } from "react-bootstrap";
import FormInput from "../../components/Form/FormInput";
import { alertActions } from "../../store/slices/alertSlice";
import { useDispatch } from "react-redux";
import { useNavigate, useRouteLoaderData } from "react-router-dom";
import { HttpMethod } from "../../utils/httpMethods";
import useAPI from "../../hooks/useAPI";
import * as Yup from "yup";
import axiosClient from "../../utils/axios_client";
import { IEditor, IRole } from "../../utils/interfaces";
import FormSelect from "../../components/Form/FormSelect";
import { transformRolesResponse } from "../Users/userUtil";

/**
 * @author Ankur Mundra on June, 2023
 */

const initialValues: IRole = {
  name: "",
  parent_id: -1,
};

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Required")
    .min(3, "Institution name must be at least 3 characters")
    .max(16, "Institution name must be at most 16 characters"),
});

const RoleEditor: React.FC<IEditor> = ({ mode }) => {
  const { data: roleResponse, error, sendRequest } = useAPI();
  const availableRoles = transformRolesResponse(JSON.stringify(useRouteLoaderData("roles")));
  const role: any = useRouteLoaderData("edit-role");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Close the modal if the role is updated successfully and navigate to the institutions page
  useEffect(() => {
    if (roleResponse && roleResponse.status >= 200 && roleResponse.status < 300) {
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `Role ${mode}d successfully!`,
        })
      );
      navigate("/administrator/roles");
    }
  }, [dispatch, mode, navigate, roleResponse]);

  // Show the error message if the role is not updated successfully
  useEffect(() => {
    error && dispatch(alertActions.showAlert({ variant: "danger", message: error }));
  }, [error, dispatch]);

  const onSubmit = (values: IRole, submitProps: FormikHelpers<IRole>) => {
    let method: HttpMethod = HttpMethod.POST;
    let url: string = "/roles";

    if (mode === "update") {
      url = `/roles/${values.id}`;
      method = HttpMethod.PATCH;
    }

    sendRequest({
      url: url,
      method: method,
      data: values,
    });
    submitProps.setSubmitting(false);
  };

  const handleClose = () => navigate("/administrator/roles");

  return (
    <Modal size="lg" centered show={true} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{mode === "update" ? "Update " : "Create "}Role</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <p className="text-danger">{error}</p>}
        <Formik
          initialValues={mode === "update" ? role : initialValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          validateOnChange={false}
          enableReinitialize={true}
        >
          {(formik) => {
            return (
              <Form>
                <FormInput controlId="role-name" label="Role Name" name="name" />
                <FormSelect
                  controlId="role-parent"
                  name="parent_id"
                  options={availableRoles}
                  inputGroupPrepend={<InputGroup.Text id="role-p-prepend">Parent</InputGroup.Text>}
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
                    {mode === "update" ? "Update " : "Create "}Role
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

export async function loadAvailableRole({ params }: any) {
  const roleResponse = await axiosClient.get(`roles/${params.id}`);
  return await roleResponse.data;
}

export default RoleEditor;
