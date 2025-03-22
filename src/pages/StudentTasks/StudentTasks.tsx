import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { RootState } from "../../store/store";
import useAPI from "hooks/useAPI";
import styles from "./StudentTasks.module.css";
import StudentTasksBox from "./StudentTasksBox";
import testData from "./testData.json";
import { CellContext } from "@tanstack/react-table"; // or the correct import for your table library
import Table from "components/Table/Table";
import { formatDate, capitalizeFirstWord } from "utils/dataFormatter";

// Define the types for a single task and the associated course
type Task = {
  id: number;
  assignment: string;
  course: string;
  topic: string;
  currentStage: string;
  reviewGrade: string | { comment: string };
  badges: string | boolean;
  stageDeadline: string;
  publishingRights: boolean;
};

// Empty props for FC as no props are needed currently
type Props = {};

// Main functional component for Student Tasks
const StudentTasks: React.FC = () => {
  // State and hooks initialization
  const participantTasks = testData.participantTasks;
  const currentUserId = testData.current_user_id;
  const auth = useSelector((state: RootState) => state.authentication);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State to hold tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const exampleDuties = testData.dueTasks;
  const taskRevisions = testData.revisions;
  const studentsTeamedWith = testData.studentsTeamedWith;

  useEffect(() => {
    if (participantTasks) {
      const filteredParticipantTasks = participantTasks.filter(
        (task) => task.participant_id === currentUserId
      );

      const mergedTasks = filteredParticipantTasks.map((task) => {
        return {
          id: task.id,
          assignment: task.assignment,
          course: task.course,
          topic: task.topic || "-",
          currentStage: task.current_stage || "Pending",
          reviewGrade: task.review_grade || "N/A",
          badges: task.badges || "",
          stageDeadline: task.stage_deadline ? formatDate(task.stage_deadline) : "No deadline",
          publishingRights: task.publishing_rights || false,
        };
      });
      setTasks(mergedTasks);
    }
  }, [participantTasks]);

  // Callback to toggle publishing rights
  const togglePublishingRights = useCallback((id: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, publishingRights: !task.publishingRights } : task
      )
    );
  }, []);

  type RowData = {
    assignment: string;
    course: string;
    topic: string;
    currentStage: string;
    reviewGrade: { comment?: string } | "N/A";
    badges?: string;
    stageDeadline: string;
    publishingRights: boolean;
    id: string;
  };
  const showBadges = tasks.some((task) => task.badges);
  const filteredColumns = [
    {
      accessorKey: "assignment",
      header: "Assignment",
      cell: (info: CellContext<RowData, string>) => (
        <Link to={`/student_task_detail/${info.row.original.id}`}>{info.getValue()}</Link>
      ),
    },
    { accessorKey: "course", header: "Course" },
    { accessorKey: "topic", header: "Topic" },
    { accessorKey: "currentStage", header: "Current Stage" },
    {
      accessorKey: "reviewGrade",
      header: "Review Grade",
      cell: (info: CellContext<RowData, RowData["reviewGrade"]>) =>
        info.getValue() === "N/A" ? (
          "NA"
        ) : (
          <img
            src="assets/icons/info.png"
            alt="Review Grade"
            title={
              typeof info.row.original.reviewGrade === "object"
                ? info.row.original.reviewGrade.comment || ""
                : ""
            }
          />
        ),
    },
    ...(showBadges ? [{ accessorKey: "badges", header: "Badges" }] : []),
    {
      accessorKey: "stageDeadline",
      header: "Stage Deadline",
      // comment: "You can change 'Preferred Time Zone' in 'Profile' in the banner.",
    },
    {
      accessorKey: "publishingRights",
      header: "Publishing Rights",
      cell: (info: CellContext<RowData, boolean>) => (
        <input
          type="checkbox"
          checked={info.getValue()}
          onChange={() => togglePublishingRights(Number(info.row.original.id))}
        />
      ),
      // comment: "Grant publishing rights",
    },
  ].map(({ header, ...rest }) => ({
    ...rest,
    header: capitalizeFirstWord(header as string),
  })); // TODO: Format header data, this should be handled by the common Table.

  const filteredAssignments = tasks.map((task) => ({
    id: task.id,
    assignment: task.assignment,
    course: task.course,
    topic: capitalizeFirstWord(task.topic) || "-", // TODO: capitalizeFirstWord should be handle wihtin the common Table
    currentStage: task.currentStage || "Pending",
    reviewGrade: task.reviewGrade || "N/A",
    badges: task.badges || "",
    stageDeadline: task.stageDeadline || "No deadline",
    publishingRights: task.publishingRights || false,
  }));

  // Component render method
  return (
    <div className="assignments-page">
      <h1 className="assignments-title">Assignments</h1>
      <div className={styles.pageLayout}>
        <aside className={styles.sidebar}>
          <StudentTasksBox
            dueTasks={exampleDuties}
            revisions={taskRevisions}
            studentsTeamedWith={studentsTeamedWith}
          />
        </aside>

        {/* Table section */}
        <div className={styles.mainContent}>
          <div className={styles.tableWrapper}>
            <Table
              data={filteredAssignments}
              columns={filteredColumns}
              showGlobalFilter={false}
              showColumnFilter={false}
              showPagination={false}
              tableSize={{ span: 12, offset: 0 }}
              headingComments={{
                "Stage deadline": "You can change 'Preferred Time Zone' in 'Profile' in the banner.",
                "Publishing rights": "Grant publishing rights",
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer section */}
      <div className={styles.footer}>
        <Link
          to="https://wiki.expertiza.ncsu.edu/index.php/Expertiza_documentation"
          className={styles.footerLink}
        >
          Help
        </Link>
        <Link to="https://research.csc.ncsu.edu/efg/expertiza/papers" className={styles.footerLink}>
          Papers on Expertiza
        </Link>
      </div>
    </div>
  );
};

// Export the component for use in other parts of the application
export default StudentTasks;
