import React, { useMemo } from 'react';
import { createColumnHelper } from "@tanstack/react-table";
import Table from "components/Table/Table";
import { useLoaderData } from 'react-router-dom';
import { ITeamRow, TeamSubmission } from './AssignmentUtil';

// Column helper to define typed table columns
const columnHelper = createColumnHelper<ITeamRow>();

const ViewSubmissions: React.FC = () => {
  // Fetch data loaded from route loader (assignment teams)
  const assignment = useLoaderData() as TeamSubmission[];

  // Transform the backend response to a table-friendly structure
  const submissions = useMemo<ITeamRow[]>(() =>
    assignment.map((team) => ({
      id: team.id,
      teamName: team.name,
      teamMembers: team.members,
      historyLink: `/history/${team.team_id}`,
    }))
  , [assignment]);

  // Define the columns used in the table
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
          {info.getValue().map((member) => (
            <div key={member.id}>
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
