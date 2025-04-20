import dummyTopicData from "./Data/DummyTopics.json";
import React, { useState, useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import Table from "components/Table/Table";
import { createColumnHelper } from "@tanstack/react-table";

type Reviewer = {
  name: string;
  username: string;
  status: string;
};

interface ReviewerAssignment {
  topic: string;
  contributors: {name: string, username: string}[]; 
  reviewers: { name: string, username: string, status: string }[];
}

interface ReviewerCardProps {
  reviewer: Reviewer;
  onUnsubmit: () => void;
  onDelete: () => void;
  index: number;
}

const columnHelper = createColumnHelper<ReviewerAssignment>();

const AssignReviewer: React.FC = () => {
const assignment: any = useLoaderData();
  
const [data, setData] = useState<ReviewerAssignment[]>(dummyTopicData);

//Add a reviewer within the contributors row
const addReviewer = (topic: string) => {
  setData(prev =>
    prev.map(row =>
      row.topic === topic && row.reviewers.length < 3
        ? { ...row, reviewers: [...row.reviewers, { name: `NewReviewer${row.reviewers.length + 1}`,
          username: `new_user${row.reviewers.length + 1}`,
            status: "Pending" }] }
        : row
    )
  );
};

//Delete a reviewer from their card
const deleteReviewer = (topic: string, reviewerName: string) => {
  setData(prev =>
    prev.map(row =>
      row.topic === topic
        ? { ...row, reviewers: row.reviewers.filter(r => r.name !== reviewerName) }
        : row
    )
  );
};

//Create a full card object for each reviewer, this makes the column creation simpler
const ReviewerCard: React.FC<ReviewerCardProps> = ({ reviewer, onUnsubmit, onDelete, index }) => {
  return (
    <div
      style={{
        backgroundColor: index % 2 === 0 ? "#e8e8ba" : "#fafad2",
        padding: "6px 8px",
        marginBottom: "6px",
        borderRadius: "4px",
      }}
    >
      <div>{reviewer.name} ({reviewer.status})</div>
      <div>
        <a
          href="#"
          style={{ textDecoration: "underline", cursor: "pointer" }}
          onClick={(e) => {
            e.preventDefault();
            onUnsubmit();
          }}
        >
          Unsubmit
        </a>
      </div>
      <div>
        <a
          href="#"
          style={{ textDecoration: "underline", cursor: "pointer" }}
          onClick={(e) => {
            e.preventDefault();
            onDelete();
          }}
        >
          Delete
        </a>
      </div>
    </div>
  );
};


//Unsubmit a given review within its card
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

const columns = useMemo(() => [
  columnHelper.accessor("topic", {
    id: 'select',
    header: "Topic Selected",
    cell: info => {
      return (
        <div>
          {info.getValue()}
        </div>
      );
    }
  }),
  columnHelper.accessor("contributors", {
    header: "Contributors",
    cell: info => {
      const { contributors, topic, reviewers } = info.row.original;
      const hasPending = reviewers.some(r => r.status === "Pending");
      const index = info.row.index;
      return (
        <div>
          {contributors.map((c, idx) => (
            <div key={idx}>{c.name} ({c.username})</div>
          ))}
  
          {reviewers.length < 3 && (
            <div className="mt-2">
              <a
                href="#"
                style={{textDecoration: "underline", cursor: "pointer" }}
                onClick={(e) => {
                  e.preventDefault();
                  addReviewer(topic);
                }}
              >
                Add Reviewer
              </a>
            </div>
          )}
  
          {hasPending && (
            <div className="mt-2">
              <a
                href="#"
                style={{textDecoration: "underline", cursor: "pointer" }}
                onClick={(e) => {
                  e.preventDefault();
                  setData(prev =>
                    prev.map(row =>
                      row.topic === topic
                        ? {
                            ...row,
                            reviewers: row.reviewers.filter(r => r.status !== "Pending")
                          }
                        : row
                    )
                  );
                }}
              >
                Delete Outstanding Reviews
              </a>
            </div>
          )}
        </div>
      );
    }
  }),
  
  // Create the reviewers column and associated buttons
  columnHelper.accessor("reviewers", {
    id: 'actions',
    header: "Reviewed By",
    cell: info => {
      const { reviewers, topic } = info.row.original;
      return (
        <>
          {reviewers.map((r, idx) => (
            <ReviewerCard
              key={r.name}
              reviewer={r}
              index={idx}
              onUnsubmit={() => unsubmitReviewer(topic, r.name)}
              onDelete={() => deleteReviewer(topic, r.name)}
            />
          ))}
        </>
      );
    }
  }),
         
], [data]);
  
  return (
    <div style={{ paddingLeft: 15, paddingRight: 15 }}>
      <div style={{ marginLeft: "0" }} className="mt-5 mb-4 ml-auto">
        <h2 className="mb-4" style={{ textAlign: "left" }}>Participants</h2>
        <h3 className="mb-5">Assignment: {assignment.name}</h3>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-start", width: "100%", margin: 0 }}>
        <div style={{
            margin: 0,
            padding: 0,
            flex: "1 1 auto", // ensure it fills available space
            width: "100%",    // prevent weird shrinking
          }}>
          <Table
            data={data}
            columns={columns}
            columnVisibility={{ id: false }}
            showGlobalFilter={false}
            showColumnFilter={false}
            showPagination={data.length >= 10}
          /> 
        </div>
      </div>
    </div>
  );
};

export default AssignReviewer;
