import React from 'react';
import styles from './StudentTasksBox.module.css';

 type DueTask = {

  };

  type Revision = {
        name: string;
        dueDate: string;
  };

  //Students teamed with data structure
  type StudentsTeamedWith = {
    [semester: string]: string[];
  };

  // interface for Student task box data
  interface StudentTasksBoxProps {
    dueTasks: DueTask[];
    revisions: Revision[];
    studentsTeamedWith: StudentsTeamedWith;
  }
  
  const StudentTasksBox: React.FC<StudentTasksBoxProps> = ({ dueTasks, revisions, studentsTeamedWith }) => {

    let totalStudents = 0;
    for (const semester in studentsTeamedWith) {
        totalStudents += studentsTeamedWith[semester].length;
    }

  // Function to calculate the number of days left until the due date
  const calculateDaysLeft = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const timeDiff = due.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff > 0 ? daysDiff : 0;
  };

  // Find the revisions that have not done yet based on the due date
  const revisedTasks = revisions.filter(revisions => calculateDaysLeft(revisions.dueDate) > 0);

// HTML for student task box
  return (
    <div className={styles.taskbox}>
        <div className={styles.section}>
          <span className={styles.badge}>0</span> &nbsp;
        <strong>Tasks not yet started</strong>
        </div>

    {/* Revisions section (remains empty since revisions array is empty) */}
      <div className={styles.section}>
      <span className={styles.greyBadge}>{revisedTasks.length}</span> &nbsp;
        <strong>Revisions</strong>
        {revisedTasks.map((task, index) => {
                const daysLeft = calculateDaysLeft(task.dueDate);
                return (
                  <div key={index}>
                    &raquo; {task.name} ({daysLeft} day{daysLeft !== 1 ? 's' : ''} left)
                  </div>
                );
              })}
      </div>


      {/* Students who have teamed with you section */}
      <div className={styles.section}>
        <span className={styles.badge}>{totalStudents}</span> &nbsp;
        <strong>Students who have teamed with you</strong>
      </div>
      {Object.entries(studentsTeamedWith).map(([semester, students], index) => (
        <div key={index}>
          <strong>{semester}</strong>
          <span className="badge">{students.length}</span>
          {students.map((student, studentIndex) => (
            <div key={studentIndex}>
              &raquo; {student}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Exporting the component for use in other parts of the application
export default StudentTasksBox;
