import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import useAPI from "hooks/useAPI";
import { useDispatch } from "react-redux";
import { alertActions } from "store/slices/alertSlice";
import { HttpMethod } from "utils/httpMethods";
import { IDuty } from "./DutyColumns";
import { emit, EVENTS } from "utils/events";

const DutyDelete: React.FC<{ dutyData: IDuty; onClose: () => void }> = ({ dutyData, onClose }) => {
    const { data: resp, error, sendRequest } = useAPI();
    const [show, setShow] = useState(true);
    const dispatch = useDispatch();

    const deleteHandler = () =>
        sendRequest({ url: `/duties/${dutyData.id}`, method: HttpMethod.DELETE });

    useEffect(() => {
        if (error) dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }, [error, dispatch]);

    useEffect(() => {
        if (resp?.status && resp.status >= 200 && resp.status < 300) {
            // NEW: tell the list to refetch
            emit(EVENTS.DUTIES_CHANGED);

            setShow(false);
            dispatch(
                alertActions.showAlert({
                    variant: "success",
                    message: `Role ${dutyData.name} deleted successfully!`,
                })
            );
            onClose();
        }
    }, [resp?.status, dispatch, onClose, dutyData.name]);

    const closeHandler = () => {
        setShow(false);
        onClose();
    };

    return (
        <Modal show={show} onHide={closeHandler} centered>
            <Modal.Header closeButton>
                <Modal.Title>Delete Role</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Are you sure you want to delete role <b>{dutyData.name}</b>?<br />
                    <i>This will also remove its associated rubrics.</i>
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

export default DutyDelete;
