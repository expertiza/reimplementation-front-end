// notificationColumns.tsx
import { createColumnHelper, Row, ColumnDef } from "@tanstack/react-table";
import { MdOutlineDeleteForever as Remove } from "react-icons/md";
import { BsPencilFill as Edit } from "react-icons/bs";
import { Button, Form } from "react-bootstrap";
import { INotification } from "../../utils/interfaces";
import React from "react";

type Fn = (row: Row<INotification>) => void;
type ToggleFn = (row: Row<INotification>, isActive: boolean) => void;
const columnHelper = createColumnHelper<INotification>();

export const notificationColumns = (
    handleEdit?: Fn,
    handleDelete?: Fn,
    showActions: boolean = true,
    handleToggle?: ToggleFn  // Added handleToggle parameter
): ColumnDef<INotification, any>[] => {
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

        columnHelper.display({
            id: "isActive",
            header: "Active",
            cell: ({ row }) => handleToggle ? (
                <Form.Check
                    type="switch"
                    id={`isActive-switch-${row.original.id}`}
                    checked={row.original.isActive}
                    onChange={() => handleToggle(row, !row.original.isActive)}
                />
            ) : row.original.isActive ? "True" : "False",
        })
    ];

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
