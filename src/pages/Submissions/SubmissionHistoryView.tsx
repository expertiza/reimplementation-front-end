import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

interface HistoryEntry {
  teamId: number;
  operation: string;
  user: string;
  content: string;
  created: string;
}

const SubmissionHistoryView = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Does nothing at the moment but a real implementation would likely
  // retrieve submission history data via the submission ID
  const { submissionId } = useParams();
  
  const columnHelper = createColumnHelper<HistoryEntry>();

  const columns = [
    columnHelper.accessor('teamId', {
      header: 'Team Id',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('operation', {
      header: 'Operation',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('user', {
      header: 'User',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('content', {
      header: 'Content',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('created', {
      header: 'Created',
      cell: info => info.getValue(),
    }),
  ];

  // Load data, dummy data for now
  useEffect(() => {
    const dummyData: HistoryEntry[] = [
      {
        teamId: 12345,
        operation: 'Submit Hyperlink',
        user: 'Test_User',
        content: 'https://github.ncsu.edu/masonhorne/reimplementation-front-end',
        created: '2024-09-17 22:38:09'
      },
      {
        teamId: 12345,
        operation: 'Submit Hyperlink',
        user: 'Test_User',
        content: 'http://152.7.176.240:8080/',
        created: '2024-09-27 18:32:10'
      },
      {
        teamId: 12345,
        operation: 'Submit File',
        user: 'Test_User',
        content: 'README.md',
        created: '2024-09-29 17:52:24'
      },
      {
        teamId: 12345,
        operation: 'Remove File',
        user: 'Test_User',
        content: 'README.md',
        created: '2024-10-03 23:36:03'
      },
      {
        teamId: 12345,
        operation: 'Submit File',
        user: 'Test_User',
        content: 'README_4_.md',
        created: '2024-10-03 23:36:57'
      }
    ];
    setHistory(dummyData);
  }, [submissionId]);

  const table = useReactTable({
    data: history,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Container className="mt-4">
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th colSpan={5} style={{ border: 'none' }}>
                <h2>Submission History</h2>
              </th>
            </tr>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
};

export default SubmissionHistoryView;