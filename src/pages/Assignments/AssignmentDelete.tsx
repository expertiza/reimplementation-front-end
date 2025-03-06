import { Button, Modal } from "react-bootstrap";
import React, { useEffect, useState } from "react";

import { HttpMethod } from "utils/httpMethods";
import { IAssignmentResponse as IAssignment } from "../../utils/interfaces";
import { alertActions } from "store/slices/alertSlice";
import useAPI from "../../hooks/useAPI";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next"; // Importing useTranslation hook

interface IDeleteAssignment {
  assignmentData: IAssignment;
  onClose: () => void;
}

const DeleteAssignment: React.FC<IDeleteAssignment> = ({ assignmentData, onClose }) => {
  const { t } = useTranslation(); // Initialize useTranslation hook
  const { data: deletedAssignment, error: assignmentError, sendRequest: deleteAssignment } = useAPI();
  const [show, setShow] = useState<boolean>(true);
  const dispatch = useDispatch();

  // Delete assignment
  const deleteHandler = () =>
    deleteAssignment({ url: `/assignments/${assignmentData.id}`, method: HttpMethod.DELETE });

  // Show error if any
  useEffect(() => {
    if (assignmentError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: assignmentError }));
    }
  }, [assignmentError, dispatch]);

  // Close modal if assignment is deleted
  useEffect(() => {
    if (
      deletedAssignment?.status &&
      deletedAssignment?.status >= 200 &&
      deletedAssignment?.status < 300
    ) {
      setShow(false);
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: t('assignments.delete.success_message', { assignmentName: assignmentData.name }),
        })
      );
      onClose();
    }
  }, [deletedAssignment?.status, dispatch, onClose, assignmentData.name, t]);

  const closeHandler = () => {
    setShow(false);
    onClose();
  };

  return (
    <Modal show={show} onHide={closeHandler}>
      <Modal.Header closeButton>
        <Modal.Title>{t('assignments.delete.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {t('assignments.delete.confirm_message')} <b>{assignmentData.name}?</b>
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={closeHandler}>
          {t('assignments.delete.cancel')}
        </Button>
        <Button variant="outline-danger" onClick={deleteHandler}>
          {t('assignments.delete.delete')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteAssignment;
