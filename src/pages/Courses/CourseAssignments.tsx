import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
import React from "react";
import useAPI from "../../hooks/useAPI";
import { useEffect, useMemo, useState } from "react";
import { assignmentColumns as getBaseAssignmentColumns } from "../Assignments/AssignmentColumns";
import { useLocation, useNavigate } from "react-router-dom";
import { IAssignmentResponse } from "../../utils/interfaces";
import AssignmentDelete from "../Assignments/AssignmentDelete";
import GradesExportModal from "../../components/Modals/GradesExportModal";

const formatDateTime = (value: string | Date | null | undefined): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

interface ActionHandler {
  icon: string;
  label: string;
  handler: (row: TRow<any>) => void;
  className?: string;
}

interface CourseAssignmentsProps {
  courseId: number;
  courseName: string;
}

const CourseAssignments: React.FC<CourseAssignmentsProps> = ({ courseId, courseName }) => {
  const { data: assignmentResponse, sendRequest: fetchAssignments } = useAPI();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: IAssignmentResponse;
  }>({ visible: false });
  const [exportAssignment, setExportAssignment] = useState<IAssignmentResponse | null>(null);

  const onDeleteAssignmentHandler = () => setShowDeleteConfirmation({ visible: false });

  const onEditHandle = (row: TRow<IAssignmentResponse>) => {
    const from = `${location.pathname}${location.search}${location.hash || ""}`;
    navigate(`/assignments/edit/${row.original.id}`, { state: { from } });
  };

  const onDeleteHandle = (row: TRow<IAssignmentResponse>) =>
    setShowDeleteConfirmation({ visible: true, data: row.original });

  const onAddParticipantHandle = (row: TRow<IAssignmentResponse>) =>
    navigate(`/assignments/edit/${row.original.id}/participants`);

  const onCreateTeamsHandle = (row: TRow<IAssignmentResponse>) =>
    navigate(`/assignments/edit/${row.original.id}/createteams`);

  const onAssignReviewersHandle = (row: TRow<IAssignmentResponse>) =>
    navigate(`/assignments/edit/${row.original.id}/assignreviewer`);

  const onViewSubmissionsHandle = (row: TRow<IAssignmentResponse>) =>
    navigate(`/assignments/edit/${row.original.id}/viewsubmissions`);

  const onViewScoresHandle = (row: TRow<IAssignmentResponse>) =>
    navigate(`/assignments/edit/${row.original.id}/viewscores`);

  const onViewReportsHandle = (row: TRow<IAssignmentResponse>) =>
    navigate(`/assignments/edit/${row.original.id}/viewreports`);

  const onExportGradesHandle = (row: TRow<IAssignmentResponse>) =>
    setExportAssignment(row.original);

  const actionHandlers: ActionHandler[] = useMemo(
    () => [
      {
        icon: "/assets/icons/edit-temp.png",
        label: "Edit",
        handler: onEditHandle,
        className: "text-primary",
      },
      {
        icon: "/assets/icons/delete-temp.png",
        label: "Delete",
        handler: onDeleteHandle,
        className: "text-danger",
      },
      {
        icon: "/assets/icons/add-participant-24.png",
        label: "Add Participant",
        handler: onAddParticipantHandle,
        className: "text-success",
      },
      {
        icon: "/assets/icons/assign-reviewers-24.png",
        label: "Assign Reviewers",
        handler: onAssignReviewersHandle,
        className: "text-info",
      },
      {
        icon: "/assets/icons/create-teams-24.png",
        label: "Create Teams",
        handler: onCreateTeamsHandle,
        className: "text-primary",
      },
      {
        icon: "/assets/icons/view-review-report-24.png",
        label: "View Review Report",
        handler: onViewReportsHandle,
        className: "text-secondary",
      },
      {
        icon: "/assets/icons/view-scores-24.png",
        label: "View Scores",
        handler: onViewScoresHandle,
        className: "text-info",
      },
      {
        icon: "/assets/icons/view-submissions-24.png",
        label: "View Submissions",
        handler: onViewSubmissionsHandle,
        className: "text-secondary",
      },
      {
        icon: "/assets/icons/copy-temp.png",
        label: "Copy Assignment",
        handler: (row: TRow<any>) => {
          console.log("Copy assignment:", row.original);
        },
        className: "text-success",
      },
      {
        icon: "/assets/icons/export-temp.png",
        label: "Export Grades",
        handler: onExportGradesHandle,
        className: "text-primary",
      },
    ],
    [
      onAddParticipantHandle,
      onAssignReviewersHandle,
      onCreateTeamsHandle,
      onDeleteHandle,
      onEditHandle,
      onExportGradesHandle,
      onViewReportsHandle,
      onViewScoresHandle,
      onViewSubmissionsHandle,
    ]
  );

  useEffect(() => {
    if (!showDeleteConfirmation.visible) {
      fetchAssignments({ url: `/assignments` });
    }
  }, [fetchAssignments, showDeleteConfirmation.visible]);

  const getAssignmentColumns = (actions: ActionHandler[]) => {
    let baseColumns = getBaseAssignmentColumns(() => {}, () => {}, () => {}).filter(col =>
      !["edit", "delete", "actions"].includes(String(col.id))
    );
    baseColumns = baseColumns
      .filter(col => col.header !== "Course Name")
      .map((col) => {
        const columnKey = String((col as any).id ?? (col as any).accessorKey ?? "");
        if (columnKey === "created_at" || columnKey === "updated_at") {
          return {
            ...col,
            cell: ({ row }: { row: TRow<IAssignmentResponse> }) => (
              <span style={{ color: "#000000" }}>
                {formatDateTime(
                  row.original[columnKey as "created_at" | "updated_at"] as unknown as string
                )}
              </span>
            ),
          };
        }

        return col;
      });

    const actionsColumn = {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: TRow<any> }) => (
        <div className="d-flex gap-1" style={{ minWidth: "max-content" }}>
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => action.handler(row)}
              className="btn btn-link p-0"
              title={action.label}
              style={{ lineHeight: 0 }}
            >
              <img
                src={action.icon}
                alt={action.label}
                width="21"
                height="21"
              />
            </button>
          ))}
        </div>
      )
    };
    return [...baseColumns, actionsColumn];
  };

  const assignments = (assignmentResponse?.data || []).filter(
    (assignment: any) => assignment.course_id === courseId);
  const columns = useMemo(() => getAssignmentColumns(actionHandlers), [actionHandlers]);

  return (
    <div className="px-4 bg-light">
      {/* <h5 className="mb-3">Assignments for {courseName}</h5> */}
      {showDeleteConfirmation.visible && (
        <AssignmentDelete
          assignmentData={showDeleteConfirmation.data!}
          onClose={onDeleteAssignmentHandler}
        />
      )}
      <Table
        data={assignments}
        columns={columns}
        showGlobalFilter={false}
        showColumnFilter={false}
        showPagination={false}
        tableSize={{ span: 12, offset: 0 }}
      />
      <GradesExportModal
        show={exportAssignment !== null}
        onHide={() => setExportAssignment(null)}
        assignmentId={exportAssignment?.id}
        assignmentName={exportAssignment?.name}
      />
    </div>
  );
};
export default CourseAssignments;
