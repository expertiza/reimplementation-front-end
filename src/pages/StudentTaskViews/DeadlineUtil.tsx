import { Deadline } from "utils/interfaces";

// Define an array of deadlines
export const deadlines: Deadline[] = [
    {
        id: 1,
        date: "2024-03-22",
        description: "Submit Assignment Round 1",
    },
    {
        id: 2,
        date: "2024-03-27",
        description: "Review Assignment Round 1",
    },
    {
        id: 3,
        date: "2024-04-04",
        description: "Submit Assignment Round 2",
    },
    {
        id: 4,
        date: "2024-04-07",
        description: "Review Assignment Round 2",
    },
];

// Function to get the next upcoming deadline
export const getNextDeadline = (): Deadline | null => {
  const now = new Date();
  // Filter the deadlines to get only the upcoming ones
  const upcomingDeadlines = deadlines.filter(deadline => new Date(deadline.date) > now);
  // Return the earliest upcoming deadline, or null if there are no upcoming deadlines
  return upcomingDeadlines.length > 0 ? upcomingDeadlines[0] : null;
};
