import { createColumnHelper } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { Button, Card, Form } from "react-bootstrap";
import Table from "../../components/Table/Table";
import { prettyName } from "./participantHelpers";
import { ALL_ROLES, Participant } from "./participantTypes";

interface ParticipantTableProps {
  participants: Participant[];
  isLoading: boolean;
  requireQuiz: boolean;
  onRoleChange: (id: number, newRoleId: number) => void;
  onRemoveClick: (participant: Participant) => void;
}

const columnHelper = createColumnHelper<Participant>();
const participantColumns = (
  handleRoleChange: (userId: number, newId: number) => void,
  handleDelete: (participant: Participant) => void
) => [
  columnHelper.accessor("parent.name", {
    header: "Parent",
    enableColumnFilter: false,
    enableSorting: false,
  }),

  columnHelper.accessor("name", {
    header: "UserName",
    enableColumnFilter: false,
    enableSorting: true,
  }),

  columnHelper.display({
    id: "full_name_handle",
    header: "Name",
    cell: ({ row: { original } }) => (
      <td style={{ verticalAlign: "middle" }}>
        <div>
          <div>{prettyName(original.full_name ?? "")}</div>
          {original.handle && (
            <div
              style={{
                color: "#727d8c",
                fontSize: "0.88rem",
                marginTop: "0.12rem",
              }}
            >
              @{original.handle}
            </div>
          )}
        </div>
      </td>
    ),
  }),

  columnHelper.accessor("email", {
    header: "Email",
    enableColumnFilter: false,
  }),

  columnHelper.display({
    id: "can_take_quiz",
    header: "Quiz",
    cell: ({ row }) => <BlankOrCheck value={row.original.can_take_quiz ?? false} />,
  }),

  columnHelper.display({
    id: "can_review",
    header: "Review",
    cell: ({ row }) => <BlankOrCheck value={row.original.can_review ?? false} />,
  }),

  columnHelper.display({
    id: "can_submit",
    header: "Submit",
    cell: ({ row }) => <BlankOrCheck value={row.original.can_submit ?? false} />,
  }),

  columnHelper.display({
    id: "role",
    header: "Role",
    cell: ({ row }) => (
      <Form.Select
        size="sm"
        aria-label="Participant Role"
        value={row.original.role?.id}
        onChange={(e) => handleRoleChange(row.original.id, parseInt(e.target.value, 10))}
        style={{
          fontSize: "0.8125rem",
          padding: "0.5rem 0.75rem",
          cursor: "pointer",
          border: "1px solid #d1d5db",
          borderRadius: "0.5rem",
          fontWeight: 500,
          color: "#374151",
          maxWidth: "110px",
          backgroundColor: "#ffffff",
        }}
      >
        {ALL_ROLES.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </Form.Select>
    ),
  }),

  columnHelper.display({
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="d-flex justify-content-center align-items-center">
        <Button
          className="btn btn-md"
          title="Remove participant"
          onClick={() => handleDelete(row.original)}
          style={{
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            outline: "none",
            backgroundColor: "transparent",
          }}
        >
          <img src="/assets/images/delete-icon-24.png" alt="Delete" width={14} height={14} />
        </Button>
      </div>
    ),
  }),
];

const BlankOrCheck: React.FC<{ value: boolean }> = ({ value }) => {
  return value ? (
    <div className="d-flex justify-content-center align-items-center p-2">
      <img src="/assets/icons/Check-icon.png" alt="Yes" width={16} height={16} />
    </div>
  ) : (
    <span></span>
  );
};

const ParticipantTable: React.FC<ParticipantTableProps> = ({
  participants,
  isLoading,
  requireQuiz,
  onRoleChange,
  onRemoveClick,
}) => {
  const tableColumns = useMemo(() => participantColumns(onRoleChange, onRemoveClick), []);

  if (isLoading) {
    return (
      <Card
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "0.75rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "#718096" }}>Loading participants...</p>
        </div>
      </Card>
    );
  }

  return <Table columns={tableColumns} data={participants} disableGlobalFilter />;
};

export default ParticipantTable;
