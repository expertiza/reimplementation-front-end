import { useEffect, useMemo, useState } from 'react';
import { Participant, ParticipantRole, Role } from './AssignmentParticipantsTypes';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './EditParticipantModal.css';

interface EditParticipantModalProps {
  participant: Participant;
  roleOptions: string[];
  show: boolean;
  onHide: () => void;
  onSave: (updatedParticipant: Participant) => void;
  errorMessage?: string | null;
}

/** Modal form for editing a participant; parent controls closing after save succeeds. */
function EditParticipantModal({ participant, roleOptions, show, onHide, onSave, errorMessage }: EditParticipantModalProps) {
  const [updatedParticipant, setUpdatedParticipant] = useState<Participant>(participant);

  useEffect(() => {
    setUpdatedParticipant(participant);
  }, [participant]);

  const handleChange = (field: keyof Participant, value: any) => {
    setUpdatedParticipant({ ...updatedParticipant, [field]: value });
  };

  const selectedRoleValue =
    String(updatedParticipant.role).toLowerCase() === "administrator"
      ? Role.Admin
      : updatedParticipant.role;

  const userRoleSelectOptions = useMemo(() => {
    const opts = [...roleOptions];
    if (updatedParticipant.role === Role.Unknown && !opts.includes(Role.Unknown)) {
      opts.push(Role.Unknown);
    }
    return opts;
  }, [roleOptions, updatedParticipant.role]);

  const participantRoleSelectOptions = useMemo(
    () =>
      Object.values(ParticipantRole).filter(
        (r) => r !== ParticipantRole.Unknown || updatedParticipant.participantRole === ParticipantRole.Unknown
      ),
    [updatedParticipant.participantRole]
  );

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="edit-participant-modal">
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
              value={selectedRoleValue}
              onChange={(e) => handleChange('role', e.target.value)}
            >
              {userRoleSelectOptions.map((role) => (
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
              {participantRoleSelectOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex flex-column align-items-stretch">
        {errorMessage && (
          <div className="alert alert-danger mb-2" role="alert">
            {errorMessage}
          </div>
        )}
        <div className="d-flex justify-content-end">
          <Button
            className="btn btn-md"
            variant="danger"
            onClick={() => onSave(updatedParticipant)}
          >
            Save changes
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default EditParticipantModal;
