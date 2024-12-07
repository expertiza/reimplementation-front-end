// Importing necessary interfaces and modules
import { IFormOption } from "components/Form/interfaces";
import axiosClient from "utils/axios_client";
import { ITA, ITARequest } from "../../utils/interfaces";

/**
 * @author Anurag Gorkar, on December, 2024
 * @author Makarand Pundalik, on December, 2024
 * @author Rutvik Kulkarni, on December, 2024
 */

/**
 * ITAFormValues interface represents the shape of values in the TA form.
 */

export interface ITAFormValues {
  name: string;
}

export const transformTAResponse = (taList: string) => {
  let taData: IFormOption[] = []; 
  let tas: ITA[] = JSON.parse(taList);
  tas.forEach((ta) => taData.push({ label: ta.name, value: ta.id! }));
  return taData;
}

export const transformTARequest = (values: ITAFormValues) => {
  // const parent_id = values.parent_id ? values.parent_id : null;
  const TA: ITARequest = {
    name: values.name,
  };
  return JSON.stringify(TA);
};
  // loadTAs function fetches the list of Teaching Assistants from the server.

export async function loadTAs({ params }: any) {
  // Making a GET request to fetch users with the "Teaching Assistant" role
  const taRoleUsersResponse = await axiosClient.get(`/users/role/Teaching Assistant`, {
    transformResponse: transformTAResponse
  });
  let taUsers = taRoleUsersResponse.data;

  // Making a GET request to fetch users with the "Student" role
  const studentRoleUsersResponse = await axiosClient.get(`/users/role/Student`, {
    transformResponse: transformTAResponse
  });
  let studentUsers = studentRoleUsersResponse.data;
  for(let i=0; i<studentUsers.length; i++)
    studentUsers[i].role = 'student';
  taUsers = [{label: "Select a TA", value: ""}, ...taUsers, ...studentUsers];

  return { taUsers };
}
