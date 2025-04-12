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

const StudentTaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.header}>
          Submit or review work for{" "}
          <Link to={`/program/${id}`} className={styles.programLink}>
            {MockedStudentTaskDetails.assignment.name}
          </Link>
        </h1>
        <Link to={`/program/${id}/email-reviewers`} className={styles.clickableLink}>
          Send Email To Reviewers
        </Link>
      </div>

      <div className={styles.flash_note}>
        Next: Click the activity you wish to perform on the assignment titled: {MockedStudentTaskDetails.assignment.name}
      </div>

      <div className={styles.taskLinks}>
        <ul className={styles.taskList}>
          <li className={styles.taskItem}>
            <Link to={`/program/${id}/team`} className={styles.taskMainLink}>
              Your team
            </Link>
            <span className={styles.taskDescription}> (View and manage your team)</span>
          </li>
          <li className={styles.taskItem}>
            <Link to={`/program/${id}/work`} className={styles.taskMainLink}>
              Your work
            </Link>
            <span className={styles.taskDescription}> (View your work)</span>
          </li>
          <li className={styles.taskItem}>
            <Link to={`/program/${id}/feedback`} className={styles.taskMainLink}>
              Other's work
            </Link>
            <span className={styles.taskDescription}> (Give feedback to others on their work)</span>
          </li>
          <li className={styles.taskItem}>
            <Link to={`/program/${id}/scores`} className={styles.taskMainLink}>
              Your scores
            </Link>
            <span className={styles.taskDescription}> (View feedback on your work)</span>
            <Link to={`/program/${id}/scores/alternative`} className={styles.alternativeView}>
              Alternative View
            </Link>
          </li>
          <li className={styles.taskItem}>
            <Link to={`/program/${id}/handle`} className={styles.taskMainLink}>
              Change your handle
            </Link>
            <span className={styles.taskDescription}>
              {" "}
              (Provide a different handle for this assignment)
            </span>
          </li>
        </ul>
      </div>

      {/** TODO: Need to redo, using responsiveness component  */}
      <div className={styles.timelineContainer}>
        <div className={styles.timelineDates}>
          <span>Wed, 13, Jun 2025 23:59</span>
          <span>Wed, 23, Jun 2025 23:59</span>
          <span>Thu, 30, Jun 2025 23:59</span>
        </div>
        <div className={styles.timelineVisual}>
          <div className={styles.timelineLine}></div>
          <div className={styles.timelineDots}>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
          </div>
        </div>
        <div className={styles.timelineDeadlines}>
          <Link to={`/program/${id}/submission`} className={styles.deadlineLink}>Submission deadline</Link>
          <Link to={`/program/${id}/review`} className={styles.deadlineLink}>Review deadline</Link>
          <Link to={`/program/${id}/peer-review`} className={styles.deadlineLink}>Peer Review deadline</Link>
        </div>
      </div>

      {/* Footer section */}
      <div>
        <Link to="/student_tasks" className={styles.clickableLink}>
          Back
        </Link>
      </div>
      <div className={styles.footer}>
        <div>
          <Link
            to="https://wiki.expertiza.ncsu.edu/index.php/Expertiza_documentation"
            className={styles.clickableLink}
          >
            Help
          </Link>
          <Link
            to="https://research.csc.ncsu.edu/efg/expertiza/papers"
            className={styles.clickableLink}
          >
            Papers on Expertiza
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentTaskDetail;
