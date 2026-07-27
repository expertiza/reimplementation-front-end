/**
 * StudentTasks — the student's "Assignments" dashboard.
 *
 * This component replaced an earlier version that rendered a topic sign-up sheet
 * (with optimistic slot counters, bookmark state, waitlist logic, and 4+ API hooks).
 * That implementation was scoped to a single assignment fetched via :assignmentId in
 * the URL, so it couldn't show a student's full workload across all their courses.
 *
 * The current implementation:
 *
 * 1. Data fetching — one GET /student_tasks/list call returns all assignments the
 *    logged-in student participates in. Each item contains the participant record,
 *    current stage, stage deadline, and derived flags (submissionUpdated, notStarted).
 *
 * 2. Parsing — parseStudentTasks() normalizes the raw API shape into a typed Task[].
 *    Fields are read with ?? fallbacks to tolerate both flat and nested response shapes
 *    (the API embeds some fields directly on the item and others inside item.participant).
 *
 * 3. Grouping — tasksGroupedByCourse groups tasks by course name so each course gets
 *    its own section heading and Table instance.
 *
 * 4. Columns — filteredColumns builds the TanStack Table column definitions:
 *    - "Assignment" links to /student_task_detail/:participantId (full task detail page).
 *    - "Topic" is hidden when no tasks have a topic value.
 *    - "Show as Example?" is a client-side-only toggle (optimistic local state update).
 *
 * 5. Sidebar — StudentTasksBox (StudentTasksList) shows tasks not yet started, revisions
 *    due, and the list of students the current user has teamed with. It receives a
 *    Revision[] derived from the same tasks list via extractAssignments().
 */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import styles from "./StudentTasks.module.css";
import StudentTasksBox, { Revision } from "./StudentTasksList";
import { CellContext } from "@tanstack/react-table";
import Table from "components/Table/Table";
import { formatDate, capitalizeFirstWord } from "utils/dataFormatter";
import axiosClient from "utils/axios_client";
import { Container } from "react-bootstrap";

type Task = {
  id: number;
  assignmentId: number | null;
  assignment: string;
  course: string;
  topic: string;
  currentStage: string;
  stageDeadline: string;
  showAsExample: boolean;
  submissionUpdated: boolean;
  started: boolean;
};

const StudentTasks: React.FC = () => {
  const [studentTasksData, setStudentTasksData] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchStudentTasks = async () => {
      try {
        const response = await axiosClient.get(`/student_tasks/list`);
        setStudentTasksData(response.data || []);
      } catch (error) {
        console.error("Error fetching student tasks:", error);
      }
    };
    fetchStudentTasks();
  }, []);

  useEffect(() => {
    setTasks(parseStudentTasks(studentTasksData));
  }, [studentTasksData]);

  /**
   * Normalizes the raw /student_tasks/list response into typed Task objects.
   * The API embeds some fields directly on the item and others inside item.participant,
   * so ?? chaining is used to try the top-level key first and fall back to the nested one.
   * assignmentId is used later to build the "Your feedbacks" link in StudentTaskDetail.
   */
  function parseStudentTasks(rawList: any[]): Task[] {
    return rawList.map((item) => {
      const participant = item.participant || {};
      const courseName = typeof item.course === "string" ? item.course : "CSC 517";
      
      return {
        id: participant.id,
        assignmentId: participant.parent_id ?? item.assignment_id ?? null,
        assignment: item.assignment ?? "N/A",
        course: courseName,
        topic: item.topic ?? participant.topic ?? "N/A",
        currentStage: item.current_stage ?? participant.current_stage ?? "N/A",
        stageDeadline: item.stage_deadline ?? participant.stage_deadline ?? "",
        showAsExample: item.permission_granted ?? participant.permission_granted ?? false,
        submissionUpdated: item.submission_updated ?? false,
        started: item.started ?? false,
      };
    });
  }

  /**
   * Converts the Task list into the Revision[] shape expected by StudentTasksBox.
   * Strips the ISO timestamp from stageDeadline so the sidebar shows only the date part.
   * submissionUpdated and started flags are computed by the backend based on current stage and
   * whether the participant has submitted any work.
   */
  function extractAssignments(tasksList: Task[]): Revision[] {
    return tasksList.map((task) => ({
      name: task.assignment,
      dueDate: task.stageDeadline ? task.stageDeadline.split("T")[0] : "N/A",
      submissionUpdated: task.submissionUpdated,
      started: task.started,
      currentStage: task.currentStage,
      participantId: task.id,
    }));
  }

  const toggleShowAsExample = useCallback((id: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, showAsExample: !task.showAsExample } : task
      )
    );
  }, []);

  // Hide topic column when no task has a meaningful topic value.
  const showTopic = tasks.some((task) => task.topic && task.topic !== "N/A");

  const filteredColumns = useMemo(() => {
    return [
      {
        accessorKey: "assignment",
        header: "Assignment",
        cell: (info: CellContext<Task, string>) => {
          const id = info.row.original.id;
          return (
            <Link
                to={`/student_task_detail/${id}`}
                state={{ task: info.row.original, assignmentId: info.row.original.assignmentId }}
                style={{ color: "#986633", textDecoration: "none" }}
              >
                {info.getValue()}
              </Link>
          );
        },
      },
      ...(showTopic ? [{ accessorKey: "topic", header: "Topic" }] : []),
      { accessorKey: "currentStage", header: "Current Stage" },
      {
        accessorKey: "stageDeadline",
        header: "Stage Deadline",
      },
      {
        accessorKey: "showAsExample",
        header: "Show as Example?",
        cell: (info: CellContext<Task, boolean>) => (
          <input
            type="checkbox"
            checked={info.getValue()}
            onChange={() => toggleShowAsExample(Number(info.row.original.id))}
          />
        ),
      },
    ].map(({ header, ...rest }) => ({
      ...rest,
      header: capitalizeFirstWord(header as string),
    }));
  }, [showTopic, toggleShowAsExample]);

  // Apply display-layer formatting (date localisation, capitalisation, fallbacks) separately
  // from the raw Task data so the original Task[] stays clean and is usable by other derivations.
  const formattedAssignments = useMemo(() => {
    return tasks.map((task) => ({
      ...task,
      topic: capitalizeFirstWord(task.topic) || "-",
      course: capitalizeFirstWord(task.course),
      stageDeadline: formatDate(task.stageDeadline) || "No deadline",
      showAsExample: task.showAsExample || false,
    }));
  }, [tasks]);

  // Group tasks by course so each course gets a separate heading + Table.
  // Tasks with no course name fall into "Unassigned Courses".
  const tasksGroupedByCourse = useMemo(() => {
    const groups: { [key: string]: typeof formattedAssignments } = {};
    formattedAssignments.forEach((task) => {
      const courseKey = task.course || "Unassigned Courses";
      if (!groups[courseKey]) {
        groups[courseKey] = [];
      }
      groups[courseKey].push(task);
    });
    return groups;
  }, [formattedAssignments]);

  return (
    <div className={styles['assignments-page']}>
      <h1 className={styles['assignments-title']}>Assignments</h1>
      <div className={styles.pageLayout}>
        <aside className={styles.sidebar}>
          <StudentTasksBox
            revisions={extractAssignments(tasks)}
          />
        </aside>

        <div className={styles.mainContent}>
          {Object.entries(tasksGroupedByCourse).map(([courseName, courseTasks]) => (
            
            <div
              key={courseName}
              style={{ width: "75%", margin: "0 0 3rem 0" }}
            >
              <Container fluid>
                <h2 className={styles.courseTitle}>
                  {courseName}
                </h2>
              </Container>

              <Table
                data={courseTasks}
                columns={filteredColumns}
                showGlobalFilter={false}
                showColumnFilter={false}
                showPagination={false}
                disableGlobalFilter={true}
                fluid={true}
                tableSize={{ span: 12, offset: 0 }}
                headingComments={{
                  "Stage deadline": "You can change 'Preferred Time Zone' in 'Profile' in the banner.",
                  "Show as example?": "Present your assignment as an example for future students. Instructors will not be able to see your name or any identifying information when viewing the assignment as an example.",
                }}
              />
            </div>
          ))}
          
          {tasks.length === 0 && <p style={{ textAlign: "center" }}>No assignments found.</p>}
        </div>
      </div>

      <div className={styles.footer}>
        <Link to="https://wiki.expertiza.ncsu.edu/index.php/Expertiza_documentation" className={styles.footerLink}>
          Help
        </Link>
        <Link to="https://research.csc.ncsu.edu/efg/expertiza/papers" className={styles.footerLink}>
          Papers on Expertiza
        </Link>
      </div>
    </div>
  );
};

export default StudentTasks;
