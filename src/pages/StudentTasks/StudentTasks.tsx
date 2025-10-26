import React, { useEffect, useState } from "react";
import { Container, Table } from "react-bootstrap";

interface Topic {
  id: string;
  name: string;
  availableSlots: number;
  waitlist: number;
}

const StudentTasks: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    // Temporary hardcoded data (replace later with API call)
    const mockData: Topic[] = [
      { id: "E2450", name: "Refactor assignments_controller.rb", availableSlots: 0, waitlist: 0 },
      { id: "E2451", name: "Reimplement feedback_response_map.rb", availableSlots: 1, waitlist: 0 },
      { id: "E2452", name: "Refactor review_mapping_controller.rb", availableSlots: 0, waitlist: 0 },
      { id: "E2453", name: "Refactor review_mapping_helper.rb", availableSlots: 0, waitlist: 0 },
      { id: "E2454", name: "Refactor student_task.rb", availableSlots: 0, waitlist: 0 },
      { id: "E2455", name: "Refactor sign_up_sheet_controller.rb", availableSlots: 0, waitlist: 0 },
      { id: "E2456", name: "Refactor teams_user.rb", availableSlots: 0, waitlist: 0 },
      { id: "E2457", name: "Github metrics integration", availableSlots: 1, waitlist: 0 },
      { id: "E2458", name: "User management and users table", availableSlots: 0, waitlist: 0 },
      { id: "E2459", name: "View for results of bidding", availableSlots: 0, waitlist: 0 },
    ];
    setTopics(mockData);
  }, []);

  return (
    <Container
      className="mt-4"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
      }}
    >
      <div style={{ width: "100%", marginBottom: "20px" }}>
        <h3 className="fw-bold">
          Signup sheet for OSS project & documentation assignment
        </h3>
        <p className="mt-2">
          <strong>Your topic(s):</strong> Refactor review_mapping_controller.rb
        </p>
      </div>

      <div style={{ width: "100%" }}>
        <Table bordered hover striped responsive>
          <thead className="table-light">
            <tr>
              <th>Topic ID</th>
              <th>Topic name(s)</th>
              <th>Available slots</th>
              <th>Num. on waitlist</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => (
              <tr
                key={topic.id}
                style={{
                  backgroundColor:
                    topic.id === "E2452" ? "#fff8c4" : "white", // highlight selected row
                }}
              >
                <td>{topic.id}</td>
                <td>{topic.name}</td>
                <td>{topic.availableSlots}</td>
                <td>{topic.waitlist}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default StudentTasks;
