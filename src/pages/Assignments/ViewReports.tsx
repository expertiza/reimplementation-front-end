import React, { useMemo } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
// import { useNavigate } from 'react-router-dom';
import Table from "../../components/Table/Table";
import { createColumnHelper } from "@tanstack/react-table";
import { useLoaderData } from 'react-router-dom';

interface IReport {
  id: number;
  title: string;
  date: string;
}

const columnHelper = createColumnHelper<IReport>();

const ViewReports: React.FC = () => {
  const assignment: any = useLoaderData();
  // const navigate = useNavigate();

  // Dummy data for reports
  const reports = useMemo(() => [
    { id: 1, title: 'Report 1', date: '2023-01-01' },
    { id: 2, title: 'Report 2', date: '2023-02-01' },
    // ...other reports
  ], []);

  const columns = useMemo(() => [
    columnHelper.accessor('title', {
      header: () => 'Title',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('date', {
      header: () => 'Date',
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

  const handleActionClick = (reportId: number) => {
    console.log(`Action clicked for report ID ${reportId}`);
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
          <h1>View Reports - {assignment.name}</h1>
        </Col>
        <hr />
      </Row>
      <Row>
        <Col>
          <Table
            data={reports}
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

export default ViewReports;