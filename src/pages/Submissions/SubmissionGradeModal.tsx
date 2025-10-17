import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface Props {
	show: boolean;
	onHide: () => void;
	submissionId?: number;
}

const SubmissionGradeModal: React.FC<Props> = ({ show, onHide, submissionId }) => {
	return (
		<Modal show={show} onHide={onHide} centered>
			<Modal.Header closeButton>
				<Modal.Title>Grade Submission {submissionId}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Form.Group controlId="grade">
						<Form.Label>Grade</Form.Label>
						<Form.Control type="number" min={0} max={100} />
					</Form.Group>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onHide}>Close</Button>
				<Button variant="primary" onClick={onHide}>Save</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default SubmissionGradeModal;
