/**
 * @author Ankur Mundra on May, 2023
 */
import React from "react";
import { Link } from "react-router-dom";
const Home = () => {
  const assignment_id = "5";
  return (
    <div>
      <h1>Welcome Home!</h1>
      <Link to={`/student_task_view?id=${assignment_id}`}>Go to Student Task</Link>
      
    </div>
  );
};

export default Home;
