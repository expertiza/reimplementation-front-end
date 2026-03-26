import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table as BTable, Spinner, Alert } from 'react-bootstrap';
import { useAPI } from '../../hooks/useAPI';

interface Answer {
  item_id: number;
  answer: number;
  comments: string;
}

interface InstructorResponse {
  response_id: number;
  additional_comment: string;
  answers: Answer[];
}

interface StudentResponse {
  reviewer_name: string;
  response_id: number;
  is_submitted: boolean;
  updated_at: string;
  additional_comment: string;
  answers: Answer[];
}

interface RubricItem {
  id: number;
  txt: string;
  weight: number;
  seq: number;
  question_type: string;
  min_label?: string;
  max_label?: string;
  break_before?: boolean;
}

interface ItemSummary {
  average: number;
  distribution: { [score: string]: number };
}

interface CalibrationData {
  assignment_id: number;
  team_id: number;
  team_name: string;
  rubric: RubricItem[];
  instructor_response: InstructorResponse | null;
  student_responses: StudentResponse[];
  summary: { [item_id: string]: ItemSummary };
}

const CalibrationReview: React.FC = () => {
  const { id: assignmentId, teamId } = useParams<{ id: string; teamId: string }>();
  const navigate = useNavigate();
  const { sendRequest, isLoading, error } = useAPI();
  const [data, setData] = useState<CalibrationData | null>(null);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState<number>(-1);

  useEffect(() => {
    const fetchData = async () => {
      const result = await sendRequest({
        method: 'GET',
        url: `/assignments/${assignmentId}/calibration_reviews/${teamId}`,
      });
      if (result) {
        setData(result);
      }
    };
    fetchData();
  }, [assignmentId, teamId, sendRequest]);

  if (isLoading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Error loading calibration data: {error}</Alert>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </Container>
    );
  }

  if (!data) return null;

  const { rubric, instructor_response, student_responses, summary, team_name } = data;

  const getBarColor = (score: number, instructorScore: number) => {
    const diff = Math.abs(score - instructorScore);
    if (diff === 0) return '#28a745'; // Green
    if (diff === 1) return '#ffc107'; // Yellow
    if (diff === 2) return '#fd7e14'; // Orange
    return '#dc3545'; // Red
  };

  const renderDistributionChart = (item: RubricItem, itemSummary: ItemSummary, instructorScore?: number) => {
    if (!itemSummary) return null;

    const scores = Object.keys(itemSummary.distribution).map(Number).sort((a, b) => a - b);
    if (scores.length === 0) return <div>No student scores yet.</div>;

    const maxCount = Math.max(...Object.values(itemSummary.distribution));
    
    // Determine the range of scores to display. 
    // Use the scores present in distribution and instructor score.
    const allRelevantScores = [...scores];
    if (instructorScore !== undefined) allRelevantScores.push(instructorScore);
    const minScore = Math.min(...allRelevantScores);
    const maxScore = Math.max(...allRelevantScores);
    
    const displayRange = [];
    for (let i = minScore; i <= maxScore; i++) {
      displayRange.push(i);
    }

    return (
      <div className="mt-2" style={{ width: '100%', height: '120px', display: 'flex', alignItems: 'flex-end', gap: '4px', paddingBottom: '20px', position: 'relative' }}>
        {displayRange.map((score) => {
          const count = itemSummary.distribution[score.toString()] || 0;
          const height = maxCount > 0 ? (count / maxCount) * 80 : 0;
          const isInstructorChoice = score === instructorScore;
          
          return (
            <div key={score} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div 
                style={{ 
                  width: '100%', 
                  height: `${height}%`, 
                  backgroundColor: instructorScore !== undefined ? getBarColor(score, instructorScore) : '#6c757d',
                  border: isInstructorChoice ? '3px solid #000' : '1px solid #ddd',
                  borderRadius: '2px 2px 0 0',
                  position: 'relative'
                }}
                title={`Score ${score}: ${count} students`}
              >
                {count > 0 && <span style={{ fontSize: '10px', position: 'absolute', top: '-15px', width: '100%', textAlign: 'center' }}>{count}</span>}
              </div>
              <span style={{ fontSize: '11px', marginTop: '4px' }}>{score}</span>
            </div>
          );
        })}
        <div style={{ position: 'absolute', bottom: '0', width: '100%', textAlign: 'center', fontSize: '10px', color: '#666' }}>
          Score Distribution (Average: {itemSummary.average})
        </div>
      </div>
    );
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Calibration Review Comparison: {team_name}</h3>
        <Button variant="outline-primary" onClick={() => navigate(`/assignments/edit/${assignmentId}`)}>
          Back to Assignment Editor
        </Button>
      </div>

      <Row>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Header>Student Reviewers</Card.Header>
            <Card.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="list-group">
                <button
                  className={`list-group-item list-group-item-action ${selectedStudentIndex === -1 ? 'active' : ''}`}
                  onClick={() => setSelectedStudentIndex(-1)}
                >
                  Class Summary
                </button>
                {student_responses.map((resp, idx) => (
                  <button
                    key={idx}
                    className={`list-group-item list-group-item-action ${selectedStudentIndex === idx ? 'active' : ''}`}
                    onClick={() => setSelectedStudentIndex(idx)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span>{resp.reviewer_name}</span>
                      <small>{new Date(resp.updated_at).toLocaleDateString()}</small>
                    </div>
                  </button>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9}>
          {rubric.map((item) => {
            const instAnswer = instructor_response?.answers.find(a => a.item_id === item.id);
            const studentResp = selectedStudentIndex >= 0 ? student_responses[selectedStudentIndex] : null;
            const studAnswer = studentResp?.answers.find(a => a.item_id === item.id);
            const itemSummary = summary[item.id.toString()];

            return (
              <Card key={item.id} className="mb-4 shadow-sm">
                <Card.Body>
                  <Card.Title className="border-bottom pb-2">
                    {item.seq}. {item.txt}
                  </Card.Title>
                  
                  <Row className="mt-3">
                    <Col md={6} className="border-end">
                      <h6>Instructor (Gold Standard)</h6>
                      <div className="p-2 bg-light rounded mb-2">
                        <strong>Score:</strong> {instAnswer ? instAnswer.answer : 'N/A'}
                        <div className="mt-2">
                          <strong>Comments:</strong>
                          <p className="mb-0 text-muted">{instAnswer?.comments || 'No comments.'}</p>
                        </div>
                      </div>
                    </Col>
                    
                    <Col md={6}>
                      {selectedStudentIndex === -1 ? (
                        <>
                          <h6>Class Summary</h6>
                          {itemSummary ? renderDistributionChart(item, itemSummary, instAnswer?.answer) : 'No summary data available for this item type.'}
                        </>
                      ) : (
                        <>
                          <h6>Student: {studentResp?.reviewer_name}</h6>
                          <div className={`p-2 rounded mb-2 ${instAnswer && studAnswer && instAnswer.answer === studAnswer.answer ? 'bg-success-subtle' : 'bg-light'}`}>
                            <strong>Score:</strong> {studAnswer ? studAnswer.answer : 'N/A'}
                            {instAnswer && studAnswer && (
                              <span className="ms-2 badge rounded-pill bg-secondary">
                                Diff: {Math.abs(studAnswer.answer - instAnswer.answer)}
                              </span>
                            )}
                            <div className="mt-2">
                              <strong>Comments:</strong>
                              <p className="mb-0 text-muted">{studAnswer?.comments || 'No comments.'}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            );
          })}
          
          <Card className="mb-4 border-primary">
            <Card.Header className="bg-primary text-white">Overall Feedback</Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="border-end">
                  <h6>Instructor</h6>
                  <p className="text-muted">{instructor_response?.additional_comment || 'No overall feedback.'}</p>
                </Col>
                <Col md={6}>
                  {selectedStudentIndex === -1 ? (
                    <p className="text-center text-muted mt-3">Select a student to see their overall feedback.</p>
                  ) : (
                    <>
                      <h6>Student: {student_responses[selectedStudentIndex].reviewer_name}</h6>
                      <p className="text-muted">{student_responses[selectedStudentIndex].additional_comment || 'No overall feedback.'}</p>
                    </>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CalibrationReview;
