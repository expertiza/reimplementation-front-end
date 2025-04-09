import React from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./StudentTaskDetail.module.css";

const StudentTaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.header}>
          Submit or Review work for <Link to={`/program/${id}`} className={styles.programLink}>Program {id}</Link>
        </h1>
        <Link to={`/program/${id}/email-reviewers`} className={styles.emailLink}>
          Send Email To Reviewers
        </Link>
      </div>

      <div className={styles.taskLinks}>
        <div className={styles.taskItem}>
          <Link to={`/program/${id}/team`} className={styles.taskMainLink}>Your Team</Link>
          <span className={styles.taskDescription}> (View and manage your team)</span>
        </div>
        <div className={styles.taskItem}>
          <Link to={`/program/${id}/work`} className={styles.taskMainLink}>Your work</Link>
          <span className={styles.taskDescription}> (View your work)</span>
        </div>
        <div className={styles.taskItem}>
          <Link to={`/program/${id}/feedback`} className={styles.taskMainLink}>Other's work</Link>
          <span className={styles.taskDescription}> (Give feedback to others on their work)</span>
        </div>
        <div className={styles.taskItem}>
          <Link to={`/program/${id}/scores`} className={styles.taskMainLink}>Your scores</Link>
          <span className={styles.taskDescription}> (View feedback on your work)</span>
          <Link to={`/program/${id}/scores/alternative`} className={styles.alternativeView}>Alternative View</Link>
        </div>
        <div className={styles.taskItem}>
          <Link to={`/program/${id}/handle`} className={styles.taskMainLink}>Change your handle</Link>
          <span className={styles.taskDescription}> (Provide a different handle for this assignment)</span>
        </div>
      </div>

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

      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <Link to="/help" className={styles.footerLink}>Help</Link>
          <span className={styles.footerSeparator}>|</span>
          <Link to="/papers" className={styles.footerLink}>Papers on Expertiza</Link>
          <Link to="/student_tasks" className={styles.backLink}>Back</Link>
        </div>
      </div>
    </div>
  );
};

export default StudentTaskDetail;