import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div>
      <h1>Welcome to Home</h1>
      <Link to="/student_task">
        <button>Go to Student Task</button>
      </Link>
    </div>
  );
};

export default Home;
