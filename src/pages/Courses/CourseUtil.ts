import { IFormOption } from "components/Form/interfaces";
import { getPrivilegeFromID, hasAllPrivilegesOf } from "utils/util";
import axiosClient from "../../utils/axios_client";
import { ICourseRequest, ICourseResponse, IInstitution, IInstructor, IUserRequest, ROLE } from "../../utils/interfaces";

/**
 * @author Ankur Mundra on April, 2023
 */

export enum CourseVisibility {
  PRIVATE = "private",
}

type PermittedCourseVisibility = CourseVisibility.PRIVATE

export const courseVisibility: IFormOption[] = [
  { label: "Private Course", value: CourseVisibility.PRIVATE },
];

export interface ICourseFormValues {
  id?: number;
  name: string;
  directory: string;
  info: string;
  private: Array<PermittedCourseVisibility>;
  institution_id: number;
  instructor_id: number;
}

export const transformInstitutionsResponse = (institutionsList: string) => {
  let institutionsData: IFormOption[] = [{ label: "Select an Institution", value: "" }];
  let institutions: IInstitution[] = JSON.parse(institutionsList);
  institutions.forEach((institution) =>
    institutionsData.push({ label: institution.name, value: institution.id! })
  );
  return institutionsData;
};

export const transformInstructorResponse = (instructorList: string) => {
  let instructorData: IFormOption[] = [{ label: "Select an Instructor", value: "" }];
  let instructor: IInstructor[] = JSON.parse(instructorList);
  instructor.forEach((instructor) =>
    instructorData.push({ label: instructor.name, value: instructor.id! })
  );
  return instructorData;
};

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

export const transformCourseResponse = (courseResponse: string) => {
  const course: ICourseResponse = JSON.parse(courseResponse);
  console.log(course);
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

export async function loadCourseInstructorDataAndInstitutions({ params }: any) {
  let courseData = {};

  // if params contains id, then we are editing a user, so we need to load the user data
  if (params.id) {
    const courseResponse = await axiosClient.get(`/courses/${params.id}`, {
      transformResponse: transformCourseResponse,
    });
    courseData = await courseResponse.data;
  }

  const institutionsResponse = await axiosClient.get("/institutions", {
    transformResponse: transformInstitutionsResponse,
  });
  const institutions = await institutionsResponse.data;

  // ToDo: Create an API to just fetch instructors, so here in the frontend we won't have to filter out the users based on the role.
  const usersResponse = await axiosClient.get("/users", {
    transformResponse: transformInstructorResponse,
  });
  const users = await usersResponse.data;
  
  const instructors = users.filter((user: IUserRequest) => !hasAllPrivilegesOf(getPrivilegeFromID(user.role_id), ROLE.TA));

  return { courseData, institutions, instructors }
}

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