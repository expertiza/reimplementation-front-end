/**
 * StudentTaskDetail — the per-assignment detail page reached by clicking an assignment
 * name in the StudentTasks dashboard.
 *
 * Three data sources are combined:
 *   - router state (location.state): summary fields (assignment name, currentStage, etc.)
 *     passed via Link state= in StudentTasks. Available immediately for a fast header render.
 *   - GET /student_tasks/show/:participantId: full task data (permissions, stage, etc.)
 *   - GET /participants/:participantId/timeline: due dates and submitted review activity.
 *     Fetched separately so the detail page renders immediately and the timeline loads independently.
 *
 * Timeline rendering:
 *   - timeline entries are sorted by date and displayed as three aligned rows:
 *       Row 1: formatted date + time labels
 *       Row 2: visual track line with colored nodes (completed=red filled, current=pulsing,
 *               pending=grey outline)
 *       Row 3: deadline names, linked to /responses/:id for submitted responses
 *   - progressPercent drives a CSS linear-gradient on the track line so the red portion
 *     advances to the midpoint of the current stage node.
 *   - Date parsing handles both ISO (YYYY-MM-DD) and legacy dd-mm-yyyy formats from the API.
 *
 */
import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./StudentTaskDetail.module.css";
import axiosClient from "utils/axios_client";

/** One entry in the assignment timeline returned by GET /participants/:id/timeline. */
interface DueDates {
  id: number | null;       // response ID if the student submitted one; null for unsubmitted deadlines
  type: number;            // numeric stage type code from the backend
  name: string;            // human-readable stage label, e.g. "Submission deadline"
  date: string;            // ISO 8601 or legacy dd-mm-yyyy date string
  round: number | null;    // review round this deadline belongs to; null for non-review stages
}

/** Summary fields passed via React Router link state from the StudentTasks dashboard. */
interface TaskData {
  assignment: string;      // assignment name shown in the page heading
  course: string;
  currentStage: string;    // active stage name, e.g. "submission" — used to highlight the timeline node
  id: number;              // participant ID (also used as the URL param)
  showAsExample: boolean;  // whether the student has opted to share their work as an example
  stageDeadline: string;   // deadline for the current stage
  topic: string;
}

/** Shape of location.state passed by StudentTasks when navigating to this page. */
interface StateData {
  task: TaskData;
  assignmentId?: number;   // participant.parent_id — used to build the "Your feedback" link
}

const StudentTaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const stateData = location.state as StateData;
  
  // 1. Establish a single, consistent baseline instance for "today"
  const today = useMemo(() => new Date(), []);

  // 2. Fetch task details and timeline events independently
  const [apiData, setApiData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [timelineData, setTimelineData] = useState<DueDates[]>([]);
  const [isTimelineLoading, setIsTimelineLoading] = useState(true);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axiosClient.get(`/student_tasks/show/${id}`);
        setApiData(response.data);
      } catch (error: any) {
        if (error?.response?.status === 403 || error?.response?.status === 404) {
          navigate("/");
          return;
        }
        console.error("Error fetching student task details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTimeline = async () => {
      try {
        setIsTimelineLoading(true);
        const response = await axiosClient.get(`/participants/${id}/timeline`);
        setTimelineData(response.data);
      } catch (error: any) {
        console.error("Error fetching timeline:", error);
      } finally {
        setIsTimelineLoading(false);
      }
    };

    fetchTaskDetails();
    fetchTimeline();
  }, [id]);

  // Permissions from the participant object in the API response
  const canSubmit = apiData?.participant?.can_submit !== false;
  const canReview = apiData?.participant?.can_review !== false;
  const canTakeQuiz = apiData?.participant?.can_take_quiz === true;

  // Router state has camelCase summary fields; API has snake_case + due_dates
  const assignment = apiData?.assignment || stateData?.task?.assignment || "Unknown Assignment";
  const current_stage = apiData?.current_stage || stateData?.task?.currentStage || "Not Started";

  // Parse timeline entries from the dedicated timeline API response.
  // The backend may return dates in ISO 8601 (YYYY-MM-DDTHH:MM:SSZ) or legacy dd-mm-yyyy HH:MM:SS format.
  // Only the legacy format is reformatted — ISO strings already parse correctly in all browsers.
  const due_dates: DueDates[] = useMemo(() => {
    const normalized = timelineData.map((due: any) => {
      let safeDateString = due.date;

      // Only reformat dd-mm-yyyy strings; skip ISO dates (which already start YYYY-)
      if (due.date && due.date.includes('-') && !/^\d{4}-/.test(due.date)) {
        const [datePart, timePart] = due.date.split(' ');
        const [day, month, year] = datePart.split('-');
        safeDateString = `${year}-${month}-${day}T${timePart || "00:00:00"}`;
      }

      return {
        id: due.id ?? null,
        type: due.type,
        name: due.name || "Unknown Stage",
        date: safeDateString || new Date().toISOString(),
        round: due.round ?? null
      };
    });
    return normalized.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [timelineData]);

  /**
   * Determines the visual status of a due-date node for the timeline.
   * Primary path: find the index of the due_date whose name matches current_stage
   * (e.g. "submission" matches "Submission deadline"). Nodes before it are "completed",
   * the matching node is "current", nodes after are "pending".
   * Fallback (when no name match): treat the first future due_date as "current" and
   * everything before it as "completed". This handles stages like "In progress" that
   * don't map directly to a due_date name.
   */
  const getStageStatus = (index: number): "completed" | "current" | "pending" => {
    const currentStageIndex = due_dates.findIndex(due_date => 
      due_date.name.toLowerCase().includes(current_stage.toLowerCase())
    );
    
    // Fallback: If "In progress" doesn't strictly string-match "Submission" or "Review"
    if (currentStageIndex === -1) {
      const deadlineDate = new Date(due_dates[index].date);
      if (deadlineDate > today) {
        const firstFutureIndex = due_dates.findIndex(d => new Date(d.date) > today);
        return index === firstFutureIndex ? "current" : "pending";
      }
      return "completed";
    }
    
    if (index < currentStageIndex) return "completed";
    if (index === currentStageIndex) return "current";
    return "pending";
  };

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: "40px" }}>Loading task details...</div>;
  }

  // Compute how far along the timeline track line should be filled red.
  // Uses step-based calculation (each node occupies 100/N %) rather than wall-clock time,
  // so equally spaced nodes visually represent equal progress regardless of real duration.
  // The active node's midpoint is used so the red line ends at the center of the current dot.
  const progressPercent = (() => {
    const totalCount = due_dates.length;
    if (totalCount === 0) return 0;

    const activeIndex = due_dates.findIndex((_, idx) => getStageStatus(idx) === "current");
    
    if (activeIndex === -1) {
      const allPast = due_dates.every(d => new Date(d.date) < today);
      return allPast ? 100 : 0;
    }

    const stepSize = 100 / totalCount;
    return (activeIndex * stepSize) + (stepSize / 2);
  })();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          Submit or Review work for{" "}
          <span className={styles.programLink} style={{ color: 'black' }}>
            {assignment}
          </span>
        </h1>
      </div>


      <div className={styles.taskLinks} style={{ position: "relative" }}>
        <Link
          to="/email_the_author"
          className={styles.emailButton}
        >
          Send email to reviewers
        </Link>
        <ul className={styles.taskList}>
          <li className={styles.taskItem}>
            <Link to="/student_teams/view" className={styles.clickableLink}>Your team</Link>
            <span className={styles.taskDescription}> (View and manage your team)</span>
          </li>
          {canSubmit && (
            <li className={styles.taskItem}>
              <Link to={`/student_tasks/${id}`} className={styles.clickableLink}>Your work</Link>
              <span className={styles.taskDescription}> (View your work)</span>
            </li>
          )}
          {canTakeQuiz && (
            <li className={styles.taskItem}>
              <Link to="/student_quizzes" className={styles.clickableLink}>Take quiz</Link>
              <span className={styles.taskDescription}> (Take a quiz before reviewing others' work)</span>
            </li>
          )}
          {(canReview || canTakeQuiz) && (
            <li className={styles.taskItem}>
              <Link to="/reviews" className={styles.clickableLink}>Others' work</Link>
              <span className={styles.taskDescription}> (Give feedback to others on their work)</span>
            </li>
          )}
          {/* Links to /view-team-grades using assignmentId (participant.parent_id on the backend) */}
          {(stateData?.assignmentId ?? apiData?.participant?.parent_id) != null && (
            <li className={styles.taskItem}>
              <Link
                to={`/view-team-grades?assignmentId=${stateData?.assignmentId ?? apiData?.participant?.parent_id}`}
                className={styles.clickableLink}>Your feedback</Link>
              <span className={styles.taskDescription}> (View scores and feedback on your work)</span>
            </li>
          )}
          <li className={styles.taskItem}>
            <Link to="/profile" className={styles.clickableLink}>Change your handle</Link>
            <span className={styles.taskDescription}> (Provide a different handle for this assignment)</span>
          </li>
        </ul>
      </div>

      {/* Unified Timeline Container Wrapper */}
      <div style={{ maxWidth: '1400px', margin: '1.5rem auto' }}>
        {isTimelineLoading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Loading timeline...</div>
        ) : due_dates.length === 0 ? null : (
        <div className={styles.timelineContainer}>
          
          {/* Row 1: Calendar Date Headings */}
          <div className={styles.timelineDates} style={{ display: 'flex', width: '100%' }}>
            {due_dates.map((due_date: DueDates, index: number) => (
              <div
                key={`${due_date.name}-date-${index}`}
                style={{ flex: 1, minWidth: 0, textAlign: 'center', fontSize: '12px', lineHeight: '1.3' }}
              >
                {(() => {
                  const d = new Date(due_date.date);
                  const datePart = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
                  const timePart = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
                  return (
                    <>
                      <div>{datePart}</div>
                      <div>{timePart}</div>
                    </>
                  );
                })()}
              </div>
            ))}
          </div>

          {/* Row 2: Dynamic Visual Line Progression and Nodes */}
          <div className={styles.timelineVisual} style={{ width: '100%', position: 'relative' }}>
            
            {/* Dynamic Colored Timeline Track Line (Overrides solid background with inline linear gradient) */}
            <div 
              className={styles.timelineLine} 
              style={{
                height: '4px',
                backgroundImage: `linear-gradient(to right, #dc3545 0%, #dc3545 ${progressPercent}%, #D6DCE0 ${progressPercent}%, #D6DCE0 100%)`,
                backgroundColor: 'transparent',
                width: '100%'
              }}
            />
            
            {/* Nodes Stacked Directly on top of the track line */}
            <div className={styles.timelineDots} style={{ width: '100%', display: 'flex' }}>
              {due_dates.map((due_date: DueDates, index: number) => {
                const status = getStageStatus(index);
                const isPast = status === "completed";
                const isCurrent = status === "current";
                
                return (
                  <div 
                    key={`${due_date.name}-dot-${index}`} 
                    style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
                  >
                    <div
                      className={`${styles.dot}`}
                      title={due_date.name}
                      style={{
                        margin: 0, // Clears the layout shifting from stylesheet margin-top
                        backgroundColor: isPast || isCurrent ? '#dc3545' : 'var(--dot-pending-bg)',
                        border: isPast || isCurrent ? 'none' : '2px solid #D6DCE0',
                        boxShadow: isCurrent ? '0 0 0 5px rgba(220, 53, 69, 0.25)' : 'none',
                        width: isCurrent ? '24px' : '18px',
                        height: isCurrent ? '24px' : '18px',
                        borderRadius: '50%',
                        zIndex: 4
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 3: Target Deadlines / Link Anchors */}
          <div className={styles.timelineDeadlines} style={{ display: 'flex', width: '100%' }}>
            {due_dates.map((due_date: DueDates, index: number) => {
              const isNonClickable = due_date.id === null || due_date.id === undefined;
              
              // Base shared column block sizing styles
              const containerStyles: React.CSSProperties = {
                flex: 1, 
                textAlign: 'center', 
                minWidth: 0,
                display: 'inline-block'
              };

              return isNonClickable ? (
                <span key={`${due_date.name}-lbl-${index}`} style={containerStyles}>
                  {due_date.name}
                </span>
              ) : (
                <div key={`${due_date.name}-lbl-${index}`} style={containerStyles}>
                  <Link
                    to={`/responses/${due_date.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.deadlineLink}
                    style={{ display: 'block', width: '100%' }}
                  >
                    {due_date.name}
                  </Link>
                </div>
              );
            })}
          </div>

        </div>
        )}
      </div>

      <div style={{ marginTop: '30px' }}>
        <Link to="/student_tasks" className={styles.clickableLink}>
          Back
        </Link>
      </div>

      <div className={styles.footer}>
        <div>
          <Link to="https://wiki.expertiza.ncsu.edu/index.php/Expertiza_documentation" className={styles.clickableLink}>
            Help
          </Link>
          <Link to="https://research.csc.ncsu.edu/efg/expertiza/papers" className={styles.clickableLink}>
            Papers on Expertiza
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentTaskDetail;
