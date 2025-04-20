import dummyTopicData from "./Data/DummyTopics.json";
import React, { useState, useMemo } from 'react';
import { Button, Container } from 'react-bootstrap';
import { useLoaderData } from 'react-router-dom';
import Table from "components/Table/Table";
import { createColumnHelper } from "@tanstack/react-table";

interface ReviewerAssignment {
  topic: string;
  contributors: {name: string, username: string}[]; 
  reviewers: { name: string, username: string, status: string }[];
}

const columnHelper = createColumnHelper<ReviewerAssignment>();

const AssignReviewer: React.FC = () => {
const assignment: any = useLoaderData();
  
const [data, setData] = useState<ReviewerAssignment[]>(dummyTopicData);

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
      
  columnHelper.accessor("reviewers", {
    id: 'actions',
    header: "Reviewed By",
    cell: info => {
      const { reviewers, topic } = info.row.original;
      return (
        <div>
          {reviewers.map((r, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: idx % 2 === 0 ? "#e8e8ba" : "#fafad2", // alternating colors
                padding: "6px 8px",
                marginBottom: "6px",
                borderRadius: "4px"
              }}
            >
              <div>{r.name} ({r.status})</div>
              <div>
                <a
                  href="#"
                  style={{textDecoration: "underline", cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault();
                    unsubmitReviewer(topic, r.name);
                  }}
                >
                  Unsubmit
                </a>
              </div>
              <div>
                <a
                  href="#"
                  style={{textDecoration: "underline", cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault();
                    deleteReviewer(topic, r.name);
                  }}
                >
                  Delete
                </a>
              </div>
            </div>
          ))}
        </div>
      );
    }
  }),        
], [data]);
  

  return (
    <div style={{ paddingLeft: 30, paddingRight: 15 }}>
  <div style={{ marginLeft: "auto" }} className="mt-5 mb-4 ml-auto">
    <h1 className="mb-4">Participants</h1>
    <h1 className="mb-5">Assignment: {assignment.name}</h1>
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
      showPagination={false}
      tableClassName="tan-bg-table"
    /> 
    </div>
    
  </div>
</div>
  );
};

export default AssignReviewer;
