import { createColumnHelper } from "@tanstack/react-table";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

interface ISubmissionEntry {
  id: number;
  teamName: string;
  assignment: string;
  members: { name: string; id: number }[];
  links: { url: string; displayName: string }[];
  fileInfo: { name: string; size: string; dateModified: string }[];
}

const columnHelper = createColumnHelper<ISubmissionEntry>();

const SubmissionEntry = ({ onGradeClick }: { onGradeClick: (id: number) => void }) => {
  const columns = [
    // Team Name column: Sorting enabled, search disabled
    columnHelper.accessor('teamName', {
      header: ({ column }) => (
        <div
          onClick={column.getToggleSortingHandler()} // Toggle sorting on click
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          Team Name
          {
            !column.getIsSorted() && <span> ⬍</span>
          }
        </div>
      ),
      cell: (info) => (
        <>
          <div>{info.getValue()}</div>
          <Button variant="link" onClick={() => onGradeClick(info.row.original.id)}>
            Assign Grade
          </Button>
        </>
      ),
      size: 25,
      enableSorting: true,
      enableColumnFilter: false, 
      enableGlobalFilter: false,
    }),

    // Team Members column: No search, no sorting
    columnHelper.accessor('members', {
      header: () => 'Team Members',
      cell: (info) =>
        info.getValue().map((member) => (
          <div key={member.id}>
            {/* This can be used to link to the users profile once the profile component exists */}
            {/* <Link to={`/profile/${member.id}`}> */}
              {member.name} (Student {member.id})
            {/* </Link> */}
          </div>
        )),
      size: 35,
      enableSorting: false,
      enableColumnFilter: false, 
      enableGlobalFilter: false, 
    }),
    // Links and File Info column: No search, no sorting
    columnHelper.accessor(row => ({ links: row.links, fileInfo: row.fileInfo }), {
      id: 'links',
      header: () => 'Links',
      cell: (info) => (
      <div>
        {info.getValue().links.map((link, idx) => (
          <div key={idx}>
            <a href={link.url}>{link.displayName}</a>
          </div>
        ))}
        <br/>
        <div>
          <div style={{ display: 'flex', fontWeight: 'bold' }}>
            <div style={{ width: '33%' }}>Name</div>
            <div style={{ width: '33%' }}>Size</div>
            <div style={{ width: '33%' }}>Date Modified</div>
          </div>
          {info.getValue().fileInfo.map((file, idx) => (
            <div key={idx} style={{ display: 'flex' }}>
              <div style={{ width: '33%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
              <div style={{ width: '33%' }}>{file.size}</div>
              <div style={{ width: '33%' }}>{file.dateModified}</div>
            </div>
          ))}
        </div>
      </div>
      ),
      size: 40,
      enableSorting: false,
      enableColumnFilter: false,
      enableGlobalFilter: false,
    }),
    // History column: Links to history pages (No search or sorting)
    columnHelper.display({
      id: 'history',
      header: () => 'History',
      cell: (info) => (
        <Link to={`/submissions/history/${info.row.original.id}`}>History</Link>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      enableGlobalFilter: false,
    }),
  ];

  return columns;
};

export default SubmissionEntry;
