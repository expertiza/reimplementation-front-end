import { BsPencilFill, BsPersonXFill,BsBookFill} from 'react-icons/bs';
import { Row, createColumnHelper } from '@tanstack/react-table';

import { Button } from "react-bootstrap";
import { IAssignmentResponse as IAssignment } from "../../utils/interfaces";

type Fn = (row: Row<IAssignment>) => void;
const columnHelper = createColumnHelper<IAssignment>();
export const assignmentColumns = ( handleEdit: Fn, handleDelete: Fn, handleReview: Fn) => [
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("courseName", {
    header: "Course Name",
  }),
  columnHelper.accessor("created_at", {
    header: "Creation Date",
  }),

  columnHelper.accessor("updated_at", {
    header: "Updated Date",
  }),

  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <>
        <Button variant="outline-warning" size="sm" onClick={() => handleEdit(row)} title="Edit">
          <BsPencilFill />
        </Button>

        {/* 3. Add your new "Review" button here */}
        <Button
          variant="outline-info" // A nice info color
          size="sm"
          className="ms-sm-2" // Add margin
          onClick={() => handleReview(row)} // Use the new handler
          title="Review"
        >
          <BsBookFill />
        </Button>
        {/* End of new button */}

        <Button
          variant="outline-danger"
          size="sm"
          className="ms-sm-2"
          onClick={() => handleDelete(row)}
          title="Delete"
        >
          <BsPersonXFill />
        </Button>
      </>
    ),
  }),
];