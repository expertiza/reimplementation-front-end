import {createColumnHelper, Row} from "@tanstack/react-table";
import {Button} from "react-bootstrap";
import {BsPencilFill, BsPersonXFill} from "react-icons/bs";
import {ICourseResponse as ICourse} from "../../utils/interfaces";

/**
 * @author Ankur Mundra on April, 2023
 */

type Fn = (row: Row<ICourse>) => void;
const columnHelper = createColumnHelper<ICourse>();
export const courseColumns = (handleEdit: Fn, handleDelete: Fn) => [
  columnHelper.accessor("id", {
    header: "Id",
    enableColumnFilter: false,
    enableSorting: false,
  }),

  columnHelper.accessor("name", {
    header: "Course name",
    enableSorting: true,
  }),

  columnHelper.accessor("Directory", {
    header: "Directory",
    enableSorting: true,
    enableMultiSort: true,
  }),

  columnHelper.accessor("Instructor", {
    header: "Instructor",
  }),

  columnHelper.accessor("Creation", {
    id: "Creation",
    header: "Creation Date",
    enableColumnFilter: false,
  }),

  columnHelper.accessor("Updated", {
    id: "Updated",
    header: "Updated Date",
    enableColumnFilter: false,
  }),
  
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
          <BsPersonXFill />
        </Button>
        <Button variant="contained" size="sm" onClick={() => handleEdit(row)}>
          <BsPencilFill />
        </Button>
      </>
    ),
  }),
];
