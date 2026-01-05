import React, {useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {useDispatch} from "react-redux";
import {alertActions} from "../../store/slices/alertSlice";
import {HttpMethod} from "../../utils/httpMethods";
import useAPI from "../../hooks/useAPI";
import {IInstitution} from "../../utils/interfaces";

/**
 * @author Ankur Mundra on June, 2023
 */

interface IDeleteInstitution {
  institutionData: IInstitution;
  onClose: () => void;
}

const DeleteInstitution: React.FC<IDeleteInstitution> = ({ institutionData, onClose }) => {
  const { data: response, error: userError, sendRequest: deleteUser } = useAPI();
  const [show, setShow] = useState<boolean>(true);
  const dispatch = useDispatch();

  // Delete user
  const deleteHandler = () =>
    deleteUser({ url: `/institutions/${institutionData.id}`, method: HttpMethod.DELETE });

  // Show error if any
  useEffect(() => {
    if (userError) dispatch(alertActions.showAlert({ variant: "danger", message: userError }));
  }, [userError, dispatch]);

  // Close modal if user is deleted
  useEffect(() => {
    if (response?.status && response?.status >= 200 && response?.status < 300) {
      setShow(false);
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `Institution ${institutionData.name} deleted successfully!`,
        })
      );
      onClose();
    }
  }, [response?.status, dispatch, onClose, institutionData.name]);

  const closeHandler = () => {
    setShow(false);
    onClose();
  };

  return (
    <Modal show={show} onHide={closeHandler}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Institution</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete institution <b>{institutionData.name}?</b>
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

export default DeleteInstitution;
