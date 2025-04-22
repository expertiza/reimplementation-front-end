import { useEffect, useState } from 'react';
import { Participant, ParticipantPermissions, ParticipantRole, Role } from './AssignmentParticipantsTypes';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './EditParticipantModal.css';

interface EditParticipantModalProps {
  participant: Participant;
  show: boolean;
  onHide: () => void;
  onSave: (updatedParticipant: Participant) => void;
}

const permissionLabels = {
  review: 'Review',
  submission: 'Submission',
  metareview: 'Meta Review',
  submit: 'Submit',
  takeQuiz: 'Take Quiz',
  mentor: 'Mentor',
};

function EditParticipantModal({ participant, show, onHide, onSave }: EditParticipantModalProps) {
  const [updatedParticipant, setUpdatedParticipant] = useState<Participant>(participant);

  useEffect(() => {
    setUpdatedParticipant(participant);
  }, [participant]);
  const handleChange = (field: keyof Participant, value: any) => {
    setUpdatedParticipant({ ...updatedParticipant, [field]: value });
  };


  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit participant</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formName" className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={updatedParticipant.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formEmail" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={updatedParticipant.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formRole" className="mb-3">
            <Form.Label>Role</Form.Label>
            <Form.Control
              as="select"
              value={updatedParticipant.role}
              onChange={(e) => handleChange('role', e.target.value)}
            >
              {Object.values(Role).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="formParticipantRole" className="mb-3">
            <Form.Label>Participant role</Form.Label>
            <Form.Control
              as="select"
              value={updatedParticipant.participantRole}
              onChange={(e) => handleChange('participantRole', e.target.value)}
            >
              {Object.values(ParticipantRole).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
                //removed the sliders that allowed redundant and insecure changes to authorization
              ))}
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      {/* Changed the buttons for Save and Cancel according to the design standards */}
      <Modal.Footer>
        <Button className = "btn btn-md" variant="danger" onClick={() => {
          onSave(updatedParticipant)
          onHide();
        }}>
          Save changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditParticipantModal;
