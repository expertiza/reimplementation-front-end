/**
 * @author Ankur Mundra on June, 2023
 */
import { ROLE } from "./interfaces";

interface Privileges {
  [key: string]: number;
}

const privileges: Privileges = {
  Student: 1,
  "Teaching Assistant": 2,
  Instructor: 3,
  Administrator: 4,
  "Super Administrator": 5,
};

export function hasAllPrivilegesOf(role: string, targetRole: ROLE): boolean {
  return privileges[role] >= privileges[targetRole];
}
