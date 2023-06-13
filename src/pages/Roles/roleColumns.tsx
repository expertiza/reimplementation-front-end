import {createColumnHelper, Row} from "@tanstack/react-table";
import {MdOutlineDeleteForever as Remove} from "react-icons/md";
import {BsPencilFill as Edit} from "react-icons/bs";
import {Button} from "react-bootstrap";
import {IRole} from "../../utils/interfaces";

/**
 * @author Ankur Mundra on June, 2023
 */

type Fn = (row: Row<IRole>) => void;
const columnHelper = createColumnHelper<IRole>();
export const roleColumns = (handleEdit: Fn, handleDelete: Fn) => [
  columnHelper.accessor("id", {
    header: "Id",
    enableColumnFilter: false,
    enableSorting: false,
  }),

  columnHelper.accessor("name", {
    header: "Role Name",
    enableSorting: true,
  }),

  columnHelper.accessor("parent_id", {
    header: "Parent Id",
    enableSorting: true,
    enableColumnFilter: false,
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <>
        <Button variant="outline-warning" size="sm" onClick={() => handleEdit(row)}>
          <Edit />
        </Button>
        <Button
          size="sm"
          variant="outline-danger"
          className="ms-sm-2"
          onClick={() => handleDelete(row)}
        >
          <Remove />
        </Button>
      </>
    ),
  }),
];
