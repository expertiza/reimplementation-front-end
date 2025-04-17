import React, { useState, useMemo } from 'react';
import { Button, Container } from 'react-bootstrap';
import { useLoaderData } from 'react-router-dom';
import Table from "components/Table/Table";
import { createColumnHelper } from "@tanstack/react-table";

interface IReviewerAssignment {
  topic: string;
  contributor: string;
  reviewers: string[]; // Allow multiple reviewers
}
const columnHelper = createColumnHelper<IReviewerAssignment>();

const AssignReviewer: React.FC = () => {
  const assignment: any = useLoaderData();

    // Dummy data for table
  const [data, setData] = useState<IReviewerAssignment[]>([
    { topic: 'Topic A', contributor: 'Alice', reviewers: ['Reviewer 1'] },
    { topic: 'Topic B', contributor: 'Bob', reviewers: ['Reviewer 2', 'Reviewer 3'] },
    { topic: 'Topic C', contributor: 'Charlie', reviewers: [] },
  ]);
  
    const addReviewer = (topic: string) => {
    setData(prevData =>
      prevData.map(row =>
        row.topic === topic && row.reviewers.length < 3
          ? { ...row, reviewers: [...row.reviewers, `Reviewer ${row.reviewers.length + 1}`] }
          : row
      )
    );
  };

  const deleteReviewer = (topic: string, reviewer: string) => {
    setData(prevData =>
      prevData.map(row =>
        row.topic === topic
          ? { ...row, reviewers: row.reviewers.filter(r => r !== reviewer) }
          : row
      )
    );
  };

  const unsubmitReviewer = (topic: string, reviewer: string) => {
    console.log(`Unsubmitted ${reviewer} for topic ${topic}`);
    // Logic for unsubmitting a reviewer can be added here
  };

  const columns = useMemo(() => [
    columnHelper.accessor('topic', {
      header: 'Topic Selected',
      cell: info => info.getValue()
         }),
    
    columnHelper.accessor('contributor', {
      header: 'Contributor',
      cell: info => info.getValue()
    }),

    columnHelper.accessor('reviewers', {
      header: 'Reviewed By',
      cell: info => {
        const { reviewers } = info.row.original;
        const topic = info.row.original.topic;

        return (
          <div style={{ textAlign: 'center' }}>
            {/* Display Reviewers */}
            {reviewers.map((reviewer, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                {reviewer}
                <Button
                  variant="outline-danger"
                  size="sm"
                  style={{ marginLeft: '10px' }}
                  onClick={() => deleteReviewer(topic, reviewer)}
                >
                  Delete
                </Button>
                <Button
                  variant="outline-warning"
                  size="sm"
                  style={{ marginLeft: '5px' }}
                  onClick={() => unsubmitReviewer(topic, reviewer)}
                >
                  Unsubmit
                </Button>
              </div>
            ))}

                        {/* Add Reviewer Button (Visible only if less than 3 reviewers) */}
            {reviewers.length < 3 && (
              <Button
                variant="outline-success"
                size="sm"
                style={{ marginTop: '10px' }}
                onClick={() => addReviewer(topic)}
              >
                Add Reviewer
              </Button>
            )}
          </div>
        );
      }
    }),
  ], [data]);

   <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div style={{ width: '80%' }}>
        <h1 className="text-center mb-4">Assign Reviewer - {assignment.name}</h1>
        <Table
          data={data}
          columns={columns}
          columnVisibility={{
            id: false,
          }}
        />
        <div className="text-right mt-3">
          <Button variant="outline-success" onClick={() => console.log('Reviewers assigned')}>
            Assign
          </Button>
          </div>
      </div>
     export default AssignReviewer;
