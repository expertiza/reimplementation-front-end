// mockData.ts
import { INotification } from "../../utils/interfaces";

export const mockNotifications: INotification[] = [
    {
        id: "1",
        course: "CS101",
        subject: "New Homework",
        description: "Homework 1 due next week",
        expirationDate: "2024-10-31",
        isActive: true,
        isUnread: true,
    },
    {
        id: "2",
        course: "CS102",
        subject: "Class Canceled",
        description: "No class tomorrow",
        expirationDate: "2024-11-01",
        isActive: false,
        isUnread: false,
    },
    {
        id: "3",
        course: "CS103",
        subject: "Exam scheduled",
        description: "Please prepare for the exam",
        expirationDate: "2024-11-05",
        isActive: true,
        isUnread: true,
    },
];

// Define mock courses for assigned courses
export const mockAssignedCourses = ["CS101", "CS102", "CS103"];
