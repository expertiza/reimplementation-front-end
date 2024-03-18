import React from 'react';
import { useCallback, useEffect, useMemo, useState } from "react";
import { loadAssignment } from "pages/Assignments/AssignmentUtil";
import TA from "pages/TA/TA";
// import RoleEditor, { loadAvailableRole } from "./pages/Roles/RoleEditor";
// import Roles, { loadRoles } from "./pages/Roles/Roles";
import { ROLE } from "../../utils/interfaces";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import ProtectedRoute from "../../router/ProtectedRoute";
import { hasAllPrivilegesOf } from "../../utils/util";
const styles = `
.timeline {
  list-style-type: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.li {
  transition: all 200ms ease-in;
  height: 140px;
}

.timestamp
{
  margin-bottom: 20px;
}

.status {
  display: flex;
  justify-content: center;
  border-top: 2px solid #D6DCE0;
  position: relative;
  transition: all 200ms ease-in;
}

.status p {
  margin-top: 10px;
}

.status:before {
  content: "";
  width: 25px;
  height: 25px;
  background-color: white;
  border-radius: 25px;
  border: 1px solid #ddd;
  position: absolute;
  top: -15px;
  left: 8%;
  transition: all 200ms ease-in;
}

.li.complete .status {
  border-top: 2px solid #A90201;
}

.li.complete .status p {
}

.li.complete .status:before {
  background-color: #A90201;
  border: none;
  transition: all 200ms ease-in;
}

@media (min-device-width: 320px) and (max-device-width: 700px) {
  .timeline {
    list-style-type: none;
    display: block;
  }

  .li {
    transition: all 200ms ease-in;
    display: flex;
    width: inherit;
  }

  .timestamp {
    width: 100px;
  }
}
.scrollable{
  height: auto;
  overflow-y: auto;
}`;


const StudentTaskView: React.FC = () => {
  // Mock data for demonstration
  
    <h1>Student Task View</h1>

    //need to extract assignment details by its ID which is a prop
    // const assignment = {
    //   name: 'Assignment Name',
    //   spec_location: 'http://example.com/assignment_spec',
    //   max_team_size: 3, 
    //   require_quiz: true, 
    //   is_selfreview_enabled: true, 
    //   current_stage: (topic_id: any) => 'Active', 
    // };

    interface Deadline {
      id: number;
      date: string;
      description: string;
    }

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
    const can_submit = true;
    const can_review = true;
    const can_take_quiz = true;
    const team = true;
    const can_provide_suggestions = true;
    const review_deadline = (assignment: any) => true;

    // Mock review_deadline function for demonstration
    const check_reviewable_topics = (assignment: any) => true;


    // Mock unsubmitted_self_review function for demonstration
     const unsubmitted_self_review = (participantId: any) => false; 

     const deadlines: Deadline[] = [
      {
        id: 1,
        date: "2024-03-15",
        description: "Submit Assignment 1",

      },
      {
        id: 2,
        date: "2024-03-16",
        description: "Review Assignment 1",
      },
      {
        id: 3,
        date: "2024-03-28",
        description: "Submit Assignment 2",
      },
      {
        id: 4,
        date: "2024-04-02",
        description: "Review Assignment 2",
      },
    ];
    const styles = {
      timeline: {
        listStyleType: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      li: {
        transition: 'all 200ms ease-in',
        height: '140px',
      },
      timestamp: {
        marginBottom: '20px',
      },
      status: {
        display: 'flex',
        justifyContent: 'center',
        borderTop: '2px solid #D6DCE0',
        position: 'relative' as 'relative',
        transition: 'all 200ms ease-in',
      },
      statusP: {
        marginTop: '10px',
      },
      statusBefore: {
        content: "''",
        width: '25px',
        height: '25px',
        backgroundColor: 'white',
        borderRadius: '25px',
        border: '1px solid #ddd',
        position: 'absolute' as 'absolute',
        top: '-15px',
        left: '8%',
        transition: 'all 200ms ease-in',
      },
      completeStatus: {
        borderTop: '2px solid #A90201',
      },
      completeStatusBefore: {
        backgroundColor: '#A90201',
        border: 'none',
        transition: 'all 200ms ease-in',
      },
      scrollable: {
        height: 'auto',
        overflowY: 'auto' as const,
      },
    };

    return (
      <div>
        <h1>
          {/* {assignment.spec_location && assignment.spec_location.length > 0 ? (
            <a href={assignment.spec_location} target="_blank" rel="noopener noreferrer">
              Submit or Review work for {assignment.name}
            </a>
          ) : (
            'Submit or Review work for ${assignment.name}'
          )} */}
          <span>Submit or Review work for {assignment.name}</span>

        </h1>
        {/* <div className="flash_note">Next click {assignment.name}</div> */}
        <div style={{ float: 'right' }}>
          {can_review && review_deadline(assignment) && check_reviewable_topics(assignment) && (
            <button>
              <a href={'email_reviewers_student_task_index_path?id=${participant.id}&assignment_id=${assignment.id}'}>
                Send Email to Reviewers
              </a>
            </button>
          )}
        </div>
        {assignment.spec_location && assignment.spec_location.length > 0 && (
          <a href={assignment.spec_location} target="_blank" rel="noopener noreferrer">
            Assignment Description
          </a>
        )}
        <ul>
          {assignment.max_team_size > 0 && authorization === 'participant' && (
            <li>
              <a href="#">Your team</a> View team
            </li>
          )}
      
          {auth.user.role===ROLE.TA && (
            <li>
              <a href="#">All teams</a> View team
            </li>
          )}
          {(authorization === 'participant' || can_submit) && (
            <li>
              <a href="#">Your work</a> Submit work
            </li>
          )}
          {(authorization === 'participant' || can_review) && (
            <li>
              <a href="#">Others' work</a> Give feedback
            </li>
          )}
          {auth.user.role===ROLE.TA && assignment.require_quiz && (authorization === 'participant' || can_take_quiz) && (
            <li>
              <a href="#">Take quizzes</a> Quizzes read
            </li>
          )}
          {team && (authorization === 'participant' || can_submit) && (
            <li>
              <a href="#">Your scores</a> View feedback &nbsp;{' '}
              <a href="#">Alternate view</a>
            </li>
          )}
          {auth.user.role===ROLE.TA && can_provide_suggestions && (
            <li>
              <a href="#">Suggest topic</a>
            </li>
          )}
          <li>
            <a href="#">Change handle</a> Different handle
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
                let canSubmit = true;

                if (index > 0) {
                  const previousDeadline = deadlines[index - 1];
                  const isPreviousDeadlinePassed = new Date(previousDeadline.date) <= new Date();
                  canSubmit = isPreviousDeadlinePassed && !isDeadlinePassed;
                }
                else {
                  canSubmit = !isDeadlinePassed; // For the first deadline, check only if the current deadline has not passed
                }

                return (
                  <li key={deadline.id} style={styles.li} className={isDeadlinePassed ? 'li complete' : 'li'}>
                  <div style={styles.timestamp} className="timestamp">
                    <p>{deadline.date}</p>
                  </div>
                  <div style={styles.status} className="status">
                    <p style={styles.statusP}>
                      {deadline.id && canSubmit ? (
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

        <button onClick={() => window.history.back()}>Back</button>
      </div>
    );


      
};

export default StudentTaskView;