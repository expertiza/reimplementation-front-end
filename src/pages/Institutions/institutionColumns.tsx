import {createColumnHelper, Row} from "@tanstack/react-table";
import {MdOutlineDeleteForever as Remove} from "react-icons/md";
import {BsPencilFill as Edit} from "react-icons/bs";
import {Button} from "react-bootstrap";
import {IInstitution} from "../../utils/interfaces";

type Fn = (row: Row<IInstitution>) => void;
const columnHelper = createColumnHelper<IInstitution>();
export const institutionColumns = (handleEdit: Fn, handleDelete: Fn) => [
  columnHelper.accessor("id", {
    header: "Id",
    enableSorting: false,
    enableColumnFilter: false,
    minSize: 100,
  }),

  columnHelper.accessor("name", {
    header: "Name",
    enableSorting: true,
    minSize: 300,
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
    minSize: 300,
  }),
];
