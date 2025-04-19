import React, { useState, useMemo } from 'react';
import { Button, Container } from 'react-bootstrap';
import { useLoaderData } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
 import Table from "components/Table/Table";

interface ReviewerAssignment {
  topic: string;
  contributors: { name: string; username: string }[];
  reviewers: { name: string; username: string; status: string }[];
}
const columnHelper = createColumnHelper<ReviewerAssignment>();

const AssignReviewer: React.FC = () => {
   const assignment: any = useLoaderData();
  
  const [data, setData] = useState<ReviewerAssignment[]>([
    {
      topic: "E2450. Refactor assignments_controller.rb",
      contributors: [
        { name: "Alice anna", username: "alice123" },
        { name: "Bob sam", username: "bob456" },
      ],
      reviewers: [{ name: "User1", username: "username1", status: "Submitted" }],
    },
    {
      topic: "E2451. Reimplement feedback_response_map.rb",
      contributors: [
        { name: "Bob sam", username: "bob123" },
        { name: "Eve wesley", username: "eve123" },
      ],
      reviewers: [
        { name: "user2", username: "username2", status: "Pending" },
        { name: "user3", username: "username3", status: "Submitted" },
      ],
    },
  ]);

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
  const columns = useMemo(
    () => [
      columnHelper.accessor("topic", {
        header: "Topic",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("contributors", {
        header: "Contributors",
        cell: (info) => info.getValue().map((c) => `${c.name}`).join(", "),
      }),
      columnHelper.accessor("reviewers", {
        header: "Reviewed By",
        cell: (info) => {
          const { reviewers, topic } = info.row.original;

  return (
    <div>
              {reviewers.map((r, idx) => (
                <div key={idx}>
                  {r.name} ({r.status}){" "}
                  <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={() => unsubmitReviewer(topic, r.name)}
                  >
                    Unsubmit
                  </Button>{" "}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => deleteReviewer(topic, r.name)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
              {reviewers.length < 3 && (
                <Button
                  variant="outline-success"
                  size="sm"
                  className="mt-2"
                  onClick={() => addReviewer(topic)}
                >
                  Add Reviewer
                </Button>
              )}
            </div>
          );
        },
      }),
    ],
    [data]
  );

  return (
    <Container>
      <h1 className="text-center my-4">Assign Reviewer - {assignment?.name || "Loading..."}</h1>
      <Table data={data} columns={columns} />
      <div className="text-end mt-3">
        <Button variant="success" onClick={() => console.log("Save reviewers")}>
          Assign
        </Button>
      </div>
    </Container>
  );
};

export default AssignReviewer;
