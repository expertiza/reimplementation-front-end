import { createColumnHelper, Row } from "@tanstack/react-table";
import { Button, Tooltip, OverlayTrigger } from "react-bootstrap";
import { BsBarChartFill, BsListCheck } from "react-icons/bs";
import { IoIosAddCircle } from "react-icons/io";

type UnifiedRow = Record<string, any>;
type Fn = (row: Row<UnifiedRow>) => void;

const columnHelper = createColumnHelper<UnifiedRow>();

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
      <img src={src} alt={alt} style={{ width: "20px", height: "20px" }} />
    </Button>
  </OverlayTrigger>
);

const GroupDivider = () => (
  <span
    aria-hidden="true"
    style={{
      display: "inline-block",
      width: "1px",
      height: "18px",
      background: "#9ca3af",
      margin: "0 10px",
      verticalAlign: "middle",
    }}
  />
);

export const courseColumns = (
  // Course actions
  handleEdit: Fn,
  handleDelete: Fn,
  handleTA: Fn,
  handleCopy: Fn,
  handleCreateAssignment: Fn,
  // Assignment actions (for sub-rows and standalone assignment rows)
  handleEditAssignment: Fn,
  handleDeleteAssignment: Fn,
  handleParticipants: Fn,
  handleAssignReviewer: Fn,
  handleCreateTeams: Fn,
  handleViewReports: Fn,
  handleViewScores: Fn,
  handleViewSubmissions: Fn,
  handleCopyAssignment: Fn,
  handleExportAssignment: Fn,
) => [
  columnHelper.accessor("name", {
    id: "name",
    header: "Name",
    meta: { width: "220px" },
    cell: (info) => {
      return (
        <div
          className="text-start py-1 px-3"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "220px",
          }}
        >
          {info.getValue()}
        </div>
      );
    },
    enableSorting: true,
    enableGlobalFilter: true,
  }),

  columnHelper.display({
    id: "instructor",
    header: "Instructor",
    cell: ({ row }) => (
      <div className="text-start py-1 px-3">
        {row.original.rowType === "course"
          ? row.original.instructor?.name || "—"
          : "—"}
      </div>
    ),
  }),

  columnHelper.accessor("created_at", {
    header: "Creation Date",
    cell: (info) => <div className="text-start py-1 px-3" style={{ whiteSpace: "nowrap" }}>{info.getValue() || "—"}</div>,
    enableSorting: true,
    meta: { whiteSpace: "nowrap", width: "175px" },
  }),

  columnHelper.accessor("updated_at", {
    header: "Updated Date",
    cell: (info) => <div className="text-start py-1 px-3" style={{ whiteSpace: "nowrap" }}>{info.getValue() || "—"}</div>,
    enableSorting: true,
    meta: { whiteSpace: "nowrap", width: "175px" },
  }),

  columnHelper.display({
    id: "actions",
    header: "Actions",
    // Exact width = widest content (assignment actions). table-layout:fixed honours this strictly.
    meta: { whiteSpace: "nowrap", width: "380px" },
    cell: ({ row }) => {
      if (row.original.rowType === "course") {
        return (
          <div className="d-flex align-items-center py-1" style={{ gap: "6px" }}>
            {/* Group 1: Edit / Copy */}
            <ActionIcon
              src="/assets/images/edit-icon-24.png"
              alt="Edit"
              title="Edit Course"
              onClick={() => handleEdit(row)}
            />
            <ActionIcon
              src="/assets/images/Copy-icon-24.png"
              alt="Copy"
              title="Copy Course"
              onClick={() => handleCopy(row)}
            />
            <GroupDivider />

            {/* Group 2: People management */}
            <OverlayTrigger overlay={<Tooltip>Create Assignment</Tooltip>}>
              <Button
                variant="link"
                onClick={() => handleCreateAssignment(row)}
                aria-label="Create Assignment"
                className="p-0"
              >
                <IoIosAddCircle size={26} color="#6abf69" />
              </Button>
            </OverlayTrigger>
            <ActionIcon
              src="/assets/images/add-ta-24.png"
              alt="Assign TA"
              title="Assign TA"
              onClick={() => handleTA(row)}
            />
            <GroupDivider />

            {/* Group 3: Reports */}
            <OverlayTrigger overlay={<Tooltip>Grade Summary by Student</Tooltip>}>
              <a
                href={`/courses/${row.original.id}/course-report/grade-summary`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Grade Summary by Student"
                style={{
                  fontSize: "20px",
                  color: "#198754",
                  padding: 0,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <BsBarChartFill />
              </a>
            </OverlayTrigger>
            <OverlayTrigger overlay={<Tooltip>Teammate Reviews Summary</Tooltip>}>
              <a
                href={`/courses/${row.original.id}/course-report/all-reviews`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Teammate Reviews Summary"
                style={{
                  fontSize: "20px",
                  color: "#0d6efd",
                  padding: 0,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <BsListCheck />
              </a>
            </OverlayTrigger>
            <GroupDivider />

            {/* Group 4: Delete */}
            <ActionIcon
              src="/assets/images/delete-icon-24.png"
              alt="Delete"
              title="Delete Course"
              onClick={() => handleDelete(row)}
            />
          </div>
        );
      }

      // Assignment row (sub-row or standalone)
      return (
        <div className="d-flex align-items-center py-1" style={{ gap: "6px" }}>
          {/* Group 1: Edit / Copy */}
          <ActionIcon
            src="/assets/images/edit-icon-24.png"
            alt="Edit"
            title="Edit Assignment"
            onClick={() => handleEditAssignment(row)}
          />
          <ActionIcon
            src="/assets/images/Copy-icon-24.png"
            alt="Copy"
            title="Copy Assignment"
            onClick={() => handleCopyAssignment(row)}
          />
          <GroupDivider />

          {/* Group 2: People / team management */}
          <ActionIcon
            src="/assets/icons/add-participant-24.png"
            alt="Participants"
            title="Add Participant"
            onClick={() => handleParticipants(row)}
          />
          <ActionIcon
            src="/assets/icons/assign-reviewers-24.png"
            alt="Assign Reviewer"
            title="Assign Reviewer"
            onClick={() => handleAssignReviewer(row)}
          />
          <ActionIcon
            src="/assets/icons/create-teams-24.png"
            alt="Create Teams"
            title="Create Teams"
            onClick={() => handleCreateTeams(row)}
          />
          <GroupDivider />

          {/* Group 3: View results */}
          <ActionIcon
            src="/assets/icons/view-review-report-24.png"
            alt="Reports"
            title="View Review Report"
            onClick={() => handleViewReports(row)}
          />
          <ActionIcon
            src="/assets/icons/view-scores-24.png"
            alt="Scores"
            title="View Scores"
            onClick={() => handleViewScores(row)}
          />
          <ActionIcon
            src="/assets/icons/view-submissions-24.png"
            alt="Submissions"
            title="View Submissions"
            onClick={() => handleViewSubmissions(row)}
          />
          <GroupDivider />

          {/* Group 4: Export / Delete */}
          <ActionIcon
            src="/assets/icons/export-temp.png"
            alt="Export"
            title="Export Assignment"
            onClick={() => handleExportAssignment(row)}
          />
          <ActionIcon
            src="/assets/images/delete-icon-24.png"
            alt="Delete"
            title="Delete Assignment"
            onClick={() => handleDeleteAssignment(row)}
          />
        </div>
      );
    },
  }),
];
