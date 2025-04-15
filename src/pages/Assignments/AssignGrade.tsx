import React from 'react';
import { useLoaderData } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

interface IPeerReview {
  reviewerName: string;
  score: number;
  comment: string;
}

interface IAssignGradeData {
  assignmentId: number;
  assignmentName: string;
  teamName: string;
  submissionSummary: string;
  peerReviews: IPeerReview[];
}

export async function loadAssignGradeData({ params }: any): Promise<IAssignGradeData> {
  return {
    assignmentId: 1,
    assignmentName: 'Program 1',
    teamName: 'Team Hornets',
    submissionSummary:
      'This is a placeholder submission summary describing the tasks, code, or content the team has submitted for the assignment.',
    peerReviews: [
      {
        reviewerName: 'student9183',
        score: 93,
        comment: 'Excellent work! Very thorough and well-documented.',
      },
      {
        reviewerName: 'student9173',
        score: 88,
        comment: 'Good submission, but could use more detailed comments in the code.',
      },
    ],
  };
}

const AssignGrade: React.FC = () => {
  const data = useLoaderData() as IAssignGradeData;

  const [grade, setGrade] = React.useState('');
  const [instructorComment, setInstructorComment] = React.useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Submitting grade data:', {
      assignmentId: data.assignmentId,
      grade,
      instructorComment,
    });

    alert('Grade submitted! (See the console for details.)');
  };

return (
    <>
        {/* Section 1: Header */}
        <Container className="mt-4 mb-4 p-4 border rounded shadow-sm">
            <Row>
                <Col>
                    <h1>Summary Report for assignment: {data.assignmentName}</h1>
                    <p><strong>Team:</strong> {data.teamName}</p>
                </Col>
            </Row>
        </Container>

        {/* Section 2: Submission Summary */}
        <Container className="mb-4 p-4 border rounded shadow-sm">
            <Row>
                <Col>
                    <h3>Submission Summary</h3>
                    <p>{data.submissionSummary}</p>
                </Col>
            </Row>
        </Container>

        {/* Section 3: Peer Review Scores */}
        <Container className="mb-4 p-4 border rounded shadow-sm">
            <Row>
                <Col>
                    <h3>Teammate Review</h3>
                    {data.peerReviews && data.peerReviews.length > 0 ? (
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Reviewer</th>
                                    <th>Score</th>
                                    <th>Comment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.peerReviews.map((review, index) => (
                                    <tr key={index}>
                                        <td>{review.reviewerName}</td>
                                        <td>{review.score}</td>
                                        <td>{review.comment}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No peer reviews found for this assignment.</p>
                    )}
                </Col>
            </Row>
        </Container>

        {/* Section 4: Grade & Comment Form */}
        <Container className="mb-4 p-4 border rounded shadow-sm">
            <Row>
                <Col>
                    <h3>Grade and Comment for Submission</h3>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="gradeInput" className="mb-3">
                            <Form.Label>Grade</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter numeric or letter grade"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="commentInput" className="mb-3">
                            <Form.Label>Comments</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Add any comments for the team here"
                                value={instructorComment}
                                onChange={(e) => setInstructorComment(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" disabled={!grade || !instructorComment}>
                            Submit Grade
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    </>
);
};

export default AssignGrade;
