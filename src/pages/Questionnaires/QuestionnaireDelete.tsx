import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { alertActions } from "store/slices/alertSlice";
import { HttpMethod } from "utils/httpMethods";
import useAPI from "hooks/useAPI";
import { QuestionnaireResponse } from "./QuestionnaireUtils";

interface IDeleteQuestionnaire {
  questionnaireData: QuestionnaireResponse;
  onClose: () => void;
  onDeleteSuccess?: (deletedId: number) => void; 
}

const DeleteQuestionnaire: React.FC<IDeleteQuestionnaire> = ({ questionnaireData, onClose, onDeleteSuccess }) => {
  
  const { data: deletedQuestionnaire, error: questionnaireError, sendRequest: deleteQuestionnaire } = useAPI();
  
  const [show, setShow] = useState<boolean>(true);
  const dispatch = useDispatch();

 
  const deleteHandler = () => 
    deleteQuestionnaire({ 
      url: `/questionnaires/${questionnaireData.id}`, 
      method: HttpMethod.DELETE 
    });

 
  useEffect(() => {
    if (questionnaireError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: questionnaireError }));
    }
  }, [questionnaireError, dispatch]);

 
  const handleDeleteSuccess = () => {
    setShow(false);
    dispatch(
      alertActions.showAlert({
        variant: "success",
        message: `Questionnaire "${questionnaireData.name}" deleted successfully!`,
      })
    );
    questionnaireData.id && onDeleteSuccess?.(questionnaireData.id);
    onClose();
  };

 
  useEffect(() => {
    if (deletedQuestionnaire?.status && deletedQuestionnaire?.status >= 200 && deletedQuestionnaire?.status < 300) {
      handleDeleteSuccess();
    }
  }, [deletedQuestionnaire?.status, dispatch, onClose, questionnaireData.name]);

  
  const closeHandler = () => {
    setShow(false);
    onClose();
  };

  return (
    <Modal show={show} onHide={closeHandler} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete Questionnaire</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete questionnaire <b>{questionnaireData.name}</b>?
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

export default DeleteQuestionnaire;
