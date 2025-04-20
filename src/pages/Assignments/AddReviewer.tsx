import React, { useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Form, Button, Container } from 'react-bootstrap';
import { useReviewerContext } from "@/context/ReviewerContext";
 

const AddReviewer: React.FC = () => {
  const [username, setUsername] = useState('');
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const contributorName = searchParams.get('contributor');
  const assignmentName = searchParams.get('assignment');
  const contributorId = searchParams.get('contributor_id');
  const topicTitle = searchParams.get('topic'); // TODO double check that this is obtained correctly
  const navigate = useNavigate();
  const { addReviewerToTopic, topics} = useReviewerContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle) return; //error handling

    const topic = topics.find(t => t.topic === topicTitle);
    const reviewerCount = topic ? topic.reviewers.length : 0; 

    //update context appropriately 
    addReviewerToTopic(topicTitle, {
        name: `Reviewer${reviewerCount + 1}`,
        username, 
        status: "Pending"
    });

    //redirect back after updating 
      navigate(`/assignments/edit/${id}/assignreviewer`);
  };

  return (
    <Container style={{ maxWidth: 600, paddingTop: 30 }}>
      <h1 className="mb-4">Add Reviewer</h1>
      <h4 className="mb-3">Contributor: {contributorName}</h4>
      <h4 className="mb-4">Assignment: {assignmentName}</h4>
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
