import { IFormOption } from "../../components/Form/interfaces";
import { getPrivilegeFromID, hasAllPrivilegesOf } from "../../utils/util";
import axiosClient from "../../utils/axios_client";
import { ICourseRequest, ICourseResponse, IInstitution, IInstitutionResponse,IInstructorResponse, IInstructor, IUserRequest, ROLE } from "../../utils/interfaces";

/**
 * @author Aniket Singh Shaktawat, on March, 2024 
 * @author Pankhi Saini on March, 2024
 * @author Siddharth Shah on March, 2024
 */

// Course Utility Functions and Constants

// Enumeration for course visibility options
export enum CourseVisibility {
  PRIVATE = "private",
}

type PermittedCourseVisibility = CourseVisibility.PRIVATE

// Form options for course visibility
export const courseVisibility: IFormOption[] = [
  { label: "Private Course", value: CourseVisibility.PRIVATE },
];

// Interface for course form values
export interface ICourseFormValues {
  id?: number;
  name: string;
  directory: string;
  info: string;
  private: Array<PermittedCourseVisibility>;
  institution_id: number;
  instructor_id: number;
}

// Transform institutions response into form options
export const transformInstitutionsResponse = (institutionsList: string) => {
  let institutionsData: IFormOption[] = [{ label: "Select an Institution", value: "" }];
  let institutions: IInstitution[] = JSON.parse(institutionsList);
  institutions.forEach((institution) =>
    institutionsData.push({ label: institution.name, value: institution.id! })
  );
  return institutionsData;
};

// Transform instructor response into form options
export const transformInstructorResponse = (instructorList: string) => {
  let instructorData: IFormOption[] = [{ label: "Select an Instructor", value: "" }];
  let instructor: IInstructor[] = JSON.parse(instructorList);
  instructor.forEach((instructor) =>
    instructorData.push({ label: instructor.name, value: instructor.id! })
  );
  return instructorData;
};

// Transform course form values into request payload
export const transformCourseRequest = (values: ICourseFormValues) => {
  const course: ICourseRequest = {
    name: values.name,
    directory_path: values.directory,
    info: values.info,
    private: values.private.includes(CourseVisibility.PRIVATE),
    institution_id: values.institution_id,
    instructor_id: values.instructor_id,
  };
  return JSON.stringify(course);
}

// Transform course response into form values
export const transformCourseResponse = (courseResponse: string) => {
  const course: ICourseResponse = JSON.parse(courseResponse);
  const institution_id = course.institution_id ? course.institution_id : -1;
  const instructor_id = course.instructor_id ? course.instructor_id : -1;
  const courseValues: ICourseFormValues = {
    id: course.id,
    name: course.name,
    directory: course.directory_path,
    info: course.info,
    institution_id: institution_id,
    instructor_id: instructor_id,
    private: course.private ? [CourseVisibility.PRIVATE] : []
  }
  return courseValues;
}

// Load course, instructor, and institution data
export async function loadCourseInstructorDataAndInstitutions({ params }: any) {
  let courseData = {};

  // if params contains id, then we are editing a user, so we need to load the user data
  if (params.id) {
    const courseResponse = await axiosClient.get(`/courses/${params.id}`, {
      transformResponse: transformCourseResponse,
    });
    courseData = await courseResponse.data;
  }

  // Load institutions data
  const institutionsResponse = await axiosClient.get("/institutions", {
    transformResponse: transformInstitutionsResponse,
  });
  const institutions = await institutionsResponse.data;

  // ToDo: Create an API to just fetch instructors, so here in the frontend we won't have to filter out the users based on the role.
  const usersResponse = await axiosClient.get("/users", {
    transformResponse: transformInstructorResponse,
  });
  const users = await usersResponse.data;
  console.log(users.role_id)
  console.log(courseData)
  const instructors = users.filter((user: IUserRequest) => !hasAllPrivilegesOf(getPrivilegeFromID(user.role_id), ROLE.INSTRUCTOR));

  return { courseData, institutions, instructors }
}

// Input Validation for the Directory path of the course
export const noSpacesSpecialCharsQuotes = (value: string) => {
  // Check for spaces
  if (/\s/.test(value)) {
    return false;
  }

  // Check for special characters
  if (/[^a-zA-Z0-9]/.test(value)) {
    return false;
  }

  // Check for quotes
  if (/["']/.test(value)) {
    return false;
  }

  return true;
};

// Function to format the date from ISO to "Dec 4, 2023, 7:35 PM" format.
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

//For the course to be displayed, find the corresponding institution and instructor.
export const mergeDataAndNamesAndInstructors = (data: ICourseResponse[], institutionNames: IInstitutionResponse[], instructorNames: IInstructorResponse[]): any => {
  return data.map((dataObj) => {
    // Find institution data from institution id of course
    const matchingInstitution = institutionNames.find((nameObj) => nameObj.id === dataObj.institution_id);
    const institutionData = matchingInstitution ? { id: matchingInstitution.id, name: matchingInstitution.name } : {};

    // Find instructor data from instructor id of course
    const matchingInstructor = instructorNames.find((instructorObj) => instructorObj.id === dataObj.instructor_id);
    const instructorData = matchingInstructor ? { id: matchingInstructor.id, name: matchingInstructor.name } : {};

    // Merge course data with institution and instructor data
    return {
      ...dataObj,
      institution: institutionData,
      instructor: instructorData
    };
  });
};
