import React from "react";
import { Modal } from "react-bootstrap";

interface ModalComponentProps {
  title: string;
  body: React.ReactNode;
  footer: React.ReactNode;
  show: boolean;
  onClose: () => void;
}

const ModalComponent: React.FC<ModalComponentProps> = ({ title, body, footer, show, onClose }) => {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
      <Modal.Footer>{footer}</Modal.Footer>
    </Modal>
  );
};

export default ModalComponent;
