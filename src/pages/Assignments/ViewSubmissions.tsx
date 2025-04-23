import React, { useMemo } from 'react';
import { createColumnHelper } from "@tanstack/react-table";
import Table from "components/Table/Table";
import { useLoaderData, useParams } from 'react-router-dom';
import { ITeamRow, TeamSubmission } from './AssignmentUtil';
import { Link } from 'react-router-dom';

// Column helper to define typed table columns
const columnHelper = createColumnHelper<ITeamRow>();

const ViewSubmissions: React.FC = () => {
  // Fetch data loaded from route loader (assignment teams)

  const { id } = useParams(); // assignment ID

  const assignment = useLoaderData() as TeamSubmission[];

  // Transform the backend response to a table-friendly structure
  const submissions = useMemo<ITeamRow[]>(() =>
    assignment.map((team) => ({
      id: id ? parseInt(id, 10) : team.id, // ensure id is a number
      team_id: team.team_id,
      topicName: team.topic,
      teamName: team.name,
      teamMembers: team.members,
      historyLink: `/history/${team.team_id}`,
      submissionLinks: team.links
      || [] // Add submission links
    }))
    , [assignment]);

  // Define the columns used in the table
  const columns = useMemo(() => [
    columnHelper.accessor('topicName', {
      header: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          Topic Name
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '10px', marginLeft: '2px' }}>
            ▲
            ▼
          </div>
        </div>
      ),
      cell: info => <span>{info.getValue()}</span>,
    }),
    columnHelper.accessor('teamName', {
      header: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          Team Name
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '10px', marginLeft: '2px' }}>
            ▲
            ▼
          </div>
        </div>
      ),
      cell: info => (
        <div style={{ color: '#3399ff', fontWeight: 'normal' }}>
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('teamMembers', {
      header: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          Team Member(s)
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '10px', marginLeft: '2px' }}>
            ▲
            ▼
          </div>
        </div>
      ),
      cell: info => (
        <div>
          {info.getValue().map((member) => (
            <div key={member.id}>
              <a href={`/students/${member.id}`} style={{ color: '#a67c52', textDecoration: 'none' }}>
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
          {/* Render Submission Links */}
          {row.original.submissionLinks.map((link: string, index: number) => (
            <a key={index} href={link} target="_blank" rel="noopener noreferrer" style={{ color: '#a67c52', marginBottom: '4px' }}>
              {link}
            </a>
          ))}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'Grades',
      header: 'Action',
      cell: ({ row }) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Link
            to={`/assignments/edit/${row.original.id}/teams/${row.original.team_id}/assign_grade`}
            state={{ teamName: row.original.teamName,
                     topicName: row.original.topicName,
                     teamMembers : row.original.teamMembers,
             }}
            style={{ color: '#a67c52', marginBottom: '4px' }}
          >
            Assign Grade
          </Link>
          <a href={row.original.historyLink} style={{ color: '#a67c52' }}>
            History
          </a>
        </div>
      ),
    }),
  ], []);
  

  return (
    <div className="mt-4">
      <h1 className="text-center">
        View Submissions - {assignment[0]?.topic || 'Assignment'}
      </h1>

      <hr />

      {/* Render dynamic table of submissions */}
      <Table
        data={submissions}
        columns={columns}
        columnVisibility={{
          id: false, // Hide the 'id' column from UI
        }}
      />
    </div>
  );
};

export default ViewSubmissions;
