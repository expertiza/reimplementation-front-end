import { createColumnHelper, Row } from "@tanstack/react-table";
import { Button } from "react-bootstrap";
import { BsPencilFill, BsPersonXFill } from "react-icons/bs";
import { IParticipantResponse as IParticipant } from "../../utils/interfaces";

type Fn = (row: Row<IParticipant>) => void;
const columnHelper = createColumnHelper<IParticipant>();
export const participantColumns = (handleEdit: Fn, handleDelete: Fn) => [
  columnHelper.accessor("id", {
    header: "Id",
    enableColumnFilter: false,
    enableSorting: false,
  }),

  columnHelper.accessor("name", {
    header: "Participant Name",
    enableSorting: true,
  }),

  columnHelper.accessor("full_name", {
    header: "Full Name",
    enableSorting: true,
    enableMultiSort: true,
  }),

  columnHelper.accessor("email", {
    header: "Email",
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
        header: "Review",
        enableSorting: false,
        enableColumnFilter: false,
        enableGlobalFilter: false,
      }),
      columnHelper.accessor("email_on_submission", {
        header: "Submission",
        enableSorting: false,
        enableColumnFilter: false,
        enableGlobalFilter: false,
      }),
      columnHelper.accessor("email_on_review_of_review", {
        header: "Meta Review",
        enableSorting: false,
        enableColumnFilter: false,
        enableGlobalFilter: false,
      }),
    ],
  }),
  columnHelper.accessor("institution.name", {
    id: "institution",
    header: "Institution",
    enableColumnFilter: false,
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <>
        <Button variant="outline-warning" size="sm" onClick={() => handleEdit(row)}>
          <BsPencilFill />
        </Button>
        <Button
          variant="outline-danger"
          size="sm"
          className="ms-sm-2"
          onClick={() => handleDelete(row)}
        >
          <BsPersonXFill />
        </Button>
      </>
    ),
  }),
];
