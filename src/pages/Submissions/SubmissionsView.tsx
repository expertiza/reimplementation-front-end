import { useEffect, useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import SubmissionList from "./SubmissionTable/SubmissionList";

const SubmissionView = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<any[]>([]);
  const [assignmentFilter, setAssignmentFilter] = useState<string>("");

  // Dummy assignments for filtering
  const assignments = ["Assignment 1", "Assignment 2", "Assignment 3"];

  useEffect(() => {
    // Simulating data fetching
    const fetchSubmissions = async () => {
      const date = new Date(Date.parse('04 Dec 2021 00:12:00 GMT'));
      const data = Array.from({ length: 23 }, (_, i) => {
        const id = i + 1;
        const teamNumber = 38121 + i;
        const assignmentNumber = (i % 5) + 1;
        const studentCount = (i % 3) + 1;
        const currentDate = new Date(new Date().setDate(date.getDate() + i));
      
        const members = Array.from({ length: studentCount }, (_, j) => ({
          name: `Student ${10000 + i * 10 + j}`,
          id: 10000 + i * 10 + j,
        }));
      
        const links = [
          { url: `https://github.com/example/repo${id}`, displayName: "GitHub repository" },
          { url: `http://example.com/submission${id}`, displayName: "Submission link" },
        ];
      
        const fileInfo = [
          {
            name: `README.md`,
            size: `${(Math.random() * 15 + 10).toFixed(1)} KB`,
            dateModified: formatDate(currentDate),
          },
        ];
      
        return {
          id,
          teamName: `Anonymized_Team_${teamNumber}`,
          assignment: `Assignment ${assignmentNumber}`,
          members,
          links,
          fileInfo,
        };
      });

      setSubmissions(data);
      setFilteredSubmissions(data);
    };

    fetchSubmissions();
  }, []);

  const formatDate = (date: Date) => {
      const padZero = (num: number) => String(num).padStart(2, '0');
    
      const year = String(date.getFullYear()) // Last two digits of the year
      const month = padZero(date.getMonth() + 1); // Months are zero-based, so we add 1
      const day = padZero(date.getDate());
    
      const hours = padZero(date.getHours());
      const minutes = padZero(date.getMinutes());
      const seconds = padZero(date.getSeconds());
    
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  const handleGradeClick = (id: number) => {
    console.log(`Assign Grade clicked for submission ID ${id}`);
  };

  const handleAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const selectedAssignment = e.target.value;
    setAssignmentFilter(selectedAssignment);
    if (selectedAssignment) {
      setFilteredSubmissions(submissions.filter(sub => sub.assignment === selectedAssignment));
    } else {
      setFilteredSubmissions(submissions);
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <h2>Submissions</h2>
          <hr />
        </Col>
      </Row>
      <Row>
        <Col md={3} style={{ paddingLeft:"200px" }}>
          <Form.Group controlId="assignmentFilter">
            <Form.Label>Filter by Assignment</Form.Label>
            <Form.Control as="select" value={assignmentFilter} onChange={(e) => handleAssignmentChange(e as any)}>
              <option value="">All Assignments</option>
              {assignments.map((assignment, index) => (
                <option key={index} value={assignment}>{assignment}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>

        <Col md={9}>
          <SubmissionList submissions={filteredSubmissions} onGradeClick={handleGradeClick} />
        </Col>
      </Row>
    </Container>
  );
};

export default SubmissionView;
