/*
 * Transforms the raw course report API response into the rows and column
 * definitions consumed by Table.tsx. Keeping this logic outside the React
 * component makes it independently testable.
 */

import React from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  AssignmentMetadata,
  StudentReportEntry,
  VisibleFields,
} from "../types/courseAssignmentOverview";

type CourseReportRow = {
  studentId?: number;
  studentName: string;
  isClassAverage?: boolean;
  [key: string]: number | string | boolean | null | undefined;
};

const columnHelper = createColumnHelper<CourseReportRow>();

/*
 * Shared cell renderer used by every column. Class average cells render in
 * bold, while null values render as empty strings rather than "null".
 */
const renderCellValue = (
  value: number | string | boolean | null | undefined,
  isClassAverage: boolean | undefined
) =>
  React.createElement(
    "span",
    { className: isClassAverage ? "fw-bold" : undefined },
    value === null || value === undefined ? "" : String(value)
  );

/*
 * Builds flat table rows from students and assignment metadata. Dynamic flat
 * keys like a{assignmentId}_peerGrade are used because TanStack Table requires
 * flat accessor keys; null assignment entries for non-participants are skipped.
 * Null numeric values are preserved on student rows but counted as zero for
 * class average calculations, and the class average row is always appended last.
 */
export const buildRows = (
  students: StudentReportEntry[],
  assignments: AssignmentMetadata[]
): CourseReportRow[] => {
  // Drives both row key generation and running sum accumulation for class averages.
  const numericFields = [
    { suffix: "peerGrade", key: "peer_grade" as const },
    { suffix: "instructorGrade", key: "instructor_grade" as const },
    { suffix: "avgTeammateScore", key: "avg_teammate_score" as const },
    { suffix: "avgAuthorFeedbackScore", key: "avg_author_feedback_score" as const },
  ];

  const averages = assignments.reduce<Record<string, { sum: number; count: number }>>(
    (acc, assignment) => {
      numericFields.forEach(({ suffix }) => {
        acc[`a${assignment.assignment_id}_${suffix}`] = { sum: 0, count: 0 };
      });
      return acc;
    },
    {}
  );

  const rows = students.map((student) => {
    const row: CourseReportRow = {
      studentId: student.user_id,
      studentName: student.user_name,
    };

    assignments.forEach((assignment) => {
      const assignmentData = student.assignments[String(assignment.assignment_id)];

      if (!assignmentData) {
        return;
      }

      if (assignment.has_topics) {
        row[`a${assignment.assignment_id}_topic`] = assignmentData.topic ?? null;
      }

      numericFields.forEach(({ suffix, key }) => {
        const columnKey = `a${assignment.assignment_id}_${suffix}`;
        const value = assignmentData[key];

        row[columnKey] = value;

        if (typeof value === "number") {
          averages[columnKey].sum += value;
          averages[columnKey].count += 1;
        } else if (value === null) {
          averages[columnKey].count += 1;
        }
      });
    });

    return row;
  });

  const classAverageRow: CourseReportRow = {
    studentName: "Class Average",
    isClassAverage: true,
  };

  assignments.forEach((assignment) => {
    if (assignment.has_topics) {
      classAverageRow[`a${assignment.assignment_id}_topic`] = null;
    }

    numericFields.forEach(({ suffix }) => {
      const columnKey = `a${assignment.assignment_id}_${suffix}`;
      const { sum, count } = averages[columnKey];
      classAverageRow[columnKey] = count > 0 ? sum / count : null;
    });
  });

  return [...rows, classAverageRow];
};

/*
 * Builds TanStack column definitions from assignment metadata and checkbox
 * visibility state. The column exclusion rule is enforced here, not at render
 * time: the topic sub-column is only created when has_topics is true regardless
 * of the topic checkbox state. All other sub-columns are always created and
 * controlled only by columnVisibility in the page component.
 */
export const buildColumns = (
  assignments: AssignmentMetadata[],
  visibleFields: VisibleFields
) => [
  columnHelper.accessor("studentName", {
    id: "studentName",
    header: "Student Name",
    cell: ({ row, getValue }) => renderCellValue(getValue(), row.original.isClassAverage),
    enableSorting: true,
  }),
  ...assignments.map((assignment) =>
    columnHelper.group({
      id: `assignment_${assignment.assignment_id}`,
      header: assignment.assignment_name,
      columns: [
        ...(assignment.has_topics
          ? [
              columnHelper.accessor(`a${assignment.assignment_id}_topic`, {
                id: `a${assignment.assignment_id}_topic`,
                header: "Topic",
                cell: ({ row, getValue }) =>
                  renderCellValue(getValue(), row.original.isClassAverage),
                enableSorting: true,
                meta: { requestedVisible: visibleFields.topic },
              }),
            ]
          : []),
        columnHelper.accessor(`a${assignment.assignment_id}_peerGrade`, {
          id: `a${assignment.assignment_id}_peerGrade`,
          header: "Peer Grade",
          cell: ({ row, getValue }) =>
            renderCellValue(getValue(), row.original.isClassAverage),
          enableSorting: true,
          meta: { requestedVisible: visibleFields.peerGrade },
        }),
        columnHelper.accessor(`a${assignment.assignment_id}_instructorGrade`, {
          id: `a${assignment.assignment_id}_instructorGrade`,
          header: "Instructor Grade",
          cell: ({ row, getValue }) =>
            renderCellValue(getValue(), row.original.isClassAverage),
          enableSorting: true,
          meta: { requestedVisible: visibleFields.instructorGrade },
        }),
        columnHelper.accessor(`a${assignment.assignment_id}_avgTeammateScore`, {
          id: `a${assignment.assignment_id}_avgTeammateScore`,
          header: "Avg. Teammate Score",
          cell: ({ row, getValue }) =>
            renderCellValue(getValue(), row.original.isClassAverage),
          enableSorting: true,
          meta: { requestedVisible: visibleFields.avgTeammateScore },
        }),
        columnHelper.accessor(`a${assignment.assignment_id}_avgAuthorFeedbackScore`, {
          id: `a${assignment.assignment_id}_avgAuthorFeedbackScore`,
          header: "Avg. Author Feedback Score",
          cell: ({ row, getValue }) =>
            renderCellValue(getValue(), row.original.isClassAverage),
          enableSorting: true,
          meta: { requestedVisible: visibleFields.avgAuthorFeedbackScore },
        }),
      ],
    })
  ),
];
