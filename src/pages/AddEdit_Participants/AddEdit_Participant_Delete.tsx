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
        <Button variant="outline-secondary"
              style={{
                backgroundColor: "white", // Default background
                color: "black", // Default text color
                border: "1px solid #ccc", // Light gray border
                padding: "4px 16px",
                borderRadius: "4px", // Slight border radius
                transition: "background-color 0.3s ease", // Smooth transition
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = "lightgray"; // Hover effect
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = "white"; // Remove hover effect
              }}
              onMouseDown={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = "gray"; // Click effect
              }}
              onMouseUp={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = "lightgray"; // Revert after click
              }} 
              onClick={closeHandler}>
          Cancel
        </Button>
        <Button variant="outline-secondary"
              style={{
                backgroundColor: "white", // Default background
                color: "black", // Default text color
                border: "1px solid #ccc", // Light gray border
                padding: "4px 16px",
                borderRadius: "4px", // Slight border radius
                transition: "background-color 0.3s ease", // Smooth transition
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = "lightgray"; // Hover effect
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = "white"; // Remove hover effect
              }}
              onMouseDown={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = "gray"; // Click effect
              }}
              onMouseUp={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = "lightgray"; // Revert after click
              }} 
              onClick={deleteHandler}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteUser;