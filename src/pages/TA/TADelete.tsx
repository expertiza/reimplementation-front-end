// Importing necessary interfaces and modules
import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { alertActions } from "../../store/slices/alertSlice";
import { HttpMethod } from "../../utils/httpMethods";
import useAPI from "../../hooks/useAPI";
import { ITAResponse as ITA } from "../../utils/interfaces";

/**
 * @author Atharva Thorve, on December, 2023
 * @author Divit Kalathil, on December, 2023
 */

interface IDeleteTA {
  TAData: ITA;
  onClose: () => void;
}

const DeleteTA: React.FC<IDeleteTA> = ({ TAData, onClose }) => {
  const { data: deletedTA, error: TAError, sendRequest: deleteTA } = useAPI();
  const [show, setShow] = useState<boolean>(true);
  const dispatch = useDispatch();
  const params = useParams();

  // Delete TA
  const deleteHandler = () => {
    const { courseId } = params;
    deleteTA({ url: `/courses/${courseId}/TAs/${TAData.id}`, method: HttpMethod.DELETE });
  };

  // Show error if any
  useEffect(() => {
    if (TAError) dispatch(alertActions.showAlert({ variant: "danger", message: TAError }));
  }, [TAError, dispatch]);

  // Close modal if TA is deleted
  useEffect(() => {
    if (deletedTA?.status && deletedTA?.status >= 200 && deletedTA?.status < 300) {
      setShow(false);
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `TA ${TAData.name} deleted successfully!`,
        })
      );
      onClose();
    }
  }, [deletedTA?.status, dispatch, onClose, TAData.name]);

  const closeHandler = () => {
    setShow(false);
    onClose();
  };

  // Pop-up Function to delete TA
  return (
    <Modal show={show} onHide={closeHandler}>
      <Modal.Header closeButton>
        <Modal.Title>Delete TA</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete TA <b>{TAData.name}?</b>
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

export default DeleteTA;
