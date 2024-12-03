import React, {useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {useDispatch} from "react-redux";
import {alertActions} from "store/slices/alertSlice";
import {IUserResponse as IUser} from "../../utils/interfaces";


type DeleteUserProps = {
  userData: IUser;
  onClose: () => void;
  onDelete: (userId: number) => void; // Ensure this is declared
};


const DeleteUser: React.FC<DeleteUserProps> = ({ userData, onClose, onDelete }) => {
  // const { data: deletedUser, error: userError, sendRequest: deleteUser } = useAPI();
  const [show, setShow] = useState<boolean>(true);
  // const dispatch = useDispatch();

  // Delete user
const deleteHandler = () => {
  onDelete(userData.id); // Call the parent-provided delete function
  setShow(false);
  
  onClose();
};

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