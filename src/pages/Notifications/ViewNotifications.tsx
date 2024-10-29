// ViewNotifications.tsx
import React, { useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Table from "components/Table/Table";
import { notificationColumns as NOTIFICATION_COLUMNS } from "./NotificationColumns";
import { mockNotifications } from "./mock_data";
import { INotification } from "../../utils/interfaces";

const enrolledCourses = ["CS101", "CS103"];

const ViewNotifications = () => {
  // Filter notifications to show only active ones related to enrolled courses
  const filteredNotifications = useMemo(
    () => mockNotifications.filter(
      (notification) => notification.isActive && enrolledCourses.includes(notification.course)
    ),
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
          columnVisibility={{ id: false, isActive: false }} // Hide isActive column
          tableSize={{ span: 10, offset: 2 }}
        />
      </Row>
    </Container>
  );
};

export default ViewNotifications;
