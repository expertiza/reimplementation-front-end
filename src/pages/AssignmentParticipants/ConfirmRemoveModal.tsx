import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

interface ConfirmRemoveModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
}

{/* Changed the buttons for Cancel and Confirm according to the design standards */}
function ConfirmRemoveModal({ show, onHide, onConfirm }: ConfirmRemoveModalProps) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Removal</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to remove this participant?
      </Modal.Body>
      <Modal.Footer>
        <Button className= "btn btn-md" variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button className= "btn btn-md" variant="danger" onClick={onConfirm}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmRemoveModal;
