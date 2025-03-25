import {
  createColumnHelper,
  useReactTable,
  flexRender,
  getCoreRowModel,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Table from '../../components/Table/Table';

interface HistoryEntry {
  teamId: number;
  operation: string;
  user: string;
  content: string;
  created: string;
}

const SubmissionHistoryView = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Fetch submissionId from URL params (if applicable)
  const { submissionId } = useParams();

  const columnHelper = createColumnHelper<HistoryEntry>();

  const columns = [
    columnHelper.accessor('teamId', {
      header: 'Team Id',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('operation', {
      header: 'Operation',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('user', {
      header: 'User',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('content', {
      header: 'Content',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('created', {
      header: 'Created',
      cell: (info) => info.getValue(),
    }),
  ];

  // Dummy data for now
  useEffect(() => {
    const dummyData: HistoryEntry[] = [
      {
        teamId: 12345,
        operation: 'Submit Hyperlink',
        user: 'Test_User',
        content: 'xyz',
        created: '2024-09-17 22:38:09',
      },
      {
        teamId: 12345,
        operation: 'Submit Hyperlink',
        user: 'Test_User',
        content: 'xyzgh',
        created: '2024-09-27 18:32:10',
      },
      {
        teamId: 12345,
        operation: 'Submit File',
        user: 'Test_User',
        content: 'README.md',
        created: '2024-09-29 17:52:24',
      },
      {
        teamId: 12345,
        operation: 'Remove File',
        user: 'Test_User',
        content: 'README.md',
        created: '2024-10-03 23:36:03',
      },
      {
        teamId: 12345,
        operation: 'Submit File',
        user: 'Test_User',
        content: 'README_4_.md',
        created: '2024-10-03 23:36:57',
      },
    ];
    setHistory(dummyData);
  }, [submissionId]);

  const table = useReactTable({
    data: history,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-4" style={{ fontSize: "15px", lineHeight: "1.428em" }}>
      <Table
        data={history}
        columns={columns}
        showGlobalFilter={false}
        showColumnFilter={false}
        disableGlobalFilter={true}
      />
    </div>
  );
};

export default SubmissionHistoryView;