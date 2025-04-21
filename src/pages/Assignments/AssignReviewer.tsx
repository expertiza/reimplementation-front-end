import dummyTopicData from "./Data/DummyTopics.json";
import React, { useState, useMemo, useContext } from 'react';
import { Button, Container } from 'react-bootstrap';
import { useLoaderData, useNavigate, Outlet, useParams } from 'react-router-dom';
import Table from "components/Table/Table";
import { createColumnHelper } from "@tanstack/react-table";
import { useReviewerContext } from 'context/ReviewerContext'; 
import { Contributor, TopicWithReviewers } from '../../utils/interfaces'; 


const columnHelper = createColumnHelper<TopicWithReviewers>();

//  Main component to manage reviewers for topics
const AssignReviewer: React.FC = () => {
    const assignment: any = useLoaderData(); // load assignment metadata
    const navigate = useNavigate(); 
    const { id } = useParams(); // get assignment ID from URL 

    const { topics, addReviewerToTopic } = useReviewerContext(); // global state
    const [data, setData] = useState<TopicWithReviewers[]>(topics) // local data 

    // sync local with global
    React.useEffect(() => {
        setData(topics);
    }, [topics]);


    // Handler for Add Reviewer link -- finds topic, adds placeholder reviewer, and navigates to nested route
    const handleAddReviewer = (topicIdentifier: string) => {
        const topic = topics.find(t => t.topic_identifier === topicIdentifier);
        if (!topic) return;
        addReviewer(topicIdentifier); // adds new reviewer
        navigate(`/assignments/edit/${id}/add-reviewer?topic=${encodeURIComponent(topicIdentifier)}`); //TODO determine if this is correct URL for redirect
    };

    // Adds a new placeholder reviewer to the selected topic via context function
    const addReviewer = (topicIdentifier: string) => {
        const topicData = topics.find(t => t.topic_identifier === topicIdentifier); 
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
    // maps to topic and reviewers 
        addReviewerToTopic(topicIdentifier, {
            map_id: reviewerCount + 1,
            reviewer: {
                name: `NewReviewer${reviewerCount + 1}`,
                full_name: `NewReviewer${reviewerCount + 1}`, //TODO check this displays username appropriately
                email: "",
                role_id: 0,
                institution_id: 0
            },
            review_status: "Pending",
            metareview_mappings: []
    });
    };
    // Deletes a reviewer by name from a specific topic (locally only ATM) 
  const deleteReviewer = (topicIdentifier: string, reviewerName: string) => {
    setData(prev =>
        prev.map(row =>
            row.topic_identifier === topicIdentifier
          ? { ...row, reviewers: row.reviewers.filter(r => r.reviewer.name !== reviewerName) }
          : row
      )
    );
  };
    // Resets review status of a reviewer back to "Pending" (simulated unsubmission) (locally only ATM)
  const unsubmitReviewer = (topic: string, reviewerName: string) => {
    setData(prev =>
        prev.map(row =>
            row.topic_identifier === topic
          ? {
              ...row,
              reviewers: row.reviewers.map(r =>
                r.reviewer.name === reviewerName ? { ...r, status: "Pending" } : r
              )
            }
          : row
      )
    );
  };
    // Define the structure and behavior of table columns
  const columns = useMemo(() => [
    columnHelper.accessor("topic_name", { //TODO determine if this should be topic name or identifier
      id: 'select',
      header: "Topic Selected",
      cell: info => info.getValue()
    }),
      columnHelper.display({
          id: "contributors",
          header: "Contributors",
          cell: info => {
              const { topic_identifier, reviewers, contributors } = info.row.original;
              const hasPending = reviewers.some(r => r.review_status === "Pending");
    
        return (
            <div>
                {contributors.map((c: Contributor, idx: number) => (
              <div key={idx}>{c.name}</div>
            ))}
    
            {reviewers.length < 3 && (
              <div className="mt-2">
                <a
                  href="#"
                  style={{textDecoration: "underline", cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault();
                      handleAddReviewer(topic_identifier);
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
                            row.topic_identifier === topic_identifier
                          ? {
                                    ...row,
                                    reviewers: row.reviewers.filter(r => r.review_status !== "Pending")
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
            const { reviewers, topic_identifier } = info.row.original;
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
                <div>{r.reviewer.name} ({r.review_status})</div>
                <div>
                  <a
                    href="#"
                    style={{textDecoration: "underline", cursor: "pointer" }}
                    onClick={(e) => {
                        e.preventDefault();
                        unsubmitReviewer(topic_identifier, r.reviewer.name);
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
                        deleteReviewer(topic_identifier, r.reviewer.name);
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
