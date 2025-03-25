import { createColumnHelper, Row } from "@tanstack/react-table";
import { Button, Tooltip, OverlayTrigger, Badge } from "react-bootstrap";
import { ICourseResponse as ICourse } from "../../utils/interfaces";
import { formatDate } from "./CourseUtil";


type Fn = (row: Row<ICourse>) => void;

const columnHelper = createColumnHelper<ICourse>();

export const courseColumns = (
  handleEdit: Fn,
  handleDelete: Fn,
  handleTA: Fn,
  handleCopy: Fn
) => [
  columnHelper.accessor("name", {
    header: () => "Course name",
    cell: (info) => (
      <div className="py-2">
        {info.getValue()}
      </div>
    ),
    enableSorting: true,
  }),

  columnHelper.accessor("instructor.name", {
    header: () => "Instructor",
    cell: ({ row }) => {
      const instructor = row.original.instructor;
      return (
        <div className="py-2">
          {instructor && instructor.name ? (
            instructor.name
          ) : (
            <Badge bg="danger">Unassigned</Badge>
          )}
        </div>
      );
    },
    enableSorting: true,
  }),

  columnHelper.accessor("created_at", {
    header: () => "Creation date",
    cell: (info) => (
      <div className="py-2">
          {
            formatDate(new Date(info.getValue()).toLocaleDateString()) ||
            <Badge bg="secondary">N/A</Badge>
          }
      </div>
    ),
    enableSorting: true,
  }),

  columnHelper.accessor("updated_at", {
    header: () => "Updated date",
    cell: (info) => (
      <div className="py-2">
        {
          formatDate(new Date(info.getValue()).toLocaleDateString()) ||
          <Badge bg="secondary">N/A</Badge>
        }
      </div>
    ),
    enableSorting: true,
  }),

  columnHelper.display({
    id: "actions",
    header: () => "Actions",
    cell: ({ row }) => (
      <div className="d-flex justify-content-start gap-2 py-2">
        <OverlayTrigger overlay={<Tooltip>Edit Course</Tooltip>}>
          <Button
            variant="link"
            onClick={() => handleEdit(row)}
            aria-label="Edit Course"
            className="btn btn-md"
          >
            <img
              src={process.env.PUBLIC_URL + "/assets/images/edit-icon-24.png"}
              alt="Edit"
              width="25px"
              height="20px"
            />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger overlay={<Tooltip>Delete Course</Tooltip>}>
          <Button
            variant="link"
            onClick={() => handleDelete(row)}
            aria-label="Delete Course"
            className="btn btn-md"
          >
            <img
              src={process.env.PUBLIC_URL + "/assets/images/delete-icon-24.png"}
              alt="Delete"
              width="25px"
              height="20px"
            />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger overlay={<Tooltip>Assign TA</Tooltip>}>
          <Button
            variant="link"
            onClick={() => handleTA(row)}
            aria-label="Assign TA"
            className="btn btn-md"
          >
            <img
              src={process.env.PUBLIC_URL + "/assets/images/add-ta-24.png"}
              alt="Assign TA"
              width="25px"
              height="20px"
            />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger overlay={<Tooltip>Copy Course</Tooltip>}>
          <Button
            variant="link"
            onClick={() => handleCopy(row)}
            aria-label="Copy Course"
            className="btn btn-md"
          >
            <img
              src={"/assets/images/Copy-icon-24.png"}
              alt="Copy"
              width="25px"
              height="20px"
            />
          </Button>
        </OverlayTrigger>
      </div>
    ),
  }),
];
