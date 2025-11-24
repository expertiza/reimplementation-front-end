import { createColumnHelper, Row } from "@tanstack/react-table";
import { Button, Tooltip, OverlayTrigger, Badge } from "react-bootstrap";
import { ICourseResponse as ICourse } from "../../utils/interfaces";


type Fn = (row: Row<ICourse>) => void;

const columnHelper = createColumnHelper<ICourse>();

export const courseColumns = (
  handleEdit: Fn,
  handleDelete: Fn,
  handleTA: Fn,
  handleCopy: Fn
) => [
  columnHelper.accessor("name", {
    id: "name",
    header: () => (
      <span
        className="text-start fw-bold"
        style={{ color: "#000000", fontSize: "1.17em" }}
      >
        Course Name
      </span>
    ),
    cell: (info) => (
      <div className="text-start py-2">
        <span style={{ color: "#000000" }}>{info.getValue()}</span>
      </div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    enableGlobalFilter: true,
  }),

  columnHelper.accessor("institution.name", {
    id: "institution",
    header: () => (
      <span
        className="text-start fw-bold"
        style={{ color: "#000000", fontSize: "1.17em" }}
      >
        Institution
      </span>
    ),
    cell: ({ row }) => {
      const institution = row.original.institution;
      return (
        <div className="text-start py-2">
          <span>
            {institution && institution.name ? (
              institution.name
            ) : (
              <Badge bg="danger">Unassigned</Badge>
            )}
          </span>
        </div>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
    enableGlobalFilter: true,
  }),

  columnHelper.accessor("instructor.name", {
    id: "instructor",
    header: () => (
      <span
        className="text-start fw-bold"
        style={{ color: "#000000", fontSize: "1.17em" }}
      >
        Instructor
      </span>
    ),
    cell: ({ row }) => {
      const instructor = row.original.instructor;
      return (
        <div className="text-start py-2">
          <span>
            {instructor && instructor.name ? (
              instructor.name
            ) : (
              <Badge bg="danger">Unassigned</Badge>
            )}
          </span>
        </div>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
    enableGlobalFilter: true,
  }),

  columnHelper.accessor("created_at", {
    header: () => (
      <span
        className="text-start fw-bold"
        style={{ color: "#000000", fontSize: "1.17em" }}
      >
        Creation Date
      </span>
    ),
    cell: (info) => (
      <div className="text-start py-2">
        <span>
          {new Date(info.getValue()).toLocaleDateString() || (
            <Badge bg="secondary">N/A</Badge>
          )}
        </span>
      </div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    enableGlobalFilter: true,
  }),

  columnHelper.accessor("updated_at", {
    header: () => (
      <span
        className="text-start fw-bold"
        style={{ color: "#000000", fontSize: "1.17em" }}
      >
        Updated Date
      </span>
    ),
    cell: (info) => (
      <div className="text-start py-2">
        <span>
          {new Date(info.getValue()).toLocaleDateString() || (
            <Badge bg="secondary">N/A</Badge>
          )}
        </span>
      </div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
    enableGlobalFilter: false,
  }),

  columnHelper.display({
    id: "actions",
    header: () => (
      <span
        className="text-start fw-bold"
        style={{ color: "#000000", fontSize: "1.17em" }}
      >
        Actions
      </span>
    ),
    cell: ({ row }) => (
      <div className="d-flex justify-content-start gap-2 py-2">
        <OverlayTrigger overlay={<Tooltip>Edit Course</Tooltip>}>
          <Button
            variant="link"
            onClick={() => handleEdit(row)}
            aria-label="Edit Course"
            className="p-0"
          >
            <img
              src="/assets/images/edit-icon-24.png"
              alt="Edit"
              style={{ width: "25px", height: "20px" }}
            />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger overlay={<Tooltip>Delete Course</Tooltip>}>
          <Button
            variant="link"
            onClick={() => handleDelete(row)}
            aria-label="Delete Course"
            className="p-0"
          >
            <img
              src="/assets/images/delete-icon-24.png"
              alt="Delete"
              style={{ width: "25px", height: "20px" }}
            />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger overlay={<Tooltip>Assign TA</Tooltip>}>
          <Button
            variant="link"
            onClick={() => handleTA(row)}
            aria-label="Assign TA"
            className="p-0"
          >
            <img
              src="/assets/images/add-ta-24.png"
              alt="Assign TA"
              style={{ width: "25px", height: "20px" }}
            />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger overlay={<Tooltip>Copy Course</Tooltip>}>
          <Button
            variant="link"
            onClick={() => handleCopy(row)}
            aria-label="Copy Course"
            className="p-0"
          >
            <img
              src={"/assets/images/Copy-icon-24.png"}
              alt="Copy"
              style={{ width: "35px", height: "25px" }}
            />
          </Button>
        </OverlayTrigger>
      </div>
    ),
  }),
];
