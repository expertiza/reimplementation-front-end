import React, { useMemo } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Table from 'components/Table/Table';
import { createColumnHelper } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';

const columnHelper = createColumnHelper<any>();

const SubmissionsView: React.FC = () => {
  const navigate = useNavigate();
  const submissions = useMemo(() => {
    if (process.env.NODE_ENV === 'development') {
      const mock = require('../../utils/mockStorage').default;
      return mock.getAllSubmissions();
    }
    return [];
  }, []);

  const columns = useMemo(() => [
    columnHelper.accessor('teamName', { header: () => 'Team', cell: info => info.getValue() }),
    columnHelper.accessor('assignment', { header: () => 'Assignment', cell: info => info.getValue() }),
    columnHelper.accessor(row => row.members, { id: 'members', header: () => 'Members', cell: info => info.getValue().map((m: any) => m.name).join(', ') }),
    columnHelper.display({ id: 'actions', header: () => 'Actions', cell: ({ row }) => (
      <div className="d-flex gap-2">
        <button className="btn btn-outline-primary btn-sm" onClick={() => navigate(`/submissions/history/${row.original.id}`)}>History</button>
      </div>
    ) }),
  ], [navigate]);

  return (
    <Container className="mt-4">
      <Row>
        <Col className="text-center"><h1>Submissions</h1></Col>
      </Row>
      <Row>
        <Col>
          <Table data={ submissions } columns={columns} columnVisibility={{ id: false }} />
        </Col>
      </Row>
    </Container>
  );
};

export default SubmissionsView;
