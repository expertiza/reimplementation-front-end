import { BsFileText, BsPencilFill, BsPersonXFill } from "react-icons/bs";
import { Row, createColumnHelper } from "@tanstack/react-table";

import { Button } from "react-bootstrap";
import { IAssignmentResponse as IAssignment } from "../../utils/interfaces";

type Fn = (row: Row<IAssignment>) => void;
const columnHelper = createColumnHelper<IAssignment>();
export const assignmentColumns = (handleEdit: Fn, handleDelete: Fn) => [
  columnHelper.accessor("id", {
    header: "Id",
    enableColumnFilter: false,
    enableSorting: false,
  }),

  columnHelper.accessor("title", {
    header: "Title",
    enableSorting: true,
  }),

  columnHelper.accessor("description", {
    header: "Description",
    enableSorting: true,
    enableMultiSort: true,
  }),

  columnHelper.accessor("due_date", {
    header: "Due Date",
  }),

  // Add other assignment-specific columns as needed

  columnHelper.group({
    id: "assignment_details",
    header: "Assignment Details",
    columns: [
      // Add more assignment-specific columns within this group
    ],
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
      </>
    ),
  }),
];
