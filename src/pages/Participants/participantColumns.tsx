import { createColumnHelper, Row } from "@tanstack/react-table";
import { Button } from "react-bootstrap";
import { BsPencilFill, BsPersonXFill } from "react-icons/bs";
import { IParticipantResponse as IParticipant } from "../../utils/interfaces";
import { useTranslation } from "react-i18next"; // Importing useTranslation hook

/**
 * @author Divit Kalathil on October, 2023
 */

type Fn = (row: Row<IParticipant>) => void;
const columnHelper = createColumnHelper<IParticipant>();

export const participantColumns = (handleEdit: Fn, handleDelete: Fn) => {
  const { t } = useTranslation(); // Initialize useTranslation hook

  return [
    columnHelper.accessor("id", {
      header: t('participants.columns.id'),
      enableColumnFilter: false,
      enableSorting: false,
    }),

    columnHelper.accessor("name", {
      header: t('participants.columns.name'),
      enableSorting: true,
    }),

    columnHelper.accessor("full_name", {
      header: t('participants.columns.full_name'),
      enableSorting: true,
      enableMultiSort: true,
    }),

    columnHelper.accessor("email", {
      header: t('participants.columns.email'),
    }),

    columnHelper.accessor("role.name", {
      id: "role",
      header: t('participants.columns.role'),
      enableColumnFilter: false,
    }),

    columnHelper.accessor("parent.name", {
      id: "parent",
      header: t('participants.columns.parent'),
      enableColumnFilter: false,
    }),

    columnHelper.group({
      id: "email_preferences",
      header: t('participants.columns.email_preferences'),
      columns: [
        columnHelper.accessor("email_on_review", {
          header: t('participants.columns.review'),
          enableSorting: false,
          enableColumnFilter: false,
          enableGlobalFilter: false,
        }),
        columnHelper.accessor("email_on_submission", {
          header: t('participants.columns.submission'),
          enableSorting: false,
          enableColumnFilter: false,
          enableGlobalFilter: false,
        }),
        columnHelper.accessor("email_on_review_of_review", {
          header: t('participants.columns.meta_review'),
          enableSorting: false,
          enableColumnFilter: false,
          enableGlobalFilter: false,
        }),
      ],
    }),
    columnHelper.accessor("institution.name", {
      id: "institution",
      header: t('participants.columns.institution'),
      enableColumnFilter: false,
    }),
    columnHelper.display({
      id: "actions",
      header: t('participants.columns.actions'),
      cell: ({ row }) => (
        <>
          <Button variant="outline-warning" size="sm" onClick={() => handleEdit(row)} title={t('participants.actions.edit')}>
            <BsPencilFill />
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            className="ms-sm-2"
            onClick={() => handleDelete(row)}
            title={t('participants.actions.delete')}
          >
            <BsPersonXFill />
          </Button>
        </>
      ),
    }),
  ];
};