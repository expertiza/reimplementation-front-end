import {createColumnHelper, Row} from "@tanstack/react-table";
import {Button} from "react-bootstrap";
import {BsPencilFill, BsPersonXFill} from "react-icons/bs";
import {ICourseResponse as ICourse} from "../../utils/interfaces";

/**
 * @author Mrityunjay Joshi on December, 2023
 */

type Fn = (row: Row<ICourse>) => void;
const columnHelper = createColumnHelper<ICourse>();
export const courseColumns = (handleEdit: Fn, handleDelete: Fn) => [
  // columnHelper.accessor("id", {
  //   header: "Id",
  //   enableColumnFilter: false,
  //   enableSorting: false,
  // }),

  columnHelper.accessor("name", {
    id: "name",
    header: "Name",
    enableSorting: true,
    enableColumnFilter: true,
  }),

  columnHelper.accessor("Institution", {
    header: "Institution",
    enableSorting: true,
    enableMultiSort: true,
  }),


  columnHelper.accessor("Creation", {
    header: "Creation Date",
    enableSorting: true,
  }),

  columnHelper.accessor("Updated", {
    header: "Updated Date",
    enableSorting: true,
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
