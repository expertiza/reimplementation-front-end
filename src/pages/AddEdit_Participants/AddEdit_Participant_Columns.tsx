import { createColumnHelper, Row } from "@tanstack/react-table";
import { Button } from "react-bootstrap";
import { BsPencilFill, BsPersonXFill } from "react-icons/bs";
import { IUserResponse as IUser } from "../../utils/interfaces";
import editIcon from "C:/Users/Kruthi/reimplementation-front-end/src/pages/AddEdit_Participants/edit-icon.png";
import deleteIcon from "C:/Users/Kruthi/reimplementation-front-end/src/pages/AddEdit_Participants/delete-icon.png";

/**
 * @author Ankur Mundra on April, 2023
 */

type Fn = (row: Row<IUser>) => void;
const columnHelper = createColumnHelper<IUser>();

export const userColumns = (handleEdit: Fn, handleDelete: Fn, data: IUser[]) => {
  // Check if all `take_quiz` values are false
  const isTakeQuizColumnVisible = data.some((user) => user.take_quiz);
  const isReviewColumnVisible = data.some((user) => user.email_on_review);
  const isSubmitColumnVisible = data.some((user) => user.email_on_submission);


  return [
    // columnHelper.accessor("id", {
    //   header: "Id",
    //   enableColumnFilter: false,
    //   enableSorting: false,
    // }),

    columnHelper.accessor("name", {
      header: "Username",
      enableSorting: true,
      cell: (info) => {
        return (
          <a
            href={"#"} // Replace with your actual link URL or route
            style={{
              color: "orange", // Set the link color
              textDecoration: "underline", // Underline to make it look like a link
              cursor: "pointer", // Show pointer cursor on hover
            }}
          >
            {info.getValue()}
          </a>
        );
      },
    }),

    columnHelper.accessor("full_name", {
      header: "Name",
      enableSorting: true,
      cell: (info) => {
        return (
          <a
            href={"#"} // Replace with your actual link URL or route
            style={{
              color: "orange", // Set the link color
              textDecoration: "underline", // Underline to make it look like a link
              cursor: "pointer", // Show pointer cursor on hover
            }}
          >
            {info.getValue()}
          </a>
        );
      },
    }),

    columnHelper.accessor("email", {
      header: "Email Address",
      enableSorting: true,
      cell: (info) => {
        return (
          <a
            href={"#"} // Replace with your actual link URL or route
            style={{
              color: "orange", // Set the link color
              textDecoration: "underline", // Underline to make it look like a link
              cursor: "pointer", // Show pointer cursor on hover
            }}
          >
            {info.getValue()}
          </a>
        );
      },
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

    // Conditionally include the `take_quiz` column
    ...(isReviewColumnVisible
      ? [
          columnHelper.accessor("email_on_review", {
            header: "Review",
            enableSorting: false,
            enableColumnFilter: false,
            enableGlobalFilter: false,
          }),
        ]
      : []),
    // Conditionally include the `take_quiz` column
    ...(isTakeQuizColumnVisible
      ? [
          columnHelper.accessor("take_quiz", {
            header: "Take Quiz",
            enableSorting: false,
            enableColumnFilter: false,
            enableGlobalFilter: false,
          }),
        ]
      : []),

    // Conditionally include the `take_quiz` column
    ...(isSubmitColumnVisible
      ? [
          columnHelper.accessor("email_on_submission", {
            header: "Submit",
            enableSorting: false,
            enableColumnFilter: false,
            enableGlobalFilter: false,
          }),
        ]
      : []),

    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <>
          <Button
            className="transparent-btn transparent-btn-warning"
            size="sm"
            style={{
              backgroundColor: "transparent",
              color: "rgb(0, 0, 0)",
              borderColor: "rgb(0, 0, 0)",
            }}
            onClick={() => handleEdit(row)}
          >
            <img
              src={editIcon}
              alt="Edit"
              style={{ width: "20px", height: "20px" }}
            />
          </Button>
          <Button
            className="transparent-btn transparent-btn-danger ms-sm-2"
            size="sm"
            style={{
              backgroundColor: "transparent",
              color: "rgb(0, 0, 0)",
              borderColor: "rgb(0, 0, 0)",
            }}
            onClick={() => handleDelete(row)}
          >
            <img
              src={deleteIcon}
              alt="Delete"
              style={{ width: "20px", height: "20px" }}
            />
          </Button>
        </>
      ),
    }),
  ];
};
