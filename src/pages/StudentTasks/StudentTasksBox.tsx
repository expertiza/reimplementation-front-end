import React from 'react';
import styles from './StudentTasksBox.module.css';

type Revision = {
    name: string;
    dueDate: string;
};

type ReviewGrade = {
    comment: string;
};

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

interface StudentTasksBoxProps {
    participantTasks: Task[];
    revisions: Revision[];
    studentsTeamedWith: StudentsTeamedWith;
}

const getDaysLeft = (dueString: string) => {
    const today: Date = new Date();
    const dueDate: Date = new Date(dueString);
    const timeToDueDate = dueDate.getTime() - today.getTime();
    return Math.ceil(timeToDueDate / (1000 * 60 * 60 * 24));
};

type StudentsTeamedWith = {
    [semester: string]: string[];
};

const StudentTasksBox: React.FC<StudentTasksBoxProps> = ({ participantTasks, revisions, studentsTeamedWith }) => {
    // Calculate total number of students teamed up with by iterating over each semester
    let totalStudents = 0;
    let allStudents: string[] = [];
    for (const semester in studentsTeamedWith) {
        // Add the number of students in each semester to the total count
        totalStudents += studentsTeamedWith[semester].length;
        allStudents = allStudents.concat(studentsTeamedWith[semester]);
    }

    // Calculate the number of revisions that are still pending (i.e., due date is in the future)
    const pendingRevisions = revisions.filter(revision => getDaysLeft(revision.dueDate) > 0);

    const dueTasks = participantTasks.filter(task => getDaysLeft(task.stageDeadline) <= 0);

    console.log("participantTasks2", participantTasks)
    // console.log("revisions", revisions)

    return (
        <div className={styles.container}>
            <h2>Task Summary</h2>
            <div className={styles.infoBox}>
                <p>Due:</p>
                <ul>
                    {dueTasks.map(task => (
                        <li key={task.id}>
                            {task.assignment} ({task.course}) - Due: {task.stageDeadline}
                        </li>
                    ))}
                </ul>
            </div>


            <div className={styles.infoBox}>
                <p>Revisions:</p>
                <ul>
                    {revisions.map((revision, index) => (
                        <li key={index}>{revision.name}</li>
                    ))}
                </ul>
            </div>

            <div className={styles.infoBox}>
                <div className={styles.teamedStudents}>
                    <p>Total Students Teamed With: {totalStudents}</p>
                    <ul>
                        {allStudents.map((student, index) => (
                            <li key={index}>{student}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );

};

export default StudentTasksBox;
