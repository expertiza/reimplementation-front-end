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
  }),

  columnHelper.accessor("full_name", {
    header: "Full Name",
    enableSorting: true,
    enableMultiSort: true,
  }),

  columnHelper.accessor("email", {
    header: "Email",
    size: 200,
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

  columnHelper.group({
    id: "email_preferences",
    header: "Email Preferences",
    columns: [
      columnHelper.accessor("email_on_review", {
        header: () => (
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="review-tooltip">Receives email when a new review becomes available</Tooltip>}
          >
            <span>Review</span>
          </OverlayTrigger>
        ),
        cell: (info) =>
          info.getValue() ? (
            <img
              src={process.env.PUBLIC_URL + "/assets/icons/Check-icon.png"}
              alt="Checked"
              style={{ width: "20px", height: "20px" }}
            />
          ) : null,
        size: 70,
        enableSorting: false,
        enableColumnFilter: false,
        enableGlobalFilter: false,
      }),
      columnHelper.accessor("email_on_submission", {
        header: () => (
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="submission-tooltip">Receives email when a new submission is made</Tooltip>}
          >
            <span>Submit</span>
          </OverlayTrigger>
        ),
        cell: (info) =>
          info.getValue() ? (
            <img
              src={process.env.PUBLIC_URL + "/assets/icons/Check-icon.png"}
              alt="Checked"
              style={{ width: "20px", height: "20px" }}
            />
          ) : null,
        size: 70,
        enableSorting: false,
        enableColumnFilter: false,
        enableGlobalFilter: false,
      }),
      // columnHelper.accessor("email_on_review_of_review", {
      //   header: "Meta Review",
      //   enableSorting: false,
      //   enableColumnFilter: false,
      //   enableGlobalFilter: false,
      // }),
    ],
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
