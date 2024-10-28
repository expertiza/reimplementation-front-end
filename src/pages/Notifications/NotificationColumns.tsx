import { createColumnHelper, Row, ColumnDef } from "@tanstack/react-table";
import { MdOutlineDeleteForever as Remove } from "react-icons/md";
import { BsPencilFill as Edit } from "react-icons/bs";
import { Button } from "react-bootstrap";
import { INotification } from "../../utils/interfaces";
import React from "react";

type Fn = (row: Row<INotification>) => void;
const columnHelper = createColumnHelper<INotification>();

// Define columns with the ability to conditionally include the Actions column
export const notificationColumns = (
    handleEdit?: Fn,
    handleDelete?: Fn,
    showActions: boolean = true
): ColumnDef<INotification, any>[] => {  // Explicitly typing the return as ColumnDef array

    const columns: ColumnDef<INotification, any>[] = [
        columnHelper.accessor("id", {
            header: "Id",
            enableSorting: false,
            enableColumnFilter: false,
        }),
    
        columnHelper.accessor("course", {
            header: "Course",
            enableSorting: true,
        }),
    
        columnHelper.accessor("subject", {
            header: "Subject",
            enableSorting: true,
        }),
    
        columnHelper.accessor("description", {
            header: "Description",
            enableSorting: true,
        }),
    
        columnHelper.accessor("expirationDate", {
            header: "Expiration Date",
            enableSorting: true,
        }),
    
        columnHelper.accessor("isActive", {
            header: "Active Flag",
            enableSorting: true,
            cell: ({ row }) => (row.original.isActive ? "True" : "False"),
        })
    ];

    // Conditionally add Actions column if `showActions` is true
    if (showActions && handleEdit && handleDelete) {
        columns.push(
            columnHelper.display({
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <>
                        <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleEdit(row)}
                        >
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
            })
        );
    }

    return columns;
};
