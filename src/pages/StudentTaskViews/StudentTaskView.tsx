import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { loadAssignment } from 'pages/Assignments/AssignmentUtil';
import { RootState } from "../../store/store";
import { ROLE } from '../../utils/interfaces';
import { styles } from './StudentTaskViewStyle';
import { deadlines, getNextDeadline } from './DeadlineUtil';

const StudentTaskView: React.FC = () => {
  const [assignment, setAssignment] = useState<any>(null); // State for assignment data
  const { id } = useParams<{ id: string }>();
  const auth = useSelector( // Using useSelector hook to access Redux store
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );

  useEffect(() => { // Fetch assignment data on component mount
    const fetchAssignment = async () => {
      try {
        const assignmentData = await loadAssignment({ params: { id } });
        setAssignment(assignmentData);
      } catch (error) {
        console.error('Error fetching assignment:', error);
      }
    };

    fetchAssignment(); // Call fetchAssignment function

    return () => {
      // Cleanup code here
    };
  }, [id]); // Include id in the dependency array to re-fetch assignment data when ID changes

  if (!assignment) { // If assignment data hasn't been fetched yet, display loading message
    return <div>Loading...</div>;
  }

  const authorization = 'participant'; // Mock authorization data
  const can_review = true; // Mock data for review permission
  const team = true; // Mock data for team permission
  const can_take_quiz = true; // Mock data for quiz permission
  const can_provide_suggestions = true; // Mock data for suggestion permission
  const nextDeadline = getNextDeadline(); // Get next deadline
  const showWork = checkShowWork(authorization, nextDeadline); // Check if work should be shown

  return (
    <div className="container">
      <h1 className="display-4 font-custom">
        <span style={styles.statusP} className="font-custom">
          Submit or Review work for {assignment.name}
        </span>
      </h1>
      {can_review && checkReviewAvailability() && checkReviewableTopics() && ( // Conditionally render button based on review availability
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary">
            {/* <a href={`email_reviewers_student_task_index_path?id=${auth.user.id}&assignment_id=${assignment.id}`} style={{ color: 'white', textDecoration: 'none' }}> */}
            <a href={``} style={{ color: 'white', textDecoration: 'none' }}>
              Send Email to Reviewers
            </a>
          </button>
        </div>
      )}
      {assignment.spec_location && assignment.spec_location.length > 0 && ( // Display assignment description if available
        <div className="mb-4">
          <a href={assignment.spec_location} target="_blank" rel="noopener noreferrer">
            Assignment Description
          </a>
        </div>
      )}
      <ul className="list-unstyled mb-4">
        {authorization === 'participant' && ( // Display team management option for participants
          <li className="mb-2">
            <a href="#" className="btn btn-outline-primary">
              Your team
            </a>{' '}
            View and manage your team
          </li>
        )}
        {auth.user.role === ROLE.TA && ( // Display all teams option for TAs
            <li className="mb-2">
              <a href="#" className="btn btn-outline-primary">All teams</a> View teams
            </li>
          )}
    
          {showWork && ( // Display work submission/review options
            <li className="mb-2">
              {checkIsSubmitDeadline(nextDeadline) && (
                <span>
                  <a href="#" className="btn btn-outline-success">Your work</a>
                  <span> Submit work </span>
                </span>
              )}
              {checkIsReviewDeadline(nextDeadline) && (
                <span>
                  Your work <span style={{ color: 'red' }}>You are not allowed to submit you work right now</span>
                </span>
              )}
            </li>
          )}
          {!showWork && ( // Display message if user is not allowed to submit work
            <li className="mb-2">
              You are not allowed to submit you work right now
            </li>
          )}
    
          {(authorization === 'participant' || can_review) && ( // Display option to give feedback to others
            <li className="mb-2">
              <a href="#" className="btn btn-outline-primary">Others' work</a> Give feedback to others on their work
            </li>
          )}
          {auth.user.role === ROLE.TA && assignment.require_quiz && (authorization === 'participant' || can_take_quiz) && ( // Display option to take quizzes
            <li className="mb-2">
              <a href="#" className="btn btn-outline-primary">Take quizzes</a> Quizzes read
            </li>
          )}
          {team && (authorization === 'participant' || checkIsSubmitDeadline(nextDeadline)) && ( // Display option to view scores
            <li className="mb-2">
              <a href="#" className="btn btn-outline-primary">Your scores</a> View feedback on your work &nbsp;
              <a href="#" className="btn btn-outline-secondary">Alternate view</a>
            </li>
          )}
          {auth.user.role === ROLE.TA && can_provide_suggestions && ( // Display option to suggest topics
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
      <div style={styles.scrollable} className="scrollable">
        <ul style={styles.timeline} className="timeline">
          {deadlines.map(renderDeadline)} {/* Map deadlines to renderDeadline function */}
        </ul>
      </div>
      <button className="btn btn-secondary mt-3" onClick={() => window.history.back()}>
        Back
      </button>
    </div>
  );

  function checkShowWork(authorization: string, nextDeadline: any) { // Check if work should be shown
    const isReview = checkIsReviewDeadline(nextDeadline);
    const isSubmit = checkIsSubmitDeadline(nextDeadline);
    return authorization === 'participant' && (isReview || isSubmit);
  }
  
  function checkIsReviewDeadline(deadline: any) { // Check if deadline is for review
    return deadline && deadline.description.startsWith('Review');
  }
  
  function checkIsSubmitDeadline(deadline: any) { // Check if deadline is for submission
    return deadline && deadline.description.startsWith('Submit');
  }
  
  function checkReviewAvailability() { // Logic to determine review availability
    return true;
  }

  function checkReviewableTopics() { // Logic to check if topics are reviewable
    return true;
  }
  
  function isDeadlinePassed(deadline: any) { // Check if deadline is passed
    const now = new Date();
    return new Date(deadline.date) <= now;
  }

  function checkShowLink(index: number, deadlines: any[]) { // Check if link should be shown for a deadline
    if (index === 0) {
      return !isDeadlinePassed(deadlines[index]);
    } else {
      const previousDeadline = deadlines[index - 1];
      const isPreviousDeadlinePassed = isDeadlinePassed(previousDeadline);
      const isPresentDeadlinePassed = isDeadlinePassed(deadlines[index]);
      return isPreviousDeadlinePassed && !isPresentDeadlinePassed;
    }
  }

  function renderDeadline(deadline: any, index: number) { // Render each deadline
    return (
      <li key={deadline.id} style={styles.li} className={isDeadlinePassed(deadline) ? 'li complete' : 'li'}>
        <div style={styles.timestamp} className="timestamp">
          <p>{deadline.date}</p>
        </div>
        <div style={styles.status} className="status">
          <p style={styles.statusP}>
            {deadline.id && checkShowLink(index, deadlines) ? ( // Conditionally render link based on deadline status
              <a href={`controller: 'response', action: 'view', id: ${deadline.id}`} target="_blank">
                {deadline.description}
              </a>
            ) : (
              deadline.description
            )}
          </p>
          <div style={isDeadlinePassed(deadline) ? { ...styles.statusBefore, ...styles.completeStatusBefore } : styles.statusBefore}></div>
        </div>
      </li>
    );
  }
};

export default StudentTaskView;