import React, { useMemo } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Table from "components/Table/Table";
import { createColumnHelper } from "@tanstack/react-table";
import { useLoaderData, useNavigate } from 'react-router-dom';


interface ISubmissionMember {
  id: number;
  github: string;
  full_name: string;
}

interface ISubmissionLink {
  url: string;
  displayName: string;
  name?: string;
  size?: string;
  type?: string;
  modified?: string;
}

interface ISubmission {
  id: number;
  teamName: string;
  assignment: string;
  members: ISubmissionMember[];
  links: ISubmissionLink[];
  fileInfo: Array<{ name: string; size: string; type?: string; modified?: string }>;
}

const columnHelper = createColumnHelper<ISubmission>();

const formatDate = (d: Date) => d.toLocaleString();

const ViewSubmissions: React.FC = () => {
  const assignment: any = useLoaderData();
  const navigate = useNavigate();

  // Create mock submissions (based on wiki example)
  const submissions = useMemo(() => {
    const baseDate = new Date(Date.parse('2021-12-01T00:12:00Z'));
    return Array.from({ length: 23 }, (_, i) => {
      const id = i + 1;
      const teamNumber = 38121 + i;
      const assignmentNumber = (i % 5) + 1;
      const studentCount = (i % 3) + 1;
      const currentDate = new Date(new Date(baseDate).setDate(baseDate.getDate() + i));

      const members = Array.from({ length: studentCount }, (_, j) => ({
        full_name: `Student ${10000 + i * 10 + j}`,
        github: `gh_user_${10000 + i * 10 + j}`,
        id: 10000 + i * 10 + j,
      }));

      const links = [
        { url: `https://github.com/example/repo${id}`, displayName: "GitHub Repository", name: `repo${id}`, size: '—', type: 'link', modified: formatDate(currentDate) },
        { url: `http://example.com/submission${id}`, displayName: "Submission Link", name: `submission${id}`, size: `${(Math.random() * 15 + 1).toFixed(1)} KB`, type: 'link', modified: formatDate(currentDate) },
      ];

      const fileInfo = [
        {
          name: `README.md`,
          size: `${(Math.random() * 15 + 10).toFixed(1)} KB`,
          type: 'file',
          modified: formatDate(currentDate),
        },
      ];

      return {
        id,
        teamName: `Anonymized_Team_${teamNumber}`,
        assignment: `Assignment ${assignmentNumber}`,
        members,
        links,
        fileInfo,
      } as ISubmission;
    });
  }, []);

  const columns = useMemo(() => [
    // Team Name column: team name + View Reviews / Assign grade
    columnHelper.accessor('teamName', {
      header: () => 'Team Name',
      cell: info => {
        const team = info.getValue() as string;
        const row = info.row.original as ISubmission;
        // Check assignment deadline: prefer assignment.due_date or assignment.deadline
        const assignmentData: any = assignment || {};
        const deadlineStr = assignmentData.due_date || assignmentData.deadline || assignmentData.close_date;
        let past = false;
        if (deadlineStr) {
          const d = new Date(deadlineStr);
          past = !isNaN(d.getTime()) && d.getTime() < Date.now();
        }
        return (
          <div>
            <div>{team}</div>
            <div>
              <a href="#" onClick={(e) => { e.preventDefault(); console.log('View Reviews for', row.id); }}>
                {past ? 'Assign grade' : 'View Reviews'}
              </a>
            </div>
          </div>
        );
      }
    }),

    // Team Members: each on its own line with github (Full Name)
    columnHelper.accessor(row => row.members, {
      id: 'members',
      header: () => 'Team Member(s)',
      cell: info => (
        <div>
          {info.getValue().map((m: ISubmissionMember, idx: number) => (
            <div key={idx}>{m.github} ({m.full_name})</div>
          ))}
        </div>
      )
    }),

    // Links column: render sub-rows with Name, Size, Type, Modified
    columnHelper.accessor(row => ({ links: row.links, files: row.fileInfo }), {
      id: 'links',
      header: () => 'Links',
      cell: info => {
        const val = info.getValue() as { links: ISubmissionLink[]; files: any[] };
        const rows: Array<{ name: any; size: any; type: any; modified: any; url?: string }> = [
          // map links first
          ...val.links.map((l: any) => ({ name: l.name || l.displayName, size: l.size || '—', type: l.type || 'link', modified: l.modified || '—', url: l.url })),
          // then files
          ...val.files.map((f: any) => ({ name: f.name, size: f.size, type: f.type || 'file', modified: f.modified || '—', url: undefined })),
        ];
        return (
          <div>
            <table className="table table-sm mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Size</th>
                  <th>Type</th>
                  <th>Modified</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.url ? <a href={r.url} target="_blank" rel="noreferrer">{r.name}</a> : r.name}</td>
                    <td>{r.size}</td>
                    <td>{r.type}</td>
                    <td>{r.modified}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }),

    // History column: link labeled 'History'
    columnHelper.display({
      id: 'history',
      header: () => 'History',
      cell: ({ row }) => (
        <button className="btn btn-link p-0" onClick={() => navigate(`/submissions/history/${row.original.id}`)}>History</button>
      )
    }),
  ], [assignment, navigate]);

  return (
    <Container fluid className="mt-4">
      <Row className="mt-md-2 mb-md-2">
        <Col xs={12} className="text-center">
          <h1>View Submissions - {assignment?.name || 'Assignment'}</h1>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <hr />
        </Col>
      </Row>

      <Row>
        <Col xs={12} md={{ span: 8, offset: 2 }}>
          <Table
            data={submissions}
            columns={columns}
            columnVisibility={{
              id: false,
            }}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ViewSubmissions;