import React from 'react';
import './StudentTask.css';

interface StudentTaskProps {
    assignmentName: string;
  }

  interface TimelineItem {
    date: string;
    label: string;
  }
  
  const items: TimelineItem[] = [
    { date: 'Fri, 27 Sep 2024 23:59', label: 'Submission deadline' },
    { date: 'Mon, 30 Sep 2024 23:59', label: 'Review deadline' },
    { date: 'Thu, 03 Oct 2024 23:59', label: 'Submission deadline' },
    { date: 'Sat, 05 Oct 2024 14:34', label: 'Round 2 peer review' },
    { date: 'Tue, 30 Nov 2024 23:59', label: 'Review deadline' }
  ];

  const StudentTask: React.FC<StudentTaskProps> = ({ assignmentName }) => {
    const currentDate = new Date();

  const getStatusClass = (date: string) => {
    const deadline = new Date(date);
    if (currentDate > deadline) return 'past-deadline';
    else return 'approaching-deadline';
    return '';
  };

    return (
      <div className="student-task-container">
        <h1>Submit or Review work for {assignmentName}</h1>
        <div className="instruction">
          Next: Click the activity you wish to perform on the assignment titled: {assignmentName}
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
      
      {/* <div className="timeline">
        <div className="timeline-item">
          <div className="timeline-circle"></div>
          <span className="timeline-date">Fri, 27 Sep 2024 23:59</span>
          <span className="timeline-label">Submission deadline</span>
        </div>
        
        <div className="timeline-item">
          <div className="timeline-circle"></div>
          <span className="timeline-date">Mon, 30 Sep 2024 23:59</span>
          <span className="timeline-label">Review deadline</span>
        </div>
        
        <div className="timeline-item">
          <div className="timeline-circle"></div>
          <span className="timeline-date">Thu, 03 Oct 2024 23:59</span>
          <span className="timeline-label">Submission deadline</span>
        </div>

        <div className="timeline-item">
          <div className="timeline-circle"></div>
          <span className="timeline-date">Sat, 05 Oct 2024 14:34</span>
          <span className="timeline-label">Round 2 peer review</span>
        </div>
        
        <div className="timeline-item">
          <div className="timeline-circle"></div>
          <span className="timeline-date">Tue, 08 Oct 2024 23:59</span>
          <span className="timeline-label">Review deadline</span>
        </div>
      </div> */}

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
        {/* <a href="#">Back</a> | <a href="#">Help</a> | <a href="#">Papers on Expertiza</a> */}
        <a href="javascript:window.history.back()">Back</a>
        <a href="http://wiki.expertiza.ncsu.edu/index.php/Expertiza_documentation" target="_blank">Help</a> |
        <a href="http://research.csc.ncsu.edu/efg/expertiza/papers" target="_blank">Papers on Expertiza</a>
      </div>
    </div>
  );
};

export default StudentTask;
