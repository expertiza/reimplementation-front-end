import { BsPencilFill, BsPersonXFill } from "react-icons/bs";
import { Row, createColumnHelper } from "@tanstack/react-table";

import { Button } from "react-bootstrap";
import { QuestionnaireResponse as IQuestionnaire } from "./QuestionnaireUtils";

type Fn = (row: Row<IQuestionnaire>) => void;
const columnHelper = createColumnHelper<IQuestionnaire>();


export const questionnaireColumns = (handleEdit: Fn, handleDelete: Fn) => [
  columnHelper.accessor("id", {
    header: "ID",
  }),
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("private", {
    header: "Private",
  }),
  columnHelper.accessor("min_question_score", {
    header: "Min. Question Score",
  }),
  columnHelper.accessor("max_question_score", {
    header: "Max. Question Score",
  }),
  columnHelper.accessor("questionnaire_type", {
    header: "Type",
  }),
  columnHelper.accessor("instructor_id", {
    header: "Instructor ID",
  }),
  columnHelper.accessor("instructor.name", {
    header: "Instructor Name",
  }),
  columnHelper.accessor("instructor.email", {
    header: "Instructor Email",
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <>
        <Button
          variant="outline-warning"
          size="sm" onClick={() => handleEdit(row)}
          title="Edit">
          <BsPencilFill />
        </Button>

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