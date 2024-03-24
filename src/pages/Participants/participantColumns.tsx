import { createColumnHelper, Row } from "@tanstack/react-table";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { BsPencilFill, BsPersonXFill } from "react-icons/bs";
import { IParticipantResponse as IParticipant } from "../../utils/interfaces";

/**
 * @author Divit Kalathil on October, 2023
 */

type Fn = (row: Row<IParticipant>) => void;
const columnHelper = createColumnHelper<IParticipant>();
const tooltip = <Tooltip id="tooltip">Delete Participant</Tooltip>;
export const participantColumns = (handleEdit: Fn, handleDelete: Fn) => [
  columnHelper.accessor("id", {
    header: "Id",
    enableColumnFilter: false,
    enableSorting: false,
  }),

  columnHelper.accessor("user.name", {
    header: "Participant Name",
    enableSorting: true,
  }),

  columnHelper.accessor("user.full_name", {
    header: "Full Name",
    enableSorting: true,
    enableMultiSort: true,
  }),

  columnHelper.accessor("user.email", {
    header: "Email",
  }),

  columnHelper.accessor("user.role.name", {
    id: "role",
    header: "Role",
    enableColumnFilter: false,
  }),

  columnHelper.accessor("user.parent.name", {
    id: "parent",
    header: "Parent",
    enableColumnFilter: false,
  }),

  columnHelper.group({
    id: "email_preferences",
    header: "Email Preferences",
    columns: [
      columnHelper.accessor("user.email_on_review", {
        header: "Review",
        enableSorting: false,
        enableColumnFilter: false,
        enableGlobalFilter: false,
      }),
      columnHelper.accessor("user.email_on_submission", {
        header: "Submission",
        enableSorting: false,
        enableColumnFilter: false,
        enableGlobalFilter: false,
      }),
      columnHelper.accessor("user.email_on_review_of_review", {
        header: "Meta Review",
        enableSorting: false,
        enableColumnFilter: false,
        enableGlobalFilter: false,
      }),
    ],
  }),
  columnHelper.accessor("user.institution.name", {
    id: "institution",
    header: "Institution",
    enableColumnFilter: false,
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <>
        <OverlayTrigger overlay={tooltip} placement="bottom">
          <Button
            variant="outline-danger"
            size="sm"
            className="ms-sm-2"
            onClick={() => handleDelete(row)}
          >
            <BsPersonXFill />
          </Button>
        </OverlayTrigger>
      </>
    ),
  }),
];
