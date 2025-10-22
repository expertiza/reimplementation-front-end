import React from "react";
import { Button, Modal } from "react-bootstrap";
import { Participant } from "./participantTypes";

interface DeleteConfirmationModalProps {
  show: boolean;
  participant: Participant | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  show,
  participant,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      style={{
        backdropFilter: "blur(2px)",
      }}
    >
      <Modal.Header
        closeButton
        style={{
          border: "none",
          paddingBottom: "0.5rem",
          backgroundColor: "#fff5f5",
        }}
      >
        <Modal.Title
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#c53030",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <img src="/assets/images/remove.png" alt="Warning" width="24" height="24" />
          Confirm delete
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: "1.5rem", backgroundColor: "#fff5f5" }}>
        <p style={{ fontSize: "0.9375rem", color: "#2d3748", marginBottom: "0.5rem" }}>
          Are you sure you want to remove{" "}
          <strong style={{ color: "#1a202c" }}>{participant?.name}</strong>?
        </p>
        <p style={{ fontSize: "0.875rem", color: "#718096", marginBottom: 0 }}>
          This action cannot be undone.
        </p>
      </Modal.Body>
      <Modal.Footer style={{ border: "none", padding: "1rem 1.5rem", backgroundColor: "#fff5f5" }}>
        <Button
          className="btn btn-md"
          variant="outline-secondary"
          onClick={onCancel}
          style={{
            fontSize: "0.875rem",
            padding: "0.5rem 1.25rem",
            fontWeight: 600,
            borderRadius: "0.5rem",
          }}
        >
          Cancel
        </Button>
        <Button
          className="btn btn-md"
          variant="danger"
          onClick={onConfirm}
          style={{
            fontSize: "0.875rem",
            padding: "0.5rem 1.25rem",
            fontWeight: 600,
            borderRadius: "0.5rem",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationModal;
