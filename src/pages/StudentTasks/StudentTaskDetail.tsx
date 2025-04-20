import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import styles from "./StudentTaskDetail.module.css";
import axiosClient from "utils/axios_client";

// Define interfaces for type safety
interface Deadline {
  id: number;
  date: string;
  description: string;
}

interface TaskData {
  assignment: string;
  badges: boolean;
  course: string;
  currentStage: string;
  deadlines: Deadline[];
  id: number;
  publishingRights: boolean;
  reviewGrade: string;
  stageDeadline: string;
  topic: string;
}

interface StateData {
  task: TaskData;
}

const StudentTaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const stateData = location.state as StateData;
  
  // Log the entire stateData object
  console.log('Complete stateData:', stateData);
  
  // Access data through the task property
  const taskData = stateData?.task || {};
  
  // Extract individual properties with fallbacks
  const assignment = taskData.assignment || "Unknown Assignment";
  const course = taskData.course || "Unknown Course";
  const current_stage = taskData.currentStage || "Not Started";
  const deadlines = taskData.deadlines || [];
  const topic = taskData.topic || "No Topic";
  const permission_granted = taskData.publishingRights || false;
  const stage_deadline = taskData.stageDeadline || null;
  const review_grade = taskData.reviewGrade || "N/A";
  
  // Log the extracted properties
  console.log({
    assignment,
    course,
    current_stage,
    deadlines,
    topic,
    permission_granted,
    stage_deadline,
    review_grade
  });
  
  // Log deadlines as a table for better visualization
  console.table(deadlines);

  // Helper function to determine stage status
  const getStageStatus = (index: number): "completed" | "current" | "pending" => {
    const currentStageIndex = deadlines.findIndex(deadline => 
      deadline.description.toLowerCase().includes(current_stage.toLowerCase()));
    
    if (currentStageIndex === -1) {
      // If current stage not found in deadlines, use date comparison
      const today = new Date("2025-04-19T18:01:00"); // Current date from your context
      const deadlineDate = new Date(deadlines[index].date);
      
      if (deadlineDate < today) return "completed";
      if (index === 0) return "current"; // Default to first stage as current if no match
      return "pending";
    }
    
    if (index < currentStageIndex) return "completed";
    if (index === currentStageIndex) return "current";
    return "pending";
  };

  // Your existing API calls
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
 
  const [assignments, setAssignments] = useState<any>(null);
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axiosClient.get(`/assignments`);
        setAssignments(response.data);
        console.log("hello assignment", response.data);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };
 
    fetchAssignments();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          Submit or review work for{" "}
          <Link to={`/program/${id}`} className={styles.programLink} style={{ color: 'black' }}>
            {assignment}
          </Link>
        </h1>
      </div>

      <div className={styles.flash_note}>
        Next: Click the activity you wish to perform on the assignment titled:{" "}
        {assignment}
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

      
      {/* Timeline section */}
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className={styles.timelineContainer}>
          {/* Dates */}
          <div
            className={styles.timelineDates}
          >
            {deadlines.map((deadline: Deadline) => (
              <span
                key={deadline.id}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  minWidth: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                {new Date(deadline.date).toLocaleDateString('en-US', {
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
  {/* Calculate the gradient stops based on deadline dates */}
  {(() => {
    const today = new Date();
    const totalDeadlines = deadlines.length;
    
    // Find the index where future dates begin
    let futureStartIndex = deadlines.findIndex(d => new Date(d.date) > today);
    if (futureStartIndex === -1) futureStartIndex = totalDeadlines; // All dates are in the past
    
    // Calculate the percentage where the color should change
    const changePoint = futureStartIndex / totalDeadlines * 100;
    
    // Create the gradient style
    const gradientStyle = {
      background: `linear-gradient(to right, 
        var(--timeline-past-color, #ff0000) 0%, 
        var(--timeline-past-color, #ff0000) ${changePoint}%, 
        #D6DCE0 ${changePoint}%, 
        #D6DCE0 100%)`
    };
    
    return (
      <div 
        className={styles.timelineLine} 
        style={{
          ...gradientStyle,
          
        }}
      ></div>
    );
  })()}
  
  <div
    className={styles.timelineDots}
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'relative',
      zIndex: 2
    }}
  >
    {deadlines.map((deadline: Deadline, index: number) => (
      <div
        key={deadline.id}
        className={`${styles.dot} ${
          getStageStatus(index) === "current" ? styles.currentDot : ""
        }`}
        title={deadline.description}
        style={{
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '25px',
          height: '25px',
          borderRadius: '50%',
          backgroundColor: new Date(deadline.date) > new Date() ? 'white' : undefined,
          border: new Date(deadline.date) > new Date() ? '1px solid #E2E2E2' : undefined
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
  {deadlines.map((deadline: Deadline) => {
    // Check if the deadline is a Submission or Review deadline
    const isNonClickable = 
      deadline.description === "Submission deadline" || 
      deadline.description === "Review deadline";
    
    // Conditionally render either a Link or a span
    return isNonClickable ? (
      <span
        key={deadline.id}
        style={{
          flex: 1,
          textAlign: 'center',
          minWidth: 0,
          whiteSpace: 'nowrap',
          fontSize: '1.15rem',
          fontWeight: '100',
        }}
      >
        {deadline.description}
      </span>
    ) : (
      <Link
        key={deadline.id}
        to={`/program/${id}/${deadline.description
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
        {deadline.description}
      </Link>
    );
  })}
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
