import React, { useEffect } from "react";
import { Form, Formik, FormikHelpers } from "formik";
import { Button, Modal } from "react-bootstrap";
import FormInput from "components/Form/FormInput";
import { alertActions } from "store/slices/alertSlice";
import { useDispatch } from "react-redux";
import { useLoaderData, useNavigate } from "react-router-dom";
import { HttpMethod } from "utils/httpMethods";
import useAPI from "hooks/useAPI";
import * as Yup from "yup";
import axiosClient from "../../utils/axios_client";
import { INotification } from "../../utils/interfaces";

const initialValues: INotification = {
    id: "",
    course: "",
    subject: "",
    description: "",
    expirationDate: "",
    isActive: false,
};

const validationSchema = Yup.object({
    subject: Yup.string().required("Required").min(3, "Subject must be at least 3 characters"),
    description: Yup.string().required("Required").min(5, "Description must be at least 5 characters"),
});

const NotificationEditor: React.FC<{ mode: "create" | "update" }> = ({ mode }) => {
    const { data: notificationResponse, error, sendRequest } = useAPI();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const notification: any = useLoaderData();

    useEffect(() => {
        if (notificationResponse && notificationResponse.status >= 200 && notificationResponse.status < 300) {
            dispatch(alertActions.showAlert({
                variant: "success",
                message: `Notification ${mode}d successfully!`,
            }));
            navigate("/administrator/notifications");
        }
    }, [dispatch, mode, navigate, notificationResponse]);

    useEffect(() => {
        error && dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }, [error, dispatch]);

    const onSubmit = (values: INotification, submitProps: FormikHelpers<INotification>) => {
        const method = mode === "update" ? HttpMethod.PATCH : HttpMethod.POST;
        const url = mode === "update" ? `/notifications/${values.id}` : "/notifications";

        sendRequest({ url, method, data: values });
        submitProps.setSubmitting(false);
    };

    const handleClose = () => navigate("/administrator/notifications");

    return (
        <Modal size="lg" centered show={true} onHide={handleClose} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{mode === "update" ? "Update " : "Create "}Notification</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Formik
                    initialValues={mode === "update" ? notification : initialValues}
                    onSubmit={onSubmit}
                    validationSchema={validationSchema}
                    validateOnChange={false}
                    enableReinitialize={true}
                >
                    {(formik) => (
                        <Form>
                            <FormInput controlId="notification-subject" label="Subject" name="subject" />
                            <FormInput controlId="notification-description" label="Description" name="description" as="textarea" rows={3} />
                            <FormInput controlId="notification-expiration" label="Expiration Date" name="expirationDate" type="date" />
                            <FormInput controlId="notification-active" label="Active" name="isActive" type="checkbox" />

                            <Modal.Footer>
                                <Button variant="outline-secondary" onClick={handleClose}>Close</Button>
                                <Button variant="outline-success" type="submit" disabled={!formik.isValid || formik.isSubmitting}>
                                    {mode === "update" ? "Update" : "Create"} Notification
                                </Button>
                            </Modal.Footer>
                        </Form>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    );
};

export async function loadNotification({ params }: any) {
    const notificationResponse = await axiosClient.get(`/notifications/${params.id}`);
    return await notificationResponse.data;
}

export default NotificationEditor;
