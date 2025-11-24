import React, { useMemo, useState } from 'react';
import { Button, Container, Row, Col, Modal } from 'react-bootstrap';
import Table from "../../components/Table/Table";
import { createColumnHelper } from "@tanstack/react-table";
import { useLoaderData } from 'react-router-dom';
import { BsGraphUp } from 'react-icons/bs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface IScore {
  id: number;
  student: string;
  score: number;
}

const columnHelper = createColumnHelper<IScore>();

const ViewScores: React.FC = () => {
  const assignment: any = useLoaderData();
  const [showGraph, setShowGraph] = useState(false);

  const scores = useMemo(() => [
    { id: 1, student: 'Team 1', score: 85 },
    { id: 2, student: 'Team 2', score: 90 },
    { id: 3, student: 'Team 3', score: 88 },
    { id: 4, student: 'Team 4', score: 92 },
    { id: 5, student: 'Team 5', score: 87 },
    { id: 6, student: 'Team 6', score: 94 },
    { id: 7, student: 'Team 7', score: 89 },
    { id: 8, student: 'Team 8', score: 91 },
    { id: 9, student: 'Team 9', score: 86 },
    { id: 10, student: 'Team 10', score: 93 },
    { id: 11, student: 'Team 11', score: 90 },
    { id: 12, student: 'Team 12', score: 92 },
    { id: 13, student: 'Team 13', score: 85 },
    { id: 14, student: 'Team 14', score: 88 },
    { id: 15, student: 'Team 15', score: 94 },
    { id: 16, student: 'Team 16', score: 87 },
    { id: 17, student: 'Team 17', score: 89 },
    { id: 18, student: 'Team 18', score: 91 },
    { id: 19, student: 'Team 19', score: 86 },
    { id: 20, student: 'Team 20', score: 93 },
    // ...other scores
  ], []);

  const columns = useMemo(() => [
    columnHelper.accessor('student', {
      header: () => 'Team',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('score', {
      header: () => 'Score',
      cell: info => info.getValue()
    }),
    columnHelper.display({
      id: 'actions',
      header: () => 'Actions',
      cell: ({ row }) => (
        <Button variant="outline-danger" size="sm" onClick={() => console.log(`Action clicked for score ID ${row.original.id}`)}>
          Action
        </Button>
      )
    })
  ], []);

  const handleShowGraph = () => setShowGraph(true);
  const handleCloseGraph = () => setShowGraph(false);

  return (
    <Container className="mt-4">
      <div style={{ color: '#31708f', backgroundColor: '#d9edf7', padding: '10px', borderRadius: '5px', border: '1px solid #bce8f1', marginBottom: '20px' }}>
        This is a placeholder page and is still in progress.
      </div>
      <Row className="mt-md-2 mb-md-2">
        <Col className="text-center">
          <h1>View Scores - {assignment.name}</h1>
        </Col>
        <hr />
      </Row>
      <Row>
        <Col md={{ span: 1, offset: 11 }}>
          <Button variant="outline-info" onClick={handleShowGraph} className="d-flex align-items-center">
            <span className="me-1">Graph</span> <BsGraphUp />
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table
            data={scores}
            columns={columns}
            columnVisibility={{
              id: false,
            }}
          />
        </Col>
      </Row>
      <Modal show={showGraph} onHide={handleCloseGraph}>
        <Modal.Header closeButton>
          <Modal.Title>Score Graph</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scores} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="student" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ViewScores;