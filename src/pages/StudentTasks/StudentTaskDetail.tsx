import React from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./StudentTaskDetail.module.css";

// TODO: Mock_Data
const MockedStudentTaskDetails = {
  assignment: {
    name: "Program 1",
    course: "CSC 517",
    topic: "Ruby",
  },
  current_stage: "Review",
  participant: {
    id: 12345,
    permissions: ["submit", "view_grades"],
  },
  stage_deadline: "Feb 26, 2024, 12:00 PM	",
  stages: [
    { name: "Submission", status: "completed", date: "2024-03-14" },
    { name: "Review", status: "current", date: "2024-03-16" },
    { name: "Revision", status: "pending", date: "2024-03-18" },
    { name: "Final Grade", status: "pending", date: "2024-03-20" },
  ],
  permission_granted: true,
};

type StudentTaskDetailsType = typeof MockedStudentTaskDetails;

const StudentTaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const taskDetails = MockedStudentTaskDetails;

  return (
    <div className={styles.container}>
      {/* Add Heading */}
      <header className={styles.header}>Submit or Review work for Program {id}</header>

      <div>
        {/* Add Interative Buttons */}
        Interative Buttons
      </div>

      <div>
        {/* Add Timeline + TimeStage  */}
        Timeline + TimeStage
      </div>

      <div> Footer </div>
      <Link to="/student_tasks" className="back-link">
        Back
      </Link>
    </div>
  );
};

export default StudentTaskDetail;
