import React, { useMemo } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Table from 'components/Table/Table';
import { createColumnHelper } from '@tanstack/react-table';
import { useParams } from 'react-router-dom';

interface IHistoryRecord {
  id: number;
  fileName: string;
  size: string;
  date: string;
}

const columnHelper = createColumnHelper<IHistoryRecord>();

const SubmissionHistoryView: React.FC = () => {
  const { id } = useParams();

  const records = useMemo(() => {
    // generate mock history data
    return Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      fileName: `file_${id}_${i + 1}.txt`,
      size: `${(Math.random() * 10 + 1).toFixed(1)} KB`,
      date: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toLocaleString(),
    }));
  }, [id]);

  const columns = useMemo(() => [
    columnHelper.accessor('fileName', { header: () => 'File', cell: info => info.getValue() }),
    columnHelper.accessor('size', { header: () => 'Size', cell: info => info.getValue() }),
    columnHelper.accessor('date', { header: () => 'Date', cell: info => info.getValue() }),
  ], []);

  return (
    <Container className="mt-4">
      <Row>
        <Col className="text-center">
          <h1>Submission History - ID {id}</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table data={records} columns={columns} columnVisibility={{ id: false }} />
        </Col>
      </Row>
    </Container>
  );
};

export default SubmissionHistoryView;