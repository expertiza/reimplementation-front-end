import {createColumnHelper, Row} from "@tanstack/react-table";
import {Button} from "react-bootstrap";
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
    header: "Actions",
    cell: ({ row }) => (
      <>
        <Button
          className="transparent-btn transparent-btn-warning"
          size="sm"
          style={{
            backgroundColor: 'transparent',
            color: 'rgba(220, 53, 69, 0.5)',
            borderColor: 'rgba(220, 53, 69, 0.5)',}}
          onClick={() => handleEdit(row)}
        >
          Edit
        </Button>
        <Button
          className="transparent-btn transparent-btn-danger ms-sm-2"
          size="sm"
          style={{
            backgroundColor: 'transparent',
            color: 'rgba(220, 53, 69, 0.5)',
            borderColor: 'rgba(220, 53, 69, 0.5)',}}
          onClick={() => handleDelete(row)}
        >
          Delete
        </Button>
      </>
    ),
  }),
  
  
];