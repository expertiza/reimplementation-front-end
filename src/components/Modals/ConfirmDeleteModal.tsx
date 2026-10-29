import React from "react";
import { Button, Modal, Spinner } from "react-bootstrap";

/**
 * Confirmation prompt for a destructive action, following the same shape as the
 * per-resource delete modals (CourseDelete, UserDelete, RoleDelete, ...) but
 * generic over what is being removed.
 */
interface IConfirmDeleteModalProps {
  show: boolean;
  /** Modal heading, e.g. "Delete File" or "Remove Hyperlink". */
  title: string;
  /** The kind of thing being removed, used in the sentence: "delete file <name>?". */
  itemType: string;
  /** What is about to be removed -- a filename, a URL. */
  itemLabel: string;
  /** Verb used in the sentence and on the confirm button. */
  action?: "Delete" | "Remove";
  /** Disables the buttons while the request is in flight. */
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<IConfirmDeleteModalProps> = ({
  show,
  title,
  itemType,
  itemLabel,
  action = "Delete",
  isSubmitting = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-break">
          Are you sure you want to {action.toLowerCase()} {itemType} <b>{itemLabel}?</b>
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="outline-danger" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting && <Spinner animation="border" size="sm" className="me-2" />}
          {action}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDeleteModal;
