import { createColumnHelper } from "@tanstack/react-table";
import { BsPlusSquareFill as Add } from "react-icons/bs";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { IQuestionnaire } from "../../utils/interfaces";

const columnHelper = createColumnHelper<IQuestionnaire>();

export const questionnaireColumns = (handlePlus: (parentId: number) => void) => [
  columnHelper.accessor("id", {
    header: "Id",
    enableSorting: false,
    enableColumnFilter: false,
  }),

  columnHelper.accessor("type", {
    header: "Type",
    enableSorting: true,
  }),

  columnHelper.accessor("name", {
    header: "Name",
    enableSorting: true,
  }),

  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <>
        <OverlayTrigger overlay={<Tooltip>Add Questionnaire</Tooltip>}>
          <Button
            size="sm"
            variant="outline-success"
            className="ms-2"
            onClick={() => handlePlus(row.original.id!)} 
          >
            <Add />
          </Button>
        </OverlayTrigger>
      </>
    ),
  }),
];
