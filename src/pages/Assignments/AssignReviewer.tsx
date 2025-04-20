import dummyTopicData from "./Data/DummyTopics.json";
import React, { useState, useMemo, useContext } from 'react';
import { Button, Container } from 'react-bootstrap';
import { useLoaderData, useNavigate, Outlet, useParams } from 'react-router-dom';
import Table from "components/Table/Table";
import { createColumnHelper } from "@tanstack/react-table";
import { useReviewerContext } from 'context/ReviewerContext'; 

interface ReviewerAssignment {
  topic: string;
  contributors: string[]; // contributors are just array of string
  reviewers: { name: string, status: string }[];
}

const columnHelper = createColumnHelper<ReviewerAssignment>();

const AssignReviewer: React.FC = () => {
    //const assignment: any = useLoaderData();
    const navigate = useNavigate(); 
    const { id } = useParams(); //gets assignment id 

    const handleAddReviewer = () => {
        addReviewer(topic); 
        navigate(`/assignments/edit/${id}/add-reviewer?topic=${encodeURIComponent(topic)}`);
    };
  
  /*const [data, setData] = useState<ReviewerAssignment[]>*/
  const { topics, addReviewerToTopic } = useReviewerContext(); 
  const data = topics; /*([

    {
      topic: "E2450. Refactor assignments_controller.rb",
      contributors: ["Alice anna", "Bob sam"],
      reviewers: [{ name: "User1", status: "Submitted" }]
    },
    {
      topic: "E2451. Reimplement feedback_response_map.rb",
      contributors: ["Bob sam", "Eve wesley"],
      reviewers: [
        { name: "user2", status: "Pending" },
        { name: "user3", status: "Submitted" }
      ]
    },
    {
      topic: "E2452. Refactor review_mapping_controller.rb",
      contributors: ["Charlie boo"],
      reviewers: []
    },
    {
      topic: "E2458. User management and users table",
      contributors: ["Harley jad", "Javed son", "Leo mee"],
      reviewers: [
        { name: "user2", status: "Pending" },
        { name: "user3", status: "Submitted" }
      ]
    },
    {
      topic: "E2467. UI for View Submissions",
      contributors: ["Shadow box", "Bradon kin"],
      reviewers: [
        { name: "user2", status: "Pending" },
        { name: "user3", status: "Submitted" }
      ]
    }
  ]); */

  const addReviewer = (topic: string) => {
      const topicData = topics.find(t => t.topic === topic);
        const reviewerCount = topicData ? topicData.reviewers.length : 0;
      /*
    setData(prev =>
      prev.map(row =>
        row.topic === topic && row.reviewers.length < 3
          ? { ...row, reviewers: [...row.reviewers, { name: `NewReviewer${row.reviewers.length + 1}`,
            username: `new_user${row.reviewers.length + 1}`,
             status: "Pending" }] }
          : row
      )
    ); */
    addReviewerToTopic(topic, {
        name: `NewReviewer${reviewerCount + 1}`,
        username: `new_user${reviewerCount + 1}`,
        status: "Pending"
    });
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
      cell: info => info.getValue()
    }),
    columnHelper.accessor("contributors", {
      header: "Contributors",
      cell: info => {
        const { contributors, topic, reviewers } = info.row.original;
        const hasPending = reviewers.some(r => r.status === "Pending");
    
        return (
          <div>
            {contributors.map((c, idx) => (
              <div key={idx}>{c}</div>
            ))}
    
            {reviewers.length < 3 && (
              <div className="mt-2">
                <a
                  href="#"
                  style={{textDecoration: "underline", cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddReviewer(topic);
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
    <div style={{ paddingLeft: 15, paddingRight: 0 }}>
  <div className="mt-5 mb-4">
    <h1 className="mb-2">Participants</h1>
              <h1 className="mb-5">Assignment: {assignment.name}</h1>
  </div>

  <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-start", width: "100%" }}>
    <div>
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
          {/*Add outlet for nested route*/}
          <Outlet />
</div>
  );
};

export default AssignReviewer;
