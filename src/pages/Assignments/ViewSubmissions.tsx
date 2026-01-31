import React, { useMemo } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Table from "../../components/Table/Table";
import { createColumnHelper } from "@tanstack/react-table";

interface ISubmission {
  id: number;
  name: string;
}

const columnHelper = createColumnHelper<ISubmission>();

const ViewSubmissions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Dummy data for submissions
  const submissions = useMemo(() => [
    { id: 1, name: 'Submission 1' },
    { id: 2, name: 'Submission 2' },
    // ...other submissions
  ], []);

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: () => 'Submission',
      cell: info => info.getValue()
    }),
    columnHelper.display({
      id: 'actions',
      header: () => 'Actions',
      cell: ({ row }) => (
        <Button variant="outline-danger" size="sm" onClick={() => handleActionClick(row.original.id)}>
          Action
        </Button>
      )
    })
  ], []);

  const handleActionClick = (submissionId: number) => {
    console.log(`Action clicked for submission ID ${submissionId}`);
    // Here goes the logic for handling the action
  };

  // const handleClose = () => {
  //   navigate(-1); // Go back to the previous page
  // };

  return (
    <Container className="mt-4">
      <div style={{ color: '#31708f', backgroundColor: '#d9edf7', padding: '10px', borderRadius: '5px', border: '1px solid #bce8f1', marginBottom: '20px' }}>
        This is a placeholder page and is still in progress.
      </div>
      <Row className="mt-md-2 mb-md-2">
        <Col className="text-center">
          <h1>View Submissions</h1>
        </Col>
        <hr />
      </Row>
      <Row className="mt-3">
        <Col className="d-flex gap-2">
          <Button 
            variant="primary" 
            onClick={() => navigate(`/assignments/edit/${id}/submitcontent`)}
          >
            Submit Content
          </Button>
        </Col>
      </Row>
      {/* <Row>
        <Col className="text-right">
          <Button variant="outline-secondary" onClick={handleClose} style={{ marginRight: '10px' }}>
            Close
          </Button>
        </Col>
      </Row> */}
    </Container>
  );
};

export default ViewSubmissions;