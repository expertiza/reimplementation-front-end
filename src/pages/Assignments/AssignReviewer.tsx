import React from "react";
import dummyTopicData from "../ViewTeamGrades/Data/DummyTopics.json"; // adjust path if needed
import { Button } from "react-bootstrap";

const AssignReviewer: React.FC = () => {
  const handleAddReviewer = (topic: string) => {
    alert(`Add reviewer for topic: ${topic}`);
  };

  const handleUnsubmit = (username: string) => {
    alert(`Unsubmit for ${username}`);
  };
  
  const handleDelete = (username: string) => {
    alert(`Delete reviewer: ${username}`);
  };

  return (
    <div className="container mt-4">
      <h1>Assign Reviewer</h1>
      <h3>Assignment: Final Project (and design doc)</h3>
      
      <table className="table table-bordered mt-4">
        <thead className="thead-light">
          <tr>
            <th>Topic selected</th>
            <th>Contributors</th>
            <th>Reviewed by</th>
            <th>Add reviewer</th>
          </tr>
        </thead>
        
        <tbody>
          {dummyTopicData.map((item, index) => (
            <tr key={index}>
              <td>{item.topic}</td>
              
              <td>
                {item.contributors.map((c, i) => (
                  <div key={i}>
                    {c.name} ({c.username})
                  </div>
                ))}
              </td>
      
            </td>
      
              {item.reviewers.length > 0 ? (
                item.reviewers.map((r, i) => (
              <div key={i}>
              {r.name} ({r.status}){" "}
             {r.status === "Submitted" && (
               <>
            <Button
              variant="link"
              size="sm"
              onClick={() => handleUnsubmit(r.username)}
            >
              Unsubmit
            </Button>
            <Button
              variant="link"
              size="sm"
              onClick={() => alert(`Delete ${r.username}`)}
            >
              Delete
            </Button>
          </>
        )}
      </div>
    ))
  ) : (
    <div>No reviewers</div>
  )}
      <td>
    
      <td>
        <Button
          variant="success"
          size="sm"
          onClick={() => handleAddReviewer(item.topic)}
        >
          Add reviewer
        </Button>
      </td>

   </tr>
   ))}
   </tbody>
 </table>
</div>
  );
};

export default AssignReviewer;
