import { createColumnHelper, Row } from "@tanstack/react-table";
import { MdOutlineDeleteForever as Remove } from "react-icons/md";
import { BsPencilFill as Edit } from "react-icons/bs";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { IRole } from "../../utils/interfaces";

type Fn = (row: Row<IRole>) => void;
const columnHelper = createColumnHelper<IRole>();

// EXPORT ROLE COLUMNS
export const roleColumns = (handleEdit: Fn, handleDelete: Fn) => [
  // ROLE ID COLUMN
  columnHelper.accessor("id", {
    header: "Id",
    enableColumnFilter: false,
    enableSorting: false,
  }),

  // ROLE NAME COLUMN
  columnHelper.accessor("name", {
    header: "Role Name",
    enableSorting: true,
  }),

  // ROLE PARENT ID COLUMN
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
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={`tooltip-edit-${row.original.id}`}>Edit</Tooltip>}
        >
          <Button variant="outline-warning" size="sm" onClick={() => handleEdit(row)}>
            <Edit />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={`tooltip-delete-${row.original.id}`}>Delete</Tooltip>}
        >
          <Button
            size="sm"
            variant="outline-danger"
            className="ms-sm-2"
            onClick={() => handleDelete(row)}
          >
            <Remove />
          </Button>
        </OverlayTrigger>
      </>
    ),
  }),
];
