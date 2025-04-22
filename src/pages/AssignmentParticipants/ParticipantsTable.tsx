import { permissionIcon } from "./AssignmentParticipants";
import { AssignmentProperties, Participant } from "./AssignmentParticipantsTypes";
import { classForRole, classForStatus, iconForRole } from "./AssignmentParticipantsUtil";
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import './ParticipantsTable.css';
import { OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import Table from 'components/Table/Table';

interface ParticipantTableProps {
  participants: Participant[];
  onSort: (key: string) => void;
  assignmentProps: AssignmentProperties;
  openEditModal: (participant: Participant) => void;
  openRemoveModal: (participant: Participant) => void;
  numColumns: number;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
}

function ParticipantTable({
  participants,
  onSort,
  assignmentProps,
  openEditModal,
  openRemoveModal,
  numColumns,
  sortConfig,
}: ParticipantTableProps) {
  const sortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FaSort />;
    }
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  {/* Changed the table and icons according to the design standards */}
  const columns = [
    { accessorKey: 'id', header: () => <>ID {sortIcon('id')}</> },
    { accessorKey: 'name', header: () => <>Name {sortIcon('name')}</> },
    { accessorKey: 'email', header: () => <>Email address {sortIcon('email')}</> },
    {
      accessorKey: 'role',
      header: () => <>Role {sortIcon('role')}</>,
      cell: ({ row }: { row: any }) => (
        <div className={classForRole(row.original.role)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          {iconForRole(row.original.role)}
          <span>{row.original.role}</span>
        </div>
      ),
    },
    { accessorKey: 'parent', header: () => <>Parent {sortIcon('parent')}</> },
    {
      accessorKey: 'permissions.review',
      header: () => <>Review {sortIcon('permissions.review')}</>,
      cell: ({ row }: { row: any }) => (
        <div className={`permission-column ${classForStatus(row.original.permissions.review)}`}>
          {permissionIcon(row.original.permissions.review)}
        </div>
      ),
    },
    {
      accessorKey: 'permissions.submit',
      header: () => <>Submit {sortIcon('permissions.submit')}</>,
      cell: ({ row }: { row: any }) => (
        <div className={`permission-column ${classForStatus(row.original.permissions.submit)}`}>
          {permissionIcon(row.original.permissions.submit)}
        </div>
      ),
    },
    assignmentProps.hasQuiz && {
      accessorKey: 'permissions.takeQuiz',
      header: () => <>Take quiz {sortIcon('permissions.takeQuiz')}</>,
      cell: ({ row }: { row: any }) => (
        <div className={`permission-column ${classForStatus(row.original.permissions.takeQuiz)}`}>
          {permissionIcon(row.original.permissions.takeQuiz)}
        </div>
      ),
    },
    assignmentProps.hasMentor && {
      accessorKey: 'permissions.mentor',
      header: () => <>Mentor {sortIcon('permissions.mentor')}</>,
      cell: ({ row }: { row: any }) => (
        <div className={`permission-column ${classForStatus(row.original.permissions.mentor)}`}>
          {permissionIcon(row.original.permissions.mentor)}
        </div>
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => (
        <div className="actions-column d-flex gap-2">
          <OverlayTrigger overlay={<Tooltip>Edit participant</Tooltip>} placement="top">
            <Button
              onClick={() => openEditModal(row.original)}
              className="bg-transparent border-0 p-0"
              style={{ cursor: 'pointer' }}
              aria-label="Edit Participant"
            >
              <img
                src={`${process.env.PUBLIC_URL}/assets/images/edit-icon-24.png`}
                alt="Edit"
                width="20"
                height="20"
              />
            </Button>
          </OverlayTrigger>
  
          <OverlayTrigger overlay={<Tooltip>Delete participant</Tooltip>} placement="top">
            <Button
              onClick={() => openRemoveModal(row.original)}
              className="bg-transparent border-0 p-0"
              style={{ cursor: 'pointer' }}
              aria-label="Delete Participant"
            >
              <img
                src={`${process.env.PUBLIC_URL}/assets/images/delete-icon-24.png`}
                alt="Delete"
                width="20"
                height="20"
              />
            </Button>
          </OverlayTrigger>
        </div>
      ),
    },
  ].filter(Boolean) as any;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <div style={{ minWidth: '1200px', fontSize: '15px', lineHeight: '1.428em' }}>
          <Table
            data={participants}
            columns={columns}
            showGlobalFilter={false}
            showColumnFilter={false}
            showPagination={participants.length >= 10}
          />
        </div>
      </div>
    </div>
  );
}

export default ParticipantTable;
