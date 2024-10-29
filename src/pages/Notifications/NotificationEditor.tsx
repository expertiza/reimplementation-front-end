import React, { useEffect, useState } from "react";
import { Form, Formik, FormikHelpers } from "formik";
import { Button, Modal, FormGroup, FormLabel, FormControl } from "react-bootstrap";
import FormInput from "components/Form/FormInput";
import { alertActions } from "store/slices/alertSlice";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import { INotification } from "../../utils/interfaces";
import { mockNotifications, mockAssignedCourses } from "./mock_data"; // Import centralized mock data

const initialValues: INotification = {
    id: "",
    course: "",
    subject: "",
    description: "",
    expirationDate: "",
    isActive: false,
    isUnread: true,
};

const validationSchema = Yup.object({
    subject: Yup.string().required("Required").min(3, "Subject must be at least 3 characters"),
    description: Yup.string().required("Required").min(5, "Description must be at least 5 characters"),
});

const NotificationEditor: React.FC<{ mode: "create" | "update" }> = ({ mode }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // Get the ID from URL parameters
    const [notification, setNotification] = useState<INotification>(initialValues);

    useEffect(() => {
        if (mode === "update" && id) {
            // Load data from centralized mockNotifications
            const notificationToEdit = mockNotifications.find((notif) => notif.id === id);
            if (notificationToEdit) {
                setNotification(notificationToEdit);
            } else {
                dispatch(alertActions.showAlert({
                    variant: "danger",
                    message: "Notification not found!",
                }));
                navigate("/notifications"); // Navigate back if notification doesn't exist
            }
        }
    }, [id, mode, dispatch, navigate]);

    const onSubmit = (values: INotification, submitProps: FormikHelpers<INotification>) => {
        // Handle submission logic (no backend call for mock data)
        const message = mode === "update" ? "Notification updated successfully!" : "Notification created successfully!";
        
        // Update mock data directly for edit mode
        if (mode === "update" && id) {
            const index = mockNotifications.findIndex((notif) => notif.id === id);
            if (index !== -1) {
                mockNotifications[index] = values;
            }
        } else {
            // For "create" mode, add a new notification
            mockNotifications.push({ ...values, id: (mockNotifications.length + 1).toString() });
        }

        dispatch(alertActions.showAlert({
            variant: "success",
            message: message,
        }));
        navigate("/notifications");
        submitProps.setSubmitting(false);
    };

    const handleClose = () => navigate("/notifications");

    return (
        <Modal size="lg" centered show={true} onHide={handleClose} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{mode === "update" ? "Update " : "Create "}Notification</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Formik
                    initialValues={notification}
                    onSubmit={onSubmit}
                    validationSchema={validationSchema}
                    validateOnChange={false}
                    enableReinitialize={true}
                >
                    {(formik) => (
                        <Form>
                            <FormGroup controlId="notification-course">
                                <FormLabel>Course</FormLabel>
                                <FormControl
                                    as="select"
                                    name="course"
                                    value={formik.values.course}
                                    onChange={formik.handleChange}
                                >
                                    <option value="">Select a Course</option>
                                    {mockAssignedCourses.map((course) => (
                                        <option key={course} value={course}>{course}</option>
                                    ))}
                                </FormControl>
                            </FormGroup>
                            <FormInput controlId="notification-subject" label="Subject" name="subject" />
                            <FormInput controlId="notification-description" label="Description" name="description" type="text" />
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

export default NotificationEditor;
