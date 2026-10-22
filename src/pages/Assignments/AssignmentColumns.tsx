import { Row, createColumnHelper } from "@tanstack/react-table";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { IAssignmentResponse as IAssignment } from "../../utils/interfaces";
import { formatDate } from "../../utils/util";

type Fn = (row: Row<IAssignment>) => void;
const columnHelper = createColumnHelper<IAssignment>();

const ActionIcon = ({
  src,
  alt,
  title,
  onClick,
}: {
  src: string;
  alt: string;
  title: string;
  onClick: () => void;
}) => (
  <OverlayTrigger overlay={<Tooltip>{title}</Tooltip>}>
    <Button variant="link" onClick={onClick} aria-label={title} className="p-0">
      <img src={src} alt={alt} style={{ width: "18px", height: "18px" }} />
    </Button>
  </OverlayTrigger>
);

export const assignmentColumns = (
  handleEdit: Fn,
  handleDelete: Fn,
  handleParticipants: Fn,
  handleCreateTeams: Fn,
  handleAssignReviewer: Fn,
  handleViewSubmissions: Fn,
  handleViewScores: Fn,
  handleViewReports: Fn
) => [
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("course_name", {
    header: "Course Name",
  }),
  columnHelper.accessor("created_at", {
    header: "Creation Date",
    cell: (info) => formatDate(info.getValue() as string) || "—",
  }),
  columnHelper.accessor("updated_at", {
    header: "Updated Date",
    cell: (info) => formatDate(info.getValue() as string) || "—",
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="d-flex align-items-center gap-1 flex-wrap">
        <ActionIcon
          src="/assets/images/edit-icon-24.png"
          alt="Edit"
          title="Edit Assignment"
          onClick={() => handleEdit(row)}
        />
        <ActionIcon
          src="/assets/icons/add-participant-24.png"
          alt="Participants"
          title="Add Participant"
          onClick={() => handleParticipants(row)}
        />
        <ActionIcon
          src="/assets/icons/create-teams-24.png"
          alt="Create Teams"
          title="Create Teams"
          onClick={() => handleCreateTeams(row)}
        />
        <ActionIcon
          src="/assets/icons/assign-reviewers-24.png"
          alt="Assign Reviewer"
          title="Assign Reviewer"
          onClick={() => handleAssignReviewer(row)}
        />
        <ActionIcon
          src="/assets/icons/view-submissions-24.png"
          alt="Submissions"
          title="View Submissions"
          onClick={() => handleViewSubmissions(row)}
        />
        <ActionIcon
          src="/assets/icons/view-scores-24.png"
          alt="Scores"
          title="View Scores"
          onClick={() => handleViewScores(row)}
        />
        <ActionIcon
          src="/assets/icons/view-review-report-24.png"
          alt="Reports"
          title="View Review Report"
          onClick={() => handleViewReports(row)}
        />
        <ActionIcon
          src="/assets/images/delete-icon-24.png"
          alt="Delete"
          title="Delete Assignment"
          onClick={() => handleDelete(row)}
        />
      </div>
    ),
  }),
];
