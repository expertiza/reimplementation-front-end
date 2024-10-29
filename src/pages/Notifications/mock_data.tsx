
import { INotification } from "../../utils/interfaces";

// Shared dummy data for notifications
export const mockNotifications: INotification[] = [
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
