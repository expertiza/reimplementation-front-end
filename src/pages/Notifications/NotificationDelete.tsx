import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { alertActions } from "store/slices/alertSlice";
import { HttpMethod } from "utils/httpMethods";
import useAPI from "../../hooks/useAPI";
import { INotification } from "../../utils/interfaces";

// Mock notifications to handle deletion for now
let mockNotifications: INotification[] = [
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

interface IDeleteNotification {
    notificationData: INotification;
    onClose: () => void;
}

const DeleteNotification: React.FC<IDeleteNotification> = ({ notificationData, onClose }) => {
    const [show, setShow] = useState<boolean>(true);
    const dispatch = useDispatch();

    const deleteHandler = () => {
        // Handle deletion locally by filtering out the notification
        mockNotifications = mockNotifications.filter(
            (notif) => notif.id !== notificationData.id
        );
        setShow(false);
        dispatch(
            alertActions.showAlert({
                variant: "success",
                message: `Notification ${notificationData.subject} deleted successfully!`,
            })
        );
        onClose();
    };

    const closeHandler = () => {
        setShow(false);
        onClose();
    };

    return (
        <Modal show={show} onHide={closeHandler}>
            <Modal.Header closeButton>
                <Modal.Title>Delete Notification</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Are you sure you want to delete the notification <b>{notificationData.subject}</b>?
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={closeHandler}>
                    Cancel
                </Button>
                <Button variant="outline-danger" onClick={deleteHandler}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteNotification;
