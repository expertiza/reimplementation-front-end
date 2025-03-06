// Importing necessary interfaces and modules
import { createColumnHelper, Row } from "@tanstack/react-table";
import { Button } from "react-bootstrap";
import { BsPersonXFill } from "react-icons/bs";
import { ITAResponse as ITA } from "../../utils/interfaces";
import { useTranslation } from "react-i18next"; // Importing useTranslation hook

/**
 * @author Atharva Thorve, on December, 2023
 * @author Divit Kalathil, on December, 2023
 */

type Fn = (row: Row<ITA>) => void;
const columnHelper = createColumnHelper<ITA>();

export const TAColumns = (handleDelete: Fn) => {
  const { t } = useTranslation(); // Initialize useTranslation hook

  return [
    columnHelper.accessor("id", {
      header: t('tas.columns.id'),
      enableColumnFilter: false,
      enableSorting: false,
    }),
    //create TA Name column Header
    columnHelper.accessor("name", {
      header: t('tas.columns.name'),
      enableSorting: true,
    }),
    //create Full TA Name column Header
    columnHelper.accessor("full_name", {
      header: t('tas.columns.full_name'),
      enableSorting: true,
      enableMultiSort: true,
    }),
    //create Email column Header
    columnHelper.accessor("email", {
      header: t('tas.columns.email'),
    }),

    columnHelper.display({
      id: "actions",
      header: t('tas.columns.actions'),
      cell: ({ row }) => (
        <>
          <Button
            variant="outline-danger"
            size="sm"
            className="ms-sm-2"
            onClick={() => handleDelete(row)}
            title={t('tas.actions.delete')}
          >
            <BsPersonXFill />
          </Button>
        </>
      ),
    }),
  ];
};