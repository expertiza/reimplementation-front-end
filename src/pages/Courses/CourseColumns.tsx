import { createColumnHelper, Row } from "@tanstack/react-table";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { BsPencilFill, BsPersonXFill } from "react-icons/bs";
import { MdContentCopy, MdDelete } from "react-icons/md";
import { ICourseResponse as ICourse } from "../../utils/interfaces";

/**
 * @author Aniket Singh Shaktawat, on March, 2024 
 * @author Pankhi Saini on March, 2024
 * @author Siddharth Shah on March, 2024
 */

// Course Columns Configuration: Defines the columns for the courses table
type Fn = (row: Row<ICourse>) => void;
const columnHelper = createColumnHelper<ICourse>();
export const courseColumns = (handleEdit: Fn, handleDelete: Fn, handleTA: Fn, handleCopy: Fn, handleShowDetails:(course: ICourse) => void) => [

  // Column for the course name
  columnHelper.accessor("name", {
    id: "name",
    header: "Name",
    cell: (info) => <a href="#" onClick={() => handleShowDetails(info.row.original)}>{info.getValue()}</a>,
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

  // Column for the instructor name
  columnHelper.accessor("instructor.name", {
    id: "instructor",
    header: "Instructor Name",
    enableSorting: true,
    enableColumnFilter: true,
    enableGlobalFilter: false
  }),

  // Column for the creation date
  columnHelper.accessor("created_at", {
    header: "Creation Date",
    enableSorting: true,
    enableColumnFilter: false,
    enableGlobalFilter: false,
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
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Edit</Tooltip>}
        >
          <Button variant="outline-warning" size="sm" onClick={() => handleEdit(row)}>
            <BsPencilFill />
          </Button>
        </OverlayTrigger>
    
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Delete</Tooltip>}
        >
          <Button
            variant="outline-danger"
            size="sm"
            className="ms-sm-2"
            onClick={() => handleDelete(row)}
          >
            <MdDelete />
          </Button>
        </OverlayTrigger>
    
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Add TA</Tooltip>}
        >
          <Button
            variant="outline-info"
            size="sm"
            className="ms-sm-2"
            onClick={() => handleTA(row)}
          >
            <BsPersonXFill />
          </Button>
        </OverlayTrigger>
    
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Copy</Tooltip>}
        >
          <Button
            variant="outline-primary"
            size="sm"
            className="ms-sm-2"
            onClick={() => handleCopy(row)}
          >
            <MdContentCopy />
          </Button>
        </OverlayTrigger>
      </>
    ),
    
  }),
];
