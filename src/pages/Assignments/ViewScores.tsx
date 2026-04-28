import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Container, Row, Col, Modal, Spinner } from 'react-bootstrap';
import Table from "../../components/Table/Table";
import { createColumnHelper } from "@tanstack/react-table";
import { useLoaderData } from 'react-router-dom';
import { BsDownload, BsGraphUp } from 'react-icons/bs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import GradesExportModal from '../../components/Modals/GradesExportModal';
import axiosClient from '../../utils/axios_client';

interface IGradeRow {
  id: number;
  username: string;
  grade: string;
  comment: string;
  email?: string;
}

const columnHelper = createColumnHelper<IGradeRow>();

const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
};

const parseGradesCsv = (csvText: string): IGradeRow[] => {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length <= 1) return [];

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const row = headers.reduce<Record<string, string>>((acc, header, valueIndex) => {
      acc[header] = values[valueIndex] ?? "";
      return acc;
    }, {});

    return {
      id: index + 1,
      username: row.username || "",
      grade: row.grade || "",
      comment: row.comment || "",
      email: row.email,
    };
  });
};

const ViewScores: React.FC = () => {
  const assignment: any = useLoaderData();
  const [showGraph, setShowGraph] = useState(false);
  const [showGradesExportModal, setShowGradesExportModal] = useState(false);
  const [grades, setGrades] = useState<IGradeRow[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [gradesError, setGradesError] = useState("");

  useEffect(() => {
    if (!assignment?.id) return;

    let ignore = false;
    setIsLoadingGrades(true);
    setGradesError("");

    axiosClient
      .get(`/grades/${assignment.id}/export`, {
        params: { include_email: true },
        responseType: "text",
        headers: { Accept: "text/csv" },
      })
      .then((response) => {
        if (!ignore) setGrades(parseGradesCsv(response.data));
      })
      .catch((error) => {
        if (!ignore) {
          setGrades([]);
          setGradesError(error?.response?.data?.error || error?.message || "Failed to load grades.");
        }
      })
      .finally(() => {
        if (!ignore) setIsLoadingGrades(false);
      });

    return () => {
      ignore = true;
    };
  }, [assignment?.id]);

  const chartData = useMemo(
    () =>
      grades
        .map((row) => ({ student: row.username, score: Number(row.grade) }))
        .filter((row) => Number.isFinite(row.score)),
    [grades]
  );

  const columns = useMemo(() => [
    columnHelper.accessor('username', {
      header: () => 'Username',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('grade', {
      header: () => 'Grade',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('comment', {
      header: () => 'Comment',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('email', {
      header: () => 'Email',
      cell: info => info.getValue() || ""
    }),
  ], []);

  const handleShowGraph = () => setShowGraph(true);
  const handleCloseGraph = () => setShowGraph(false);

  return (
    <Container className="mt-4">
      <Row className="mt-md-2 mb-md-2">
        <Col className="text-center">
          <h1>View Scores - {assignment.name}</h1>
        </Col>
        <hr />
      </Row>
      <Row className="mb-3">
        <Col className="d-flex justify-content-end gap-2">
          <Button
            variant="outline-primary"
            onClick={() => setShowGradesExportModal(true)}
            className="d-flex align-items-center"
          >
            <span className="me-1">Export Grades</span> <BsDownload />
          </Button>
          <Button variant="outline-info" onClick={handleShowGraph} className="d-flex align-items-center">
            <span className="me-1">Graph</span> <BsGraphUp />
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          {gradesError && <Alert variant="danger">{gradesError}</Alert>}
          {isLoadingGrades ? (
            <div className="d-flex justify-content-center align-items-center py-4">
              <Spinner animation="border" role="status" size="sm" className="me-2" />
              Loading grades...
            </div>
          ) : (
            <Table
              data={grades}
              columns={columns}
              columnVisibility={{
                id: false,
              }}
            />
          )}
        </Col>
      </Row>
      <Modal show={showGraph} onHide={handleCloseGraph}>
        <Modal.Header closeButton>
          <Modal.Title>Score Graph</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {chartData.length === 0 ? (
            <Alert variant="info" className="mb-0">
              No numeric grades are available to graph.
            </Alert>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="student" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Modal.Body>
      </Modal>
      <GradesExportModal
        show={showGradesExportModal}
        onHide={() => setShowGradesExportModal(false)}
        assignmentId={assignment?.id}
        assignmentName={assignment?.name}
      />
    </Container>
  );
};

export default ViewScores;
