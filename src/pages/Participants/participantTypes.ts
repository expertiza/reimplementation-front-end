export type Role = { id: number; name: string };

export type Participant = {
  id: number;
  name: string;
  full_name: string;
  email: string;
  role: Role;
  parent: { id: number | null; name: string | null };
  handle?: string | null;
  can_submit?: boolean;
  can_review?: boolean;
  can_take_quiz?: boolean;
  can_mentor?: boolean;
  authorization?: string;
};

export const ALL_ROLES: Role[] = [
  { id: 1, name: "Participant" },
  { id: 2, name: "Mentor" },
  { id: 3, name: "Reader" },
  { id: 4, name: "Reviewer" },
  { id: 5, name: "Submitter" },
];
