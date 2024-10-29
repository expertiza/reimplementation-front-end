import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { alertActions } from "store/slices/alertSlice";
import { INotification } from "../../utils/interfaces";
import { mockNotifications } from "./mock_data"; // Import the centralized mock data

interface IDeleteNotification {
    notificationData: INotification;
    onClose: () => void;
}

const DeleteNotification: React.FC<IDeleteNotification> = ({ notificationData, onClose }) => {
    const [show, setShow] = useState<boolean>(true);
    const dispatch = useDispatch();

    const deleteHandler = () => {
        // Simulate deletion by filtering out the selected notification
        const updatedNotifications = mockNotifications.filter(
            (notif) => notif.id !== notificationData.id
        );

        // Update the mockNotifications in the data file (replaceable by API call in production)
        mockNotifications.splice(0, mockNotifications.length, ...updatedNotifications);

        // Show success message
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
