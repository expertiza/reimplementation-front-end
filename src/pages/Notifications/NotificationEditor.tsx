import React, { useEffect, useState } from "react";
import { Form, Formik, FormikHelpers } from "formik";
import { Button, Modal } from "react-bootstrap";
import FormInput from "components/Form/FormInput";
import { alertActions } from "store/slices/alertSlice";
import { useDispatch, useSelector } from "react-redux";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { HttpMethod } from "utils/httpMethods";
import useAPI from "hooks/useAPI";
import * as Yup from "yup";
import axiosClient from "../../utils/axios_client";
import { INotification } from "../../utils/interfaces";
import { RootState } from "../../store/store";
import { FormGroup, FormLabel, FormControl } from "react-bootstrap";

// Mock notification data for edit
const mockNotifications: INotification[] = [
    {
        id: "1",
        course: "CS101",
        subject: "New Homework",
        description: "Homework 1 due next week",
        expirationDate: "2024-10-31",
        isActive: true,
    },
    {
        id: "2",
        course: "CS102",
        subject: "Class Canceled",
        description: "No class tomorrow",
        expirationDate: "2024-11-01",
        isActive: false,
    },
    {
        id: "3",
        course: "CS103",
        subject: "Exam scheduled",
        description: "Please prepare for the exam",
        expirationDate: "2024-11-05",
        isActive: true,
    },
];

const mockAssignedCourses = ["CS101", "CS102", "CS103"];

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

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // Get the ID from the URL parameters
    const [notification, setNotification] = useState<INotification>(initialValues);


    useEffect(() => {
        if (mode === "update" && id) {
            // Simulate loading data for the edit mode from mock notifications
            const notificationToEdit = mockNotifications.find((notif) => notif.id === id);
            if (notificationToEdit) {
                setNotification(notificationToEdit);
            } else {
                dispatch(alertActions.showAlert({
                    variant: "danger",
                    message: "Notification not found!",
                }));
                navigate("/notifications"); // Navigate back if the notification doesn't exist
            }
        }
    }, [id, mode, dispatch, navigate]);


    const onSubmit = (values: INotification, submitProps: FormikHelpers<INotification>) => {

        // Simulate submission logic here (no backend call)
        const message = mode === "update" ? "Notification updated successfully!" : "Notification created successfully!";
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
