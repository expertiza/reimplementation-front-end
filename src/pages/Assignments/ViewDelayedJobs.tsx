import React, { useMemo } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
// import { useNavigate } from 'react-router-dom';
import Table from "../../components/Table/Table";
import { createColumnHelper } from "@tanstack/react-table";
import { useLoaderData } from 'react-router-dom';

interface IDelayedJob {
  id: number;
  jobName: string;
  scheduledTime: string;
}

const columnHelper = createColumnHelper<IDelayedJob>();

const ViewDelayedJobs: React.FC = () => {
  const assignment: any = useLoaderData();
  // const navigate = useNavigate();

  // Dummy data for delayed jobs
  const delayedJobs = useMemo(() => [
    { id: 1, jobName: 'Job 1', scheduledTime: '2023-01-01 12:00' },
    { id: 2, jobName: 'Job 2', scheduledTime: '2023-02-01 15:30' },
    // ...other delayed jobs
  ], []);

  const columns = useMemo(() => [
    columnHelper.accessor('jobName', {
      header: () => 'Job Name',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('scheduledTime', {
      header: () => 'Scheduled Time',
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

  const handleActionClick = (jobId: number) => {
    console.log(`Action clicked for delayed job ID ${jobId}`);
    // Logic for handling the action goes here
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
          <h1>View Delayed Jobs - {assignment.name}</h1>
        </Col>
        <hr />
      </Row>
      <Row>
        <Col>
          <Table
            data={delayedJobs}
            columns={columns}
            columnVisibility={{
              id: false,

            }}
          />
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

export default ViewDelayedJobs;