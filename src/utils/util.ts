/**
 * @author Ankur Mundra on June, 2023
 */
import { ROLE } from "./interfaces";
import { IUserResponse } from './interfaces';

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

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString || isNaN(new Date(dateString).getTime())) {
    return "—";
  }

  const date = new Date(dateString);
  let dateFormat: string | undefined;

  const session = localStorage.getItem("session");
  if (session) {
    try {
      const user: IUserResponse | null = JSON.parse(session).user;
      dateFormat = user?.date_format_pref;
    } catch (error) {
      console.error("Failed to parse session data:", error);
    }
  }

  dateFormat = dateFormat || "MM/DD/YYYY";

  // Define a base set of options
  const baseOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };

  let options = baseOptions;
  let formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);

  // Handle new date formats
  if (dateFormat === "MMM DD, YYYY") {
    const newDateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    };
    const newDatePart = new Intl.DateTimeFormat("en-US", newDateOptions).format(date);
    const timePart = new Intl.DateTimeFormat("en-US", { hour: '2-digit', minute: '2-digit', hour12: true }).format(date);
    return `${newDatePart}, ${timePart}`;

  } else if (dateFormat === "DD MMM, YYYY") {
    const newDateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    };
    const newDatePart = new Intl.DateTimeFormat("en-GB", newDateOptions).format(date); // Use 'en-GB' for DD MMM YYYY format
    const timePart = new Intl.DateTimeFormat("en-US", { hour: '2-digit', minute: '2-digit', hour12: true }).format(date);
    return `${newDatePart}, ${timePart}`;

  } else {
    // Existing logic for old formats
    const datePart = formattedDate.split(', ')[0];
    const timePart = formattedDate.split(', ')[1];
    const parts = datePart.match(/(\d{2})\/(\d{2})\/(\d{4})/);

    if (parts) {
      const [_, month, day, year] = parts;
      let newDatePart = datePart;

      if (dateFormat === "YYYY/MM/DD") {
        newDatePart = `${year}/${month}/${day}`;
      } else if (dateFormat === "DD/MM/YYYY") {
        newDatePart = `${day}/${month}/${year}`;
      }
      formattedDate = `${newDatePart}, ${timePart}`;
    }
    return formattedDate;
  }
};