import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { alertActions } from "store/slices/alertSlice";
import { HttpMethod } from "utils/httpMethods";
import useAPI from "../../hooks/useAPI";
import { INotification } from "../../utils/interfaces";

interface IDeleteNotification {
    notificationData: INotification;
    onClose: () => void;
}

const DeleteNotification: React.FC<IDeleteNotification> = ({ notificationData, onClose }) => {
    const { data: response, error: userError, sendRequest: deleteNotification } = useAPI();
    const [show, setShow] = useState<boolean>(true);
    const dispatch = useDispatch();

    const deleteHandler = () =>
        deleteNotification({
            url: `/notifications/${notificationData.id}`,
            method: HttpMethod.DELETE,
        });

    useEffect(() => {
        if (userError) {
            dispatch(alertActions.showAlert({ variant: "danger", message: userError }));
        }
    }, [userError, dispatch]);

    useEffect(() => {
        if (response?.status && response?.status >= 200 && response?.status < 300) {
            setShow(false);
            dispatch(alertActions.showAlert({
                variant: "success",
                message: `Notification ${notificationData.subject} deleted successfully!`,
            }));
            onClose();
        }
    }, [response?.status, dispatch, onClose, notificationData.subject]);

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
                <p>Are you sure you want to delete notification <b>{notificationData.subject}</b>?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={closeHandler}>Cancel</Button>
                <Button variant="outline-danger" onClick={deleteHandler}>Delete</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteNotification;
