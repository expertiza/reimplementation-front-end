import React, {useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {useDispatch} from "react-redux";
import {alertActions} from "store/slices/alertSlice";
import {HttpMethod} from "utils/httpMethods";
import useAPI from "../../hooks/useAPI";
import {IRole} from "../../utils/interfaces";

/**
 * @author Ankur Mundra on June, 2023
 */

// DELETE ROLE INTERFACE
interface IDeleteRole {
  roleData: IRole;
  onClose: () => void;
}

// DEFAULT EXPORT FUNCTION
const DeleteRole: React.FC<IDeleteRole> = ({ roleData, onClose }) => {
  // API CUSTOM HOOK
  const { data: response, error: roleError, sendRequest: deleteRole } = useAPI();

  // STATE MANAGEMENT
  const [show, setShow] = useState<boolean>(true);
  const dispatch = useDispatch();

  // DELETE USER
  const deleteHandler = () =>
    deleteRole({ url: `/roles/${roleData.id}`, method: HttpMethod.DELETE });

  // SHOW ERRORS
  useEffect(() => {
    if (roleError) dispatch(alertActions.showAlert({ variant: "danger", message: roleError }));
  }, [roleError, dispatch]);

  // CLOSE MODAL IF USER IS DELETED
  useEffect(() => {
    if (response?.status && response?.status >= 200 && response?.status < 300) {
      setShow(false);

      // SHOW ALERT
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `Role: ${roleData.name} deleted successfully!`,
        })
      );
      onClose();
      window.location.reload();
    }
  }, [response?.status, dispatch, onClose, roleData.name]);

  // CLOSE FUNCTION
  const closeHandler = () => {
    setShow(false);
    onClose();
  };

  // RENDER DOM
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
