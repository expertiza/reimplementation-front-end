import {createColumnHelper, Row} from "@tanstack/react-table";
import {Button} from "react-bootstrap";
import {IInstitution} from "../Users/userUtil";
import {BsFileXFill as Remove, BsPencilFill} from "react-icons/bs";

/**
 * @author Ankur Mundra on June, 2023
 */

type Fn = (row: Row<IInstitution>) => void;
const columnHelper = createColumnHelper<IInstitution>();
export const institutionColumns = (handleEdit: Fn, handleDelete: Fn) => [
  columnHelper.accessor("id", {
    header: "Id",
    enableSorting: false,
    enableColumnFilter: false,
  }),

  columnHelper.accessor("name", {
    header: "Name",
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
          <Remove />
        </Button>
      </>
    ),
  }),
];
