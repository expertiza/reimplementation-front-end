import { Button, Modal } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import useAPI from "hooks/useAPI";
import { alertActions } from "store/slices/alertSlice";

interface DeleteTopicsProps {
  assignmentId: string;
  topicIds: string[]; // topic_identifier values
  topicNames?: string[]; // optional display names
  onClose: () => void;
  onDeleted?: () => void;
}

const DeleteTopics: React.FC<DeleteTopicsProps> = ({ assignmentId, topicIds, topicNames = [], onClose, onDeleted }) => {
  const { data: deleteResp, error: deleteError, sendRequest: deleteTopics } = useAPI();
  const [show, setShow] = useState<boolean>(true);
  const dispatch = useDispatch();

  const deleteHandler = () => {
    deleteTopics({
      url: `/project_topics`,
      method: 'DELETE',
      params: {
        assignment_id: Number(assignmentId),
        'topic_ids[]': topicIds,
      }
    });
  };

  useEffect(() => {
    if (deleteError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: deleteError }));
    }
  }, [deleteError, dispatch]);

  useEffect(() => {
    if (deleteResp?.status && deleteResp.status >= 200 && deleteResp.status < 300) {
      setShow(false);
      const label = topicIds.length === 1 ? (topicNames[0] || topicIds[0]) : `${topicIds.length} topics`;
      dispatch(alertActions.showAlert({ variant: "success", message: `Deleted ${label} successfully.` }));
      onClose();
      onDeleted && onDeleted();
    }
  }, [deleteResp?.status, dispatch, onClose, topicIds, topicNames]);

  const closeHandler = () => {
    setShow(false);
    onClose();
  };

  const title = topicIds.length === 1 ? 'Delete Topic' : 'Delete Topics';
  const body = topicIds.length === 1
    ? <>Are you sure you want to delete topic <b>{topicNames[0] || topicIds[0]}</b>?</>
    : <>Are you sure you want to delete <b>{topicIds.length}</b> selected topics?</>;

  return (
    <Modal show={show} onHide={closeHandler} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{body}</p>
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

export default DeleteTopics;
