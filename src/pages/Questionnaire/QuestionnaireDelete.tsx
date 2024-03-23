import React, {useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {useDispatch} from "react-redux";
import {alertActions} from "store/slices/alertSlice";
import {HttpMethod} from "utils/httpMethods";
import useAPI from "../../hooks/useAPI";
import {IQuestionnaire} from "../../utils/interfaces";

/**
 * @author Jeffrey Riehle on March, 2024
 */

interface IDeleteQuestionnaire {
  questionnaireData: IQuestionnaire;
  onClose: () => void;
}

const DeleteQuestionnaire: React.FC<IDeleteQuestionnaire> = ({ questionnaireData, onClose }) => {
  const [show, setShow] = useState<boolean>(true);

  
  const closeHandler = () => {
    setShow(false);
    onClose();
  };

  return (
    <Modal show={show} onHide={closeHandler}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Questionnaire</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete Questionnaire <b>{questionnaireData.name}?</b>
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={closeHandler}>
          Cancel
        </Button>
        <Button variant="outline-danger">
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteQuestionnaire;
