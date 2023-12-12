import { createColumnHelper, Row } from "@tanstack/react-table";
import { Button } from "react-bootstrap";
import { BsPencilFill, BsPersonXFill } from "react-icons/bs";
import { MdContentCopy, MdDelete } from "react-icons/md";
import { ICourseResponse as ICourse } from "../../utils/interfaces";

/**
 * @author Atharva Thorve, on December, 2023
 * @author Mrityunjay Joshi on December, 2023
 */

// Course Columns Configuration: Defines the columns for the courses table
type Fn = (row: Row<ICourse>) => void;
const columnHelper = createColumnHelper<ICourse>();
export const courseColumns = (handleEdit: Fn, handleDelete: Fn, handleTA: Fn, handleCopy: Fn) => [

  // Column for the course name
  columnHelper.accessor("name", {
    id: "name",
    header: "Name",
    enableSorting: true,
    enableColumnFilter: true,
    enableGlobalFilter: false
  }),

  // Column for the institution name
  columnHelper.accessor("institution.name", {
    id: "institution",
    header: "Institution",
    enableSorting: true,
    enableMultiSort: true,
    enableGlobalFilter: false
  }),

  // Column for the creation date
  columnHelper.accessor("created_at", {
    header: "Creation Date",
    enableSorting: true,
    enableColumnFilter: false,
    enableGlobalFilter: false
  }),

  // Column for the last updated date
  columnHelper.accessor("updated_at", {
    header: "Updated Date",
    enableSorting: true,
    enableColumnFilter: false,
    enableGlobalFilter: false
  }),
  
  // Actions column with edit, delete, TA, and copy buttons
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <>
        <Button variant="outline-warning" size="sm" onClick={() => handleEdit(row)}>
          <BsPencilFill />
        </Button>
        <Button
          variant="outline-danger"
          size="sm"
          className="ms-sm-2"
          onClick={() => handleDelete(row)}
        >
          <MdDelete />
        </Button>
        <Button variant="outline-info" size="sm" className="ms-sm-2" onClick={() => handleTA(row)}>
          <BsPersonXFill />
        </Button>
        <Button variant="outline-primary" size="sm" className="ms-sm-2" onClick={() => handleCopy(row)}>
          <MdContentCopy />
        </Button>
      </>
    ),
  }),
];
