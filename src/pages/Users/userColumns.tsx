import {createColumnHelper, Row} from "@tanstack/react-table";
import {Button, Tooltip, OverlayTrigger } from "react-bootstrap";
import {BsPencilFill, BsPersonXFill} from "react-icons/bs";
import {IUserResponse as IUser} from "../../utils/interfaces";
/**
 * @author Ankur Mundra on April, 2023
 */

type Fn = (row: Row<IUser>) => void;
const columnHelper = createColumnHelper<IUser>();
export const userColumns = (handleEdit: Fn, handleDelete: Fn) => [
  columnHelper.accessor("id", {
    header: "Id",
    enableColumnFilter: false,
    enableSorting: false,
  }),

  columnHelper.accessor("name", {
    header: "Username",
    enableSorting: true,
    size: 140,
  }),

  columnHelper.accessor("full_name", {
    header: "Full Name",
    enableSorting: true,
    enableMultiSort: true,
    size: 200,
  }),

  columnHelper.accessor("email", {
    header: "Email",
    size: 220,
  }),

  columnHelper.accessor("role.name", {
    id: "role",
    header: "Role",
    enableColumnFilter: false,
  }),

  columnHelper.accessor("parent.name", {
    id: "parent",
    header: "Parent",
    enableColumnFilter: false,
  }),

  columnHelper.display({
    id: "assignment_emails",
    header: () => (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id="assignment-emails-tooltip">
            On means this user gets emails for assignment activity (for example new reviews and new submissions).
            Editing the user uses one setting for both.
          </Tooltip>
        }
      >
        <span className="d-inline-block" style={{ lineHeight: 1.25 }}>
          Assignment emails
        </span>
      </OverlayTrigger>
    ),
    cell: ({ row }) => {
      const on = Boolean(row.original.email_on_review || row.original.email_on_submission);
      return on ? (
        <img
          src={process.env.PUBLIC_URL + "/assets/icons/Check-icon.png"}
          alt="Assignment emails: on"
          style={{ width: "20px", height: "20px" }}
        />
      ) : (
        <span className="text-muted small" title="Off">
          —
        </span>
      );
    },
  }),
  columnHelper.accessor("institution.name", {
    id: "institution",
    header: "Institution",
    enableColumnFilter: false,
  }),
  columnHelper.display({
    id: "actions",
    header: () => (
      <span
        className="text-start fw-bold"
        style={{ color: "#000000", fontSize: "1.17em" }}
      >
        Actions
      </span>
    ),
    cell: ({ row }) => (
      <div className="d-flex justify-content-start gap-2 py-2">
        <OverlayTrigger overlay={<Tooltip>Edit User</Tooltip>}>
          <Button
            variant="link"
            onClick={() => handleEdit(row)}
            aria-label="Edit User"
            className="p-0"
          >
            <img
              src={"/assets/images/edit-icon-24.png"}
              alt="Edit"
              style={{ width: "20px", height: "20px" }}
            />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger overlay={<Tooltip>Delete User</Tooltip>}>
          <Button
            variant="link"
            onClick={() => handleDelete(row)}
            aria-label="Delete User"
            className="p-0"
          >
            <img
              src={"/assets/images/delete-icon-24.png"}
              alt="Delete"
              style={{ width: "20px", height: "20px" }}
            />
          </Button>
        </OverlayTrigger>
      </div>
    ),
  }),
];
