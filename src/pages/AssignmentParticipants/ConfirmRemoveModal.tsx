import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

interface ConfirmRemoveModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void | Promise<void>;
  errorMessage?: string | null;
}

function ConfirmRemoveModal({ show, onHide, onConfirm, errorMessage }: ConfirmRemoveModalProps) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Removal</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-2">Are you sure you want to remove this participant?</p>
        {errorMessage ? (
          <div className="flash_note alert alert-danger error-message" role="alert">
            {errorMessage}
          </div>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn btn-md" variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button className="btn btn-md" variant="danger" onClick={() => void onConfirm()}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmRemoveModal;
