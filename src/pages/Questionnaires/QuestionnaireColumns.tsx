import { BsPencilFill, BsPersonXFill } from "react-icons/bs";
import { Row, createColumnHelper } from "@tanstack/react-table";
import { BsArrowDownUp, BsArrowDown, BsArrowUp } from "react-icons/bs";


import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { QuestionnaireResponse as IQuestionnaire } from "./QuestionnaireUtils";

type Fn = (row: Row<IQuestionnaire>) => void;
const columnHelper = createColumnHelper<IQuestionnaire>();


export const questionnaireColumns = (handleEdit: Fn, handleDelete: Fn) => [
  columnHelper.accessor("id", {
    header: "ID",
  }),
  columnHelper.accessor("name", {
    header: "Name",
    size: 150,
  }),
  columnHelper.accessor("private", {
    header: "Private",
    size:100,
    cell: (info) =>
      info.getValue() ? (
        <img
          src={"/assets/icons/Check-icon.png"}
          alt="Private"
          style={{ width: "18px", height: "18px" }}
        />
      ) : null,
  }),
  columnHelper.accessor("questionnaire_type", {
    header: "Type",
  }),
  columnHelper.accessor("created_at", {
  header: "Created At",
  cell: (info) => {
    const dateValue = info.getValue();
    if (!dateValue) return "";
    return new Date(dateValue).toISOString().split("T")[0]; // shows YYYY-MM-DD
  },
}),
columnHelper.accessor("updated_at", {
  header: "Updated At",
  cell: (info) => {
    const dateValue = info.getValue();
    if (!dateValue) return "";
    return new Date(dateValue).toISOString().split("T")[0];
  },
}),

  columnHelper.accessor("instructor_id", {
    header: "Instructor ID",
  }),
  columnHelper.accessor("instructor.name", {
    header: "Instructor Name",
    size:200
  }),
  columnHelper.accessor("instructor.email", {
    header: "Instructor Email",
    size:300
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <>
        <OverlayTrigger overlay={<Tooltip>Edit Questionnaire</Tooltip>}>
          <Button
            variant="link"
             onClick={(e) => {
          e.stopPropagation(); 
          handleEdit(row);
        }}
            aria-label="Edit Questionnaire"
            className="p-0"
          >
            <img
              src={"/assets/images/edit-icon-24.png"}
              alt="Edit"
              style={{ width: "20px", height: "20px" }}
            />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger overlay={<Tooltip>Delete Questionnaire</Tooltip>}>
          <Button
            variant="link"
            onClick={(e) => {
          e.stopPropagation(); 
          handleDelete(row);
        }}
            aria-label="Delete Questionnaire"
            className="p-0"
          >
            <img
              src={"/assets/images/delete-icon-24.png"}
              alt="Delete"
              style={{ width: "20px", height: "20px" }}
            />
          </Button>
        </OverlayTrigger>
      </>
    ),
  }),
];
