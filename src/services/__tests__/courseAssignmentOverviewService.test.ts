import React from "react";
import {
  buildColumns,
  buildRows,
} from "../courseAssignmentOverviewService";
import {
  AssignmentMetadata,
  StudentReportEntry,
  VisibleFields,
} from "../../types/courseAssignmentOverview";

const assignments: AssignmentMetadata[] = [
  {
    assignment_id: 3,
    assignment_name: "Assignment 3",
    has_topics: true,
  },
  {
    assignment_id: 5,
    assignment_name: "Assignment 5",
    has_topics: false,
  },
];

const students: StudentReportEntry[] = [
  {
    user_id: 1,
    user_name: "Alice",
    assignments: {
      "3": {
        participant_id: 101,
        peer_grade: 80,
        instructor_grade: 90,
        avg_teammate_score: 70,
        avg_author_feedback_score: 65,
        topic: "Topic Alpha",
      },
      "5": null,
    },
  },
  {
    user_id: 2,
    user_name: "Bob",
    assignments: {
      "3": {
        participant_id: 102,
        peer_grade: 100,
        instructor_grade: null,
        avg_teammate_score: 50,
        avg_author_feedback_score: 75,
      },
      "5": {
        participant_id: 202,
        peer_grade: 60,
        instructor_grade: 70,
        avg_teammate_score: 80,
        avg_author_feedback_score: 90,
      },
    },
  },
  {
    user_id: 3,
    user_name: "Cara",
    assignments: {
      "3": {
        participant_id: 103,
        peer_grade: null,
        instructor_grade: null,
        avg_teammate_score: null,
        avg_author_feedback_score: null,
        topic: "Topic Gamma",
      },
      "5": {
        participant_id: 203,
        peer_grade: null,
        instructor_grade: null,
        avg_teammate_score: null,
        avg_author_feedback_score: null,
      },
    },
  },
];

const visibleFields: VisibleFields = {
  topic: false,
  peerGrade: true,
  instructorGrade: false,
  avgTeammateScore: true,
  avgAuthorFeedbackScore: true,
};

describe("courseAssignmentOverviewService buildRows", () => {
  it("returns one row per student plus a class average row", () => {
    const rows = buildRows(students, assignments);

    expect(rows).toHaveLength(4);
  });

  it("preserves the student name on each student row", () => {
    const [aliceRow] = buildRows(students, assignments);

    expect(aliceRow.studentName).toBe("Alice");
  });

  it("creates dynamic numeric field keys for assignment data", () => {
    const [aliceRow] = buildRows(students, assignments);

    expect(aliceRow.a3_peerGrade).toBe(80);
    expect(aliceRow.a3_instructorGrade).toBe(90);
    expect(aliceRow.a3_avgTeammateScore).toBe(70);
    expect(aliceRow.a3_avgAuthorFeedbackScore).toBe(65);
  });

  it("includes a topic key when the assignment has topics", () => {
    const [aliceRow] = buildRows(students, assignments);

    expect(aliceRow.a3_topic).toBe("Topic Alpha");
  });

  it("does not create a topic key when the assignment has_topics flag is false", () => {
    const [, bobRow] = buildRows(students, assignments);

    expect("a5_topic" in bobRow).toBe(false);
  });

  it("skips an assignment entirely when the student is not a participant", () => {
    const [aliceRow] = buildRows(students, assignments);

    expect("a5_peerGrade" in aliceRow).toBe(false);
    expect("a5_instructorGrade" in aliceRow).toBe(false);
    expect("a5_avgTeammateScore" in aliceRow).toBe(false);
    expect("a5_avgAuthorFeedbackScore" in aliceRow).toBe(false);
  });

  it("treats a missing topic on a topic-enabled assignment as null", () => {
    const [, bobRow] = buildRows(students, assignments);

    expect(bobRow.a3_topic).toBeNull();
  });

  it("preserves null numeric values on student rows", () => {
    const [, bobRow] = buildRows(students, assignments);

    expect(bobRow.a3_instructorGrade).toBeNull();
  });

  it("marks the appended summary row as the class average row", () => {
    const classAverageRow = buildRows(students, assignments).at(-1);

    expect(classAverageRow).toMatchObject({
      studentName: "Class Average",
      isClassAverage: true,
    });
  });

  it("computes the mean peer grade for each assignment using only numeric values", () => {
    const classAverageRow = buildRows(students, assignments).at(-1);

    expect(classAverageRow?.a3_peerGrade).toBe(90);
    expect(classAverageRow?.a5_peerGrade).toBe(60);
  });

  it("computes the mean instructor grade for each assignment using only numeric values", () => {
    const classAverageRow = buildRows(students, assignments).at(-1);

    expect(classAverageRow?.a3_instructorGrade).toBe(90);
    expect(classAverageRow?.a5_instructorGrade).toBe(70);
  });

  it("computes the mean teammate score for each assignment using only numeric values", () => {
    const classAverageRow = buildRows(students, assignments).at(-1);

    expect(classAverageRow?.a3_avgTeammateScore).toBe(60);
    expect(classAverageRow?.a5_avgTeammateScore).toBe(80);
  });

  it("computes the mean author feedback score for each assignment using only numeric values", () => {
    const classAverageRow = buildRows(students, assignments).at(-1);

    expect(classAverageRow?.a3_avgAuthorFeedbackScore).toBe(70);
    expect(classAverageRow?.a5_avgAuthorFeedbackScore).toBe(90);
  });

  it("sets the class average topic field to null for topic-enabled assignments", () => {
    const classAverageRow = buildRows(students, assignments).at(-1);

    expect(classAverageRow?.a3_topic).toBeNull();
  });

  it("returns null averages when no student has a numeric value for that field", () => {
    const emptyAverageRows = buildRows(
      [
        {
          user_id: 9,
          user_name: "Only Nulls",
          assignments: {
            "3": {
              participant_id: 909,
              peer_grade: null,
              instructor_grade: null,
              avg_teammate_score: null,
              avg_author_feedback_score: null,
            },
          },
        },
      ],
      [{ assignment_id: 3, assignment_name: "A3", has_topics: true }]
    );

    const classAverageRow = emptyAverageRows.at(-1);

    expect(classAverageRow?.a3_peerGrade).toBeNull();
    expect(classAverageRow?.a3_instructorGrade).toBeNull();
    expect(classAverageRow?.a3_avgTeammateScore).toBeNull();
    expect(classAverageRow?.a3_avgAuthorFeedbackScore).toBeNull();
  });

  it("still returns a class average row even when there are no students", () => {
    const rows = buildRows([], assignments);

    expect(rows).toHaveLength(1);
    expect(rows[0].studentName).toBe("Class Average");
  });
});

describe("courseAssignmentOverviewService buildColumns", () => {
  it("places the student name column first and makes it sortable", () => {
    const columns = buildColumns(assignments, visibleFields) as any[];

    expect(columns[0].id).toBe("studentName");
    expect(columns[0].enableSorting).toBe(true);
  });

  it("creates one assignment group per assignment using the assignment name as the header", () => {
    const columns = buildColumns(assignments, visibleFields) as any[];

    expect(columns).toHaveLength(3);
    expect(columns[1].header).toBe("Assignment 3");
    expect(columns[2].header).toBe("Assignment 5");
  });

  it("creates the topic sub-column only for assignments that have topics", () => {
    const columns = buildColumns(assignments, visibleFields) as any[];
    const assignmentThreeColumns = columns[1].columns;
    const assignmentFiveColumns = columns[2].columns;

    expect(assignmentThreeColumns.map((column: any) => column.id)).toContain("a3_topic");
    expect(assignmentFiveColumns.map((column: any) => column.id)).not.toContain("a5_topic");
  });

  it("creates peer grade columns for every assignment", () => {
    const columns = buildColumns(assignments, visibleFields) as any[];

    expect(columns[1].columns.map((column: any) => column.id)).toContain("a3_peerGrade");
    expect(columns[2].columns.map((column: any) => column.id)).toContain("a5_peerGrade");
  });

  it("creates instructor grade columns for every assignment", () => {
    const columns = buildColumns(assignments, visibleFields) as any[];

    expect(columns[1].columns.map((column: any) => column.id)).toContain("a3_instructorGrade");
    expect(columns[2].columns.map((column: any) => column.id)).toContain("a5_instructorGrade");
  });

  it("creates teammate score columns for every assignment", () => {
    const columns = buildColumns(assignments, visibleFields) as any[];

    expect(columns[1].columns.map((column: any) => column.id)).toContain("a3_avgTeammateScore");
    expect(columns[2].columns.map((column: any) => column.id)).toContain("a5_avgTeammateScore");
  });

  it("creates author feedback score columns for every assignment", () => {
    const columns = buildColumns(assignments, visibleFields) as any[];

    expect(columns[1].columns.map((column: any) => column.id)).toContain("a3_avgAuthorFeedbackScore");
    expect(columns[2].columns.map((column: any) => column.id)).toContain("a5_avgAuthorFeedbackScore");
  });

  it("marks every generated assignment sub-column as sortable", () => {
    const columns = buildColumns(assignments, visibleFields) as any[];
    const assignmentColumns = [...columns[1].columns, ...columns[2].columns];

    expect(assignmentColumns.every((column: any) => column.enableSorting)).toBe(true);
  });

  it("stores visibility metadata for the generated sub-columns", () => {
    const columns = buildColumns(assignments, visibleFields) as any[];
    const assignmentThreeColumns = columns[1].columns;

    expect(
      assignmentThreeColumns.find((column: any) => column.id === "a3_topic").meta
    ).toEqual({ requestedVisible: false });
    expect(
      assignmentThreeColumns.find((column: any) => column.id === "a3_peerGrade").meta
    ).toEqual({ requestedVisible: true });
    expect(
      assignmentThreeColumns.find((column: any) => column.id === "a3_instructorGrade").meta
    ).toEqual({ requestedVisible: false });
    expect(
      assignmentThreeColumns.find((column: any) => column.id === "a3_avgTeammateScore").meta
    ).toEqual({ requestedVisible: true });
    expect(
      assignmentThreeColumns.find((column: any) => column.id === "a3_avgAuthorFeedbackScore").meta
    ).toEqual({ requestedVisible: true });
  });

  it("renders class average cells in bold through the generated cell renderer", () => {
    const columns = buildColumns(assignments, visibleFields) as any[];
    const studentNameCell = columns[0].cell({
      row: { original: { studentName: "Class Average", isClassAverage: true } },
      getValue: () => "Class Average",
    });

    expect(React.isValidElement(studentNameCell)).toBe(true);
    expect((studentNameCell as React.ReactElement).props.className).toBe("fw-bold");
  });
});
