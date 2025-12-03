// Importing necessary interfaces and modules
import { IFormOption } from "../../components/Form/interfaces";
import axiosClient from "../../utils/axios_client";
import { ITA, ITARequest } from "../../utils/interfaces";

/**
 * @author Atharva Thorve, on December, 2023
 * @author Divit Kalathil, on December, 2023
 */

/**
 * ITAFormValues interface represents the shape of values in the TA form.
 */

export interface ITAFormValues {
  name: string;
}

export const transformTAResponse = (taList: string) => {
  let taData: IFormOption[] = [{ label: "Select a TA", value: "" }]; 
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
  const taUsers = taRoleUsersResponse.data;

  return { taUsers };
}
