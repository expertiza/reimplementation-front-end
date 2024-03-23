// ROLE TO ACCESS LEVEL ARRAY
export const access: Record<string, string[]> = {
    "Student": ['Student'],
    "Teaching Assistant": ["Teaching Assistant", "Student"],
    "Instructor": ["Instructor", "Teaching Assistant", "Student"],
    "Administrator": ["Administrator", "Instructor", "Teaching Assistant", "Student"],
    "Super Administrator": ["Super Administrator", "Administrator", "Instructor", "Teaching Assistant", "Student"]
};
