import { createColumnHelper, Row } from "@tanstack/react-table";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Badge } from "react-bootstrap";

export interface IDuty {
  id: number;
  name: string;
  private: boolean;
  instructor_id: number;
  created_at?: string;     // from backend
  created_by?: string;     // injected on the client
  created_at_fmt?: string; // injected on the client (formatted date)
}

type Fn = (row: Row<IDuty>) => void;

const columnHelper = createColumnHelper<IDuty>();

export const dutyColumns = (
  onEdit: Fn,
  onDelete: Fn,
  onRubrics: Fn,
  currentUserId: number
) => [
  columnHelper.accessor("name", {
    id: "name",
    header: () => <span className="text-start fw-bold" style={{ color: "#000", fontSize: "1.17em" }}>Role (Duty)</span>,
    cell: (info) => (
      <div className="text-start py-2">
        <span style={{ color: "#000" }}>{info.getValue()}</span>
      </div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    enableGlobalFilter: true,
  }),

  // Created By
columnHelper.accessor("created_by", {
  id: "created_by",
  header: () => (
    <span className="text-start fw-bold" style={{ color: "#000", fontSize: "1.17em" }}>
      Created By
    </span>
  ),
  cell: ({ row }) => (
    <div className="text-start py-2">
      {row.original.created_by ? (
        <span>{row.original.created_by}</span>
      ) : (
        <Badge bg="secondary">Unknown</Badge>
      )}
    </div>
  ),
  enableSorting: true,
  enableColumnFilter: true,
  enableGlobalFilter: true,
}),

// Created Date
columnHelper.accessor("created_at_fmt", {
  id: "created_at",
  header: () => (
    <span className="text-start fw-bold" style={{ color: "#000", fontSize: "1.17em" }}>
      Created Date
    </span>
  ),
  cell: ({ row }) => (
    <div className="text-start py-2">
      {row.original.created_at_fmt ? (
        <span>{row.original.created_at_fmt}</span>
      ) : (
        <Badge bg="secondary">N/A</Badge>
      )}
    </div>
  ),
  enableSorting: true,
  enableColumnFilter: true,
  enableGlobalFilter: true,
}),

  columnHelper.display({
    id: "actions",
    header: () => <span className="text-start fw-bold" style={{ color: "#000", fontSize: "1.17em" }}>Actions</span>,
    cell: ({ row }) => {
      const isOwner = row.original.instructor_id === currentUserId;
      return (
        <div className="d-flex justify-content-start gap-2 py-2">
          <OverlayTrigger overlay={<Tooltip>Edit Role</Tooltip>}>
            <span>
              <Button
                variant="link"
                onClick={() => onEdit(row)}
                aria-label="Edit Role"
                className="p-0"
                disabled={!isOwner}
              >
                <img
                  src={process.env.PUBLIC_URL + "/assets/images/edit-icon-24.png"}
                  alt="Edit"
                  style={{ width: 25, height: 20, opacity: isOwner ? 1 : 0.4 }}
                />
              </Button>
            </span>
          </OverlayTrigger>

          <OverlayTrigger overlay={<Tooltip>Delete Role</Tooltip>}>
            <span>
              <Button
                variant="link"
                onClick={() => onDelete(row)}
                aria-label="Delete Role"
                className="p-0"
                disabled={!isOwner}
              >
                <img
                  src={process.env.PUBLIC_URL + "/assets/images/delete-icon-24.png"}
                  alt="Delete"
                  style={{ width: 25, height: 20, opacity: isOwner ? 1 : 0.4 }}
                />
              </Button>
            </span>
          </OverlayTrigger>

          {/* Rubrics button (placeholder hook-up for now) */}
          <OverlayTrigger overlay={<Tooltip>Rubrics</Tooltip>}>
            <span>
              <Button
                variant="link"
                onClick={() => onRubrics(row)}
                aria-label="Rubrics"
                className="p-0"
                disabled={!isOwner}
              >
                <img
                  src={"/assets/images/Copy-icon-24.png"}
                  alt="Rubrics"
                  style={{ width: 35, height: 25, opacity: isOwner ? 1 : 0.4 }}
                />
              </Button>
            </span>
          </OverlayTrigger>
        </div>
      );
    },
  }),
];
