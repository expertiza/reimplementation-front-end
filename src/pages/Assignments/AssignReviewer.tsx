import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import dummyTopicData from '../ViewTeamGrades/Data/DummyTopics.json'; 

const AssignReviewer: React.FC = () => {
  const [data, setData] = useState(dummyTopicData);

  const addReviewer = (topic: string) => {
    setData(prev =>
      prev.map(row =>
        row.topic === topic && row.reviewers.length < 3
          ? { ...row, reviewers: [...row.reviewers, { name: `New Reviewer ${row.reviewers.length + 1}`, status: "Pending" }] }
          : row
      )
    );
  };

  const deleteReviewer = (topic: string, reviewerName: string) => {
    setData(prev =>
      prev.map(row =>
        row.topic === topic
          ? { ...row, reviewers: row.reviewers.filter(r => r.name !== reviewerName) }
          : row
      )
    );
  };

  const unsubmitReviewer = (topic: string, reviewerName: string) => {
    setData(prev =>
      prev.map(row =>
        row.topic === topic
          ? {
              ...row,
              reviewers: row.reviewers.map(r =>
                r.name === reviewerName ? { ...r, status: "Pending" } : r
              )
            }
          : row
      )
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Assign Reviewer</h2>
      <h5 className="text-xl font-semibold mb-1">Assignment: [assignment name]</h5>

      <table className="tbl_heat">
        <thead>
          <tr className="bg-gray-200">
            <th>Topic</th>
            <th>Contributors</th>
            <th>Reviewers</th>
          </tr>
        </thead>
        <tbody>
          {data.map((topicItem, index) => (
            <tr key={index}>
              <td>{topicItem.topic}</td>
              <td>
                {topicItem.contributors.map((c, i) => (
                  <div key={i}>
                    {c.name}
                  </div>
                ))}
              </td>
              <td>
                {topicItem.reviewers.map((r, i) => (
                  <div key={i} style={{ marginBottom: '5px' }}>
                    {r.name} ({r.status})
                    {" "}
                    <Button
                      size="sm"
                      variant="warning"
                      style={{ marginLeft: '5px' }}
                      onClick={() => unsubmitReviewer(topicItem.topic, r.name)}
                    >
                      Unsubmit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      style={{ marginLeft: '5px' }}
                      onClick={() => deleteReviewer(topicItem.topic, r.name)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
                {topicItem.reviewers.length < 3 && (
                  <Button
                    size="sm"
                    variant="success"
                    className="mt-2"
                    onClick={() => addReviewer(topicItem.topic)}
                  >
                    Add Reviewer
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-end">
        <Button variant="outline-success" onClick={() => console.log("Assign reviewers")}>
          Assign
        </Button>
      </div>
    </div>
  );
};

export default AssignReviewer;
