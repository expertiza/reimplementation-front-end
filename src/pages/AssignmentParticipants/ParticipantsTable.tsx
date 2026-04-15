import { permissionIcon } from "./AssignmentParticipants";
import { AssignmentProperties, Participant } from "./AssignmentParticipantsTypes";
import { classForRole, classForStatus } from "./AssignmentParticipantsUtil";
import "./ParticipantsTable.css";
import { OverlayTrigger, Tooltip, Button } from "react-bootstrap";
import Table from "components/Table/Table";

interface ParticipantTableProps {
  participants: Participant[];
  assignmentProps: AssignmentProperties;
  openEditModal: (participant: Participant) => void;
  openRemoveModal: (participant: Participant) => void;
}

function ParticipantTable({
  participants,
  assignmentProps,
  openEditModal,
  openRemoveModal,
}: ParticipantTableProps) {
  const columns = [
    { accessorKey: "id", header: "ID", enableSorting: true },
    { accessorKey: "name", header: "Name", enableSorting: true },
    { accessorKey: "email", header: "Email address", enableSorting: true },
    {
      accessorKey: "role",
      header: "Role",
      enableSorting: true,
      cell: ({ row }: { row: any }) => (
        <div
          className={classForRole(row.original.role)}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <span>{row.original.role}</span>
        </div>
      ),
    },
    { accessorKey: "parent", header: "Parent", enableSorting: true },
    {
      accessorKey: "permissions.review",
      id: "perm_review",
      header: "Review",
      enableSorting: true,
      cell: ({ row }: { row: any }) => (
        <div className={`permission-column ${classForStatus(row.original.permissions.review)}`}>
          {permissionIcon(row.original.permissions.review)}
        </div>
      ),
    },
    {
      accessorKey: "permissions.submit",
      id: "perm_submit",
      header: "Submit",
      enableSorting: true,
      cell: ({ row }: { row: any }) => (
        <div className={`permission-column ${classForStatus(row.original.permissions.submit)}`}>
          {permissionIcon(row.original.permissions.submit)}
        </div>
      ),
    },
    assignmentProps.hasQuiz && {
      accessorKey: "permissions.takeQuiz",
      id: "perm_quiz",
      header: "Take quiz",
      enableSorting: true,
      cell: ({ row }: { row: any }) => (
        <div className={`permission-column ${classForStatus(row.original.permissions.takeQuiz)}`}>
          {permissionIcon(row.original.permissions.takeQuiz)}
        </div>
      ),
    },
    assignmentProps.hasMentor && {
      accessorKey: "permissions.mentor",
      id: "perm_mentor",
      header: "Mentor",
      enableSorting: true,
      cell: ({ row }: { row: any }) => (
        <div className={`permission-column ${classForStatus(row.original.permissions.mentor)}`}>
          {permissionIcon(row.original.permissions.mentor)}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }: { row: any }) => (
        <div className="actions-column d-flex gap-2">
          <OverlayTrigger overlay={<Tooltip>Edit participant</Tooltip>} placement="top">
            <Button
              onClick={() => openEditModal(row.original)}
              className="bg-transparent border-0 p-0"
              style={{ cursor: "pointer" }}
              aria-label="Edit participant"
            >
              <img src="/assets/icons/edit-icon-24.png" alt="Edit" width={20} height={20} />
            </Button>
          </OverlayTrigger>

          <OverlayTrigger overlay={<Tooltip>Delete participant</Tooltip>} placement="top">
            <Button
              onClick={() => openRemoveModal(row.original)}
              className="bg-transparent border-0 p-0"
              style={{ cursor: "pointer" }}
              aria-label="Delete participant"
            >
              <img src="/assets/icons/delete-icon-24.png" alt="Delete" width={20} height={20} />
            </Button>
          </OverlayTrigger>
        </div>
      ),
    },
  ].filter(Boolean) as any;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ width: "100%", overflowX: "auto" }}>
        <div style={{ minWidth: "1200px", fontSize: "15px", lineHeight: "1.428em" }}>
          <Table
            data={participants}
            columns={columns}
            disableGlobalFilter
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
