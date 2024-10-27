import React from 'react';
import styles from './StudentTasksBox.module.css';

type Revision = {
    name: string;
    dueDate: string;
};

type DueTask = {}; // Adjust this type as needed

interface StudentTasksBoxProps {
    participantTasks: DueTask;
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
    for (const semester in studentsTeamedWith) {
        // Add the number of students in each semester to the total count
        totalStudents += studentsTeamedWith[semester].length;
    }

    // Calculate the number of revisions that are still pending (i.e., due date is in the future)
    const pendingRevisions = revisions.filter(revision => getDaysLeft(revision.dueDate) > 0);

    return (
        <div className={styles.container}>
            <div className={styles.infoBox}>
                <h2>Task Summary</h2>
                <p>Due Tasks: {String(participantTasks)}</p>
                <p>Revisions: {pendingRevisions.map(revision => revision.name).join(", ")}</p> {/* Display only pending revisions */}
            </div>
            <div className={styles.tableContainer}>
                {/* Render your table here */}
                {/* Example: <Table data={tableData} columns={tableColumns} /> */}
                <table>
                    <thead>
                        <tr>
                            <th>Task</th>
                            <th>Due Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Assuming participantTasks is an array, replace this with actual data */}
                        {/* Example placeholder */}
                        <tr>
                            <td>Task 1</td>
                            <td>2024-10-31</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            {/* This div should be below the tableContainer */}
            <div className={styles.teamedStudents}>
                <p>Total Students Teamed With: {totalStudents}</p>
            </div>
        </div>
    );
};

export default StudentTasksBox;
