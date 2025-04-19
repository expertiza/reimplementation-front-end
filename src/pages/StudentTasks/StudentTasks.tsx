import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import styles from "./StudentTasks.module.css";
import StudentTasksBox from "./StudentTasksBox";
import testData from "./testData.json";
import { CellContext } from "@tanstack/react-table"; // or the correct import for your table library
import Table from "components/Table/Table";
import { formatDate, capitalizeFirstWord } from "utils/dataFormatter";
import axiosClient from "utils/axios_client";
import ToolTip from "../../components/ToolTip";

// Define the types for a single task and the associated course
type Task = {
  id: number;
  assignment: string;
  course: string;
  topic: string;
  currentStage: string;
  reviewGrade: string;
  badges: string | boolean;
  stageDeadline: string;
  publishingRights: boolean;
};

// Main functional component for Student Tasks
const StudentTasks: React.FC = () => {
  // Store the studentTaskData
  const [studentTasksData, setStudentTasksData] = useState<any>([]);
  // State to hold tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  // Team test data
  const studentsTeamedWith = testData.studentsTeamedWith;

  // Fetch student tasks from the backend when the component mounts
  useEffect(() => {
    const fetchStudentTasks = async () => {
      try {
        const response = await axiosClient.get(`/student_tasks/list`);
        setStudentTasksData(response.data);
      } catch (error) {
        console.error("Error fetching student tasks:", error);
      }
    };

    fetchStudentTasks();
  }, []);

  // Parse and update tasks whenever studentTasksData changes
  useEffect(() => {
    setTasks(parseStudentTasks(studentTasksData));
  }, [studentTasksData]);

  /**
   * Converts a raw list of student task data into a structured array of Task objects
   */
  function parseStudentTasks(rawList: any[]): Task[] {
    return rawList.map((item) => {
      const participant = item.participant || {};
      const course = item.course || {};
      return {
        id: participant.id,
        assignment: item.assignment ?? "N/A",
        course: course ?? "CSC 517", // Not present in data, defaulting
        topic: participant.topic ?? "N/A",
        currentStage: item.current_stage ?? participant.current_stage ?? "N/A",
        reviewGrade: item.review_grade ?? "N/A",
        badges: item.badges ?? false, // Adjust if you have badges logic elsewhere
        stageDeadline: item.stage_deadline ?? participant.stage_deadline ?? "",
        publishingRights: participant.permission_granted ?? false,
        deadlines: item.deadlines, // Additional fields for StudentTaskDetails
      };
    });
  }

  /**
   * Extracts assignment names and due dates from student task data.
   */
  function extractAssignments(tasks: any[]) {
    return tasks.map((task) => ({
      name: task.assignment,
      dueDate: task.stageDeadline.split("T")[0],
    }));
  }

  /**
   * Handle toggle publishing rights checkbox
   */
  const togglePublishingRights = useCallback((id: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, publishingRights: !task.publishingRights } : task
      )
    );
  }, []);

  const showBadges = tasks.some((task) => task.badges);

  /**
   * Extracts table columns
   */
  const filteredColumns = [
    {
      accessorKey: "assignment",
      header: "Assignment",
      cell: (info: CellContext<Task, string>) => {
        const id = info.row.original.id;
        const matchedTask = tasks.find((task) => task.id === id);
        return (
          <Link to={`/student_task_detail/${id}`} state={{ task: matchedTask }}>
            {info.getValue()}
          </Link>
        );
      },
    },
    { accessorKey: "course", header: "Course" },
    { accessorKey: "topic", header: "Topic" },
    { accessorKey: "currentStage", header: "Current Stage" },
    {
      accessorKey: "reviewGrade",
      header: "Review Grade",
      cell: (info: CellContext<Task, Task["reviewGrade"]>) =>
        info.getValue() === "N/A" ? (
          "NA"
        ) : (
          <ToolTip id="info.row.original" info={info.row.original.reviewGrade || ""} />
        ),
    },
    ...(showBadges ? [{ accessorKey: "badges", header: "Badges" }] : []),
    {
      accessorKey: "stageDeadline",
      header: "Stage Deadline",
      comment: "You can change 'Preferred Time Zone' in 'Profile' in the banner.",
    },
    {
      accessorKey: "publishingRights",
      header: "Publishing Rights",
      cell: (info: CellContext<Task, boolean>) => (
        <input
          type="checkbox"
          checked={info.getValue()}
          onChange={() => togglePublishingRights(Number(info.row.original.id))}
        />
      ),
      comment: "Grant publishing rights",
    },
  ].map(({ header, ...rest }) => ({
    ...rest,
    header: capitalizeFirstWord(header as string),
  }));

  console.log("hello date1", tasks);

  /**
   * Extracts related table records
   */
  const filteredAssignments = tasks.map((task) => ({
    ...task,
    topic: capitalizeFirstWord(task.topic) || "-",
    course: capitalizeFirstWord(task.course),
    reviewGrade: task.reviewGrade || "N/A",
    badges: task.badges || "",
    stageDeadline: formatDate(task.stageDeadline) || "No deadline",
    publishingRights: task.publishingRights || false,
  }));

  // Component render method
  return (
    <div className="assignments-page">
      <h1 className="assignments-title">Assignments</h1>
      <div className={styles.pageLayout}>
        <aside className={styles.sidebar}>
          <StudentTasksBox
            revisions={extractAssignments(tasks)}
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
                "Stage deadline":
                  "You can change 'Preferred Time Zone' in 'Profile' in the banner.",
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