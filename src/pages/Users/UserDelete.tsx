import React, {useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {useDispatch} from "react-redux";
import {alertActions} from "../../store/slices/alertSlice";
import {HttpMethod} from "../../utils/httpMethods";
import useAPI from "../../hooks/useAPI";
import {IUserResponse as IUser} from "../../utils/interfaces";

/**
 * @author Ankur Mundra on April, 2023
 */

interface IDeleteUser {
  userData: IUser;
  onClose: () => void;
}

const DeleteUser: React.FC<IDeleteUser> = ({ userData, onClose }) => {
  const { data: deletedUser, error: userError, sendRequest: deleteUser } = useAPI();
  const [show, setShow] = useState<boolean>(true);
  const dispatch = useDispatch();

  // Delete user
  const deleteHandler = () =>
    deleteUser({ url: `/users/${userData.id}`, method: HttpMethod.DELETE });

  // Show error if any
  useEffect(() => {
    if (userError) dispatch(alertActions.showAlert({ variant: "danger", message: userError }));
  }, [userError, dispatch]);

  // Close modal if user is deleted
  useEffect(() => {
    if (deletedUser?.status && deletedUser?.status >= 200 && deletedUser?.status < 300) {
      setShow(false);
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `User ${userData.name} deleted successfully!`,
        })
      );
      onClose();
    }
  }, [deletedUser?.status, dispatch, onClose, userData.name]);

  const closeHandler = () => {
    setShow(false);
    onClose();
  };

  return (
    <Modal show={show} onHide={closeHandler}>
      <Modal.Header closeButton>
        <Modal.Title>Delete User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete user <b>{userData.name}?</b>
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

export default DeleteUser;
