import React, {useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {useDispatch} from "react-redux";
import {alertActions} from "store/slices/alertSlice";
import {HttpMethod} from "utils/httpMethods";
import useAPI from "../../hooks/useAPI";
import {IInstitution} from "../../utils/interfaces";
import {useTranslation} from "react-i18next";

/**
 * @author Ankur Mundra on June, 2023
 */

interface IDeleteInstitution {
  institutionData: IInstitution;
  onClose: () => void;
}

const DeleteInstitution: React.FC<IDeleteInstitution> = ({ institutionData, onClose }) => {
  const { t } = useTranslation(); // Initialize useTranslation hook
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
          message: t('institutions.delete.success_message', { institutionName: institutionData.name }),
        })
      );
      onClose();
    }
  }, [response?.status, dispatch, onClose, institutionData.name, t]);

  const closeHandler = () => {
    setShow(false);
    onClose();
  };

  return (
    <Modal show={show} onHide={closeHandler}>
      <Modal.Header closeButton>
        <Modal.Title>{t('institutions.delete.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {t('institutions.delete.confirm_message')} <b>{institutionData.name}?</b>
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={closeHandler}>
          {t('institutions.delete.cancel')}
        </Button>
        <Button variant="outline-danger" onClick={deleteHandler}>
          {t('institutions.delete.delete')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteInstitution;
