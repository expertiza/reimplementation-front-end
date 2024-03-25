import React from "react";
import { Link } from "react-router-dom";

const StudentTask: React.FC = () => {
  const assignment_id = 4; // Define assignment ID

  return (
    <div>
      <br></br><br></br>
      {/* Create a Link to the StudentTaskView component with the assignment ID as a route parameter */}
      <Link to={`/student_task_view/${assignment_id}`}>Assignment {assignment_id+1}</Link>
    </div>
  );
};

export default StudentTask;
