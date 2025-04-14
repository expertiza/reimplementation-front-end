import React, { useMemo } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Table from "components/Table/Table";
import { createColumnHelper } from "@tanstack/react-table";
import { useLoaderData } from 'react-router-dom';

interface ITeamSubmission {
  id: number;
  teamName: string;
  teamMembers: { name: string, id: number }[];
  historyLink: string;
}

const columnHelper = createColumnHelper<ITeamSubmission>();

const ViewSubmissions: React.FC = () => {
  const assignment: any = useLoaderData();

  const submissions = useMemo<ITeamSubmission[]>(() => [
    {
      id: 1,
      teamName: 'Hornets',
      teamMembers: [
        { name: 'student9183', id: 9183 },
        { name: 'student9173', id: 9173 }
      ],
      historyLink: '/history/1'
    },
    {
      id: 2,
      teamName: 'rubywolf',
      teamMembers: [
        { name: 'student9180', id: 9180 },
        { name: 'student9164', id: 9164 }
      ],
      historyLink: '/history/2'
    }
  ], []);

  const columns = useMemo(() => [
    columnHelper.accessor('teamName', {
      header: 'Team Name',
      cell: info => (
        <div style={{ color: 'brown', fontWeight: 'bold' }}>
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('teamMembers', {
      header: 'Team Member(s)',
      cell: info => (
        <div>
          {info.getValue().map((member, idx) => (
            <div key={idx}>
              <a href={`/students/${member.id}`} style={{ color: '#b44' }}>
                {member.name}
              </a>
            </div>
          ))}
        </div>
      ),
    }),
    columnHelper.display({
    id: 'links',
    header: 'Links',
    cell: ({ row }) => (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <a
          href={`/assign_grade/${row.original.id}`}
          style={{ color: '#b44', marginBottom: '4px' }}
        >
          Assign Grade
        </a>
        <a
          href={row.original.historyLink}
          style={{ color: '#b44' }}
        >
          History
        </a>
      </div>
    ),
  }),
  ], []);

  return (
    <div className="mt-4">
      <h1 className="text-center">View Submissions - {assignment.name}</h1>

      <hr />

      <Table
        data={submissions}
        columns={columns}
        columnVisibility={{
          id: false,
        }}
      />
    </div>
  );
};

export default ViewSubmissions;
