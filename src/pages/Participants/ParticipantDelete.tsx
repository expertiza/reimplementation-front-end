import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { alertActions } from "../../store/slices/alertSlice";
import { HttpMethod } from "../../utils/httpMethods";
import useAPI from "../../hooks/useAPI";
import { IParticipantResponse as IParticipant } from "../../utils/interfaces";

/**
 * @author Atharva Thorve on October, 2023
 */

interface IDeleteParticipant {
  participantData: IParticipant;
  onClose: () => void;
}

const DeleteParticipant: React.FC<IDeleteParticipant> = ({ participantData, onClose }) => {
  const { data: deletedParticipant, error: participantError, sendRequest: deleteParticipant } = useAPI();
  const [show, setShow] = useState<boolean>(true);
  const dispatch = useDispatch();

  // Delete user
  const deleteHandler = () =>
    deleteParticipant({ url: `/participants/${participantData.id}`, method: HttpMethod.DELETE });

  // Show error if any
  useEffect(() => {
    if (participantError) dispatch(alertActions.showAlert({ variant: "danger", message: participantError }));
  }, [participantError, dispatch]);

  // Close modal if user is deleted
  useEffect(() => {
    if (deletedParticipant?.status && deletedParticipant?.status >= 200 && deletedParticipant?.status < 300) {
      setShow(false);
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `User ${participantData.name} deleted successfully!`,
        })
      );
      onClose();
    }
  }, [deletedParticipant?.status, dispatch, onClose, participantData.name]);

  const closeHandler = () => {
    setShow(false);
    onClose();
  };

  return (
    <Modal show={show} onHide={closeHandler}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Participant</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete participant <b>{participantData.name}?</b>
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

export default DeleteParticipant;
