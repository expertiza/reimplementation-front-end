import React from "react";
import { Button, Col, Container, Modal, Row, Form } from "react-bootstrap";

function EditModal(props) {
  return (
    <Modal show={props.showModal} onHide={props.handleCloseModal}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Row</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Name"
              defaultValue={props.editRowData[0]}
              onChange={(e) => props.handleInputChange(e, 0)}
            />
          </Form.Group>
          <Form.Group controlId="institution">
            <Form.Label>Institution</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Institution"
              defaultValue={props.editRowData[1]}
              onChange={(e) => props.handleInputChange(e, 1)}
            />
          </Form.Group>
          <Form.Group controlId="creationDate">
            <Form.Label>Creation Date</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Creation Date"
              defaultValue={props.editRowData[2]}
              onChange={(e) => props.handleInputChange(e, 2)}
            />
          </Form.Group>
          <Form.Group controlId="updatedDate">
            <Form.Label>Updated Date</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Updated Date"
              defaultValue={props.editRowData[3]}
              onChange={(e) => props.handleInputChange(e, 3)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={props.handleCloseModal}>
          Close
        </Button>
        <Button variant="primary" onClick={props.handleSaveEdit}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditModal;
