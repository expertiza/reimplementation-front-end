import React, { useMemo } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
// import { useNavigate } from 'react-router-dom';
import { useLoaderData } from 'react-router-dom';
import Table from "../../components/Table/Table";
import { createColumnHelper } from "@tanstack/react-table";

interface IReviewer {
  id: number;
  name: string;
}

const columnHelper = createColumnHelper<IReviewer>();

const AssignReviewer: React.FC = () => {
  const assignment: any = useLoaderData();
  // const navigate = useNavigate();

  // Dummy data for reviewers
  const reviewers = useMemo(() => [
    { id: 1, name: 'Reviewer 1' },
    { id: 2, name: 'Reviewer 2' },
    { id: 3, name: 'Reviewer 3' },
    // ...other reviewers
  ], []);

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      header: () => 'Select',
      cell: () => (
        <input type="checkbox" style={{ marginLeft: 'auto', marginRight: 'auto', display: 'block' }} /> // Center the checkbox
      )
    }),
    columnHelper.accessor('name', {
      header: () => 'Reviewer',
      cell: info => info.getValue()
    }),
    columnHelper.display({
      id: 'actions',
      header: () => 'Action',
      cell: () => (
        <Button variant="outline-danger" size="sm">
          Action
        </Button>
      )
    })
  ], []);

  const handleAssignReviewers = () => {
    console.log('Assigned reviewers');
    // Logic to assign selected reviewers goes here
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
          <h1>Assign Reviewer - {assignment.name}</h1>
        </Col>
        <hr />
      </Row>
      <Row>
        <Col>
          <Table
            data={reviewers}
            columns={columns}
            columnVisibility={{
              id: false,

            }}
          />
        </Col>
      </Row>
      <Row>
        <Col className="text-right" md={{ span: 1, offset: 11 }}>
          {/* <Button variant="outline-secondary" onClick={handleClose} style={{ marginRight: '10px' }}>
            Close
          </Button> */}
          <Button variant="outline-success" onClick={handleAssignReviewers}>
            Assign
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default AssignReviewer;