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

const renderCellValue = (
  value: number | string | boolean | null | undefined,
  isClassAverage: boolean | undefined
) =>
  React.createElement(
    "span",
    { className: isClassAverage ? "fw-bold" : undefined },
    value === null || value === undefined ? "" : String(value)
  );

export const buildRows = (
  students: StudentReportEntry[],
  assignments: AssignmentMetadata[]
): CourseReportRow[] => {
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
