import React, { useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Form, Button, Container } from 'react-bootstrap';
import { useReviewerContext } from "../../context/ReviewerContext";
import type { TopicWithReviewers } from "../../utils/interfaces";

const AddReviewer: React.FC = () => {
    //state to track input username
  const [username, setUsername] = useState(''); 

  // hook to retrieve URL params
  const [searchParams] = useSearchParams(); 
  const { id } = useParams();

    // Extract relevant query parameters from the URL
  const contributorName = searchParams.get('contributor');
  const assignmentName = searchParams.get('assignment');
  const contributorId = searchParams.get('contributor_id');
  const topicIdentifier = searchParams.get('topic'); 

  const navigate = useNavigate();

  // Access context for topics and updater function
  const { addReviewerToTopic, topics} = useReviewerContext();

    // Handler for form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicIdentifier) return; //error handling, ensures topic is defined

      // Find the relevant topic from the list
      const topic = topics.find((t: TopicWithReviewers) => t.topic_name === topicIdentifier);
      const reviewerCount = topic ? topic.reviewers.length : 0;

      // Add a new reviewer using the context function
      addReviewerToTopic(topicIdentifier, {
          map_id: reviewerCount + 1,
          reviewer: {
          name: username,
          full_name: username,
          email: '',
          role_id: 0,
          institution_id: 0
      },
          review_status: "Pending",
          metareview_mappings: []
});

    //redirect back after updating
      navigate(`/assignments/edit/${id}/assignreviewer`);
      

  };

  return (
      <Container style={{ maxWidth: 800, paddingTop: 30, marginLeft: "auto", flexDirection: "column", }}>
          <div className="mt-5 mb-4">
            <h2 className="mb-4" style={{ textAlign: "left" }}>Add Reviewer</h2>
            <h3 className="mb-2">Contributor: {contributorName}</h3>
              <h3 className="mb-4">Assignment: {assignmentName} </h3> 
            </div>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="usernameInput" className="mb-3">
          <Form.Label>Enter a user login:</Form.Label>
          <Form.Control
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            size="lg"
          />
        </Form.Group>
        <input type="hidden" name="contributor_id" value={contributorId || ''} />
        <Button type="submit" variant="primary">Add Reviewer</Button>
      </Form>
    </Container>
  );
};

export default AddReviewer;
