import { createColumnHelper, Row } from "@tanstack/react-table";
import { Button } from "react-bootstrap";
import { BsPersonXFill } from "react-icons/bs";
import { ITAResponse as ITA } from "../../utils/interfaces";

/**
 * @author Atharva Thorve, on December, 2023
 * @author Divit Kalathil, on December, 2023
 */

type Fn = (row: Row<ITA>) => void;
const columnHelper = createColumnHelper<ITA>();
export const TAColumns = (handleDelete: Fn) => [
  columnHelper.accessor("id", {
    header: "Id",
    enableColumnFilter: false,
    enableSorting: false,
  }),

  columnHelper.accessor("name", {
    header: "TA Name",
    enableSorting: true,
  }),

  columnHelper.accessor("full_name", {
    header: "Full Name",
    enableSorting: true,
    enableMultiSort: true,
  }),

  columnHelper.accessor("email", {
    header: "Email",
  }),

  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <>
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
