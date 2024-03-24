enum Role {
    Student = "Student",
    TeachingAssistant = "Teaching Assistant",
    Instructor = "Instructor",
    Administrator = "Administrator",
    SuperAdministrator = "Super Administrator",
  }
  
  export const access: Record<string, string[]> = {
    [Role.Student]: [Role.Student],
    [Role.TeachingAssistant]: [Role.TeachingAssistant, Role.Student],
    [Role.Instructor]: [Role.Instructor, Role.TeachingAssistant, Role.Student],
    [Role.Administrator]: [Role.Administrator, Role.Instructor, Role.TeachingAssistant, Role.Student],
    [Role.SuperAdministrator]: [
      Role.SuperAdministrator, 
      Role.Administrator, 
      Role.Instructor, 
      Role.TeachingAssistant, 
      Role.Student,
    ],
  };
  