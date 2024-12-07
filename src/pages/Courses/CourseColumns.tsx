import { createColumnHelper, Row } from "@tanstack/react-table";
import { Button } from "react-bootstrap";
import { BsPencilFill, BsPersonXFill } from "react-icons/bs";
import { MdContentCopy, MdDelete } from "react-icons/md";
import { ICourseResponse as ICourse, ROLE } from "../../utils/interfaces";
import ColumnButton from "../../components/ColumnButton";

/**
 * @author Anurag Gorkar, on December, 2024
 * @author Makarand Pundalik, on December, 2024
 * @author Rutvik Kulkarni, on December, 2024
 */

/**
 * Determines if the current user has the authority to add a TA to a course.
 * Only users with roles SUPER_ADMIN, ADMIN, or INSTRUCTOR can assign TAs.
 * @param {String} currUserRole - The role of the current user
 * @returns {boolean} - True if the user has TA assignment authority, otherwise false
 */
const hasAddTAAuthority = (currUserRole: String): boolean => {
  return (
    currUserRole === ROLE.SUPER_ADMIN.valueOf() ||
    currUserRole === ROLE.ADMIN.valueOf() ||
    currUserRole === ROLE.INSTRUCTOR.valueOf()
  );
};

// Course Columns Configuration: Defines the columns for the courses table
type Fn = (row: Row<ICourse>) => void;
const columnHelper = createColumnHelper<ICourse>();

export const courseColumns = (
  handleEdit: Fn,
  handleDelete: Fn,
  handleTA: Fn,
  handleCopy: Fn,
  currUserRole: String
) => [
    // Column for the course name
    columnHelper.accessor("name", {
      id: "name",
      header: "Name",
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: false,
    }),

    // Column for the institution name
    columnHelper.accessor("institution.name", {
      id: "institution",
      header: "Institution",
      enableSorting: true,
      enableMultiSort: true,
      enableGlobalFilter: false,
    }),

    // Column for the creation date
    columnHelper.accessor("created_at", {
      header: "Creation Date",
      enableSorting: true,
      enableColumnFilter: false,
      enableGlobalFilter: false,
    }),

    // Column for the last updated date
    columnHelper.accessor("updated_at", {
      header: "Updated Date",
      enableSorting: true,
      enableColumnFilter: false,
      enableGlobalFilter: false,
    }),

    // Actions column with edit, delete, TA, and copy buttons
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <>
          <ColumnButton
            id="edit"
            variant="outline-warning"
            size="sm"
            onClick={() => handleEdit(row)}
            tooltip="Edit this course"
            icon={<BsPencilFill />}
          />
          <ColumnButton
            id="delete"
            variant="outline-danger"
            size="sm"
            className="ms-sm-2"
            onClick={() => handleDelete(row)}
            tooltip="Delete this course"
            icon={<MdDelete />}
          />
          {hasAddTAAuthority(currUserRole) && ( // Use the helper function to determine TA authority
            <ColumnButton
              id="assign-ta"
              variant="outline-info"
              size="sm"
              className="ms-sm-2"
              onClick={() => handleTA(row)}
              tooltip="Assign a TA to this course"
              icon={<BsPersonXFill />}
            />
          )}
          <ColumnButton
            id="copy"
            variant="outline-primary"
            size="sm"
            className="ms-sm-2"
            onClick={() => handleCopy(row)}
            tooltip="Copy course details"
            icon={<MdContentCopy />}
          />
        </>
      ),
    }),
  ];