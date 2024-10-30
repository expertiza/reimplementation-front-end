import React, { useEffect, useState } from "react";
import { Alert, Container } from "react-bootstrap";

// Mock data for notifications
const mockNotifications = [
  {
    id: "1",
    subject: "New Assignment Posted",
    description: "Please check the new assignment in your course.",
    isUnread: true,
    isActive: true,
  },
  {
    id: "2",
    subject: "Exam Scheduled",
    description: "An exam has been scheduled for next week.",
    isUnread: false,
    isActive: true,
  },
  {
    id: "3",
    subject: "Class Canceled",
    description: "Class is canceled tomorrow.",
    isUnread: true,
    isActive: true,
  },
];

const Home = () => {
  // State to manage if there are unread notifications
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  useEffect(() => {
    // Check for any unread and active notifications
    const unreadNotifications = mockNotifications.some(
      (notification) => notification.isUnread && notification.isActive
    );
    setHasUnreadNotifications(unreadNotifications);
  }, []);

  return (
    <Container className="mt-4">
      <h1>Welcome Home!</h1>
      {hasUnreadNotifications && (
        <Alert variant="info">
          You have new notifications. Please check your <a href="/view-notifications">notifications</a> page.
        </Alert>
      )}
      
    </Container>
  );
};

export default Home;
