import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { RootState } from '../../store/store';
import useAPI from 'hooks/useAPI';
import styles from './StudentTasks.module.css';
import StudentTasksBox from './StudentTasksBox';
import testData from './testData.json';

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

  // Effect to process tasks on component mount or update
  useEffect(() => {
    if (participantTasks) {
      const filteredParticipantTasks = participantTasks.filter(task => task.participant_id === currentUserId);

      const mergedTasks = filteredParticipantTasks.map(task => {
        return {
          id: task.id,
          assignment: task.assignment,
          course: task.course,
          topic: task.topic || '-',
          currentStage: task.current_stage || 'Pending',
          reviewGrade: task.review_grade || 'N/A',
          badges: task.badges || '',
          stageDeadline: task.stage_deadline || 'No deadline',
          publishingRights: task.publishing_rights || false
        };
      });
      setTasks(mergedTasks);
    }
  }, [participantTasks]);

  // Callback to toggle publishing rights
  const togglePublishingRights = useCallback((id: number) => {
    setTasks(prevTasks => prevTasks.map(task =>
      task.id === id ? {...task, publishingRights: !task.publishingRights} : task
    ));
  }, []);

  const showBadges = tasks.some(task => task.badges);

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
        <div className={styles.mainContent}>
          <table className={styles.tasksTable}>
            <thead>
              <tr>
                <th>Assignment</th>
                <th>Course</th>
                <th>Topic</th>
                <th>Current Stage</th>
                <th>Review Grade</th>
                {showBadges && <th>Badges</th>}
                <th>
                  Stage Deadline
                  <img src="assets/icons/info.png" alt="Info" title="You can change 'Preferred Time Zone' in 'Profile' in the banner." />
                </th>
                <th>
                  Publishing Rights
                  <img src="assets/icons/info.png" alt="Info" title="Grant publishing rights to make my work available to others over the Web" />
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td><Link to={`/student_task_detail/${task.id}`}>{task.assignment}</Link></td>
                  <td>{task.course}</td>
                  <td>{task.topic}</td>
                  <td>{task.currentStage}</td>
                  <td>
                    {task.reviewGrade === "N/A" ? "NA" :
                      <img src="assets/icons/info.png" alt="Review Grade" title={(task.reviewGrade as any).comment || ''} />
                    }
                  </td>
                  {showBadges && <td>{task.badges}</td>}
                  <td>{task.stageDeadline}</td>
                  <td className={styles.centerCheckbox}>
                    <input
                      type="checkbox"
                      checked={task.publishingRights}
                      onChange={() => togglePublishingRights(task.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer section */}
      <div className={styles.footer}>
        <Link to="https://wiki.expertiza.ncsu.edu/index.php/Expertiza_documentation" className={styles.footerLink}>Help</Link>
        <Link to="https://research.csc.ncsu.edu/efg/expertiza/papers" className={styles.footerLink}>Papers on Expertiza</Link>
      </div>
    </div>
  );
};

// Export the component for use in other parts of the application
export default StudentTasks;
