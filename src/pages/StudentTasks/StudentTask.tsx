import React from 'react';
import './StudentTask.css';
import dummyData from './DummyData.json';

interface StudentTaskProps {
    assignmentName: string;
}

interface TimelineItem {
    date: string;
    label: string;
}
  

const StudentTask: React.FC = () => {
    const assignmentName = dummyData.assignmentName;
    const items: TimelineItem[] = dummyData.timeline;
    const currentDate = new Date();

    const getStatusClass = (date: string) => {
        const deadline = new Date(date);
        if (currentDate > deadline) return 'past-deadline';
        else return 'approaching-deadline';
    };
    const handleSendEmail = () => {
        window.location.href = "mailto:reviewers@example.com?subject=Review Reminder&body=Please review the submission for Program 2.";
    };


    return (
    <div className="student-task-container">
        <h1>Submit or Review work for {assignmentName}</h1>
        <div className="instruction">
        Next: Click the activity you wish to perform on the assignment titled: {assignmentName}
        </div>

        <div style={{ position: 'relative'}}>
            <button
                onClick={handleSendEmail}
                style={{
                position: 'absolute',
                right: '20px',
                backgroundColor: 'transparent',
                color: '#986633',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
                }}
            >
                Send Email To Reviewers
            </button>
        </div>
    
        <ul className="actions">
            <li><a href="#">Your team</a> (View and manage your team)</li>
            <li><a href="#">Your work</a> (View your work)</li>
            <li><a href="#">Others' work</a> (Give feedback to others on their work)</li>
            <li>
            <a href="#">Your scores</a> (View feedback on your work) 
            <span> | </span>
            <a href="#">Alternate View</a>
            </li>
            <li><a href="#">Change your handle</a> (Provide a different handle for this assignment)</li>
        </ul>
        
        <div className="timeline">
        {items.map((item, index) => (
            <div key={index} className={`timeline-item ${getStatusClass(item.date)}`}>
                <li>
            <div className="timeline-circle"></div>
            <span className="timeline-date">{item.date}</span>
            <span className="timeline-label">{item.label}</span>
            </li>
            </div>
            
        ))}
        </div>


        <div className="footer">
            <a href="javascript:window.history.back()">Back</a> |
            <a href="http://wiki.expertiza.ncsu.edu/index.php/Expertiza_documentation" target="_blank">Help</a> |
            <a href="http://research.csc.ncsu.edu/efg/expertiza/papers" target="_blank">Papers on Expertiza</a>
        </div>
    </div>
);
};

export default StudentTask;
