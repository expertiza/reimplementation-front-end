import React, {useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {useDispatch} from "react-redux";
import {alertActions} from "../../store/slices/alertSlice";
import {HttpMethod} from "../../utils/httpMethods";
import useAPI from "../../hooks/useAPI";
import {IRole} from "../../utils/interfaces";

/**
 * @author Ankur Mundra on June, 2023
 */

interface IDeleteRole {
  roleData: IRole;
  onClose: () => void;
}

const DeleteRole: React.FC<IDeleteRole> = ({ roleData, onClose }) => {
  const { data: response, error: roleError, sendRequest: deleteRole } = useAPI();
  const [show, setShow] = useState<boolean>(true);
  const dispatch = useDispatch();

  // Delete user
  const deleteHandler = () =>
    deleteRole({ url: `/roles/${roleData.id}`, method: HttpMethod.DELETE });

  // Show error if any
  useEffect(() => {
    if (roleError) dispatch(alertActions.showAlert({ variant: "danger", message: roleError }));
  }, [roleError, dispatch]);

  // Close modal if user is deleted
  useEffect(() => {
    if (response?.status && response?.status >= 200 && response?.status < 300) {
      setShow(false);
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `Role: ${roleData.name} deleted successfully!`,
        })
      );
      onClose();
    }
  }, [response?.status, dispatch, onClose, roleData.name]);

  const closeHandler = () => {
    setShow(false);
    onClose();
  };

  return (
    <Modal show={show} onHide={closeHandler}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Role</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete role <b>{roleData.name}?</b>
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

export default DeleteRole;
