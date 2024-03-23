// IMPORTING NECESSARY MODULES AND COMPONENTS FROM DEPENDENCIES
import { createColumnHelper, Row } from "@tanstack/react-table";
import { MdOutlineDeleteForever as Remove } from "react-icons/md";
import { BsPencilFill as Edit } from "react-icons/bs";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { IRole } from "../../utils/interfaces";

// DEFINING THE FUNCTION TYPE FOR EVENT HANDLERS
type Fn = (row: Row<IRole>) => void;

// INITIALIZING THE COLUMN HELPER WITH THE IROLE INTERFACE FOR STRONG TYPING
const columnHelper = createColumnHelper<IRole>();

// REUSABLE COMPONENT FOR BUTTON WITH TOOLTIP IN A TABLE CELL
const OverlayTriggerButton = ({
  id,
  variant,
  size,
  onClick,
  children,
  tooltip,
}: {
  id: string;
  variant: string;
  size: "sm" | "lg" | undefined;
  onClick: () => void;
  children: React.ReactNode;
  tooltip: string;
}) => (
  // RENDERING A BUTTON WITH TOOLTIP FOR BETTER USER INTERACTION
  <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${id}`}>{tooltip}</Tooltip>}>
    <Button variant={variant} size={size} onClick={onClick}>
      {children}
    </Button>
  </OverlayTrigger>
);

// FUNCTION TO EXPORT ROLE COLUMNS CONFIGURATION
export const roleColumns = (handleEdit: Fn, handleDelete: Fn) => [
  // COLUMN FOR DISPLAYING ROLE ID
  columnHelper.accessor("id", {
    header: "Id",
    enableColumnFilter: false, // DISABLING FILTER FOR ID COLUMN
    enableSorting: false, // DISABLING SORTING FOR ID COLUMN
  }),

  // COLUMN FOR DISPLAYING ROLE NAME WITH SORTING ENABLED
  columnHelper.accessor("name", {
    header: "Role Name",
    enableSorting: true,
  }),

  // COLUMN FOR DISPLAYING ROLE PARENT ID WITH SORTING ENABLED
  columnHelper.accessor("parent_id", {
    header: "Parent Id",
    enableSorting: true,
    enableColumnFilter: false, // DISABLING FILTER FOR PARENT ID COLUMN
  }),

  // COLUMN FOR DISPLAYING ACTION BUTTONS (EDIT, DELETE) FOR EACH ROLE
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      // ACTION BUTTONS WITH TOOLTIPS FOR EDIT AND DELETE
      <>
        <OverlayTriggerButton
          id={`edit-${row.original.id}`}
          variant="outline-warning"
          size="sm"
          onClick={() => handleEdit(row)}
          tooltip="Edit"
        >
          <Edit />
        </OverlayTriggerButton>

        <OverlayTriggerButton
          id={`delete-${row.original.id}`}
          variant="outline-danger"
          size="sm"
          onClick={() => handleDelete(row)}
          tooltip="Delete"
        >
          <Remove />
        </OverlayTriggerButton>
      </>
    ),
  }),
];
