/**
 * @author Ankur Mundra on June, 2023
 */
import { ROLE } from "./interfaces";

interface Privileges {
  [key: string]: number;
}

interface PrivilegeID {
  [key: number]: string;
}

const privilegeID: PrivilegeID = {
  1: "Student",
  2: "Teaching Assistant",
  3: "Instructor",
  4: "Administrator",
  5: "Super Administrator",
}

export function getPrivilegeFromID(roleId: number): string {
  return privilegeID[roleId];
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
