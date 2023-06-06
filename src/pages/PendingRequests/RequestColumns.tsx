import { Row, createColumnHelper } from "@tanstack/react-table";
import { IPendingTable as ITable } from "./util";
import { Fragment } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

const columnHelper = createColumnHelper<ITable>();

export const REQUEST_COLUMNS = (
  triggerModal: (row: Row<ITable>["original"], action: "accept" | "reject") => void,
  showCurrent: boolean
) => {
  const columns = [
    columnHelper.accessor("username", {
      header: "Username",
      enableSorting: true,
      enableColumnFilter: false,
    }),

    columnHelper.accessor("full_name", {
      header: "Full Name",
      enableSorting: true,
      enableMultiSort: true,
      enableColumnFilter: false,
    }),

    columnHelper.accessor("email", {
      header: "Email",
      enableColumnFilter: false,
    }),

    columnHelper.accessor("role.name", {
      id: "role",
      header: "Role",
      enableColumnFilter: false,
    }),

    columnHelper.accessor("introduction", {
      id: "introduction",
      header: "Introduction",
      enableColumnFilter: false,
    }),

    columnHelper.accessor("status", {
      id: "status",
      header: "Status",
      enableColumnFilter: false,
    }),
  ];

  if (showCurrent) {
    columns.push(
      columnHelper.display({
        id: "Accept",
        cell: ({ row }) => (
          <Fragment>
            <button onClick={() => triggerModal(row.original, "accept")}>
              <FaCheck className="mr-1" color="green" />
            </button>
          </Fragment>
        ),
      }),
      columnHelper.display({
        id: "Reject",
        cell: ({ row }) => (
          <Fragment>
            <button onClick={() => triggerModal(row.original, "reject")}>
              <FaTimes className="mr-1" color="red" />
            </button>
          </Fragment>
        ),
      })
    );
  }

  return columns;
};
