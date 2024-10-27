import React from 'react'
import styles from './StudentTasksBox.module.css'

type Revision = {
    name: string;
    dueDate: string;
}
type StudentsTeamedWith = {
    [semester: string]: string[];
};
type dueTask = {};

interface StudentTasksBoxProps {
    participantTasks: dueTask; // might be wrong
    revisions: Revision[];
    studentsTeamedWith: StudentsTeamedWith;
}

const getDaysLeft = (dueString: string) => {
    // calc number days left till due date
    const today: Date = new Date();
    const dueDate: Date = new Date(dueString);
    const timeToDueDate = dueDate.getTime() - today.getTime();
    const daysLeftTillDueDate = Math.ceil(timeToDueDate / (1000 * 60 * 60 * 24));
    if (daysLeftTillDueDate < 0) { return 0 }
    else { return daysLeftTillDueDate }
};

const StudentTasksBox: React.FC<StudentTasksBoxProps> = ({ participantTasks, revisions, studentsTeamedWith }) => {
    // calc total number of students teamed up with
    let totalStudents = 0;
    for (const semester in studentsTeamedWith) {
        totalStudents = totalStudents + studentsTeamedWith[semester].length;
    }

    // calc number of revisions remaining
    const pendingRevisions = revisions.filter(revisions => getDaysLeft(revisions.dueDate) > 0);

    return (
        <div>
            <p>Due Tasks: {participantTasks}</p>
            <p>Revisions: {revisions.join(", ")}</p>
            <p>Total Students Teamed With: {totalStudents}</p>
        </div>
    );
};

export default StudentTasksBox;