import React, { useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Table from "components/Table/Table";
import { notificationColumns as NOTIFICATION_COLUMNS } from "./NotificationColumns";
import { INotification } from "../../utils/interfaces";

// Mock Data for Notifications
const mockStudentNotifications: INotification[] = [
  {
    id: "3",
    course: "CS103",
    subject: "New Quiz",
    description: "Quiz 1 scheduled for next class",
    expirationDate: "2024-10-25",
    isActive: true,
  },
  {
    id: "4",
    course: "CS104",
    subject: "Project Deadline",
    description: "Project 2 deadline extended",
    expirationDate: "2024-11-02",
    isActive: true,
  },
];

const ViewNotifications = () => {
  // For now, using mock data; replace this with API data later
  const notifications = useMemo(() => mockStudentNotifications, []);

  return (
    <Container fluid className="px-md-4">
      <Row className="mt-md-2 mb-md-2">
        <Col className="text-center">
          <h1>My Notifications</h1>
        </Col>
        <hr />
      </Row>
      <Row>
        <Table
          data={notifications}
          columns={NOTIFICATION_COLUMNS(undefined, undefined, false)} // No edit/delete for students
          showColumnFilter={false}
          columnVisibility={{ id: false }}
          tableSize={{ span: 10, offset: 2 }}
        />
      </Row>
    </Container>
  );
};

export default ViewNotifications;
