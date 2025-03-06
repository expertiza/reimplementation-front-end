import React, {useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {useDispatch} from "react-redux";
import {alertActions} from "store/slices/alertSlice";
import {HttpMethod} from "utils/httpMethods";
import useAPI from "../../hooks/useAPI";
import {IUserResponse as IUser} from "../../utils/interfaces";
import {useTranslation} from "react-i18next"; // Importing useTranslation hook

/**
 * @author Ankur Mundra on April, 2023
 */

interface IDeleteUser {
  userData: IUser;
  onClose: () => void;
}

const DeleteUser: React.FC<IDeleteUser> = ({ userData, onClose }) => {
  const { t } = useTranslation(); // Initialize useTranslation hook
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
          message: t('users.delete.success_message', { userName: userData.name }),
        })
      );
      onClose();
    }
  }, [deletedUser?.status, dispatch, onClose, userData.name, t]);

  const closeHandler = () => {
    setShow(false);
    onClose();
  };

  return (
    <Modal show={show} onHide={closeHandler}>
      <Modal.Header closeButton>
        <Modal.Title>{t('users.delete.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {t('users.delete.confirm_message')} <b>{userData.name}?</b>
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={closeHandler}>
          {t('users.delete.cancel')}
        </Button>
        <Button variant="outline-danger" onClick={deleteHandler}>
          {t('users.delete.delete')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteUser;
