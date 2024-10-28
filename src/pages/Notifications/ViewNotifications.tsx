import React, { useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Table from "components/Table/Table";
import { notificationColumns as NOTIFICATION_COLUMNS } from "./NotificationColumns";
import { INotification } from "../../utils/interfaces";

// Dummy data for notifications
const mockNotifications: INotification[] = [
  {
    id: "1",
    course: "CS101",
    subject: "Assignment Due",
    description: "Assignment 1 is due on Friday.",
    expirationDate: "2024-10-20",
    isActive: true,
  },
  {
    id: "2",
    course: "CS102",
    subject: "Class Canceled",
    description: "Class is canceled tomorrow.",
    expirationDate: "2024-10-21",
    isActive: true,
  },
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

const enrolledCourses = ["CS101", "CS103"]; // Courses the student is enrolled in

const ViewNotifications = () => {
  // Filter notifications to show only those related to enrolled courses
  const filteredNotifications = useMemo(
    () => mockNotifications.filter((notification) => enrolledCourses.includes(notification.course)),
    []
  );

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
          data={filteredNotifications}
          columns={NOTIFICATION_COLUMNS(undefined, undefined, false)} // Hide actions column
          showColumnFilter={false}
          columnVisibility={{ id: false }}
          tableSize={{ span: 10, offset: 2 }}
        />
      </Row>
    </Container>
  );
};

export default ViewNotifications;
