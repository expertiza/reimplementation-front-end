import { createColumnHelper, Row } from "@tanstack/react-table";
import { Button } from "react-bootstrap";
import { BsPencilFill, BsPersonXFill } from "react-icons/bs";
import { IUserResponse as IUser } from "../../utils/interfaces";
import { useTranslation } from "react-i18next"; // Importing useTranslation hook

/**
 * Author: Ankur Mundra on April, 2023
 */

type Fn = (row: Row<IUser>) => void;
const columnHelper = createColumnHelper<IUser>();

export const userColumns = (handleEdit: Fn, handleDelete: Fn) => {
  const { t } = useTranslation(); // Initialize useTranslation hook

  return [
    columnHelper.accessor("id", {
      header: t('users.columns.id'),
      enableColumnFilter: false,
      enableSorting: false,
    }),

    columnHelper.accessor("name", {
      header: t('users.columns.username'),
      enableSorting: true,
    }),

    columnHelper.accessor("full_name", {
      header: t('users.columns.full_name'),
      enableSorting: true,
      enableMultiSort: true,
    }),

    columnHelper.accessor("email", {
      header: t('users.columns.email'),
    }),

    columnHelper.accessor("role.name", {
      id: "role",
      header: t('users.columns.role'),
      enableColumnFilter: false,
    }),

    columnHelper.accessor("parent.name", {
      id: "parent",
      header: t('users.columns.parent'),
      enableColumnFilter: false,
    }),

    columnHelper.group({
      id: "email_preferences",
      header: t('users.columns.email_preferences'),
      columns: [
        columnHelper.accessor("email_on_review", {
          header: t('users.columns.review'),
          enableSorting: false,
          enableColumnFilter: false,
          enableGlobalFilter: false,
        }),
        columnHelper.accessor("email_on_submission", {
          header: t('users.columns.submission'),
          enableSorting: false,
          enableColumnFilter: false,
          enableGlobalFilter: false,
        }),
        columnHelper.accessor("email_on_review_of_review", {
          header: t('users.columns.meta_review'),
          enableSorting: false,
          enableColumnFilter: false,
          enableGlobalFilter: false,
        }),
      ],
    }),
    columnHelper.accessor("institution.name", {
      id: "institution",
      header: t('users.columns.institution'),
      enableColumnFilter: false,
    }),
    columnHelper.display({
      id: "actions",
      header: t('users.columns.actions'),
      cell: ({ row }) => (
        <>
          <Button variant="outline-warning" size="sm" onClick={() => handleEdit(row)} title={t('users.actions.edit')}>
            <BsPencilFill />
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            className="ms-sm-2"
            onClick={() => handleDelete(row)}
            title={t('users.actions.delete')}
          >
            <BsPersonXFill />
          </Button>
        </>
      ),
    }),
  ];
};