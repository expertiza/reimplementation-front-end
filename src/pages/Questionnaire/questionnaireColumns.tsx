import {createColumnHelper, Row} from "@tanstack/react-table";
import {MdOutlineDeleteForever as Remove} from "react-icons/md";
import {BsPencilFill as Edit} from "react-icons/bs";
import {Button, OverlayTrigger, Tooltip} from "react-bootstrap";
import {IQuestionnaire} from "../../utils/interfaces";

/**
 * @author Jeffrey Riehle on March, 2024
 */

type Fn = (row: Row<IQuestionnaire>) => void;
const columnHelper = createColumnHelper<IQuestionnaire>();
export const questionnaireColumns = (handleEdit: Fn, handleDelete: Fn) => [
  columnHelper.accessor("id", {
    header: "Id",
    enableSorting: false,
    enableColumnFilter: false,
  }),

  columnHelper.accessor("name", {
    header: "Name",
    enableSorting: true,
  }),

  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <><OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
          <Button variant="outline-warning" size="sm" onClick={() => handleEdit(row)}>
            <Edit />
          </Button>
		</OverlayTrigger>
		<OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
          <Button
            size="sm"
            variant="outline-danger"
            className="ms-sm-2"
		    onClick={() => { if (window.confirm('Are you sure you wish to delete this item?')) handleDelete(row)}}
          >
            <Remove />
          </Button>
		</OverlayTrigger>
      </>
    ),
  }),
];
