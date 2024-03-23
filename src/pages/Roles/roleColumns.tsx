import { createColumnHelper, Row } from "@tanstack/react-table";
import { MdOutlineDeleteForever as Remove } from "react-icons/md";
import { BsPencilFill as Edit } from "react-icons/bs";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { IRole } from "../../utils/interfaces";

type Fn = (row: Row<IRole>) => void;
const columnHelper = createColumnHelper<IRole>();

type ButtonSize = 'sm' | 'lg' | undefined;

interface OverlayTriggerButtonProps {
  id: string;
  variant: string;
  size: ButtonSize;
  onClick: () => void;
  children: React.ReactNode;
  tooltip: string;
}

const OverlayTriggerButton: React.FC<OverlayTriggerButtonProps> = ({
  id,
  variant,
  size,
  onClick,
  children,
  tooltip,
}) => (
  <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${id}`}>{tooltip}</Tooltip>}>
    <Button variant={variant} size={size} onClick={onClick}>
      {children}
    </Button>
  </OverlayTrigger>
);

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
  columnHelper.accessor("parent_id", {
    header: "Parent Id",
    enableSorting: true,
    enableColumnFilter: false,
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
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
