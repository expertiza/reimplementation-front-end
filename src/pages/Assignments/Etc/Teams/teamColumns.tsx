import {createColumnHelper, Row} from "@tanstack/react-table";
import {MdOutlineDeleteForever as Remove} from "react-icons/md";
import {BsPencilFill as Edit} from "react-icons/bs";
import {Button} from "react-bootstrap";
import {ITeam} from "../../../../utils/interfaces";

/**
 * @author Ankur Mundra on June, 2023
 */

type Fn = (row: Row<ITeam>) => void;
const columnHelper = createColumnHelper<ITeam>();
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

  columnHelper.accessor("age", {
    header: "Age",
    enableSorting: true,
    enableColumnFilter: false,
  })
];
