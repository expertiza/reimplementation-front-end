import React, { useState, useEffect, useCallback } from 'react';
import testData from './testData.json';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { RootState } from 'store/store';
import StudentTasksBox from './StudentTasksBox';

import styles from './StudentTasks.module.css';

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

const StudentTasksHome: React.FC = () => {
    // init state and hooks
    const currUserId = testData.current_user_id;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const auth = useSelector((state: RootState) => state.authentication)

    // states to hold tasks
    const taskRevisions = testData.revisions;
    const participantTasks = testData.participantTasks;
    const [tasks, setTasks] = useState<Task[]>([]);
    const dueTasks = testData.dueTasks;
    const studentsTeamedWith = testData.studentsTeamedWith;

    function togglePublishingRights(id: number): void {
        throw new Error('Function not implemented.');
    }

    useEffect(() => {
        // Map the data from participationTasks to the tasks state
        const mappedTasks = participantTasks.map(task => ({
            id: task.id,
            assignment: task.assignment,
            course: task.course,
            topic: task.topic,
            currentStage: task.current_stage, // Adjust to match your data's structure
            reviewGrade: task.review_grade, // Can be a string or an object
            badges: task.badges, // Keep as is since it can be string or boolean
            stageDeadline: task.stage_deadline, // Adjust to match your data's structure
            publishingRights: task.publishing_rights, // Boolean type
        }));

        setTasks(mappedTasks);
    }, [participantTasks]);

    return (
        <div className="assignments-page">
            <h1 className="assignments-title">Assignments</h1>
            <div className={styles.pageLayout}>
                <aside className={styles.sidebar}>
                    <StudentTasksBox
                        participantTasks={dueTasks}
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
                                {<th>Badges</th>}
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
                                    {<td>{task.badges}</td>}
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

export default StudentTasksHome;