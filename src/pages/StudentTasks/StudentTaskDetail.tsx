import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./StudentTaskDetail.module.css";
import axiosClient from "utils/axios_client";

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
  const { stages, current_stage } = MockedStudentTaskDetails;

  const [tasks, setTasks] = useState<any>(null);
  useEffect(() => {
    const fetchStudentTasks = async () => {
      try {
        const response = await axiosClient.get(`/student_tasks/list`);
        setTasks(response.data);
        console.log("hello", response.data);
      } catch (error) {
        console.error("Error fetching student tasks:", error);
      }
    };
 
 
    fetchStudentTasks();
  }, []);
 
 
  const [assignments, setAssignmetns] = useState<any>(null);
  useEffect(() => {
    const fetchStudentTasks = async () => {
      try {
        const response = await axiosClient.get(`/assignments`);
        setTasks(response.data);
        console.log("hello assignment", response.data);
      } catch (error) {
        console.error("Error fetching student tasks:", error);
      }
    };
 
 
    fetchStudentTasks();
  }, []);
 

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          Submit or review work for{" "}
          <Link to={`/program/${id}`} className={styles.programLink} style={{ color: 'black' }}>
            {MockedStudentTaskDetails.assignment.name}
            
          </Link>
        </h1>
      </div>

      <div className={styles.flash_note}>
        Next: Click the activity you wish to perform on the assignment titled:{" "}
        {MockedStudentTaskDetails.assignment.name}
      </div>

      <Link
        to={`/program/${id}/email-reviewers`}
        className={`${styles.clickableLink} ${styles.link_to_right}`}
        style={{ color: '#A90201' }}
      >
        Send Email To Reviewers
      </Link>

      <div className={styles.taskLinks}>
        <ul className={styles.taskList}>
          <li className={styles.taskItem}>
            <Link to={`/program/${id}/team`} className={styles.clickableLink} style={{ marginLeft: '1px', marginRight: '2px' }}>
              Your team
            </Link>
            <span className={styles.taskDescription}> (View and manage your team)</span>
          </li>
          <li className={styles.taskItem}>
            <Link to={`/program/${id}/work`} className={styles.clickableLink} style={{ marginLeft: '1px', marginRight: '2px' }}>
              Your work
            </Link>
            <span className={styles.taskDescription}> (View your work)</span>
          </li>
          <li className={styles.taskItem}>
            <Link to={`/program/${id}/feedback`} className={styles.clickableLink} style={{ marginLeft: '1px', marginRight: '2px' }}>
              Other's work
            </Link>
            <span className={styles.taskDescription}> (Give feedback to others on their work)</span>
          </li>
          <li className={styles.taskItem}>
            <Link to={`/program/${id}/scores`} className={styles.clickableLink} style={{ marginLeft: '1px', marginRight: '2px' }}>
              Your scores
            </Link>
            <span className={styles.taskDescription}> (View feedback on your work)</span>
            <Link to={`/program/${id}/scores/alternative`} className={styles.clickableLink} style={{ marginLeft: '1px', marginRight: '2px' }}>
              Alternative View
            </Link>
          </li>
          <li className={styles.taskItem}>
            <Link to={`/program/${id}/handle`} className={styles.clickableLink} style={{ marginLeft: '1px', marginRight: '2px' }}>
              Change your handle
            </Link>
            <span className={styles.taskDescription}>
              {" "}
              (Provide a different handle for this assignment)
            </span>
          </li>
        </ul>
      </div>

<div style={{ maxWidth: '1000px', margin: '0 auto' }}>
  <div className={styles.timelineContainer}>
    {/* Dates */}
    <div
      className={styles.timelineDates}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}
    >
      {stages.map((stage) => (
        <span
          key={stage.name}
          style={{
            flex: 1,
            textAlign: 'center',
            minWidth: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {new Date(stage.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}
        </span>
      ))}
    </div>

    {/* Visual timeline */}
    <div className={styles.timelineVisual}>
      <div className={styles.timelineLine}></div>
      <div
        className={styles.timelineDots}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {stages.map((stage) => (
          <div
            key={stage.name}
            className={`${styles.dot} ${
              stage.status === "current" ? styles.currentDot : ""
            }`}
            title={stage.name}
            style={{
              margin: '0 auto',
              // Optionally, if you want dots to be exactly centered in their column
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
            }}
          ></div>
        ))}
      </div>
    </div>

    {/* Deadlines/Links */}
    <div
      className={styles.timelineDeadlines}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '12px',
      }}
    >
      {stages.map((stage) => (
        <Link
          key={stage.name}
          to={`/program/${id}/${stage.name
            .toLowerCase()
            .replace(/\s+/g, "-")}`}
          className={styles.clickableLink}
          style={{
            flex: 1,
            textAlign: 'center',
            minWidth: 0,
            whiteSpace: 'nowrap',
            fontSize: '1.15rem',
            fontWeight: '100',
          }}
        >
          {stage.name} deadline
        </Link>
      ))}
    </div>
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