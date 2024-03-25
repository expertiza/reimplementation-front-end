import React from 'react';
import { useEffect, useState } from "react";
import { loadAssignment } from "pages/Assignments/AssignmentUtil";
import { ROLE } from "../../utils/interfaces";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { styles } from './StudentTaskViewStyle';
import { deadlines, getNextDeadline } from './DeadlineUtil';

const StudentTaskView: React.FC = () => {
  
    <h1>Student Task View</h1>

    const auth = useSelector(
      (state: RootState) => state.authentication,
      (prev, next) => prev.isAuthenticated === next.isAuthenticated
    );

    const [assignment, setAssignment] = useState<any>(null); // Initialize state to store assignment data

    useEffect(() => {
      const fetchAssignment = async () => {
        try {
          // Call loadAssignment function with the ID you want to fetch
          const assignmentData = await loadAssignment({ params: { id: '5' } });
          // Set the fetched assignment data to state
          setAssignment(assignmentData);
        } catch (error) {
          console.error('Error fetching assignment:', error);
        }
      };
  
      // Call fetchAssignment function when component mounts
      fetchAssignment();
  
      // Clean-up function to cancel fetch if component unmounts
      return () => {
        // Any cleanup code here, if needed
      };
    }, []); // Empty dependency array ensures useEffect runs only once

    if (!assignment) {
      // If assignment data hasn't been fetched yet, return loading or placeholder UI
      return <div>Loading...</div>;
    }
  

    // Mock authorization data for demonstration
    const authorization = 'participant';
    let can_submit = true;
    const can_review = true;
    const can_take_quiz = true;
    const team = true;
    const can_provide_suggestions = true;
    const review_deadline = (assignment: any) => true;

    // Mock review_deadline function for demonstration
    const check_reviewable_topics = (assignment: any) => true;

    // Mock unsubmitted_self_review function for demonstration
    const unsubmitted_self_review = (participantId: any) => false; 
    
    const nextDeadline = getNextDeadline();
    const isReview = nextDeadline && nextDeadline.description.startsWith("Review");
    const isSubmit = nextDeadline && nextDeadline.description.startsWith("Submit");
    const showWork = authorization === 'participant' && (isReview || isSubmit);

    return (
      <div className="container">
        <h1 className="display-4 font-custom">
          <span style={styles.statusP} className="font-custom">Submit or Review work for {assignment.name}</span>
        </h1>
        <div className="d-flex justify-content-end">
          {can_review && review_deadline(assignment) && check_reviewable_topics(assignment) && (
            <button className="btn btn-primary">
              <a href={'email_reviewers_student_task_index_path?id=${participant.id}&assignment_id=${assignment.id}'} style={{ color: 'white', textDecoration: 'none' }}>
                Send Email to Reviewers
              </a>
            </button>
          )}
        </div>
        {assignment.spec_location && assignment.spec_location.length > 0 && (
          <div className="mb-4"> {/* Added margin-bottom class */}
            <a href={assignment.spec_location} target="_blank" rel="noopener noreferrer">
              Assignment Description
            </a>
          </div>
        )}
        <ul className="list-unstyled mb-4"> {/* Added list-unstyled to remove bullet points and margin-bottom class */}
          {authorization === 'participant' && (
            <li className="mb-2">
              <a href="#" className="btn btn-outline-primary">Your team</a> View and manage your team
            </li>
          )}
    
          {auth.user.role === ROLE.TA && (
            <li className="mb-2">
              <a href="#" className="btn btn-outline-primary">All teams</a> View teams
            </li>
          )}
    
          {showWork && (
            <li className="mb-2">
              {isSubmit && (
                <span>
                  <a href="#" className="btn btn-outline-success">Your work</a>
                  <span> Submit work </span>
                </span>
              )}
              {isReview && (
                <span>
                  Your work <span style={{ color: 'red' }}>You are not allowed to submit you work right now</span>
                </span>
              )}
            </li>
          )}
          {!showWork && (
            <li className="mb-2">
              You are not allowed to submit you work right now
            </li>
          )}
    
          {(authorization === 'participant' || can_review) && (
            <li className="mb-2">
              <a href="#" className="btn btn-outline-primary">Others' work</a> Give feedback to others on their work
            </li>
          )}
          {auth.user.role === ROLE.TA && assignment.require_quiz && (authorization === 'participant' || can_take_quiz) && (
            <li className="mb-2">
              <a href="#" className="btn btn-outline-primary">Take quizzes</a> Quizzes read
            </li>
          )}
          {team && (authorization === 'participant' || can_submit) && (
            <li className="mb-2">
              <a href="#" className="btn btn-outline-primary">Your scores</a> View feedback on your work &nbsp;
              <a href="#" className="btn btn-outline-secondary">Alternate view</a>
            </li>
          )}
          {auth.user.role === ROLE.TA && can_provide_suggestions && (
            <li className="mb-2">
              <a href="#" className="btn btn-outline-primary">Suggest topic</a>
            </li>
          )}
          <li className="mb-2">
            <a href="#" className="btn btn-outline-primary">Change handle</a> Provide a different handle for this assignment
          </li>
        </ul>
        <br />
        <br />
        <h2>Deadlines</h2>
          {/* <div style={{ cssText: styles }}> */}
          <div style={styles.scrollable} className="scrollable">
          
            <ul style={styles.timeline} className="timeline">
                {deadlines.map((deadline, index) => {
                const isDeadlinePassed = new Date(deadline.date) <= new Date();
                let showLink = true;

                if (index > 0) {
                  const previousDeadline = deadlines[index - 1];
                  const isPreviousDeadlinePassed = new Date(previousDeadline.date) <= new Date();
                  showLink = isPreviousDeadlinePassed && !isDeadlinePassed;
                }
                else {
                  showLink = !isDeadlinePassed; // For the first deadline, check only if the current deadline has not passed
                }

                return (
                  <li key={deadline.id} style={styles.li} className={isDeadlinePassed ? 'li complete' : 'li'}>
                  <div style={styles.timestamp} className="timestamp">
                    <p>{deadline.date}</p>
                  </div>
                  <div style={styles.status} className="status">
                    <p style={styles.statusP}>
                      {deadline.id && showLink ? (
                        <a href={`controller: 'response', action: 'view', id: ${deadline.id}`} target="_blank">
                          {deadline.description}
                        </a>
                      ) : (
                        deadline.description
                      )}
                    </p>
                    <div style={isDeadlinePassed ? { ...styles.statusBefore, ...styles.completeStatusBefore } : styles.statusBefore}></div>
                  </div>
                </li>
                );
              })}
            </ul>
          </div>
          {/* </div> */}
        <button className="btn btn-secondary mt-3" onClick={() => window.history.back()}>Back</button>
      </div>
    );
      
};

export default StudentTaskView;